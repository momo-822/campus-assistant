const { getDb } = require('../config/db')
const response = require('../utils/response')
const logger = require('../utils/logger')

/** GET /api/trade?category= — 获取商品列表 */
exports.getItems = (req, res, next) => {
  try {
    const db = getDb()
    const category = req.query.category || '全部'

    let items
    if (category === '全部') {
      items = db.prepare(
        "SELECT * FROM trade_items WHERE status = 'active' ORDER BY created_at DESC"
      ).all()
    } else {
      items = db.prepare(
        "SELECT * FROM trade_items WHERE category = ? AND status = 'active' ORDER BY created_at DESC"
      ).all(category)
    }

    res.json(response.success(items))
  } catch (err) {
    next(err)
  }
}

/** GET /api/trade/:id — 获取单个商品详情 */
exports.getItemById = (req, res, next) => {
  try {
    const db = getDb()
    const { id } = req.params

    const item = db.prepare(
      "SELECT * FROM trade_items WHERE id = ? AND status = 'active'"
    ).get(id)

    if (!item) {
      return res.status(404).json(response.notFound('商品不存在'))
    }

    res.json(response.success(item))
  } catch (err) {
    next(err)
  }
}

/** GET /api/trade/categories — 获取分类列表 */
exports.getCategories = (req, res, next) => {
  try {
    const db = getDb()
    const rows = db.prepare(
      "SELECT DISTINCT category FROM trade_items WHERE status = 'active' ORDER BY category"
    ).all()
    const categories = ['全部', ...rows.map((r) => r.category)]
    res.json(response.success(categories))
  } catch (err) {
    next(err)
  }
}

/** GET /api/trade/search?q= — 搜索商品 */
exports.searchItems = (req, res, next) => {
  try {
    const db = getDb()
    const q = req.query.q || ''
    const items = db.prepare(
      "SELECT * FROM trade_items WHERE status = 'active' AND (title LIKE ? OR description LIKE ?) ORDER BY created_at DESC"
    ).all(`%${q}%`, `%${q}%`)
    res.json(response.success(items))
  } catch (err) {
    next(err)
  }
}

