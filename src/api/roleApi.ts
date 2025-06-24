import { BaseResult } from '@/types/axios'
import api from '@/utils/http'

export class RoleService {
  private static baseUrl = import.meta.env.VITE_API_URL

  // 获取角色列表
  static async getRoleList(options: { params?: any }): Promise<BaseResult> {
    const pagination = {
      page: 1,
      pageSize: 10
    }
    const params = { ...pagination, ...(options.params || {}) }
    try {
      const response = await api.get<BaseResult>({
        url: '/role/list',
        params,
        headers: {
          'Content-Type': 'application/json'
        }
      })
      return response
    } catch {
      return {
        code: 500,
        message: '获取角色列表失败，请稍后重试',
        data: null
      }
    }
  }
  // 新增角色
  static async addRole(options: { body: string }): Promise<BaseResult> {
    try {
      const response = await api.post<BaseResult>({
        url: '/role/add',
        data: JSON.parse(options.body),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      return response
    } catch {
      return {
        code: 500,
        message: '新增角色失败，请稍后重试',
        data: null
      }
    }
  }
  // 修改角色
  static async updateRole(options: { body: string }): Promise<BaseResult> {
    try {
      const response = await api.put<BaseResult>({
        url: '/role/update',
        data: JSON.parse(options.body),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      return response
    } catch {
      return {
        code: 500,
        message: '修改角色失败，请稍后重试',
        data: null
      }
    }
  }
  // 删除角色
  static async deleteRole(options: { params?: any }): Promise<BaseResult> {
    try {
      const response = await api.del<BaseResult>({
        url: '/role/delete',
        params: options.params
      })
      return response
    } catch {
      return {
        code: 500,
        message: '删除角色失败，请稍后重试',
        data: null
      }
    }
  }
}
