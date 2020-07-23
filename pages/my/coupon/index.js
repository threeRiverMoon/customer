// pages/my/coupon/index.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page_index: 1,
    page_size: 10,
    page_count: "",
    list: []
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
    this.couponCenterList()
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
    self.couponCenterList()
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let self = this;
    let { page_index, page_count } = self.data;
    if (page_index >= page_count) {
      return false;
    }
    self.setData({
      page_index: ++page_index
    })
    self.couponCenterList()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  /**
   * 获取优惠券列表
   */
  couponCenterList() {
    const self = this,
      { page_index, page_size, list } = self.data,
      params = {
        page_index,
        page_size
      };
    app.ajax.couponCenterList(params).then(res => {
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

  /**
   * 领取优惠券
   */
  handleGive(e){
    const self = this,
      { id } = e.currentTarget.dataset,
      params = {
        coupons_id:id
      };
    wx.showLoading({
      title: '领取中',
      icon:'none',
      mask:'true'
    })
    app.ajax.receiveCoupons(params).then(res => {
      wx.showToast({
        title: '领取成功',
        mask:'true'
      })
      this.couponCenterList()
    })
  },
})