import { Link } from 'react-router-dom'
import FeatureCard from '../components/FeatureCard'

const features = [
  { icon: '🗓️', title: '课表管理', description: '随时随地查看课程安排，不再错过每一堂课', path: '/schedule' },
  { icon: '🍽️', title: '食堂点评', description: '看看今天食堂有什么好吃的，师生真实评价', path: '/canteen' },
  { icon: '🔄', title: '二手交易', description: '教材、电子产品、生活用品，安全便捷交易', path: '/trade' },
  { icon: '🔍', title: '失物招领', description: '丢失物品及时发布，捡到物品快速归还', path: '/lost-found' },
]

const aiFeatures = [
  {
    icon: '🤖',
    title: 'AI 评价总结',
    description: '智能分析食堂评价，生成评分分布、高频关键词和情感分析总结',
    path: '/canteen',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: '✨',
    title: 'AI 商品描述',
    description: '根据标题、价格和分类，智能生成高转化率的二手商品描述',
    path: '/trade',
    color: 'from-pink-500 to-rose-500',
  },
  {
    icon: '🧠',
    title: 'AI 失物招领',
    description: '智能生成寻物/招领描述，自动匹配相关物品信息',
    path: '/lost-found',
    color: 'from-indigo-500 to-purple-500',
  },
]

export default function HomePage() {
  return (
    <>
      <section className="pt-32 pb-16 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4 bg-gradient-to-r from-yellow-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            广西民族大学校园助手
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-xl mx-auto leading-relaxed">
            让校园生活更便捷
          </p>
        </div>
      </section>

      {/* 功能模块入口 */}
      <section className="pb-10 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-sm font-semibold text-gray-400 mb-4 px-1">功能模块</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {features.map((item) => (
              <FeatureCard key={item.title} {...item} />
            ))}
          </div>
        </div>
      </section>

      {/* AI 智能专区 */}
      <section className="pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-4 px-1">
            <span className="text-sm">🤖</span>
            <h2 className="text-sm font-semibold text-gray-400">AI 智能专区</h2>
            <span className="text-xs text-gray-300">基于规则引擎的智能辅助</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {aiFeatures.map((item) => (
              <Link
                key={item.title}
                to={item.path}
                className="group block bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-lg mb-3 shadow-sm`}>
                  {item.icon}
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1.5 group-hover:text-pink-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {item.description}
                </p>
                <div className="mt-3 flex items-center gap-1 text-xs text-pink-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>前往体验</span>
                  <span>→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}