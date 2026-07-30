import { get, put, formatTime, type ApiResponse } from './request'
import { mockHomework, type Homework } from '../mock'

// ========== 类型定义 ==========

export interface HomeworkParams {
  courseName: string
  name: string
  lesson: string
  format: string
  score: string
  requirement: string
  deadline: string
}

// ========== 后端原始响应类型 ==========

interface BackendHomework {
  id: number
  course_name: string
  title: string
  description: string | null
  deadline: string | null
  status: 'pending' | 'submitted' | 'graded'
  created_at: string
}

/** 后端作业 → 前端作业 */
const HW_STATUS_MAP: Record<string, '待提交' | '已提交' | '已批改'> = {
  pending: '待提交',
  submitted: '已提交',
  graded: '已批改',
}

function mapHomework(h: BackendHomework, index: number): Homework {
  return {
    id: h.id,
    index,
    courseName: h.course_name,
    name: h.title,
    lesson: '',
    format: '',
    score: '',
    requirement: h.description || '',
    deadline: h.deadline || '',
    status: HW_STATUS_MAP[h.status] || '待提交',
  }
}

// ========== 接口 ==========

/** 获取全部作业 */
export async function getHomework(): Promise<ApiResponse<Homework[]>> {
  const res = await get<BackendHomework[]>('/homework')
  if (res.success && res.data) {
    return { success: true, data: res.data.map((h, i) => mapHomework(h, res.data!.length - i)) }
  }
  return { success: true, data: mockHomework }
}

/** 搜索作业（本地过滤） */
export async function searchHomework(keyword: string): Promise<ApiResponse<Homework[]>> {
  const res = await get<BackendHomework[]>('/homework')
  if (res.success && res.data) {
    const filtered = res.data.filter(
      (h) =>
        h.course_name.includes(keyword) || h.title.includes(keyword) || (h.description || '').includes(keyword)
    )
    return { success: true, data: filtered.map((h, i) => mapHomework(h, filtered.length - i)) }
  }
  return { success: true, data: [] }
}

/** 按课程筛选作业（本地过滤） */
export async function getHomeworkByCourse(courseName: string): Promise<ApiResponse<Homework[]>> {
  const res = await get<BackendHomework[]>('/homework')
  if (res.success && res.data) {
    const filtered = courseName === '全部' ? res.data : res.data.filter((h) => h.course_name === courseName)
    return { success: true, data: filtered.map((h, i) => mapHomework(h, filtered.length - i)) }
  }
  return { success: true, data: [] }
}

/** 获取课程列表 */
export async function getHomeworkCourses(): Promise<ApiResponse<string[]>> {
  const res = await get<BackendHomework[]>('/homework')
  if (res.success && res.data) {
    const courses = [...new Set(res.data.map((h) => h.course_name))]
    return { success: true, data: courses }
  }
  return { success: true, data: [] }
}

/** 提交作业（更新状态） */
export async function submitHomework(id: number): Promise<ApiResponse<Homework[]>> {
  const res = await put<BackendHomework[]>(`/homework/${id}`, { status: 'submitted' })
  if (res.success && res.data) {
    return { success: true, data: res.data.map((h, i) => mapHomework(h, res.data!.length - i)), message: '提交成功' }
  }
  return { success: false, message: res.message }
}