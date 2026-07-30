// ========== 课表模拟数据 ==========

export interface Course {
  id: number
  name: string
  teacher: string
  room: string
  weeks: string
}

export interface ScheduleDay {
  day: string
  courses: (Course | null)[]
}

export const periods = [
  '第1-2节 08:00-09:40',
  '第3-4节 10:00-11:40',
  '第5-6节 14:00-15:40',
  '第7-8节 16:00-17:40',
]

export const mockSchedule: ScheduleDay[] = [
  {
    day: '周一',
    courses: [
      { id: 1, name: '高等数学', teacher: '张教授', room: 'A101', weeks: '1-16周' },
      { id: 2, name: '大学英语', teacher: '李老师', room: 'B203', weeks: '1-16周' },
      null,
      null,
    ],
  },
  {
    day: '周二',
    courses: [
      null,
      { id: 3, name: '数据结构', teacher: '王教授', room: 'C301', weeks: '1-16周' },
      { id: 4, name: '体育', teacher: '陈老师', room: '体育馆', weeks: '1-16周' },
      null,
    ],
  },
  {
    day: '周三',
    courses: [
      { id: 5, name: '线性代数', teacher: '刘教授', room: 'A102', weeks: '1-16周' },
      null,
      { id: 6, name: '操作系统', teacher: '赵教授', room: 'C302', weeks: '1-16周' },
      null,
    ],
  },
  {
    day: '周四',
    courses: [
      { id: 1, name: '高等数学', teacher: '张教授', room: 'A101', weeks: '1-16周' },
      { id: 3, name: '数据结构', teacher: '王教授', room: 'C301', weeks: '1-16周' },
      null,
      { id: 7, name: '思想政治', teacher: '周老师', room: 'D101', weeks: '1-16周' },
    ],
  },
  {
    day: '周五',
    courses: [
      null,
      { id: 2, name: '大学英语', teacher: '李老师', room: 'B203', weeks: '1-16周' },
      null,
      { id: 8, name: '程序设计实验', teacher: '王教授', room: '实验楼401', weeks: '3-16周' },
    ],
  },
]

// ========== 食堂模拟数据 ==========

export interface Review {
  id: number
  canteenId: number
  user: string
  rating: number
  content: string
  likes: number
  time: string
  canteenName?: string
}

export const canteens = [
  { id: 1, name: '第一食堂', type: '大众餐饮', hours: '06:30-21:00' },
  { id: 2, name: '第二食堂', type: '风味小吃', hours: '07:00-22:00' },
  { id: 3, name: '民族餐厅', type: '民族特色窗口', hours: '07:00-20:30' },
  { id: 4, name: '教工餐厅', type: '自助餐', hours: '07:00-19:00' },
]

export const mockReviews: Review[] = [
  { id: 1, canteenId: 3, user: '小明', rating: 5, content: '民族餐厅的兰州拉面太正宗了，牛肉给得足！', likes: 23, time: '10分钟前' },
  { id: 2, canteenId: 1, user: '小红', rating: 4, content: '第一食堂今天有糖醋排骨，味道不错，就是排队有点长。', likes: 15, time: '30分钟前' },
  { id: 3, canteenId: 2, user: '大伟', rating: 3, content: '第二食堂的麻辣香锅一般般，价格偏贵。', likes: 8, time: '1小时前' },
  { id: 4, canteenId: 1, user: '小芳', rating: 5, content: '早餐的包子很不错，推荐鲜肉包！', likes: 19, time: '2小时前' },
  { id: 5, canteenId: 4, user: '李老师', rating: 4, content: '教工餐厅的自助餐种类丰富，性价比高。', likes: 12, time: '3小时前' },
  { id: 6, canteenId: 3, user: '阿丽', rating: 5, content: '民族餐厅的烤羊肉串太香了，每次必点！', likes: 31, time: '4小时前' },
  { id: 7, canteenId: 2, user: '小刚', rating: 4, content: '第二食堂的螺蛳粉很正宗，酸笋够味。', likes: 20, time: '5小时前' },
  { id: 8, canteenId: 1, user: '学姐', rating: 3, content: '第一食堂的麻辣烫一般，菜品不够新鲜。', likes: 7, time: '6小时前' },
]

// ========== 二手交易模拟数据 ==========

export interface TradeItem {
  id: number
  title: string
  price: string
  originalPrice: string
  category: string
  user: string
  description: string
  time: string
}

export const categories = ['全部', '教材', '电子产品', '生活用品', '其他']

export const mockItems: TradeItem[] = [
  { id: 1, title: '高等数学第七版', price: '15', originalPrice: '49', category: '教材', user: '学长', description: '九成新，有少量笔记，不影响阅读', time: '2小时前' },
  { id: 2, title: '二手iPad Air 4', price: '1800', originalPrice: '4599', category: '电子产品', user: '小李', description: '使用一年，屏幕完好，配件齐全', time: '5小时前' },
  { id: 3, title: '宿舍台灯', price: '20', originalPrice: '89', category: '生活用品', user: '小王', description: 'LED护眼，三档调光', time: '1天前' },
  { id: 4, title: '数据结构（C语言版）', price: '10', originalPrice: '39', category: '教材', user: '学姐', description: '几乎全新，仅翻看过几页', time: '1天前' },
  { id: 5, title: '蓝牙耳机', price: '120', originalPrice: '299', category: '电子产品', user: '小张', description: '续航好，音质不错', time: '2天前' },
  { id: 6, title: '收纳盒套装', price: '15', originalPrice: '45', category: '生活用品', user: '小刘', description: '全新未使用，毕业清仓', time: '2天前' },
]

