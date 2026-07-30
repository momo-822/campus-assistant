const { getDb } = require('../config/db')
const response = require('../utils/response')
const logger = require('../utils/logger')

/** GET /api/canteen — 获取所有食堂 */
exports.getCanteens = (req, res, next) => {
  try {
    const db = getDb()
    const canteens = db.prepare('SELECT * FROM canteens ORDER BY id ASC').all()
    res.json(response.success(canteens))
  } catch (err) {
    next(err)
  }
}

/** GET /api/canteen/stats — 获取所有食堂的统计数据（平均评分+评价数） */
exports.getCanteenStats = (req, res, next) => {
  try {
    const db = getDb()
    const stats = db.prepare(`
      SELECT
        c.id,
        c.name,
        c.type,
        c.hours,
        COALESCE(ROUND(AVG(r.rating), 1), 0) AS avg_rating,
        COUNT(r.id) AS review_count
      FROM canteens c
      LEFT JOIN reviews r ON r.canteen_id = c.id
      GROUP BY c.id
      ORDER BY c.id ASC
    `).all()
    res.json(response.success(stats))
  } catch (err) {
    next(err)
  }
}

/** GET /api/canteen/:id — 获取单个食堂详情 */
exports.getCanteenById = (req, res, next) => {
  try {
    const db = getDb()
    const { id } = req.params

    const canteen = db.prepare('SELECT * FROM canteens WHERE id = ?').get(id)
    if (!canteen) {
      return res.status(404).json(response.notFound('食堂不存在'))
    }

    // 同时返回该食堂的统计数据
    const stat = db.prepare(`
      SELECT
        COALESCE(ROUND(AVG(rating), 1), 0) AS avg_rating,
        COUNT(*) AS review_count
      FROM reviews WHERE canteen_id = ?
    `).get(id)

    res.json(response.success({ ...canteen, ...stat }))
  } catch (err) {
    next(err)
  }
}

/** GET /api/canteen/reviews?canteenId=&page=&pageSize= — 分页获取评价 */
exports.getReviews = (req, res, next) => {
  try {
    const db = getDb()
    const canteenId = parseInt(req.query.canteenId) || 1
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize) || 10))
    const offset = (page - 1) * pageSize

    const total = db.prepare(
      'SELECT COUNT(*) AS count FROM reviews WHERE canteen_id = ?'
    ).get(canteenId).count

    const reviews = db.prepare(
      'SELECT * FROM reviews WHERE canteen_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?'
    ).all(canteenId, pageSize, offset)

    res.json(response.paginated(reviews, total, page, pageSize))
  } catch (err) {
    next(err)
  }
}

/** GET /api/canteen/reviews/search?q=&page=&pageSize= — 搜索评价（含食堂名） */
exports.searchReviews = (req, res, next) => {
  try {
    const db = getDb()
    const q = req.query.q || ''
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize) || 10))
    const offset = (page - 1) * pageSize

    const total = db.prepare(
      'SELECT COUNT(*) AS count FROM reviews WHERE content LIKE ?'
    ).get(`%${q}%`).count

    const reviews = db.prepare(`
      SELECT r.*, c.name AS canteen_name
      FROM reviews r
      LEFT JOIN canteens c ON c.id = r.canteen_id
      WHERE r.content LIKE ?
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `).all(`%${q}%`, pageSize, offset)

    res.json(response.paginated(reviews, total, page, pageSize))
  } catch (err) {
    next(err)
  }
}

/** POST /api/canteen/reviews — 新增评价 */
exports.addReview = (req, res, next) => {
  try {
    const db = getDb()
    const { canteenId, rating, content, user } = req.body

    // 验证食堂存在
    const canteen = db.prepare('SELECT id, name FROM canteens WHERE id = ?').get(canteenId)
    if (!canteen) {
      return res.status(404).json(response.notFound('食堂不存在'))
    }

    const result = db.prepare(
      'INSERT INTO reviews (canteen_id, user, rating, content) VALUES (?, ?, ?, ?)'
    ).run(canteenId, user, rating, content)

    // 返回第一页评价
    const reviews = db.prepare(
      'SELECT * FROM reviews WHERE canteen_id = ? ORDER BY created_at DESC LIMIT 10'
    ).all(canteenId)

    logger.info(`新评价: ${user} 在「${canteen.name}」评分 ${rating}`)

    res.status(201).json(response.created(reviews, '评价发布成功'))
  } catch (err) {
    next(err)
  }
}

