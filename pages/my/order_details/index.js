//获取应用实例
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    HOST: '',
    order_id: '',  //订单id
    shopowner: 0, //取消订单弹窗
    detailsData:[],
    goods_list:[]
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
   * 查看地图
   */
  handleMap(){
    const { latitude, longitude, s_del_flag} = this.data.detailsData;
    if (s_del_flag == 1) {
      wx.showToast({
        title: '该门店不存在',
        icon:'none'
      })
      return false
    }
    wx.openLocation({
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      scale: 18
    })
  },

  /**
   * 确认自提
   */
  handleMelt(e) {
    const self = this,
      { order_id } = self.data,
      params = {
        order_id,
      };
    wx.showModal({
      title: '提示',
      content: '是否确认自提？',
      confirmColor: '#C3D939',
      cancelColor: '#949494',
      success(res) {
        if (res.confirm) {
          app.ajax.mention(params).then(res => {
            wx.showToast({
              title: '确认自提成功',
              duration: 2000
            })
            self.getOrderDetails()
          })
        } else if (res.cancel) {

        }
      }
    })
  },

  /**
   *  取消订单
   */
  handleShopowner(e) {
    const self = this,
      { id } = e.currentTarget.dataset,
      params = {
        id,
      };
    wx.showModal({
      title: '提示',
      content: '是否取消订单？',
      confirmColor: '#C3D939',
      cancelColor: '#949494',
      success(res) {
        if (res.confirm) {
          app.ajax.order_cancel(params).then(res => {
            wx.showToast({
              title: '订单取消成功',
              duration: 2000
            })
            self.getOrderDetails()
          })
        } else if (res.cancel) {

        }
      }
    })
  },

  /**
   * 立即支付
   */
  handlePayment(){
    const self = this,
      { detailsData } = self.data;
    detailsData['amount'] = detailsData['pay_amount']
    detailsData['detail'] = {
     data: detailsData['comm_list']
    } 
    wx.navigateTo({
      url: '/pages/home/payment/index?list=' + JSON.stringify(detailsData),
    })
  },

  /**
   * 获取订单详情
   */
  getOrderDetails(){
    let self = this;
    const { order_id} = self.data;
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
          if (data.pay_amount < 0 ){
            data.pay_amount = 0
          }
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
  },
  activity(e) {
    let { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: '/pages/home/goods_details/index?id=' + id,
    })
  },
})