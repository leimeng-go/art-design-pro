import { BaseResult } from '@/types/axios'
import api from '@/utils/http'

export class EntityService {
  private static baseUrl = import.meta.env.VITE_API_URL

  // 获取部门列表
  static async getDepartmentList(options: { params?: any }): Promise<BaseResult> {
    const pagination = {
      page: 1,
      pageSize: 10
    }
    // 合并分页参数到 options.params
    const params = { ...pagination, ...(options.params || {}) }
    try {
      const response = await api.get<BaseResult>({
        url: '/department/list',
        params, // 通过 url 传递分页参数
        headers: {
          'Content-Type': 'application/json'
        }
      })
      console.log('获取部门列表的响应内容:' + response)
      return response
    } catch {
      return {
        code: 500,
        message: '获取部门列表失败，请稍后重试',
        data: null
      }
    }
  }

  // 新增部门
  static async addDepartment(options: { body: string }): Promise<BaseResult> {
    try {
      const response = await api.post<BaseResult>({
        url: '/department/add',
        data: JSON.parse(options.body),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      return response
    } catch {
      return {
        code: 500,
        message: '新增部门失败，请稍后重试',
        data: null
      }
    }
  }

  // 修改部门
  static async updateDepartment(options: { body: string }): Promise<BaseResult> {
    try {
      const response = await api.put<BaseResult>({
        url: '/department/update',
        data: JSON.parse(options.body),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      return response
    } catch {
      return {
        code: 500,
        message: '修改部门失败，请稍后重试',
        data: null
      }
    }
  }

  static async getTopDepartmentList(options: { body: string }): Promise<BaseResult> {
    try {
      const response = await api.post<BaseResult>({
        url: '/department/top',
        data: JSON.parse(options.body),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      return response
    } catch {
      return {
        code: 500,
        message: '获取上级部门失败，请稍后重试',
        data: null
      }
    }
  }

  // 删除部门
  static async deleteDepartment(options: { params?: any }): Promise<BaseResult> {
    try {
      const response = await api.del<BaseResult>({
        url: '/department/delete',
        params: options.params
      })
      return response
    } catch {
      return {
        code: 500,
        message: '删除部门失败，请稍后重试',
        data: null
      }
    }
  }
}