/** POST /api/canteen/reviews/:id/like — 点赞评价 */
exports.likeReview = (req, res, next) => {
  try {
    const db = getDb()
    const { id } = req.params

    const reviewId = parseInt(id)
    if (isNaN(reviewId)) {
      return res.status(400).json(response.badRequest('无效的评价ID'))
    }

    const review = db.prepare('SELECT * FROM reviews WHERE id = ?').get(reviewId)
    if (!review) {
      return res.status(404).json(response.notFound('评价不存在'))
    }

    db.prepare('UPDATE reviews SET likes = likes + 1 WHERE id = ?').run(reviewId)

    // 返回第一页评价
    const reviews = db.prepare(
      'SELECT * FROM reviews WHERE canteen_id = ? ORDER BY created_at DESC LIMIT 10'
    ).all(review.canteen_id)

    res.json(response.success(reviews, '点赞成功'))
  } catch (err) {
    next(err)
  }
}

/** PUT /api/canteen/reviews/:id — 编辑评价 */
exports.updateReview = (req, res, next) => {
  try {
    const db = getDb()
    const { id } = req.params
    const { rating, content, user } = req.body

    const reviewId = parseInt(id)
    if (isNaN(reviewId)) {
      return res.status(400).json(response.badRequest('无效的评价ID'))
    }

    const review = db.prepare('SELECT * FROM reviews WHERE id = ?').get(reviewId)
    if (!review) {
      return res.status(404).json(response.notFound('评价不存在'))
    }

    // 校验用户身份（简单校验：编辑时需提供原用户名）
    if (user !== review.user) {
      return res.status(403).json(response.forbidden('只能编辑自己的评价'))
    }

    // 构建更新字段
    const updates = []
    const params = []

    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json(response.badRequest('评分必须在1-5之间'))
      }
      updates.push('rating = ?')
      params.push(rating)
    }

    if (content !== undefined) {
      if (!content.trim()) {
        return res.status(400).json(response.badRequest('评价内容不能为空'))
      }
      updates.push('content = ?')
      params.push(content.trim())
    }

    if (updates.length === 0) {
      return res.status(400).json(response.badRequest('没有需要更新的字段'))
    }

    params.push(reviewId)
    db.prepare(`UPDATE reviews SET ${updates.join(', ')} WHERE id = ?`).run(...params)

    // 返回更新后的评价列表
    const reviews = db.prepare(
      'SELECT * FROM reviews WHERE canteen_id = ? ORDER BY created_at DESC LIMIT 10'
    ).all(review.canteen_id)

    logger.info(`评价更新: #${reviewId} 由 ${user} 修改`)

    res.json(response.success(reviews, '评价更新成功'))
  } catch (err) {
    next(err)
  }
}

