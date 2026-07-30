/**
 * 数据库初始数据填充脚本
 * 运行：node scripts/seed.js
 */
const Database = require('better-sqlite3')
const bcrypt = require('bcryptjs')
const path = require('path')

const dbPath = path.join(__dirname, '..', 'data', 'campus.db')
const db = new Database(dbPath)

// ─── 清空旧数据 ─────────────────────────────────────────────
db.exec(`
  DELETE FROM favorites;
  DELETE FROM homework;
  DELETE FROM reviews;
  DELETE FROM trade_items;
  DELETE FROM lost_found;
  DELETE FROM schedules;
  DELETE FROM canteens;
  DELETE FROM users;
`)

// ─── 1. 用户 ────────────────────────────────────────────────
const hashedPwd = bcrypt.hashSync('123456', 10)
db.prepare(
  'INSERT INTO users (username, email, nickname, password) VALUES (?, ?, ?, ?)'
).run('testuser', 'test@example.com', '测试用户', hashedPwd)

// ─── 2. 食堂 ────────────────────────────────────────────────
const canteens = [
  { name: '东区食堂', type: '中餐', hours: '06:30-22:00' },
  { name: '西区食堂', type: '中餐', hours: '06:30-21:30' },
  { name: '民族风味餐厅', type: '特色', hours: '07:00-21:00' },
  { name: '清真食堂', type: '清真', hours: '06:30-20:30' },
  { name: '教职工食堂', type: '中餐', hours: '07:00-19:00' },
]
const insertCanteen = db.prepare('INSERT INTO canteens (name, type, hours) VALUES (?, ?, ?)')
canteens.forEach(c => insertCanteen.run(c.name, c.type, c.hours))

// ─── 3. 评价 ────────────────────────────────────────────────
const reviews = [
  { canteen_id: 1, user: '张三', rating: 5, content: '东区食堂的螺蛳粉非常正宗，汤底浓郁，配料丰富，价格也很实惠！' },
  { canteen_id: 1, user: '李四', rating: 4, content: '整体不错，就是中午人太多了，建议错峰就餐。' },
  { canteen_id: 2, user: '王五', rating: 3, content: '西区食堂菜品一般，但是环境比较好，适合自习。' },
  { canteen_id: 3, user: '赵六', rating: 5, content: '民族风味餐厅的酸汤鱼太棒了，每次来都必点！' },
  { canteen_id: 4, user: '钱七', rating: 4, content: '清真食堂的牛肉面味道很好，分量也足。' },
  { canteen_id: 1, user: '孙八', rating: 5, content: '早餐的米粉很好吃，推荐杂酱粉和牛肉粉。' },
]
const insertReview = db.prepare('INSERT INTO reviews (canteen_id, user, rating, content, likes) VALUES (?, ?, ?, ?, ?)')
reviews.forEach(r => insertReview.run(r.canteen_id, r.user, r.rating, r.content, Math.floor(Math.random() * 20)))

// ─── 4. 二手商品 ──────────────────────────────────────────
const items = [
  { title: '高等数学（第七版）', category: '教材', price: 25, original_price: 58, description: '九成新，有少量笔记，不影响阅读', user: '张三', contact: '微信: zhangsan' },
  { title: '全新U盘64G', category: '数码', price: 45, original_price: 89, description: '买来没用过，支持USB3.0', user: '李四', contact: 'QQ: 123456' },
  { title: '自行车（山地车）', category: '出行', price: 200, original_price: 600, description: '骑了半年，正常磨损，适合通勤', user: '王五', contact: '手机: 138****1234' },
  { title: '英语四级真题', category: '教材', price: 15, original_price: 45, description: '2024年最新版，含解析', user: '赵六', contact: '微信: zhaoliu' },
  { title: '台灯（护眼）', category: '生活', price: 35, original_price: 80, description: '三档调光，LED护眼', user: '钱七', contact: 'QQ: 789012' },
  { title: '电风扇', category: '生活', price: 50, original_price: 120, description: '夏天必备，遥控定时', user: '孙八', contact: '微信: sunba' },
]
const insertItem = db.prepare('INSERT INTO trade_items (title, category, price, original_price, description, user) VALUES (?, ?, ?, ?, ?, ?)')
items.forEach(i => insertItem.run(i.title, i.category, i.price, i.original_price, i.description, i.user))

