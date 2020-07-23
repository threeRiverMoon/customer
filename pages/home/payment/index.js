// pages/home/payment/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    HOST: '',
    check: 1,
    money:0,
    list: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const list = JSON.parse(options.list),
     { HOST } = app.globalData;
    console.log(list)
    this.setData({
      list,
	  HOST
    })
    this.getGold()
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
    let pages = getCurrentPages(),
      currPage = pages[pages.length - 1],   //当前页面
      prevPage = pages[pages.length - 2],  //上一个页面
      //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
      newtitle = '不刷新';
    //不需要页面更新
    prevPage.setData({
      newtitle
    })
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

  /**
   * 是否支持代购金
   */
  handleChecks(e) {
    const { check, money } = this.data;
    console.log(money)
    if (money == 0.00 || money == 0 ){
      wx.showToast({
        title: '无可用代购金',
        icon:'none'
      })
      return false;
    }
    this.setData({
      check: check==1?0:1
    })
  },

  /**
   * 获取代购金
   */
  getGold(){
    const params = {}
    wx.showLoading({
      title: '加载中',
      mask:true
    })
    app.ajax.getGold(params).then(res => {
	  wx.hideLoading()
      let { money } = res.data;
      this.setData({
        money: parseFloat(money),
        check: money==0.00?0:1
      })
    })
  },

  /**
   * 微信支付
   */
  bindPayment() {
    const self = this,
      { list, check, money } = self.data,
      params = {
        order_id: list.order_id,
        voucherPaymentAmount:0,
        wechatPaymentAmount: parseFloat(list.amount)
      };
      if( check == 1 ){
        if (parseFloat(list.amount) > parseFloat(money) ){
          params['wechatPaymentAmount'] = parseFloat((list.amount - money).toFixed(2))
          params['voucherPaymentAmount'] = parseFloat(money);
        } else{
          params['wechatPaymentAmount'] = 0
          params['voucherPaymentAmount'] = parseFloat(list.amount);
        }
      }
    if (list.amount == 0 || list.amount == 0.00 ){
      params['wechatPaymentAmount'] = 0
      params['voucherPaymentAmount'] = 0
    }
    wx.requestSubscribeMessage({
      tmplIds: ["meEqCcq02bQWhO_8-sDSz6LEerTaLE917wTycnzrknI"],
      success: (res) => {
        if (res['meEqCcq02bQWhO_8-sDSz6LEerTaLE917wTycnzrknI'] === 'accept') {
          wx.showLoading({
            title: "支付中",
            mask: true
          })
          app.ajax.pay(params).then(res => {
            if (params['wechatPaymentAmount'] == 0 ){
              wx.showToast({
                title: '支付成功',
                duration: 2000,
                mask: "true"
              })
              setTimeout(() => {
                wx.redirectTo({
                  url: '/pages/my/order/index?nav=1',
                })
              }, 2000)
            }else{
              wx.requestPayment({
                timeStamp: res.data.timeStamp,
                nonceStr: res.data.nonceStr,
                package: res.data.package,
                signType: res.data.signType,
                paySign: res.data.paySign,
                success: function (res1) {
                  wx.showToast({
                    title: '支付成功',
                    duration: 2000,
                    mask: "true"
                  })
                  setTimeout(() => {
                    wx.redirectTo({
                      url: '/pages/my/order/index?nav=1',
                    })
                  }, 2000)
                },
                fail: function (res) {
                  wx.showToast({
                    title: '支付失败',
                    icon: 'none',
                  })
                }
              })
            }
          })
        }
      },
      fail(err) {
        if (err.errMsg == 'requestSubscribeMessage:fail can only be invoked by user TAP gesture.') {
          wx.showModal({
            title: '订阅消息',
            content: '需要获取订阅消息',
            showCancel: false,
            cancelText: '取消',
            confirmText: '确认授权',
            success: res => {
              wx.openSetting({
                withSubscriptions: true,
                success(res) {
                  
                }
              })
            },
            fail: () => { },
            complete: () => {

            }
          });
        }
      }
    })
  },
})