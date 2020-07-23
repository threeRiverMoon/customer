//获取应用实例
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    order_id: '',  //订单状态
    HOST: '',
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
	const { HOST } = app.globalData;
    this.setData({
      order_id: options.order_id,
	  HOST
    })
  },

  // 查看地图
  handleMap() {
    wx.navigateTo({
      url: '/pages/home/carry_see/index',
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
    this.getOrderDetails();
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
     * 查看地图
     */
  handleMap() {
    const { latitude, longitude } = this.data.detailsData;
    wx.openLocation({
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      scale: 18
    })
  },

  /**
   * 获取订单详情
   */
  getOrderDetails() {
    let self = this;
    const { order_id } = self.data;
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        const { latitude, longitude } = res
        const params = {
          order_id,
          lat: latitude,
          lng: longitude
        }
        app.ajax.orderDetails(params).then(res => {
          let { data } = res;
          data['coupon_amount'] = parseFloat(data['coupon_amount'])
          data.price_whole = String(data.pay_amount).split('.')[0]
          data.price_small = String(data.pay_amount).split('.')[1] || ''
          for( let i in data.comm_list ){
            data.comm_list[i].price = parseFloat(data.comm_list[i].price)
            data.comm_list[i].original_price = parseFloat(data.comm_list[i].original_price) 
            data.comm_list[i].price_whole = String(data.comm_list[i].price).split('.')[0]
            data.comm_list[i].price_small = String(data.comm_list[i].price).split('.')[1] || ''
          }
          self.setData({
            detailsData: data
          })
        })
      },
      fail: function (res) {
        
      }
    })
  }
  
})