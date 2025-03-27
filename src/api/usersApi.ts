// import request from '@/utils/http'
// import { BaseResult } from '@/types/axios'
import { BaseResult } from '@/types/axios'
import { UserInfo } from '@/types/store'
import avatar from '@imgs/user/avatar.png'
import axios from 'axios'

export class UserService {
  private static baseUrl = import.meta.env.VITE_API_URL

  // 登录接口
  static async login(options: { body: string }): Promise<BaseResult> {
    try {
      console.log(options.body)
      const response = await axios.post(`${this.baseUrl}/auth/login`, JSON.parse(options.body), {
        headers: {
          'Content-Type': 'application/json'
        },
        validateStatus: () => {
          // 让 axios 不自动抛出除了网络错误之外的错误，我们自己处理所有状态码
          return true
        }
      })
      console.log(response)

      // 明确处理 HTTP 状态码
      if (response.status !== 200) {
        return {
          code: response.data.code,
          message: response.data?.message || `HTTP 错误: ${response.status}`,
          data: null
        }
      }

      // 处理业务状态码，确保 code 正确
      if (response.data && response.data.code !== 0) {
        return response.data
      }

      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          code: error.response?.status || 500,
          message: error.response?.data?.message || '登录失败，请稍后重试',
          data: null
        }
      }
      return {
        code: 500,
        message: '登录失败，请稍后重试',
        data: null
      }
    }
  }

  // 获取用户信息
  static getUserInfo(userid: string): Promise<BaseResult<UserInfo>> {
    console.log(userid)
    return new Promise((resolve) => {
      resolve({
        code: 200,
        message: '获取用户信息成功',
        data: {
          id: 1,
          name: '张三',
          username: 'John Snow',
          avatar: avatar,
          email: 'art.design@gmail.com'
        }
      })
    })
  }
}
