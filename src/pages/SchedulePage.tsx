import { useEffect, useState } from 'react'
import { useSearch } from '../context/SearchContext'
import { mockSchedule, periods, type ScheduleDay } from '../mock'
import { getSchedule, searchSchedule } from '../api'

export default function SchedulePage() {
  const { query } = useSearch()

  const [dayList, setDayList] = useState<ScheduleDay[]>(mockSchedule)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!query.trim()) {
      setLoading(false)
      getSchedule().then((res) => res.data && setDayList(res.data))
      return
    }
    setLoading(true)
    searchSchedule(query).then((res) => {
      if (res.data) setDayList(res.data)
      setLoading(false)
    })
  }, [query])

  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">课表管理</h1>
        <p className="text-sm text-gray-500 mb-8">
          {loading ? '搜索中...' : query ? `搜索 "${query}" 的结果` : '本学期课程安排'}
        </p>

        <div className="space-y-4">
          {dayList.length > 0 ? dayList.map((day) => (
            <div key={day.day} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="text-base font-semibold text-gray-900 mb-3">{day.day}</h3>
              {day.courses.map((course, idx) =>
                course ? (
                  <div key={idx} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-b-0">
                    <span className="text-xs text-gray-400 w-32 shrink-0">{periods[idx]}</span>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900">{course.name}</span>
                      <span className="text-xs text-gray-500 ml-3">👨‍🏫 {course.teacher}</span>
                      <span className="text-xs text-gray-400 ml-2">📍 {course.room}</span>
                    </div>
                    <span className="text-xs text-gray-400">{course.weeks}</span>
                  </div>
                ) : (
                  <div key={idx} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-b-0">
                    <span className="text-xs text-gray-400 w-32 shrink-0">{periods[idx]}</span>
                    <span className="text-xs text-gray-300">空闲</span>
                  </div>
                )
              )}
            </div>
          )) : (
            <p className="text-sm text-gray-400">未找到相关课程</p>
          )}
        </div>
      </div>
    </div>
  )
}