/** GET /api/canteen/reviews/summary?canteenId= — AI 评价总结 */
exports.getReviewSummary = (req, res, next) => {
  try {
    const db = getDb()
    const canteenId = parseInt(req.query.canteenId) || 1

    // 获取食堂信息
    const canteen = db.prepare('SELECT * FROM canteens WHERE id = ?').get(canteenId)
    if (!canteen) {
      return res.status(404).json(response.notFound('食堂不存在'))
    }

    // 获取所有评价
    const reviews = db.prepare(
      'SELECT * FROM reviews WHERE canteen_id = ? ORDER BY created_at DESC'
    ).all(canteenId)

    if (reviews.length === 0) {
      return res.json(response.success({
        total_reviews: 0,
        avg_rating: 0,
        rating_distribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
        sentiment: { positive: 0, neutral: 0, negative: 0 },
        common_keywords: [],
        summary_text: '暂无评价，快来写第一条吧！',
        generated_at: new Date().toISOString(),
      }))
    }

    // ========== 评分分布 ==========
    const distribution = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }
    let totalRating = 0
    const allContents = []

    for (const r of reviews) {
      distribution[String(r.rating)]++
      totalRating += r.rating
      allContents.push(r.content)
    }

    const avgRating = Math.round((totalRating / reviews.length) * 10) / 10

    // ========== 情感分析 ==========
    const sentiment = { positive: 0, neutral: 0, negative: 0 }
    for (const r of reviews) {
      if (r.rating >= 4) sentiment.positive++
      else if (r.rating === 3) sentiment.neutral++
      else sentiment.negative++
    }

    // ========== 关键词提取（基于词典匹配） ==========
    const positiveWords = [
      '好吃','美味','不错','很棒','推荐','正宗','实惠','丰富','新鲜','给力',
      '满意','喜欢','赞','好喝','值得','划算','卫生','干净','精致','可口',
      '浓郁','份量足','量大','便宜','好评','优秀','过瘾','爽','香','绝',
    ]
    const negativeWords = [
      '难吃','一般','差','不好','失望','贵','油腻','咸','淡','少',
      '慢','差劲','不行','太差','糟糕','不新鲜','不干净'
    ]
    const foodCategory = [
      '螺蛳粉','米粉','拉面','牛肉面','酸汤鱼','牛肉','面条',
      '米饭','套餐','早餐','午餐','晚餐','杂酱粉','牛肉粉','菜品',
      '菜','汤','饭','粉','面','小吃','炒菜','盖饭','麻辣','火锅',
      '烧烤','炸鸡','汉堡','薯条','披萨','沙拉','寿司','刺身',
    ]

    // 提取关键词
    const wordCount = {}
    for (const content of allContents) {
      // 检查正向词
      for (const word of positiveWords) {
        if (content.includes(word)) {
          wordCount[word] = (wordCount[word] || 0) + 1
        }
      }
      // 检查负向词
      for (const word of negativeWords) {
        if (content.includes(word)) {
          wordCount[word] = (wordCount[word] || 0) + 1
        }
      }
      // 检查菜品/品类词
      for (const word of foodCategory) {
        if (content.includes(word)) {
          wordCount[word] = (wordCount[word] || 0) + 1
        }
      }
    }

    // 按出现频率排序，取前 10 个
    const commonKeywords = Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word)

    // ========== 生成自然语言总结 ==========
    let summaryText = ''

    // 总体评价
    if (avgRating >= 4.5) {
      summaryText += `同学们对「${canteen.name}」的评价非常出色，平均评分 ${avgRating} 分`
    } else if (avgRating >= 4.0) {
      summaryText += `同学们对「${canteen.name}」的评价总体较好，平均评分 ${avgRating} 分`
    } else if (avgRating >= 3.0) {
      summaryText += `同学们对「${canteen.name}」的评价中等偏上，平均评分 ${avgRating} 分`
    } else {
      summaryText += `同学们对「${canteen.name}」的评价有待提升，平均评分 ${avgRating} 分`
    }

    // 评价数量
    summaryText += `，共 ${reviews.length} 条评价。`

    // 情感分布
    const posPercent = Math.round((sentiment.positive / reviews.length) * 100)
    if (posPercent >= 80) {
      summaryText += `绝大多数同学（${posPercent}%）给出了好评`
    } else if (posPercent >= 60) {
      summaryText += `大部分同学（${posPercent}%）给出了好评`
    } else if (posPercent >= 40) {
      summaryText += `约半数同学（${posPercent}%）给出了好评`
    } else {
      summaryText += `好评率较低（${posPercent}%）`
    }

    // 评分分布详情
    const fiveStar = distribution['5']
    const fourStar = distribution['4']
    if (fiveStar > 0) {
      summaryText += `，其中 ${fiveStar} 人给出 5 星满分好评`
      if (fourStar > 0) summaryText += `，${fourStar} 人给出 4 星好评`
    }
    summaryText += '。'

    // 关键词总结
    if (commonKeywords.length > 0) {
      const posKeywords = commonKeywords.filter(w => positiveWords.includes(w))
      const negKeywords = commonKeywords.filter(w => negativeWords.includes(w))
      const foodKeywords = commonKeywords.filter(w => foodCategory.includes(w))

      if (posKeywords.length > 0) {
        summaryText += `被频繁提及的评价词：${posKeywords.slice(0, 5).join('、')}。`
      }
      if (foodKeywords.length > 0) {
        summaryText += `热门菜品/品类：${foodKeywords.slice(0, 5).join('、')}。`
      }
      if (negKeywords.length > 0) {
        summaryText += `有待改进的方面：${negKeywords.slice(0, 3).join('、')}。`
      }
    }

    // 评分分布柱状图数据
    const ratingBars = [5, 4, 3, 2, 1].map(star => ({
      rating: star,
      count: distribution[String(star)],
      percent: Math.round((distribution[String(star)] / reviews.length) * 100),
    }))

    logger.info(`AI评价总结生成: 「${canteen.name}」${reviews.length}条评价`)

    res.json(response.success({
      total_reviews: reviews.length,
      avg_rating: avgRating,
      rating_distribution: distribution,
      rating_bars: ratingBars,
      sentiment,
      common_keywords: commonKeywords,
      summary_text: summaryText,
      generated_at: new Date().toISOString(),
    }))
  } catch (err) {
    next(err)
  }
}

/** DELETE /api/canteen/reviews/:id — 删除评价 */
exports.deleteReview = (req, res, next) => {
  try {
    const db = getDb()
    const { id } = req.params

    const reviewId = parseInt(id)
    if (isNaN(reviewId)) {
      return res.status(400).json(response.badRequest('无效的评价ID'))
    }

    const review = db.prepare('SELECT * FROM reviews WHERE id = ?').get(reviewId)
    if (!review) {
      return res.status(404).json(response.notFound('评价不存在'))
    }

    const { user } = req.body
    // 校验用户身份（必须提供用户名且匹配）
    if (!user || user !== review.user) {
      return res.status(403).json(response.forbidden('只能删除自己的评价'))
    }

    db.prepare('DELETE FROM reviews WHERE id = ?').run(reviewId)

    // 返回更新后的评价列表
    const reviews = db.prepare(
      'SELECT * FROM reviews WHERE canteen_id = ? ORDER BY created_at DESC LIMIT 10'
    ).all(review.canteen_id)

    logger.info(`评价删除: #${reviewId} 被删除`)

    res.json(response.success(reviews, '评价删除成功'))
  } catch (err) {
    next(err)
  }
}