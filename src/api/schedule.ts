import { get, post, del, type ApiResponse } from './request'
import { mockSchedule, periods, type ScheduleDay, type Course } from '../mock'

// ========== 类型定义 ==========

export interface CourseForm {
  day: string
  periodIndex: number
  name: string
  teacher: string
  room: string
  weeks: string
}

// ========== 后端原始响应类型 ==========

interface BackendCourse {
  id: number
  course_name: string
  teacher: string | null
  classroom: string | null
  day_of_week: number
  start_time: string
  end_time: string
  weeks: string | null
}

/** 星期映射 */
const DAY_NAMES = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日']

/** 节次时间到索引的映射 */
function getPeriodIndex(startTime: string): number {
  const map: Record<string, number> = { '08:00': 0, '10:00': 1, '14:00': 2, '16:00': 3 }
  return map[startTime] ?? 0
}

/** 后端课程数组 → 前端按天分组 */
function groupByDay(courses: BackendCourse[]): ScheduleDay[] {
  const days: ScheduleDay[] = DAY_NAMES.slice(1, 6).map((day) => ({ day, courses: [null, null, null, null] }))

  courses.forEach((c) => {
    const dayIdx = c.day_of_week - 1
    const periodIdx = getPeriodIndex(c.start_time)
    if (dayIdx >= 0 && dayIdx < days.length && periodIdx < 4) {
      days[dayIdx].courses[periodIdx] = {
        id: c.id,
        name: c.course_name,
        teacher: c.teacher || '',
        room: c.classroom || '',
        weeks: c.weeks || '',
      }
    }
  })

  return days
}

// ========== 接口 ==========

/** 获取全部课表 */
export async function getSchedule(): Promise<ApiResponse<ScheduleDay[]>> {
  const res = await get<BackendCourse[]>('/schedule')
  if (res.success && res.data) {
    return { success: true, data: groupByDay(res.data) }
  }
  return { success: true, data: mockSchedule }
}

/** 搜索课程（本地过滤） */
export async function searchSchedule(keyword: string): Promise<ApiResponse<ScheduleDay[]>> {
  const res = await get<BackendCourse[]>('/schedule')
  if (res.success && res.data) {
    const filtered = res.data.filter(
      (c) =>
        c.course_name.includes(keyword) ||
        (c.teacher || '').includes(keyword) ||
        (c.classroom || '').includes(keyword)
    )
    return { success: true, data: groupByDay(filtered) }
  }
  return { success: true, data: [] }
}

/** 添加课程 */
export async function addCourse(course: CourseForm): Promise<ApiResponse<ScheduleDay[]>> {
  // 节次 → 时间
  const timeMap = [
    { start: '08:00', end: '09:40' },
    { start: '10:00', end: '11:40' },
    { start: '14:00', end: '15:40' },
    { start: '16:00', end: '17:40' },
  ]
  const t = timeMap[course.periodIndex] || timeMap[0]
  const dayMap: Record<string, number> = { '周一': 1, '周二': 2, '周三': 3, '周四': 4, '周五': 5, '周六': 6, '周日': 7 }

  const res = await post<BackendCourse[]>('/schedule', {
    course_name: course.name,
    teacher: course.teacher,
    classroom: course.room,
    day_of_week: dayMap[course.day] || 1,
    start_time: t.start,
    end_time: t.end,
    weeks: course.weeks,
  })
  if (res.success && res.data) {
    return { success: true, data: groupByDay(res.data), message: res.message }
  }
  return { success: false, message: res.message }
}

/** 删除课程 */
export async function deleteCourse(day: string, periodIndex: number): Promise<ApiResponse<ScheduleDay[]>> {
  // 先获取课表找到对应课程ID
  const scheduleRes = await get<BackendCourse[]>('/schedule')
  if (!scheduleRes.data) return { success: false, message: '获取课表失败' }

  const dayMap: Record<string, number> = { '周一': 1, '周二': 2, '周三': 3, '周四': 4, '周五': 5, '周六': 6, '周日': 7 }
  const timeMap = ['08:00', '10:00', '14:00', '16:00']
  const target = scheduleRes.data.find(
    (c) => c.day_of_week === dayMap[day] && c.start_time === timeMap[periodIndex]
  )

  if (!target) return { success: false, message: '未找到该课程' }

  const res = await del<BackendCourse[]>(`/schedule/${target.id}`)
  if (res.success && res.data) {
    return { success: true, data: groupByDay(res.data), message: res.message }
  }
  return { success: false, message: res.message }
}

/** 获取节次时间表 */
export async function getPeriods(): Promise<ApiResponse<string[]>> {
  return { success: true, data: periods }
}