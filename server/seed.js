/**
 * 数据库种子数据脚本
 * 运行: node seed.js
 */
const path = require('path')
const Database = require('better-sqlite3')

const DB_PATH = path.join(__dirname, 'data', 'campus.db')
const db = new Database(DB_PATH)

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

console.log('🌱 开始插入种子数据...')

// 插入食堂数据
const insertCanteen = db.prepare('INSERT OR IGNORE INTO canteens (id, name, type, hours) VALUES (?, ?, ?, ?)')
const canteens = [
  [1, '东区食堂', '中餐', '06:30-22:00'],
  [2, '西区食堂', '中餐', '06:30-21:30'],
  [3, '民族风味餐厅', '特色', '07:00-21:00'],
  [4, '清真食堂', '清真', '06:30-20:30'],
  [5, '教职工食堂', '中餐', '07:00-19:00'],
]

const insertMany = db.transaction(() => {
  for (const c of canteens) {
    insertCanteen.run(...c)
  }
})
insertMany()
console.log(`✅ 已插入 ${canteens.length} 个食堂`)

// 插入评价数据
const insertReview = db.prepare(
  'INSERT OR IGNORE INTO reviews (id, canteen_id, user, rating, content, likes) VALUES (?, ?, ?, ?, ?, ?)'
)
const reviews = [
  [1, 1, '张三', 5, '东区食堂的螺蛳粉非常正宗，汤底浓郁，配料丰富，价格也很实惠！', 18],
  [2, 1, '李四', 4, '整体不错，就是中午人太多了，建议错峰就餐。', 1],
  [3, 1, '王五', 5, '早餐的米粉很好吃，推荐杂酱粉和牛肉粉。', 18],
  [4, 2, '赵六', 4, '西区食堂的麻辣香锅味道不错，分量也很足。', 5],
  [5, 2, '小明', 3, '价格稍微有点贵，但味道还可以。', 2],
  [6, 3, '小红', 5, '民族风味餐厅的烤鱼非常好吃，推荐！', 12],
  [7, 4, '小刚', 4, '清真食堂的牛肉面很正宗，环境也很干净。', 8],
]

const insertReviews = db.transaction(() => {
  for (const r of reviews) {
    insertReview.run(...r)
  }
})
insertReviews()
console.log(`✅ 已插入 ${reviews.length} 条评价`)

// 插入二手商品数据
const insertItem = db.prepare(
  'INSERT OR IGNORE INTO trade_items (id, title, category, price, original_price, description, user, contact) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
)
const items = [
  [1, '高等数学（第七版）', '教材', 25.00, 58.00, '九成新，有少量笔记，不影响阅读', '张三', '138****1234'],
  [2, '全新U盘64G', '电子产品', 45.00, 89.00, '买来没用过，支持USB3.0', '李四', '139****5678'],
  [3, '自行车（山地车）', '生活用品', 200.00, 500.00, '骑了半年，正常磨损，适合通勤', '王五', '137****9012'],
  [4, '英语四级真题', '教材', 15.00, 45.00, '2024年最新版，含解析', '赵六', '136****3456'],
  [5, '台灯（护眼）', '生活用品', 35.00, 79.00, '三档调光，LED护眼', '小明', '135****7890'],
  [6, '电风扇', '生活用品', 50.00, 120.00, '夏天必备，遥控定时', '小红', '134****2345'],
]

const insertItems = db.transaction(() => {
  for (const item of items) {
    insertItem.run(...item)
  }
})
insertItems()
console.log(`✅ 已插入 ${items.length} 个二手商品`)

// 插入失物招领数据
const insertLostFound = db.prepare(
  'INSERT OR IGNORE INTO lost_found (id, type, title, description, location, contact, user, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
)
const lostFounds = [
  [1, 'lost', '校园卡丢失', '在东区食堂附近丢失，姓名：张三，学号2024****', '东区食堂', '138****1234', '张三', 'pending'],
  [2, 'found', '捡到一串钥匙', '在图书馆三楼捡到，银色钥匙串上有三个钥匙', '图书馆三楼', '139****5678', '李四', 'pending'],
  [3, 'lost', '蓝色水杯丢失', '一个蓝色保温杯，放在教室忘记拿了', '教学楼201', '137****9012', '王五', 'pending'],
  [4, 'found', '捡到一本笔记本', '黑色皮面笔记本，封面写有"课堂笔记"', '操场', '136****3456', '赵六', 'pending'],
  [5, 'lost', '黑色双肩包丢失', '内有笔记本电脑和充电器', '图书馆', '135****7890', '小明', 'pending'],
]

const insertLostFounds = db.transaction(() => {
  for (const lf of lostFounds) {
    insertLostFound.run(...lf)
  }
})
insertLostFounds()
console.log(`✅ 已插入 ${lostFounds.length} 条失物招领`)

// 插入课表数据
const insertSchedule = db.prepare(
  'INSERT OR IGNORE INTO schedules (id, course_name, teacher, classroom, day_of_week, start_time, end_time, weeks) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
)
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

const insertSchedules = db.transaction(() => {
  for (const s of schedules) {
    insertSchedule.run(...s)
  }
})
insertSchedules()
console.log(`✅ 已插入 ${schedules.length} 条课表数据`)

// 插入测试用户
const bcrypt = require('bcryptjs')
const hashedPassword = bcrypt.hashSync('123456', 10)

const insertUser = db.prepare(
  'INSERT OR IGNORE INTO users (id, username, email, password, nickname) VALUES (?, ?, ?, ?, ?)'
)

const users = [
  [1, 'testuser', 'test@example.com', hashedPassword, '测试用户'],
  [2, 'admin', 'admin@example.com', hashedPassword, '管理员'],
]

const insertUsers = db.transaction(() => {
  for (const u of users) {
    insertUser.run(...u)
  }
})
insertUsers()
console.log(`✅ 已插入 ${users.length} 个测试用户（密码: 123456）`)

console.log('🎉 种子数据插入完成！')
console.log('📝 测试账号: testuser / 123456')
db.close()