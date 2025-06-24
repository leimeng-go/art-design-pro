// import request from '@/utils/http'
// import { BaseResult } from '@/types/axios'
import { BaseResult } from '@/types/axios'
import { UserInfo } from '@/types/store'
import api from '@/utils/http'

export class UserService {
  private static baseUrl = import.meta.env.VITE_API_URL

  // 登录接口
  static async login(options: { body: string }): Promise<BaseResult> {
    try {
      // console.log(options.body)
      const response = await api.post<BaseResult>({
        url: '/auth/login',
        data: JSON.parse(options.body),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      // 明确处理 HTTP 状态码和业务状态码
      console.log('登陆后的响应内容:' + response)
      return response
    } catch {
      return {
        code: 500,
        message: '登录失败，请稍后重试',
        data: null
      }
    }
  }

  // 获取用户信息
  static async getUserInfo(): Promise<BaseResult<UserInfo>> {
    try {
      const response = await api.get<BaseResult<UserInfo>>({
        url: '/user/info'
      })
      return response
    } catch {
      return {
        code: 500,
        message: '获取用户信息失败，请稍后重试',
        data: null as any
      }
    }
  }

  // 新增用户接口
  static async addUser(options: { body: string }): Promise<BaseResult> {
    try {
      const response = await api.post<BaseResult>({
        url: '/user/add',
        data: JSON.parse(options.body),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      return response
    } catch {
      return {
        code: 500,
        message: '新增用户失败，请稍后重试',
        data: null
      }
    }
  }
}
