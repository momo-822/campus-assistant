import { useNavigate } from 'react-router-dom'

interface FeatureCardProps {
  icon: string
  title: string
  description: string
  path: string
}

export default function FeatureCard({ icon, title, description, path }: FeatureCardProps) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(path)}
      className="group bg-white rounded-3xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border border-gray-100"
    >
      <div className="w-12 h-12 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  )
}