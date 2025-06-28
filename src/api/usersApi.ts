
import request from '@/utils/http'

export class UserService {
  private static baseUrl = import.meta.env.VITE_API_URL

  // 登录接口
  static login(params: Api.Auth.LoginParams){
    return request.post<Api.Auth.LoginResponse>({
      url: '/auth/login',
      params
    })
    } 

    static getUserInfo(){
      return request.get<Api.User.UserInfo>({
        url: '/user/info'
      })
    }

    static userAdd(params: Api.User.UserInfo){
      return request.post<Api.User.UserInfo>({
        url: '/user/add',
        params
      })
    }

    static userList(params: Api.User.UserListData){
      return request.get<Api.User.UserListData>({
        url: '/user/list',
        params
      })
    }
  }

  
  // 获取用户信息
  // static async getUserInfo(): Promise<BaseResult<UserInfo>> {
  //   try {
  //     const response = await api.get<BaseResult<UserInfo>>({
  //       url: '/user/info'
  //     })
  //     return response
  //   } catch {
  //     return {
  //       code: 500,
  //       message: '获取用户信息失败，请稍后重试',
  //       data: null as any
  //     }
  //   }
  // }

  // 新增用户接口
  // static async addUser(options: { body: string }): Promise<BaseResult> {
  //   try {
  //     const response = await api.post<BaseResult>({
  //       url: '/user/add',
  //       data: JSON.parse(options.body),
  //       headers: {
  //         'Content-Type': 'application/json'
  //       }
  //     })
  //     return response
  //   } catch {
  //     return {
  //       code: 500,
  //       message: '新增用户失败，请稍后重试',
  //       data: null
  //     }
  //   }
  // }
}
