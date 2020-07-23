// pages/common/location/index.js
//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {

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
   * 获取小程序位置
   */
  getLocations() {
    const self = this
    wx.openSetting({
      success: function (res) {
        if (res.authSetting["scope.userLocation"] == true) {
          //再次授权，调用wx.getLocation的API
          self.geUsertLocation()
        } 
      }
    })
  },
  // 微信获得经纬度
  geUsertLocation() {
    const self = this
    wx.getLocation({
      type: "gcj02",
      success(res) {
        const { latitude, longitude } = res
        app.globalData.longitude = longitude;
        app.globalData.latitude = latitude;
        wx.showToast({
          title: '位置授权成功'
        })
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/tarbar/home/index'
          })
        },1500)
      },
      fail (err) {
        
      }
    })
  },
})