// ─── 5. 失物招领 ──────────────────────────────────────────
const lostItems = [
  { type: 'lost', title: '校园卡丢失', description: '在东区食堂附近丢失，姓名：张三，学号2024****', location: '东区食堂', contact: '手机: 138****1234', user: '张三' },
  { type: 'found', title: '捡到一串钥匙', description: '在图书馆三楼捡到，银色钥匙串上有三个钥匙', location: '图书馆', contact: '交到图书馆前台', user: '李四' },
  { type: 'lost', title: '蓝色水杯丢失', description: '一个蓝色保温杯，放在教室忘记拿了', location: '教学楼2栋301', contact: '微信: zhangsan', user: '王五' },
  { type: 'found', title: '捡到一本笔记本', description: '黑色皮面笔记本，封面写有"课堂笔记"', location: '西区食堂二楼', contact: '交到食堂失物招领处', user: '赵六' },
  { type: 'lost', title: '黑色双肩包丢失', description: '内有笔记本电脑和充电器', location: '操场看台', contact: '手机: 139****5678', user: '钱七' },
]
const insertLost = db.prepare('INSERT INTO lost_found (type, title, description, location, contact, user) VALUES (?, ?, ?, ?, ?, ?)')
lostItems.forEach(l => insertLost.run(l.type, l.title, l.description, l.location, l.contact, l.user))

// ─── 6. 课表 ────────────────────────────────────────────────
const schedules = [
  { course_name: '高等数学', teacher: '王教授', classroom: '教学楼1栋101', day_of_week: 1, start_time: '08:00', end_time: '09:40', weeks: '1-16周' },
  { course_name: '大学英语', teacher: '李老师', classroom: '教学楼2栋201', day_of_week: 1, start_time: '10:00', end_time: '11:40', weeks: '1-16周' },
  { course_name: '数据结构', teacher: '陈教授', classroom: '计算机楼301', day_of_week: 2, start_time: '08:00', end_time: '09:40', weeks: '1-16周' },
  { course_name: '体育', teacher: '张老师', classroom: '体育馆', day_of_week: 2, start_time: '14:00', end_time: '15:40', weeks: '1-16周' },
  { course_name: '线性代数', teacher: '刘教授', classroom: '教学楼1栋102', day_of_week: 3, start_time: '08:00', end_time: '09:40', weeks: '1-16周' },
  { course_name: '思想政治', teacher: '周老师', classroom: '教学楼3栋101', day_of_week: 3, start_time: '10:00', end_time: '11:40', weeks: '1-16周' },
  { course_name: '操作系统', teacher: '黄教授', classroom: '计算机楼302', day_of_week: 4, start_time: '08:00', end_time: '09:40', weeks: '1-16周' },
  { course_name: '大学物理', teacher: '赵教授', classroom: '教学楼1栋201', day_of_week: 4, start_time: '14:00', end_time: '15:40', weeks: '1-16周' },
  { course_name: '计算机网络', teacher: '吴教授', classroom: '计算机楼303', day_of_week: 5, start_time: '08:00', end_time: '09:40', weeks: '1-16周' },
  { course_name: '概率论', teacher: '郑教授', classroom: '教学楼1栋103', day_of_week: 5, start_time: '10:00', end_time: '11:40', weeks: '1-16周' },
]
const insertSchedule = db.prepare('INSERT INTO schedules (course_name, teacher, classroom, day_of_week, start_time, end_time, weeks) VALUES (?, ?, ?, ?, ?, ?, ?)')
schedules.forEach(s => insertSchedule.run(s.course_name, s.teacher, s.classroom, s.day_of_week, s.start_time, s.end_time, s.weeks))

// ─── 7. 作业 ────────────────────────────────────────────────
const homework = [
  { course_name: '高等数学', title: '第三章习题1-10', description: '完成课后习题1到10题，下周一交', deadline: '2026-08-05', status: 'pending' },
  { course_name: '数据结构', title: '链表实现实验报告', description: '用C语言实现单向链表和双向链表，提交实验报告', deadline: '2026-08-01', status: 'submitted' },
  { course_name: '大学英语', title: 'Unit 4 作文', description: 'Write an essay about your campus life (300 words)', deadline: '2026-07-30', status: 'graded' },
  { course_name: '操作系统', title: '进程调度模拟', description: '实现FCFS、SJF、RR三种调度算法', deadline: '2026-08-10', status: 'pending' },
  { course_name: '线性代数', title: '矩阵运算练习', description: '完成矩阵乘法和逆矩阵相关习题', deadline: '2026-07-28', status: 'pending' },
]
const insertHomework = db.prepare('INSERT INTO homework (course_name, title, description, deadline, status) VALUES (?, ?, ?, ?, ?)')
homework.forEach(h => insertHomework.run(h.course_name, h.title, h.description, h.deadline, h.status))

// ─── 验证 ──────────────────────────────────────────────────
console.log('✅ 数据填充完成！')
console.log('  用户:', db.prepare('SELECT COUNT(*) as c FROM users').get().c)
console.log('  食堂:', db.prepare('SELECT COUNT(*) as c FROM canteens').get().c)
console.log('  评价:', db.prepare('SELECT COUNT(*) as c FROM reviews').get().c)
console.log('  二手商品:', db.prepare('SELECT COUNT(*) as c FROM trade_items').get().c)
console.log('  失物招领:', db.prepare('SELECT COUNT(*) as c FROM lost_found').get().c)
console.log('  课表:', db.prepare('SELECT COUNT(*) as c FROM schedules').get().c)
console.log('  作业:', db.prepare('SELECT COUNT(*) as c FROM homework').get().c)

db.close()