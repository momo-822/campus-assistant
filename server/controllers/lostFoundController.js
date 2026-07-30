const { getDb } = require('../config/db')
const response = require('../utils/response')
const logger = require('../utils/logger')

/** GET /api/lost-found?type= */
exports.getItems = (req, res, next) => {
  try {
    const db = getDb()
    const type = req.query.type || 'all'

    let items
    if (type === 'all') {
      items = db.prepare(
        "SELECT * FROM lost_found ORDER BY created_at DESC"
      ).all()
    } else {
      items = db.prepare(
        "SELECT * FROM lost_found WHERE type = ? ORDER BY created_at DESC"
      ).all(type)
    }

    res.json(response.success(items))
  } catch (err) {
    next(err)
  }
}

/** GET /api/lost-found/stats */
exports.getStats = (req, res, next) => {
  try {
    const db = getDb()
    const total = db.prepare('SELECT COUNT(*) as count FROM lost_found').get().count
    const lost = db.prepare("SELECT COUNT(*) as count FROM lost_found WHERE type = 'lost'").get().count
    const found = db.prepare("SELECT COUNT(*) as count FROM lost_found WHERE type = 'found'").get().count
    const resolved = db.prepare("SELECT COUNT(*) as count FROM lost_found WHERE status = 'resolved'").get().count

    res.json(response.success({ total, lost, found, resolved }))
  } catch (err) {
    next(err)
  }
}

