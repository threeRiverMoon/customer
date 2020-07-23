//获取应用实例
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    HOST: '',
    detailsData:[],
    sale_id:"",
    order_id:'',  //订单id
    melt: 0, //是否显示核销弹窗
    goods_list:[]
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
	const { HOST } = app.globalData;
    this.setData({
      order_id: options.order_id,
      sale_id:options.sale_id,
	  HOST
    })
    this.getOrderDetails();
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
   * 取消售后
   */
  handleCancel(e) {
    let self = this,
      { id } = e.currentTarget.dataset,
      params = {
        sale_id: id
      }
    wx.showModal({
      title: '提示',
      content: '确定要取消售后吗？',
      confirmColor: '#C3D939',
      cancelColor: '#949494',
      success: function (res) {
        if (res.confirm) {
          app.ajax.cancelSales(params).then(res => {
            wx.showToast({
              title: '取消成功',
            })
            self.getOrderDetails()
          })
        }
      }
    })
  },

  /**
   * 核销
   */
  handleMelt(e) {
    var id = e.currentTarget.dataset.id;
    this.setData({
      melt: id
    })
  },

  /**
   * 获取订单详情
   */
  getOrderDetails() {
    let self = this;
    const { order_id} = self.data
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
          data['all_sale_amount'] = parseFloat(data['all_sale_amount'])
          data.all_sale_amount_whole = String(data.all_sale_amount).split('.')[0]
          data.all_sale_amount_small = String(data.all_sale_amount).split('.')[1] || ''
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