// ========== 失物招领模拟数据 ==========

export interface LostFoundPost {
  id: number
  type: 'lost' | 'found'
  title: string
  description: string
  location: string
  user: string
  contact: string
  time: string
  status: '进行中' | '已找回' | '已归还'
}

export const mockPosts: LostFoundPost[] = [
  { id: 1, type: 'lost', title: '蓝色水杯', description: '膳魔师保温杯，蓝色，落在第二食堂', location: '第二食堂', user: '小张', contact: '微信: zhang123', time: '30分钟前', status: '进行中' },
  { id: 2, type: 'found', title: '捡到校园卡', description: '在图书馆三楼捡到，姓名：王小明，学号2024xxxx', location: '图书馆三楼', user: '热心同学', contact: '联系宿管阿姨', time: '1小时前', status: '进行中' },
  { id: 3, type: 'lost', title: '黑色书包', description: '黑色双肩包，内有笔记本电脑和课本', location: '操场看台', user: '小李', contact: '电话: 138xxxx', time: '3小时前', status: '进行中' },
  { id: 4, type: 'found', title: '捡到钥匙串', description: '一串钥匙，有U盘挂件', location: '教学楼A座203', user: '王老师', contact: '交到A座一楼值班室', time: '5小时前', status: '已归还' },
  { id: 5, type: 'lost', title: '白色耳机', description: 'AirPods白色，左耳丢失', location: '食堂到宿舍的路上', user: '小刘', contact: '微信: liu666', time: '昨天', status: '进行中' },
  { id: 6, type: 'found', title: '捡到钱包', description: '黑色短款钱包，内有少量现金和银行卡', location: '校门口', user: '保安大叔', contact: '校门口保安室', time: '昨天', status: '已找回' },
]

// ========== 作业管理模拟数据 ==========

export interface Homework {
  id: number
  /** 序号 */
  index: number
  /** 材料名称 */
  name: string
  /** 对应课节 */
  lesson: string
  /** 提交形式 */
  format: string
  /** 分值 */
  score: string
  /** 具体要求 */
  requirement: string
  /** 课程名称 */
  courseName: string
  /** 截止日期 */
  deadline: string
  /** 状态 */
  status: '待提交' | '已提交' | '已批改'
}

export const mockHomework: Homework[] = [
  {
    id: 1, index: 1, courseName: 'Web前端开发技术',
    name: '可复用组件',
    lesson: '第5节 实践',
    format: '截图+项目链接',
    score: '3分',
    requirement: '请在之前组件基础上，设计并创建更多可复用的组件，如Navbar、Footer、FeatureCard、Props等，并展示如何将这些组件组合成完整的页面布局。通过实例演示组件的复用性和组合能力。',
    deadline: '2026-07-30',
    status: '待提交',
  },
  {
    id: 2, index: 2, courseName: 'Web前端开发技术',
    name: '页面路由配置',
    lesson: '第6节 实践',
    format: '项目链接',
    score: '5分',
    requirement: '使用React Router配置多页面路由，包含首页、课表、食堂、二手交易、失物招领等页面，实现导航栏的路由跳转和页面切换效果。',
    deadline: '2026-08-06',
    status: '待提交',
  },
  {
    id: 3, index: 3, courseName: '数据结构',
    name: '链表操作实验',
    lesson: '第3节 实验',
    format: '代码+报告',
    score: '8分',
    requirement: '实现单链表的创建、插入、删除、查找等基本操作，并编写实验报告分析各操作的时间复杂度。',
    deadline: '2026-07-28',
    status: '已提交',
  },
  {
    id: 4, index: 4, courseName: '数据结构',
    name: '栈和队列应用',
    lesson: '第4节 实验',
    format: '代码+截图',
    score: '6分',
    requirement: '利用栈实现表达式求值，利用队列实现循环队列的基本操作，提交代码运行截图和源代码。',
    deadline: '2026-08-10',
    status: '待提交',
  },
  {
    id: 5, index: 5, courseName: '高等数学',
    name: '导数与微分',
    lesson: '第5节 作业',
    format: '拍照上传',
    score: '4分',
    requirement: '完成教材第二章习题1-10题，要求书写工整，步骤完整，拍照上传至课程平台。',
    deadline: '2026-07-25',
    status: '已批改',
  },
]

// ========== 用户模拟数据 ==========

export interface User {
  id: number
  name: string
  studentId: string
  avatar: string
  email: string
}

export const mockUser: User = {
  id: 1,
  name: '张三',
  studentId: '2024010101',
  avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=张三',
  email: 'zhangsan@stu.gxmzu.edu.cn',
}