import axios from 'axios'
import jwtDecode from 'jwt-decode'
import User from '@/services/user'
import { delay, mergeMap, retryWhen, scan } from 'rxjs/operators'
import { of } from 'rxjs'
const userService = User.getInstance()
// create an axios instance
const service = axios.create({
  // baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 50000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent
    const userObj = userService.userObj$.getValue()
    if (userObj && userObj.userStatus === 'valid' && userObj.userToken && !(config.url.startsWith('/public') || config.url.startsWith('public'))) {
      config.headers['x-user-token'] = userObj.userToken
    }
    // console.log(config)
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
   */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    // console.log(response)
    const xUserToken = response.headers['x-user-token']
    const res = response.data
    if (xUserToken && xUserToken !== '' && res.status !== 'INVALID') {
      const userObj = jwtDecode(xUserToken)
      userObj.userStatus = 'valid'
      userObj.userToken = xUserToken
      userService.userObj$.next(userObj)
    } else if (res.status === 'INVALID' || response.status === 403) {
      const userObj = {
        userStatus: 'invalid'
      }
      userService.userObj$.next(userObj)
    }

    return res
  },
  error => {
    if (error && error.response.status === 403 && error.response.data.status === 'INVALID') {
      const userObj = {
        userStatus: 'invalid'
      }
      userService.userObj$.next(userObj)
    }
    console.log('err' + error) // for debug
    return Promise.reject(error)
  }
)

export default service

export function rtnRetryWhenOperator (count = 2, time = 3000) {
  return retryWhen((errors) => {
    return errors.pipe(
      mergeMap(next => {
        if (next.response.status === 403 || next.response.status === 400) {
          throw next
        } else {
          return of(next)
        }
      }),
      delay(time),
      scan((acc, next) => {
        acc += 1
        if (acc > count) {
          throw next
        }
        return acc
      }, 0)
    )
  })
}
