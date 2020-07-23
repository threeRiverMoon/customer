//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    money: '',
    couponNum: '',
    orderNum: '',
    phone: '',
    userInfo: '',
    session_key: '',
    token: '',
    navBarHeight: app.globalData.navBarHeight,
    menuRight: app.globalData.menuRight,
    menuBotton: app.globalData.menuBotton,
    menuHeight: app.globalData.menuHeight,
    isScroll:false,

    loading:false,
    isKeleton:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    const { userInfo, token, phone } = app.globalData;
    this.setData({
      userInfo,
      phone,
      token
    })
    if (token !== "") {
      this.getGold()
      this.getCouponNum()
      this.getOrderMentioned()
      app.cart_list_count()
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  onPageScroll(e){ // 滚动事件
    let isScroll = false;
    if (e.scrollTop <= 90) {
      isScroll = false;
    } else {
      isScroll = true;
    }
    this.setData({
      isScroll
    })
  },
  /**
   * 获取用户授权信息
   */
  bindGetUserInfo(e) {
    const self = this;
    app.oauth(function (res) {
      const { data, session_key, token } = res;
      app.globalData.token = token;
      app.globalData.session_key = session_key;
      app.globalData.userInfo = data;
      wx.setStorageSync('token', token)
      wx.setStorageSync('session_key', session_key)
      wx.setStorageSync('userInfo', data)
      self.setData({
        token,
        userInfo: data
      })
      app.handleStore()
      self.getGold()
      self.getCouponNum()
      self.getOrderMentioned()
    })
  },

  /**
   * 获取可用代购金
   */
  getGold(){
    const self = this,
      params = {

      }
    app.ajax.getGold(params).then(res => {
      let { money } = res.data
      self.setData({
        money: parseFloat(money),
      })
    })
  }, 

  /**
   * 当前用户可用的优惠券数量
   */
  getCouponNum() {
    const params = {

    }
    app.ajax.getCouponNum(params).then(res => {
      this.setData({
        couponNum: res.data.num
      })
    })
  },

  /**
   * 当前用户订单数
   */
  getOrderMentioned() {
    const params = {

    }
    app.ajax.getOrderMentioned(params).then(res => {
      this.setData({
        orderNum: res.data
      })
    })
  },
  // 获取手机号码
  getPhoneNumber(e){
    const { encryptedData, iv } = e.detail,
      params = {
        encryptedData,
        iv,
        sessionKey:wx.getStorageSync('session_key')
      };
    if(iv){
      wx.showLoading({
        title: '获取中',
        mask:true
      })
      app.ajax.getPhone(params).then(res => {
        console.log(res);
        
        // const { phoneNumber, watermark } = res.data;
        // self.setData({
        //   phone: phoneNumber
        // })
        // wx.setStorage({
        //   key: "phoneNumber",
        //   data: phoneNumber
        // })
        // wx.setStorage({
        //   key: "appid",
        //   data: watermark.appid
        // })
        // app.globalData.phone = phoneNumber
        // app.globalData.appid = watermark.appid
        // self.setPhone()
      }).catch(err=>{
        wx.hideLoading()
        wx.showToast({
          title: '获取失败，请重新获取',
          icon:'none',
          duration:2000
        })
      })
    }
  },

  /**
   * 绑定手机号
   */
  setPhone(){
    const { phone } = app.globalData,
    params = {
      phone
    }
    wx.showLoading({
      title: '绑定中',
      mask: true
    })
    app.ajax.setPhone(params).then(res => {
      wx.showToast({
        title: '绑定成功',
        duration: 2000,
        mask: true
      })
    })
  },
})