/** POST /api/trade — 发布商品 */
exports.addItem = (req, res, next) => {
  try {
    const db = getDb()
    const { title, category, price, originalPrice, description, user } = req.body

    const result = db.prepare(
      'INSERT INTO trade_items (title, category, price, original_price, description, user) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(title, category, price, originalPrice || null, description || null, user)

    const items = db.prepare(
      "SELECT * FROM trade_items WHERE status = 'active' ORDER BY created_at DESC"
    ).all()

    logger.info(`新商品发布: ${title} (¥${price})`)

    res.status(201).json(response.created(items, '发布成功'))
  } catch (err) {
    next(err)
  }
}

/** PUT /api/trade/:id — 编辑商品 */
exports.updateItem = (req, res, next) => {
  try {
    const db = getDb()
    const { id } = req.params
    const { title, category, price, originalPrice, description, user } = req.body

    const itemId = parseInt(id)
    if (isNaN(itemId)) {
      return res.status(400).json(response.badRequest('无效的商品ID'))
    }

    const item = db.prepare('SELECT * FROM trade_items WHERE id = ?').get(itemId)
    if (!item) {
      return res.status(404).json(response.notFound('商品不存在'))
    }

    // 校验用户身份
    if (!user || user !== item.user) {
      return res.status(403).json(response.forbidden('只能编辑自己的商品'))
    }

    // 构建更新字段
    const updates = []
    const params = []

    if (title !== undefined) {
      if (!title.trim()) return res.status(400).json(response.badRequest('商品标题不能为空'))
      updates.push('title = ?')
      params.push(title.trim())
    }
    if (category !== undefined) {
      if (!category.trim()) return res.status(400).json(response.badRequest('分类不能为空'))
      updates.push('category = ?')
      params.push(category.trim())
    }
    if (price !== undefined) {
      if (isNaN(price) || price <= 0) return res.status(400).json(response.badRequest('价格必须大于0'))
      updates.push('price = ?')
      params.push(price)
    }
    if (originalPrice !== undefined) {
      updates.push('original_price = ?')
      params.push(originalPrice || null)
    }
    if (description !== undefined) {
      updates.push('description = ?')
      params.push(description.trim() || null)
    }

    if (updates.length === 0) {
      return res.status(400).json(response.badRequest('没有需要更新的字段'))
    }

    params.push(itemId)
    db.prepare(`UPDATE trade_items SET ${updates.join(', ')} WHERE id = ?`).run(...params)

    const items = db.prepare(
      "SELECT * FROM trade_items WHERE status = 'active' ORDER BY created_at DESC"
    ).all()

    logger.info(`商品更新: #${itemId} 由 ${user} 修改`)

    res.json(response.success(items, '商品更新成功'))
  } catch (err) {
    next(err)
  }
}

/** POST /api/trade/generate-description — AI 商品描述生成 */
exports.generateDescription = (req, res, next) => {
  try {
    const { title, category, price, originalPrice } = req.body

    if (!title || !title.trim()) {
      return res.status(400).json(response.badRequest('商品标题不能为空'))
    }
    if (!category || !category.trim()) {
      return res.status(400).json(response.badRequest('分类不能为空'))
    }
    if (!price || isNaN(price) || price <= 0) {
      return res.status(400).json(response.badRequest('价格必须大于0'))
    }

    const titleStr = title.trim()
    const cat = category.trim()
    const priceNum = parseFloat(price)
    const origPriceNum = originalPrice ? parseFloat(originalPrice) : null

    // ========== 价格分析 ==========
    let priceComment = ''
    if (origPriceNum && origPriceNum > priceNum) {
      const discount = Math.round((1 - priceNum / origPriceNum) * 100)
      if (discount >= 50) {
        priceComment = `超值折扣！仅需原价 ${origPriceNum} 元的 ${discount} 折即可入手，性价比极高`
      } else if (discount >= 20) {
        priceComment = `优惠 ${discount}%，比原价 ${origPriceNum} 元省了 ${Math.round(origPriceNum - priceNum)} 元，非常划算`
      } else {
        priceComment = `比原价 ${origPriceNum} 元优惠了 ${discount}%，物有所值`
      }
    } else if (priceNum < 10) {
      priceComment = '价格亲民，仅需一杯奶茶钱就能带回家'
    } else if (priceNum < 50) {
      priceComment = '定价合理，适合学生党预算'
    } else if (priceNum < 200) {
      priceComment = '品质之选，这个价位买到就是赚到'
    } else {
      priceComment = '高端好物，值得投资'
    }

    // ========== 分类关键词库 ==========
    const categoryKeywords = {
      '教材': ['知识点全面', '结构清晰', '学习必备', '考研/考公/考证适用', '经典教材', '配套习题丰富'],
      '电子': ['功能完好', '续航持久', '配件齐全', '日常使用流畅', '屏幕完好', '运行稳定'],
      '生活': ['干净整洁', '实用性强', '宿舍必备', '便携易收纳', '材质优良', '耐用'],
      '衣物': ['款式经典', '尺寸标准', '面料舒适', '百搭款', '洗护得当', '穿着次数少'],
      '其他': ['保存完好', '功能正常', '实用好物', '闲置转让', '成色不错'],
    }

    const keywords = categoryKeywords[cat] || categoryKeywords['其他']

    // ========== 标题关键词分析 ==========
    const conditionWords = ['全新', '九成新', '八成新', '七成新', '八成', '九成', '二手', '闲置', '几乎没用', '只用过']
    const foundCondition = conditionWords.find(w => titleStr.includes(w))

    let conditionDesc = ''
    if (foundCondition) {
      if (foundCondition.includes('全新')) {
        conditionDesc = '商品为全新状态，未使用过，包装完好'
      } else if (foundCondition.includes('九成')) {
        conditionDesc = '商品保持九成新，使用痕迹极少，功能完全正常'
      } else if (foundCondition.includes('八成')) {
        conditionDesc = '商品约八成新，正常使用痕迹，各项功能完好'
      } else if (foundCondition.includes('七成')) {
        conditionDesc = '商品七成新，有明显的使用痕迹但功能正常'
      } else if (foundCondition.includes('闲置') || foundCondition.includes('几乎没用') || foundCondition.includes('只用过')) {
        conditionDesc = '商品闲置使用少，成色良好，功能正常运行'
      } else {
        conditionDesc = '商品为二手，功能正常，适合日常使用'
      }
    } else {
      conditionDesc = '商品功能完好，日常使用正常'
    }

    // ========== 构建描述 ==========
    // 随机选 2-3 个关键词
    const shuffled = [...keywords].sort(() => Math.random() - 0.5)
    const selectedKeywords = shuffled.slice(0, 2 + Math.floor(Math.random() * 2))

    const lines = []

    // 第一段：总体介绍
    if (origPriceNum && origPriceNum > priceNum) {
      lines.push(`【${titleStr}】${cat}类好物，现仅售 ¥${priceNum}（原价 ¥${origPriceNum}）。${priceComment}。`)
    } else {
      lines.push(`【${titleStr}】${cat}类好物，售价 ¥${priceNum}。${priceComment}。`)
    }

    // 第二段：成色与功能
    lines.push(`成色方面：${conditionDesc}。`)

    // 第三段：亮点
    if (selectedKeywords.length > 0) {
      lines.push(`商品亮点：${selectedKeywords.join('、')}。`)
    }

    // 第四段：建议
    if (cat === '教材') {
      lines.push('适合在校学生购买使用，考试复习、日常学习皆可。购买二手教材既环保又省钱，推荐给有需要的同学。')
    } else if (cat === '电子') {
      lines.push('宿舍学习、娱乐皆宜，适合预算有限的学生党。如有任何功能问题，欢迎联系了解更多细节。')
    } else if (cat === '生活') {
      lines.push('宿舍生活好帮手，提升校园生活质量。实用性强，性价比高，推荐入手。')
    } else if (cat === '衣物') {
      lines.push('适合日常穿搭，简约实用。购买前建议确认尺寸是否合适，校园内可当面交易试穿。')
    } else {
      lines.push('适合有需要的同学购买，价格实惠，校园内可当面交易验货。')
    }

    const description = lines.join('\n')

    logger.info(`AI商品描述生成: 「${titleStr}」(${cat})`)

    res.json(response.success({
      description,
      title: titleStr,
      category: cat,
      price: priceNum,
      original_price: origPriceNum,
      generated_at: new Date().toISOString(),
    }))
  } catch (err) {
    next(err)
  }
}

/** DELETE /api/trade/:id — 删除商品 */
exports.deleteItem = (req, res, next) => {
  try {
    const db = getDb()
    const { id } = req.params

    const itemId = parseInt(id)
    if (isNaN(itemId)) {
      return res.status(400).json(response.badRequest('无效的商品ID'))
    }

    const item = db.prepare('SELECT * FROM trade_items WHERE id = ?').get(itemId)
    if (!item) {
      return res.status(404).json(response.notFound('商品不存在'))
    }

    // 校验用户身份
    const { user } = req.body
    if (!user || user !== item.user) {
      return res.status(403).json(response.forbidden('只能删除自己的商品'))
    }

    db.prepare("UPDATE trade_items SET status = 'deleted' WHERE id = ?").run(itemId)

    const items = db.prepare(
      "SELECT * FROM trade_items WHERE status = 'active' ORDER BY created_at DESC"
    ).all()

    logger.info(`商品删除: #${itemId} 被删除`)

    res.json(response.success(items, '删除成功'))
  } catch (err) {
    next(err)
  }
}