// pages/my/article_details/index.js
const app = getApp();
var WxParse = require('../../../wxParse/wxParse.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    data:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { name } = options
    if (name == '关于我们'){
      this.getAbout()
    } else if (name == '用户协议'){
      this.userAgreement()
    } else if (name == '隐私政策'){
      this.privacyPolicy()
    } else if (name == '营业执照'){
      this.businessLicense()
    }
    wx.setNavigationBarTitle({
      title: name,
    })
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
   * 关于我们
   */
  getAbout(){
    app.ajax.about().then(res => {
      const { data } = res
      this.setData({
        data,
      })
      WxParse.wxParse('data', 'html', data, this, 0);
    })
  },

  /**
   * 用户协议
   */
  userAgreement() {
    app.ajax.userAgreement().then(res => {
      const { data } = res
      this.setData({
        data,
      })
      WxParse.wxParse('data', 'html', data, this, 0);
    })
  },

  /**
   * 隐私政策
   */
  privacyPolicy() {
    app.ajax.privacyPolicy().then(res => {
      const { data } = res
      this.setData({
        data,
      })
      WxParse.wxParse('data', 'html', data, this, 0);
    })
  },

  /**
   * 营业执照
   */
  businessLicense() {
    app.ajax.businessLicense().then(res => {
      const { data } = res
      this.setData({
        data,
      })
      WxParse.wxParse('data', 'html', data, this, 0);
    })
  },
})