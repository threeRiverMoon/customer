// pages/my/discount/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page_index: 1,
    page_size: 10,
    page_count: "",
    list:[]
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
    this.setData({
      page_index: 1
    })
    this.couponList()
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
    let self = this;
    self.setData({
      page_index: 1,
      list: []
    })
    self.couponList()
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let self = this;
    let { page_index, page_count } = self.data;
    if (page_index >= page_count ) {
      return false;
    }
    self.setData({
      page_index: ++page_index
    })
    self.couponList()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  /**
   * 获取用户优惠券列表
   */
  couponList(){
    const self = this,
      { page_index, page_size, list } = self.data,
      params = {
        page_index,
        page_size
      };
    app.ajax.couponList(params).then(res => {
      let { page_count, data } = res.data;
      if (page_index == '1') {
        self.setData({
          list: data,
          page_count
        })
      } else {
        self.setData({
          list: list.concat(data)
        })
      }
    })
  },
})