/** POST /api/lost-found */
exports.addItem = (req, res, next) => {
  try {
    const db = getDb()
    const { type, title, description, location, contact, user } = req.body

    db.prepare(
      'INSERT INTO lost_found (type, title, description, location, contact, user) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(type, title, description || null, location || null, contact, user)

    const items = db.prepare("SELECT * FROM lost_found ORDER BY created_at DESC").all()

    logger.info(`新失物招领: [${type}] ${title}`)

    res.status(201).json(response.created(items, '发布成功'))
  } catch (err) {
    next(err)
  }
}

/** PUT /api/lost-found/:id/resolve */
exports.resolveItem = (req, res, next) => {
  try {
    const db = getDb()
    const { id } = req.params

    const item = db.prepare('SELECT * FROM lost_found WHERE id = ?').get(id)
    if (!item) {
      return res.status(404).json(response.notFound('记录不存在'))
    }

    db.prepare("UPDATE lost_found SET status = 'resolved' WHERE id = ?").run(id)

    const items = db.prepare("SELECT * FROM lost_found ORDER BY created_at DESC").all()
    res.json(response.success(items, '已标记为已完成'))
  } catch (err) {
    next(err)
  }
}

/** GET /api/lost-found/:id — 获取单个详情 */
exports.getItemById = (req, res, next) => {
  try {
    const db = getDb()
    const { id } = req.params

    const item = db.prepare('SELECT * FROM lost_found WHERE id = ?').get(id)
    if (!item) {
      return res.status(404).json(response.notFound('记录不存在'))
    }

    res.json(response.success(item))
  } catch (err) {
    next(err)
  }
}

/** PUT /api/lost-found/:id — 编辑帖子 */
exports.updateItem = (req, res, next) => {
  try {
    const db = getDb()
    const { id } = req.params
    const { title, description, location, contact, user } = req.body

    const itemId = parseInt(id)
    if (isNaN(itemId)) {
      return res.status(400).json(response.badRequest('无效的ID'))
    }

    const item = db.prepare('SELECT * FROM lost_found WHERE id = ?').get(itemId)
    if (!item) {
      return res.status(404).json(response.notFound('记录不存在'))
    }

    // 校验用户身份
    if (!user || user !== item.user) {
      return res.status(403).json(response.forbidden('只能编辑自己的帖子'))
    }

    // 构建更新字段
    const updates = []
    const params = []

    if (title !== undefined) {
      if (!title.trim()) return res.status(400).json(response.badRequest('标题不能为空'))
      updates.push('title = ?')
      params.push(title.trim())
    }
    if (description !== undefined) {
      updates.push('description = ?')
      params.push(description.trim() || null)
    }
    if (location !== undefined) {
      updates.push('location = ?')
      params.push(location.trim() || null)
    }
    if (contact !== undefined) {
      if (!contact.trim()) return res.status(400).json(response.badRequest('联系方式不能为空'))
      updates.push('contact = ?')
      params.push(contact.trim())
    }

    if (updates.length === 0) {
      return res.status(400).json(response.badRequest('没有需要更新的字段'))
    }

    params.push(itemId)
    db.prepare(`UPDATE lost_found SET ${updates.join(', ')} WHERE id = ?`).run(...params)

    const items = db.prepare("SELECT * FROM lost_found ORDER BY created_at DESC").all()

    logger.info(`失物招领更新: #${itemId} 由 ${user} 修改`)

    res.json(response.success(items, '更新成功'))
  } catch (err) {
    next(err)
  }
}

/** POST /api/lost-found/generate-description — AI 失物/招领描述生成 */
exports.generateDescription = (req, res, next) => {
  try {
    const { type, title, location } = req.body

    if (!type || !['lost', 'found'].includes(type)) {
      return res.status(400).json(response.badRequest('类型必须是 lost 或 found'))
    }
    if (!title || !title.trim()) {
      return res.status(400).json(response.badRequest('标题不能为空'))
    }

    const titleStr = title.trim()
    const locStr = (location || '').trim()
    const isLost = type === 'lost'

    // ========== 物品分类关键词库 ==========
    const itemKeywords = {
      '校园卡': { features: ['姓名', '学号', '学院', '照片'], color: ['蓝色', '白色', '彩色'] },
      '水杯': { features: ['保温', '容量', '颜色', '材质'], color: ['蓝色', '粉色', '白色', '黑色', '透明'] },
      '耳机': { features: ['无线', '蓝牙', '品牌', '充电仓'], color: ['白色', '黑色'] },
      '钥匙': { features: ['钥匙扣', '数量', '挂件'], color: ['银色', '黑色'] },
      '手机': { features: ['品牌', '型号', '手机壳', '屏幕'], color: ['黑色', '白色', '金色', '蓝色'] },
      '钱包': { features: ['品牌', '颜色', '夹层', '拉链'], color: ['黑色', '棕色', '粉色'] },
      '书包': { features: ['品牌', '容量', '隔层', '拉链'], color: ['黑色', '蓝色', '灰色'] },
      '雨伞': { features: ['折叠', '自动', '伞面', '手柄'], color: ['黑色', '蓝色', '彩色'] },
      '眼镜': { features: ['镜框', '度数', '镜片', '颜色'], color: ['黑色', '金色', '银色'] },
      '充电宝': { features: ['容量', '品牌', '接口', '颜色'], color: ['白色', '黑色', '红色'] },
      'U盘': { features: ['容量', '品牌', '接口', '颜色'], color: ['银色', '黑色', '彩色'] },
      '书本': { features: ['书名', '作者', '封面', '页数'], color: ['彩色', '白色'] },
      '文具': { features: ['品牌', '颜色', '数量', '类型'], color: ['黑色', '蓝色', '彩色'] },
      '卡片': { features: ['卡面', '文字', '编号'], color: ['白色', '彩色'] },
      '手表': { features: ['品牌', '表盘', '表带', '功能'], color: ['黑色', '银色', '金色'] },
    }

    // 匹配物品类别
    let matchedCategory = null
    for (const [cat, info] of Object.entries(itemKeywords)) {
      if (titleStr.includes(cat)) {
        matchedCategory = { name: cat, ...info }
        break
      }
    }

    // ========== 地点关键词 ==========
    const locationWords = [
      '食堂', '教学楼', '图书馆', '宿舍', '操场', '体育馆', '教室',
      '实验室', '办公楼', '食堂', '超市', '快递站', '校门口', '花园',
      '篮球场', '足球场', '跑道', '报告厅', '礼堂', '咖啡厅',
    ]
    const foundLocation = locationWords.find(w => locStr.includes(w) || titleStr.includes(w))

    // ========== 构建描述 ==========
    const lines = []

    if (isLost) {
      // 寻物描述
      lines.push(`【紧急寻物】本人不慎在${foundLocation ? '「' + foundLocation + '」' : '校园内'}丢失了「${titleStr}」，如有拾到者请速与我联系，万分感谢！`)

      if (matchedCategory) {
        const colors = matchedCategory.color
        const randomColor = colors[Math.floor(Math.random() * colors.length)]
        lines.push(`物品特征：该${titleStr}为${randomColor}色，${matchedCategory.features.slice(0, 2).join('、')}等特征明显，便于辨认。`)
      } else {
        lines.push('物品特征：有明显个人标识，便于辨认。如有捡到，请及时联系失主，不胜感激！')
      }

      lines.push(`丢失地点：${locStr || '校园内某处'}。`)
      lines.push('如有捡到，希望好心人可以联系我，必有酬谢！同时也提醒同学们注意保管好个人物品。')
    } else {
      // 招领描述
      lines.push(`【失物招领】本人在${foundLocation ? '「' + foundLocation + '」' : '校园内'}捡到了「${titleStr}」，请失主看到后尽快联系认领。`)

      if (matchedCategory) {
        const colors = matchedCategory.color
        const randomColor = colors[Math.floor(Math.random() * colors.length)]
        lines.push(`物品特征：该物品为${randomColor}色，${matchedCategory.features.slice(0, 2).join('、')}，请失主描述具体特征以确认身份。`)
      } else {
        lines.push('物品特征：请失主描述物品的具体特征和颜色以确认身份。')
      }

      lines.push(`捡到地点：${locStr || '校园内某处'}。`)
      lines.push('请失主尽快联系认领，认领时请描述物品特征以便核实身份。')
    }

    const description = lines.join('\n')

    logger.info(`AI失物招领描述生成: [${type}] 「${titleStr}」`)

    res.json(response.success({
      description,
      type,
      title: titleStr,
      location: locStr,
      generated_at: new Date().toISOString(),
    }))
  } catch (err) {
    next(err)
  }
}

/** GET /api/lost-found/smart-match — 智能匹配推荐 */
exports.smartMatch = (req, res, next) => {
  try {
    const db = getDb()
    const { type, title, description, location, limit: limitParam } = req.query

    if (!type || !['lost', 'found'].includes(type)) {
      return res.status(400).json(response.badRequest('类型必须是 lost 或 found'))
    }
    if (!title || !title.trim()) {
      return res.status(400).json(response.badRequest('标题不能为空'))
    }

    const matchLimit = parseInt(limitParam) || 5
    const targetType = type === 'lost' ? 'found' : 'lost'
    const titleStr = title.trim().toLowerCase()
    const descStr = (description || '').trim().toLowerCase()
    const locStr = (location || '').trim().toLowerCase()

    // 获取所有匹配类型的待处理记录
    const candidates = db.prepare(
      "SELECT * FROM lost_found WHERE type = ? AND status = 'pending' ORDER BY created_at DESC"
    ).all(targetType)

    // ========== 辅助函数：中文二元分词（2-gram） ==========
    function extractChineseBigrams(text) {
      const bigrams = []
      // 只处理中文字符（Unicode 范围 \u4e00-\u9fff）
      const chars = text.split('')
      for (let i = 0; i < chars.length - 1; i++) {
        const ch1 = chars[i]
        const ch2 = chars[i + 1]
        // 只有两个都是中文字符才提取
        if (/[\u4e00-\u9fff]/.test(ch1) && /[\u4e00-\u9fff]/.test(ch2)) {
          bigrams.push(ch1 + ch2)
        }
      }
      return bigrams
    }

    // ========== 评分匹配算法 ==========
    const scored = candidates.map(item => {
      let score = 0
      const matches = []
      const itemTitle = item.title.toLowerCase()

      // 1. 标题关键词匹配（权重最高）
      // 1a. 按标点/空格分词
      const titleWords = titleStr.split(/[\s,，、.。]+/).filter(w => w.length >= 2)
      for (const word of titleWords) {
        if (itemTitle.includes(word)) {
          score += 30
          matches.push(`标题匹配: "${word}"`)
        }
      }
      // 1b. 中文二元分词补充（处理无空格中文标题）
      const titleBigrams = extractChineseBigrams(titleStr)
      for (const bigram of titleBigrams) {
        if (itemTitle.includes(bigram)) {
          score += 15
          if (!matches.find(m => m.includes(bigram))) {
            matches.push(`标题匹配: "${bigram}"`)
          }
        }
      }

      // 2. 地点匹配
      const itemLoc = (item.location || '').toLowerCase()
      if (locStr && itemLoc && (locStr.includes(itemLoc) || itemLoc.includes(locStr))) {
        score += 25
        matches.push('地点匹配')
      }

      // 3. 描述关键词匹配
      const itemDesc = (item.description || '').toLowerCase()
      const descWords = descStr.split(/[\s,，、.。]+/).filter(w => w.length >= 2)
      for (const word of descWords) {
        if (itemDesc.includes(word)) {
          score += 10
          matches.push(`描述匹配: "${word}"`)
        }
      }

      // 4. 标题完全匹配加分
      if (itemTitle === titleStr) {
        score += 40
        matches.push('标题完全匹配')
      } else if (itemTitle.includes(titleStr) || titleStr.includes(itemTitle)) {
        score += 20
        matches.push('标题包含匹配')
      }

      return { item, score, matches }
    })

    // 按得分排序，取前 N 个
    const results = scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, matchLimit)

    const matched = results.map(r => ({
      id: r.item.id,
      type: r.item.type,
      title: r.item.title,
      description: r.item.description,
      location: r.item.location,
      contact: r.item.contact,
      user: r.item.user,
      score: r.score,
      created_at: r.item.created_at,
      match_reasons: r.matches.slice(0, 3),
    }))

    logger.info(`智能匹配推荐: [${type}]「${titleStr}」→ 找到 ${matched.length} 条匹配`)

    res.json(response.success({
      source_type: type,
      target_type: targetType,
      total_candidates: candidates.length,
      matches: matched,
    }))
  } catch (err) {
    next(err)
  }
}

/** DELETE /api/lost-found/:id — 删除帖子 */
exports.deleteItem = (req, res, next) => {
  try {
    const db = getDb()
    const { id } = req.params

    const itemId = parseInt(id)
    if (isNaN(itemId)) {
      return res.status(400).json(response.badRequest('无效的ID'))
    }

    const item = db.prepare('SELECT * FROM lost_found WHERE id = ?').get(itemId)
    if (!item) {
      return res.status(404).json(response.notFound('记录不存在'))
    }

    // 校验用户身份
    const { user } = req.body
    if (!user || user !== item.user) {
      return res.status(403).json(response.forbidden('只能删除自己的帖子'))
    }

    db.prepare('DELETE FROM lost_found WHERE id = ?').run(itemId)

    const items = db.prepare("SELECT * FROM lost_found ORDER BY created_at DESC").all()

    logger.info(`失物招领删除: #${itemId} 被删除`)

    res.json(response.success(items, '删除成功'))
  } catch (err) {
    next(err)
  }
}