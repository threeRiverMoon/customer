// pages/home/carry_search/index.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    store:'',
    latitude: '',
    longitude: '',
    markers: [{
      iconPath: "/images/icon/zhongxin@2x.png",
      id: 0,
      latitude: '',
      longitude: '',
      width: 30,
      height: 50
    }],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const store = JSON.parse(options.store),
      { markers } = this.data,
      location = store.location.split(',');
    markers[0].longitude = location[0];
    markers[0].latitude = location[1];
    this.setData({
      store,
      markers,
      longitude: location[0],
      latitude: location[1]
    })
  },

  // 导航
  setNavigation(){
    const { latitude, longitude } = this.data;
    const latitudes = parseFloat(latitude)
    const longitudes = parseFloat(longitude)
    wx.openLocation({
      latitude: latitudes,
      longitude: longitudes,
      scale: 18
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

  }
})