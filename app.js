//app.js
import ajax from './apis/ajax.js'
App({
  onLaunch:async function () {
    const token = wx.getStorageSync('token') || '',
      store_name = wx.getStorageSync('store_name') || '',
      store_id = wx.getStorageSync('store_id') || '',
      userInfo = wx.getStorageSync('userInfo') || null,
      phone = wx.getStorageSync('phoneNumber') || '',
      session_key = wx.getStorageSync('session_key') || '',
      longitude = wx.getStorageSync('longitude') || '',
      latitude = wx.getStorageSync('latitude') || '';
    this.globalData.userInfo = userInfo;
    this.globalData.store_name = store_name;
    this.globalData.store_id = store_id;
    this.globalData.token = token;
    this.globalData.session_key = session_key;
    this.globalData.phone = phone;
    this.globalData.longitude = longitude;
    this.globalData.latitude = latitude;
    // 获取系统信息
    const systemInfo = wx.getSystemInfoSync();
    // 胶囊按钮位置信息
    const menuButtonInfo = wx.getMenuButtonBoundingClientRect();
    // 导航栏高度 = 状态栏到胶囊的间距（胶囊距上距离-状态栏高度） * 2 + 胶囊高度 + 状态栏高度
    this.globalData.navBarHeight = (menuButtonInfo.top - systemInfo.statusBarHeight) * 2 + menuButtonInfo.height + systemInfo.statusBarHeight;
    this.globalData.menuRight = systemInfo.screenWidth - menuButtonInfo.right;
    this.globalData.menuBotton = menuButtonInfo.top - systemInfo.statusBarHeight;
    this.globalData.menuHeight = menuButtonInfo.height;
    this.globalData.menuWidth = menuButtonInfo.right-20;
    
  },

  


  wxLogin(){
    return new Promise(function(reslove,reject){
      wx.login({
        success (res) {
          reslove(res.code);
        }
      })
  ﻿ })
  },
  
  //获取用户当前地理位置
  getUserLocation: function (successCallback) {
    const self = this;
    wx.getSetting({
      success: (res) => {
        // res.authSetting['scope.userLocation'] == undefined    表示 初始化进入该页面
        // res.authSetting['scope.userLocation'] == false    表示 非初始化进入该页面,且未授权
        // res.authSetting['scope.userLocation'] == true    表示 地理位置授权
        // 拒绝授权后再次进入重新授权
        if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) {
          wx.showModal({
            title: '提示',
            content: '【为餐小栈】需要获取您的地理位置，请确认授权',
            success: function (res) {
              if (res.cancel) {
                wx.redirectTo({
                  url: '/pages/common/location/index'
                })
              } else if (res.confirm) {
                wx.openSetting({
                  success: function (dataAu) {
                    if (dataAu.authSetting["scope.userLocation"] == true) {
                      //再次授权，调用wx.getLocation的API
                      self.getLocation(dataAu, successCallback)
                    } else {
                      wx.redirectTo({
                        url: '/pages/common/location/index'
                      })
                    }
                  }
                })
              }
            }
          })
        } else if (res.authSetting['scope.userLocation'] == undefined) {
          //调用wx.getLocation的API
          self.getLocation(res, successCallback)
        } else if (res.authSetting['scope.userLocation']) {
          //调用wx.getLocation的API
          self.getLocation(res, successCallback)
        }
      }
    })
  },

  // 微信获得经纬度
  getLocation: function (userLocation, successCallback) {
    const self = this
    wx.getLocation({
      type: "gcj02",
      success: function (res) {
        successCallback && successCallback(res)
      },
      fail: function (res) {
        if (res.errMsg === 'getLocation:fail:auth denied') {
          wx.redirectTo({
            url: '/pages/common/location/index'
          })
          return
        }
        if (!userLocation || !userLocation.authSetting['scope.userLocation']) {
          wx.redirectTo({
            url: '/pages/common/location/index'
          })
        } else if (userLocation.authSetting['scope.userLocation']) {
          wx.showModal({
            title: '提示',
            content: '【为餐小栈】需要获取您的地理位置，请确认授权',
            success: result => {
              if (result.confirm) {
                wx.navigateBack()
              }
            }
          })
        } else {
          wx.redirectTo({
            url: '/pages/common/location/index'
          })
        }
      }
    })
  },

  // 微信用户登录
  oauth(successCallback) {
    const self = this;
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              const { signature, rawData, encryptedData, iv } = res;
              wx.login({
                success(response) {
                  const { code } = response,
                    params = {
                      code, signature, rawData, encryptedData, iv
                    };
                  if (code) {
                    //发起网络请求
                    // 登录
                    wx.showLoading({
                      title: "授权登陆中",
                      mask: true
                    })
                    self.ajax.oauth(params).then(res => {
                      wx.hideLoading()
                      wx.showToast({
                        title: "授权成功",
                        mask: true
                      })
                      successCallback && successCallback(res.data)
                    })
                  } else {
                    
                  }
                }
              })
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },

  /**
   * 选择自提点
   */
  handleStore(e) {
    const self = this;
    const id = wx.getStorageSync('store_id'),
    params = {
      store_id: id
    };
    self.ajax.select_store(params).then(res => {

    })
  },

  /**
   * 购物车数量
   */
  cart_list_count(successCallback){
    const { shoppingTiem } = this.globalData,
      data = new Date(),
      params = {
        deliver_time:shoppingTiem
      };
    if( shoppingTiem ){
      params['deliver_time'] = data.getFullYear()+'-'+params['deliver_time']
      params['deliver_time'] = params['deliver_time'].replace("月", "-")
      params['deliver_time'] = params['deliver_time'].replace("日", "")
    }
    this.ajax.cart_list_count(params).then(res => {
      let text = res.data.toString();
      this.globalData.cart_num = text
      if (text <= 0 ){
        wx.removeTabBarBadge({
          index: 2,
        });
      }else{
        wx.setTabBarBadge({
          index: 2,
          text: this.globalData.cart_num
        })
      }
    })
  },

  autoUpdate: function () {
    var self = this
    // 获取小程序更新机制兼容
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      //1. 检查小程序是否有新版本发布
      updateManager.onCheckForUpdate(function (res) {
        // 请求完新版本信息的回调
        if (res.hasUpdate) {
          //检测到新版本，需要更新，给出提示
          wx.showModal({
            title: '更新提示',
            content: '检测到新版本，是否下载新版本并重启小程序？',
            success: function (res) {
              if (res.confirm) {
                //2. 用户确定下载更新小程序，小程序下载及更新静默进行
                self.downLoadAndUpdate(updateManager)
              } else if (res.cancel) {
                //用户点击取消按钮的处理，如果需要强制更新，则给出二次弹窗，如果不需要，则这里的代码都可以删掉了
                wx.showModal({
                  title: '温馨提示~',
                  content: '本次版本更新涉及到新的功能添加，旧版本无法正常访问的哦~',
                  showCancel: false,//隐藏取消按钮
                  confirmText: "确定更新",//只保留确定更新按钮
                  success: function (res) {
                    if (res.confirm) {
                      //下载新版本，并重新应用
                      self.downLoadAndUpdate(updateManager)
                    }
                  }
                })
              }
            }
          })
        }
      })
    } else {
      // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
  },
  /**
   * 下载小程序新版本并重启应用
   */
  downLoadAndUpdate: function (updateManager) {
    var self = this
    wx.showLoading();
    //静默下载更新小程序新版本
    updateManager.onUpdateReady(function () {
      wx.hideLoading()
      //新的版本已经下载好，调用 applyUpdate 应用新版本并重启
      updateManager.applyUpdate()
    })
    updateManager.onUpdateFailed(function () {
      // 新的版本下载失败
      wx.showModal({
        title: '已经有新版本了哟~',
        content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~',
      })
    })
  },

  bezier: function (pots, amount) {
    var pot;
    var lines;
    var ret = [];
    var points;
    for (var i = 0; i <= amount; i++) {
      points = pots.slice(0);
      lines = [];
      while (pot = points.shift()) {
        if (points.length) {
          lines.push(pointLine([pot, points[0]], i / amount));
        } else if (lines.length > 1) {
          points = lines;
          lines = [];
        } else {
          break;
        }
      }
      ret.push(lines[0]);
    }
    function pointLine(points, rate) {
      var pointA, pointB, pointDistance, xDistance, yDistance, tan, radian, tmpPointDistance;
      var ret = [];
      pointA = points[0];//点击
      pointB = points[1];//中间
      xDistance = pointB.x - pointA.x;
      yDistance = pointB.y - pointA.y;
      pointDistance = Math.pow(Math.pow(xDistance, 2) + Math.pow(yDistance, 2), 1 / 2);
      tan = yDistance / xDistance;
      radian = Math.atan(tan);
      tmpPointDistance = pointDistance * rate;
      ret = {
        x: pointA.x + tmpPointDistance * Math.cos(radian),
        y: pointA.y + tmpPointDistance * Math.sin(radian)
      };
      return ret;
    }
    return {
      'bezier_points': ret
    };
  },

  globalData: {
    sessionKey: "", // 导航栏高度
    navBarHeight: 0, // 导航栏高度
    menuRight: 0, // 胶囊距右方间距（方保持左、右间距一致）
    menuBotton: 0, // 胶囊距底部间距（保持底部间距一致）
    menuHeight: 0, // 胶囊高度（自定义内容可与胶囊高度保证一致）
    menuWidth: 0,// 距离胶囊宽度 （自定义内容可与胶囊高度保证一致）
    HOST: '',
    Url: 'https://wcxz-client.web.gdtuode.com/',
    url: 'https://wcxz-client.web.gdtuode.com/',
    staticUrl: 'https://oss.static.wcxzstore.com/',
    wxAuth: "",

    pid: '',
    category: '',
    
    storeState:0,
    longitude: '',
    latitude: '',
    token: '',
    session_key: '',
    userInfo: null,
    store_id: '',
    store_name: '',
    classify: '',
    shoppingTiem:'',
    cart_num:'',

    list:'',
    date: '', 
    money: '', 
    from: '',

    address: "",
    city: "",
    cityCode: "",

    session_key: "",
    userInfo: '',
    phone: "",
    appid: "",
    stopState: 0
  },
  ajax: new ajax()
})
