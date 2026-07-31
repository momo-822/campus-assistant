require('dotenv').config()

const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const path = require('path')
const fs = require('fs')
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler')
const routes = require('./routes')
const logger = require('./utils/logger')

const app = express()
const PORT = process.env.PORT || 3001

// ─── 中间件 ─────────────────────────────────────────────
app.use(cors({
  origin: function (origin, callback) {
    // 允许所有来源（生产环境）
    callback(null, true)
  },
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

// ─── 静态文件 ──────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
app.use(express.static(path.join(__dirname, 'dist')))

// ─── 路由 ───────────────────────────────────────────────
app.use('/api', routes)

// ─── 健康检查 ──────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})

// ─── SPA 降级：所有非 API 请求返回 index.html ─────────
app.get('*', (req, res) => {
  // 健康检查已在前面处理，这里只放行 /api /uploads /health
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path === '/health') {
    return res.status(404).json({ success: false, code: 404, message: '接口不存在' })
  }
  const indexPath = path.join(__dirname, 'dist', 'index.html')
  logger.info(`SPA serve: ${req.path} -> ${indexPath}`)
  res.sendFile(indexPath)
})

// ─── 错误处理 ──────────────────────────────────────────
app.use(notFoundHandler)
app.use(errorHandler)

// ─── 自动种子数据 ─────────────────────────────────────
function seedData() {
  try {
    const { getDb } = require('./config/db')
    const db = getDb()
    const bcrypt = require('bcryptjs')

    // 检查是否已存在数据
    const canteenCount = db.prepare('SELECT COUNT(*) as cnt FROM canteens').get().cnt
    if (canteenCount > 0) {
      logger.info('数据库已有数据，跳过种子数据')
      return
    }

    logger.info('🌱 开始插入种子数据...')

    // 食堂
    const insertCanteen = db.prepare('INSERT INTO canteens (id, name, type, hours) VALUES (?, ?, ?, ?)')
    const canteens = [
      [1, '东区食堂', '中餐', '06:30-22:00'],
      [2, '西区食堂', '中餐', '06:30-21:30'],
      [3, '民族风味餐厅', '特色', '07:00-21:00'],
      [4, '清真食堂', '清真', '06:30-20:30'],
      [5, '教职工食堂', '中餐', '07:00-19:00'],
    ]
    const insertCanteens = db.transaction(() => { for (const c of canteens) insertCanteen.run(...c) })
    insertCanteens()

    // 评价
    const insertReview = db.prepare('INSERT INTO reviews (id, canteen_id, user, rating, content, likes) VALUES (?, ?, ?, ?, ?, ?)')
    const reviews = [
      [1, 1, '张三', 5, '东区食堂的螺蛳粉非常正宗，汤底浓郁，配料丰富，价格也很实惠！', 18],
      [2, 1, '李四', 4, '整体不错，就是中午人太多了，建议错峰就餐。', 1],
      [3, 1, '王五', 5, '早餐的米粉很好吃，推荐杂酱粉和牛肉粉。', 18],
      [4, 2, '赵六', 4, '西区食堂的麻辣香锅味道不错，分量也很足。', 5],
      [5, 2, '小明', 3, '价格稍微有点贵，但味道还可以。', 2],
      [6, 3, '小红', 5, '民族风味餐厅的烤鱼非常好吃，推荐！', 12],
      [7, 4, '小刚', 4, '清真食堂的牛肉面很正宗，环境也很干净。', 8],
    ]
    const insertReviews = db.transaction(() => { for (const r of reviews) insertReview.run(...r) })
    insertReviews()

    // 二手商品
    const insertItem = db.prepare('INSERT INTO trade_items (id, title, category, price, original_price, description, user, contact) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    const items = [
      [1, '高等数学（第七版）', '教材', 25.00, 58.00, '九成新，有少量笔记，不影响阅读', '张三', '138****1234'],
      [2, '全新U盘64G', '电子产品', 45.00, 89.00, '买来没用过，支持USB3.0', '李四', '139****5678'],
      [3, '自行车（山地车）', '生活用品', 200.00, 500.00, '骑了半年，正常磨损，适合通勤', '王五', '137****9012'],
      [4, '英语四级真题', '教材', 15.00, 45.00, '2024年最新版，含解析', '赵六', '136****3456'],
      [5, '台灯（护眼）', '生活用品', 35.00, 79.00, '三档调光，LED护眼', '小明', '135****7890'],
      [6, '电风扇', '生活用品', 50.00, 120.00, '夏天必备，遥控定时', '小红', '134****2345'],
    ]
    const insertItems = db.transaction(() => { for (const item of items) insertItem.run(...item) })
    insertItems()

    // 失物招领
    const insertLost = db.prepare('INSERT INTO lost_found (id, type, title, description, location, contact, user, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    const lostFounds = [
      [1, 'lost', '校园卡丢失', '在东区食堂附近丢失，姓名：张三，学号2024****', '东区食堂', '138****1234', '张三', 'pending'],
      [2, 'found', '捡到一串钥匙', '在图书馆三楼捡到，银色钥匙串上有三个钥匙', '图书馆三楼', '139****5678', '李四', 'pending'],
      [3, 'lost', '蓝色水杯丢失', '一个蓝色保温杯，放在教室忘记拿了', '教学楼201', '137****9012', '王五', 'pending'],
      [4, 'found', '捡到一本笔记本', '黑色皮面笔记本，封面写有"课堂笔记"', '操场', '136****3456', '赵六', 'pending'],
      [5, 'lost', '黑色双肩包丢失', '内有笔记本电脑和充电器', '图书馆', '135****7890', '小明', 'pending'],
    ]
    const insertLosts = db.transaction(() => { for (const lf of lostFounds) insertLost.run(...lf) })
    insertLosts()

    // 课表
    const insertSchedule = db.prepare('INSERT INTO schedules (id, course_name, teacher, classroom, day_of_week, start_time, end_time, weeks) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    const schedules = [
      [1, '高等数学', '王教授', '教学楼301', 1, '08:00', '09:40', '1-16周'],
      [2, '大学英语', '李老师', '教学楼201', 1, '10:00', '11:40', '1-16周'],
      [3, '数据结构', '陈教授', '实验楼501', 2, '08:00', '09:40', '1-16周'],
      [4, '体育', '张老师', '体育馆', 2, '10:00', '11:40', '1-16周'],
      [5, '线性代数', '刘教授', '教学楼302', 3, '08:00', '09:40', '1-16周'],
      [6, '计算机网络', '周教授', '实验楼502', 3, '14:00', '15:40', '1-16周'],
      [7, '操作系统', '吴教授', '教学楼303', 4, '08:00', '09:40', '1-16周'],
      [8, '毛泽东思想概论', '马老师', '教学楼101', 4, '10:00', '11:40', '1-16周'],
      [9, '概率论与数理统计', '郑教授', '教学楼301', 5, '08:00', '09:40', '1-16周'],
      [10, 'Java程序设计', '黄老师', '实验楼503', 5, '14:00', '15:40', '1-16周'],
    ]
    const insertSchedules = db.transaction(() => { for (const s of schedules) insertSchedule.run(...s) })
    insertSchedules()

    // 测试用户
    const hashedPassword = bcrypt.hashSync('123456', 10)
    const insertUser = db.prepare('INSERT INTO users (id, username, email, password, nickname) VALUES (?, ?, ?, ?, ?)')
    const users = [
      [1, 'testuser', 'test@example.com', hashedPassword, '测试用户'],
      [2, 'admin', 'admin@example.com', hashedPassword, '管理员'],
    ]
    const insertUsers = db.transaction(() => { for (const u of users) insertUser.run(...u) })
    insertUsers()

    logger.info('🎉 种子数据插入完成！测试账号: testuser / 123456')
  } catch (err) {
    logger.warn('种子数据插入失败（可能已存在）:', err.message)
  }
}

// ─── 启动服务 ──────────────────────────────────────────
app.listen(PORT, () => {
  logger.info(`服务器已启动 → http://localhost:${PORT}`)
  logger.info(`健康检查 → http://localhost:${PORT}/health`)
  logger.info(`API 前缀 → http://localhost:${PORT}/api`)
  seedData()
})

module.exports = app