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
      { id: 3, name: '数据结构', teacher: '王教授', room: 'C301', weeks: '1-16周' },
      { id: 4, name: '体育', teacher: '陈老师', room: '体育馆', weeks: '1-16周' },
      { id: 5, name: 'Web前端开发', teacher: '黄老师', room: '实验楼503', weeks: '3-16周' },
      null,
    ],
  },
  {
    day: '周三',
    courses: [
      { id: 6, name: '线性代数', teacher: '刘教授', room: 'A102', weeks: '1-16周' },
      null,
      { id: 7, name: '操作系统', teacher: '赵教授', room: 'C302', weeks: '1-16周' },
      null,
    ],
  },
  {
    day: '周四',
    courses: [
      { id: 8, name: '高等数学', teacher: '张教授', room: 'A101', weeks: '1-16周' },
      { id: 9, name: '数据结构', teacher: '王教授', room: 'C301', weeks: '1-16周' },
      null,
      { id: 10, name: '思想政治', teacher: '周老师', room: 'D101', weeks: '1-16周' },
    ],
  },
  {
    day: '周五',
    courses: [
      null,
      { id: 11, name: '大学英语', teacher: '李老师', room: 'B203', weeks: '1-16周' },
      null,
      { id: 12, name: '程序设计实验', teacher: '王教授', room: '实验楼401', weeks: '3-16周' },
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
  { id: 1, name: '东区食堂', type: '中餐', hours: '06:30-22:00' },
  { id: 2, name: '西区食堂', type: '中餐', hours: '06:30-21:30' },
  { id: 3, name: '民族风味餐厅', type: '特色', hours: '07:00-21:00' },
  { id: 4, name: '清真食堂', type: '清真', hours: '06:30-20:30' },
  { id: 5, name: '教职工食堂', type: '中餐', hours: '07:00-19:00' },
]

export const mockReviews: Review[] = [
  // 东区食堂评价
  { id: 1, canteenId: 1, user: '张三', rating: 5, content: '东区食堂的螺蛳粉非常正宗，汤底浓郁，配料丰富，价格也很实惠！', likes: 18, time: '10分钟前' },
  { id: 2, canteenId: 1, user: '李四', rating: 4, content: '整体不错，就是中午人太多了，建议错峰就餐。', likes: 1, time: '30分钟前' },
  { id: 3, canteenId: 1, user: '王五', rating: 5, content: '早餐的米粉很好吃，推荐杂酱粉和牛肉粉。', likes: 18, time: '1小时前' },
  { id: 4, canteenId: 1, user: '赵六', rating: 3, content: '麻辣烫味道一般，菜品不太新鲜，希望能改进。', likes: 5, time: '2小时前' },
  { id: 5, canteenId: 1, user: '小明', rating: 4, content: '新出的铁板烧窗口不错，份量很足，价格公道。', likes: 12, time: '3小时前' },
  // 西区食堂评价
  { id: 6, canteenId: 2, user: '赵六', rating: 4, content: '西区食堂的麻辣香锅味道不错，分量也很足。', likes: 5, time: '4小时前' },
  { id: 7, canteenId: 2, user: '小明', rating: 3, content: '价格稍微有点贵，但味道还可以。', likes: 2, time: '5小时前' },
  { id: 8, canteenId: 2, user: '小红', rating: 5, content: '二楼的自选水饺特别好吃，韭菜鸡蛋馅的绝了！', likes: 22, time: '6小时前' },
  { id: 9, canteenId: 2, user: '小刚', rating: 4, content: '麻辣烫窗口的汤底选择多，番茄汤底很受欢迎。', likes: 9, time: '7小时前' },
  // 民族风味餐厅评价
  { id: 10, canteenId: 3, user: '小红', rating: 5, content: '民族风味餐厅的烤鱼非常好吃，推荐！', likes: 12, time: '8小时前' },
  { id: 11, canteenId: 3, user: '阿丽', rating: 5, content: '兰州拉面太正宗了，牛肉给得足，汤也鲜！', likes: 31, time: '9小时前' },
  { id: 12, canteenId: 3, user: '小马', rating: 4, content: '大盘鸡拌面份量超级大，两个人都吃不完。', likes: 15, time: '10小时前' },
  { id: 13, canteenId: 3, user: '大伟', rating: 5, content: '烤羊肉串太香了，每次必点，外焦里嫩！', likes: 28, time: '11小时前' },
  // 清真食堂评价
  { id: 14, canteenId: 4, user: '小刚', rating: 4, content: '清真食堂的牛肉面很正宗，环境也很干净。', likes: 8, time: '12小时前' },
  { id: 15, canteenId: 4, user: '小杨', rating: 5, content: '手抓饭非常好吃，羊肉炖得很烂，米饭粒粒分明。', likes: 16, time: '13小时前' },
  // 教职工食堂评价
  { id: 16, canteenId: 5, user: '陈老师', rating: 4, content: '教工餐厅的自助餐种类丰富，性价比高，推荐工作日午餐。', likes: 14, time: '14小时前' },
  { id: 17, canteenId: 5, user: '王老师', rating: 5, content: '环境优雅，菜品精致，适合教师聚餐。', likes: 10, time: '15小时前' },
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

export const categories = ['全部', '教材', '电子产品', '生活用品', '衣物', '其他']

export const mockItems: TradeItem[] = [
  // 教材类
  { id: 1, title: '高等数学（第七版）上册', price: '15', originalPrice: '49', category: '教材', user: '学长', description: '九成新，有少量笔记，不影响阅读，期末复习必备', time: '2小时前' },
  { id: 2, title: '数据结构（C语言版）', price: '10', originalPrice: '39', category: '教材', user: '学姐', description: '几乎全新，仅翻看过几页，考研必备', time: '1天前' },
  { id: 3, title: '英语四级真题2024版', price: '12', originalPrice: '45', category: '教材', user: '小赵', description: '含解析和听力光盘，只做了前三套题', time: '2天前' },
  { id: 4, title: '线性代数辅导讲义', price: '8', originalPrice: '35', category: '教材', user: '考研党', description: '张宇老师的辅导书，有完整笔记标注', time: '3天前' },
  { id: 5, title: '计算机组成原理', price: '20', originalPrice: '55', category: '教材', user: '学霸', description: '唐朔飞版，期末复习重点已标注，考完清仓', time: '4天前' },
  // 电子产品类
  { id: 6, title: '全新U盘64G USB3.0', price: '45', originalPrice: '89', category: '电子产品', user: '小李', description: '买来没用过，全新未拆封，银色金属外壳', time: '5小时前' },
  { id: 7, title: '二手iPad Air 4 64G', price: '1800', originalPrice: '4599', category: '电子产品', user: '小刘', description: '使用一年，屏幕完好，配件齐全，电池健康度92%', time: '1天前' },
  { id: 8, title: '蓝牙耳机 真无线', price: '120', originalPrice: '299', category: '电子产品', user: '小张', description: '续航好，音质不错，带充电仓，用了三个月', time: '2天前' },
  { id: 9, title: '机械键盘 青轴', price: '80', originalPrice: '199', category: '电子产品', user: '程序员', description: '茶轴机械键盘，手感好，适合编程打字', time: '3天前' },
  { id: 10, title: '充电宝20000mAh', price: '55', originalPrice: '129', category: '电子产品', user: '旅行者', description: '大容量，支持快充，上个月刚买的', time: '4天前' },
  // 生活用品类
  { id: 11, title: '宿舍LED护眼台灯', price: '20', originalPrice: '89', category: '生活用品', user: '小王', description: '三档调光，USB充电，夹式设计省空间', time: '1天前' },
  { id: 12, title: '电风扇 遥控定时', price: '50', originalPrice: '120', category: '生活用品', user: '小红', description: '夏天必备，遥控定时，静音模式，用了两个月', time: '2天前' },
  { id: 13, title: '自行车（山地车）', price: '200', originalPrice: '500', category: '生活用品', user: '王五', description: '骑了半年，正常磨损，适合通勤，变速顺畅', time: '3天前' },
  { id: 14, title: '收纳盒套装3件套', price: '15', originalPrice: '45', category: '生活用品', user: '小刘', description: '全新未使用，毕业清仓，收纳衣物超实用', time: '4天前' },
  { id: 15, title: '保温壶 1.5L', price: '25', originalPrice: '68', category: '生活用品', user: '养生达人', description: '304不锈钢内胆，保温效果很好，用了半年', time: '5天前' },
  // 衣物类
  { id: 16, title: '夏季篮球短裤', price: '25', originalPrice: '79', category: '衣物', user: '运动男', description: '全新，L码，买大了没穿过，速干面料', time: '2天前' },
  { id: 17, title: '秋季卫衣 经典款', price: '35', originalPrice: '129', category: '衣物', user: '时尚达人', description: '穿了两次，质量很好，藏青色，M码', time: '3天前' },
  // 其他类
  { id: 18, title: '吉他 入门款', price: '150', originalPrice: '350', category: '其他', user: '音乐人', description: '买了半年，练习够用，送教材和调音器', time: '5天前' },
  { id: 19, title: '考研数学资料全套', price: '30', originalPrice: '120', category: '其他', user: '上岸人', description: '含张宇高数18讲+线代9讲+概率9讲，有笔记', time: '6天前' },
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
  // 寻物
  { id: 1, type: 'lost', title: '蓝色水杯丢失', description: '膳魔师保温杯，蓝色，500ml，落在东区食堂二楼', location: '东区食堂二楼', user: '小张', contact: '微信: zhang123', time: '30分钟前', status: '进行中' },
  { id: 2, type: 'lost', title: '黑色双肩包丢失', description: '黑色双肩包，内有笔记本电脑（联想小新）和课本，非常重要', location: '图书馆3楼自习区', user: '小明', contact: '电话: 135****7890', time: '3小时前', status: '进行中' },
  { id: 3, type: 'lost', title: '白色AirPods左耳丢失', description: 'AirPods三代白色，左耳丢失，带透明保护壳', location: '东区食堂到宿舍的路上', user: '小刘', contact: '微信: liu666', time: '昨天', status: '进行中' },
  { id: 4, type: 'lost', title: '校园卡丢失', description: '在东区食堂附近丢失，姓名：张三，学号2024****', location: '东区食堂附近', user: '张三', contact: '138****1234', time: '2天前', status: '进行中' },
  { id: 5, type: 'lost', title: '黑色钱包丢失', description: '黑色短款钱包，内有身份证、银行卡和少量现金', location: '操场看台', user: '王五', contact: '137****9012', time: '3天前', status: '已找回' },
  // 招领
  { id: 6, type: 'found', title: '捡到一串钥匙', description: '在图书馆三楼捡到，银色钥匙串上有三个钥匙和一个U盘挂件', location: '图书馆三楼', user: '李四', contact: '139****5678', time: '1小时前', status: '进行中' },
  { id: 7, type: 'found', title: '捡到一本笔记本', description: '黑色皮面笔记本，封面写有"课堂笔记"，内页有高数笔记', location: '操场', user: '赵六', contact: '136****3456', time: '5小时前', status: '进行中' },
  { id: 8, type: 'found', title: '捡到一张校园卡', description: '在图书馆三楼捡到，姓名：王小明，学号2024xxxx', location: '图书馆三楼', user: '热心同学', contact: '已交到图书馆值班台', time: '6小时前', status: '已归还' },
  { id: 9, type: 'found', title: '捡到黑色钱包', description: '黑色短款钱包，内有少量现金和银行卡', location: '校门口', user: '保安大叔', contact: '校门口保安室', time: '昨天', status: '已归还' },
  { id: 10, type: 'found', title: '捡到学生证', description: '2024级计算机学院，学号2024******，姓名：赵某', location: '教学楼A座203', user: '王老师', contact: '交到A座一楼值班室', time: '2天前', status: '进行中' },
  { id: 11, type: 'found', title: '捡到充电宝', description: '白色20000mAh充电宝，带一根数据线，在机房捡到', location: '实验楼502机房', user: '黄老师', contact: '实验楼501办公室', time: '3天前', status: '进行中' },
]

// ========== 作业管理模拟数据 ==========

export interface Homework {
  id: number
  index: number
  name: string
  lesson: string
  format: string
  score: string
  requirement: string
  courseName: string
  deadline: string
  status: '待提交' | '已提交' | '已批改'
}

export const mockHomework: Homework[] = [
  // Web前端开发技术
  {
    id: 1, index: 1, courseName: 'Web前端开发技术',
    name: 'React组件化开发',
    lesson: '第5节 实践',
    format: '截图+项目链接',
    score: '3分',
    requirement: '请设计并创建可复用的组件，如Navbar、Footer、FeatureCard等，并展示如何将这些组件组合成完整的页面布局。通过实例演示组件的复用性和组合能力。',
    deadline: '2026-07-30',
    status: '待提交',
  },
  {
    id: 2, index: 2, courseName: 'Web前端开发技术',
    name: '页面路由配置',
    lesson: '第6节 实践',
    format: '项目链接',
    score: '5分',
    requirement: '使用React Router配置多页面路由，包含首页、课表、食堂、二手交易、失物招领等页面，实现导航栏的路由跳转和页面切换效果，要求使用react-router-dom v6。',
    deadline: '2026-08-06',
    status: '待提交',
  },
  {
    id: 3, index: 3, courseName: 'Web前端开发技术',
    name: '状态管理与API交互',
    lesson: '第7节 实践',
    format: '代码+截图',
    score: '8分',
    requirement: '使用React Context或Redux实现全局状态管理（用户认证、收藏功能），并实现与后端API的交互，包括登录注册、数据获取、增删改查操作。',
    deadline: '2026-08-13',
    status: '待提交',
  },
  // 数据结构
  {
    id: 4, index: 1, courseName: '数据结构',
    name: '链表操作实验',
    lesson: '第3节 实验',
    format: '代码+报告',
    score: '8分',
    requirement: '实现单链表的创建、插入、删除、查找等基本操作，并编写实验报告分析各操作的时间复杂度。要求用C语言实现，提交源代码和实验报告。',
    deadline: '2026-07-28',
    status: '已提交',
  },
  {
    id: 5, index: 2, courseName: '数据结构',
    name: '栈和队列应用',
    lesson: '第4节 实验',
    format: '代码+截图',
    score: '6分',
    requirement: '利用栈实现表达式求值（中缀转后缀），利用队列实现循环队列的基本操作，提交代码运行截图和源代码。',
    deadline: '2026-08-10',
    status: '待提交',
  },
  {
    id: 6, index: 3, courseName: '数据结构',
    name: '二叉树遍历算法',
    lesson: '第5节 实验',
    format: '代码+报告',
    score: '10分',
    requirement: '实现二叉树的先序、中序、后序和层序遍历，并对比递归与非递归实现的性能差异。提交实验报告。',
    deadline: '2026-08-17',
    status: '待提交',
  },
  // 高等数学
  {
    id: 7, index: 1, courseName: '高等数学',
    name: '导数与微分',
    lesson: '第5节 作业',
    format: '拍照上传',
    score: '4分',
    requirement: '完成教材第二章习题1-10题，要求书写工整，步骤完整，拍照上传至课程平台。',
    deadline: '2026-07-25',
    status: '已批改',
  },
  {
    id: 8, index: 2, courseName: '高等数学',
    name: '不定积分与定积分',
    lesson: '第7节 作业',
    format: '拍照上传',
    score: '5分',
    requirement: '完成教材第四章习题1-15题，重点练习分部积分法和换元积分法，注意书写规范。',
    deadline: '2026-08-04',
    status: '待提交',
  },
  // 大学英语
  {
    id: 9, index: 1, courseName: '大学英语',
    name: '英语作文写作',
    lesson: '第4节 作业',
    format: '文档上传',
    score: '3分',
    requirement: '以"My University Life"为题，写一篇不少于200词的英语短文。要求语法正确，用词准确，结构清晰。',
    deadline: '2026-08-01',
    status: '已提交',
  },
  {
    id: 10, index: 2, courseName: '大学英语',
    name: '英语阅读报告',
    lesson: '第6节 作业',
    format: '文档上传',
    score: '4分',
    requirement: '阅读教材Unit 3课文，写一篇不少于150词的英文阅读报告，包含文章主旨、个人观点和学到的生词。',
    deadline: '2026-08-15',
    status: '待提交',
  },
  // 操作系统
  {
    id: 11, index: 1, courseName: '操作系统',
    name: '进程调度算法模拟',
    lesson: '第4节 实验',
    format: '代码+截图',
    score: '10分',
    requirement: '编程实现先来先服务（FCFS）、短作业优先（SJF）和轮转（RR）三种进程调度算法，输出各算法的平均周转时间和平均等待时间。',
    deadline: '2026-08-20',
    status: '待提交',
  },
  {
    id: 12, index: 2, courseName: '操作系统',
    name: '页面置换算法',
    lesson: '第5节 实验',
    format: '代码+报告',
    score: '8分',
    requirement: '实现OPT、FIFO、LRU三种页面置换算法，对比不同算法的缺页率，提交实验报告分析各算法优劣。',
    deadline: '2026-09-01',
    status: '待提交',
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