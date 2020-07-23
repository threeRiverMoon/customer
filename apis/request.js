const app = getApp()
class request {
  constructor() {
    this._header = { 
      'content-type': 'application/json'
    }
  }

  /**
   * 设置统一的异常处理
   */
  setErrorHandler(handler) {
    this._errorHandler = handler;
  }

  /**
   * 设置header
   */
  setHeader(header){
    this._header = header;
  }

  /**
   * GET类型的网络请求
   */
  getRequest(url, data, header = this._header) {
    return this.requestAll(url, data, header, 'GET')
  }

  /**
   * DELETE类型的网络请求
   */
  deleteRequest(url, data, header = this._header) {
    return this.requestAll(url, data, header, 'DELETE')
  }

  /**
   * PUT类型的网络请求
   */
  putRequest(url, data, header = this._header) {
    return this.requestAll(url, data, header, 'PUT')
  }

  /**
   * POST类型的网络请求
   */
  postRequest(url, data, header = this._header) {
    return this.requestAll(url, data, header, 'POST')
  }

  /**
   * 网络请求
   */
  requestAll(url, data, header, method) {
    this._header['auth'] = wx.getStorageSync('token');
    return new Promise((resolve, reject) => {
      wx.request({
        url,
        data,
        header,
        method,
        success: (res => {
          const { code } = res.data;
          //wx.hideLoading()
          if (code == '1') {
            //200: 服务端业务处理正常结束
            resolve(res.data)
          } else if (code == '-3') {
            wx.hideLoading()
            wx.clearStorageSync()
            wx.showToast({
              title: '请先登录',
              icon: "none",
              mask: true,
              duration: 1500
            })
            setTimeout(() => {
              wx.switchTab({
                url: '/pages/tarbar/home/index',
              })
            }, 1500)
          } else {
            wx.hideLoading()
            if (code == '-1' || code == 0  ) {
              wx.showToast({
                title: res.data.msg,
                icon: "none",
                mask: true,
              })
              if (res.data.data == '商品不存在') {
                setTimeout(function () {
                  wx.navigateBack({

                  })
                }, 2000)
              }
              if (url.indexOf('store_info') != -1 ){
                resolve(res.data)
              }
            } 
            //其它错误，提示用户错误信息
            if (this._errorHandler != null) {
              //如果有统一的异常处理，就先调用统一异常处理函数对异常进行处理
              this._errorHandler(res)
            } else {
              reject(res)
            }
          }
        }),
        fail: (res => {
          wx.hideLoading()
          if (res.errMsg == 'request:fail timeout') {
            wx.showToast({
              title: '服务器连接失败,请退出小程序',
              icon: "none"
            })
          } else if (this._errorHandler != null) {
            this._errorHandler(res)
          } else {
            reject(res)
          }
        })
      })
    })
  }
}

export default request
