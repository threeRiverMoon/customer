//获取应用实例
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    HOST: '',
    tabs: [
      {
        name:'待付款',
        total:'0'
      },
      {
        name: '已付款',
        total: '0'
      },
      {
        name: '待自提',
        total: '0'
      },
      {
        name: '全部',
        total: '0'
      }
    ],
    activeIndex:2,    //选项卡
    page_index: 1,
    page_size: 10,
    page_count: "",
    list: [],
    lastTime:0,
    newtitle: '',
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
	const { HOST } = app.globalData;
    this.setData({
      activeIndex: options.nav||3,
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
    this.setData({
      page_index: 1
    })
    let { newtitle } = this.data;
    if (newtitle == '不刷新') {

    } else {
      this.ordersList()
    }    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.setData({
      newtitle: ''
    })
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
    this.setData({
      page_index: 1,
      list: []
    })
    this.ordersList()
    wx.stopPullDownRefresh()
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
  onPageScroll(){ // 滚动事件
    this.showImg()
  },

  /**
  * 加载更多
  */
  onBottom() {
    let self = this;
    let { page_index, page_count } = self.data;
    if (page_index >= page_count) {
      return false;
    }
    self.setData({
      page_index: ++page_index
    })
    self.ordersList()
  },

  /**
   * 订单列表
   */
  ordersList(){
    const self = this,
      { activeIndex, page_index, page_size, list } = self.data,
      params = {
        page_index,
        page_size,
        status: activeIndex == 3 ? '' : activeIndex
      };
    self.getOrderMentioned()
    app.ajax.ordersList(params).then(res => {
      let { page_count, data } = res.data;
      for( let i in data ){
        data[i].amount = parseFloat(data[i].amount)
        data[i].pay_amount = parseFloat(data[i].pay_amount)
        data[i].show = false
        data[i].price_whole = String(data[i].amount).split('.')[0]
        data[i].price_small = String(data[i].amount).split('.')[1] || ''
      }
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
      this.showImg()
    })
  },

  showImg(){
    let list = this.data.list,
    height = wx.getSystemInfoSync().windowHeight  // 页面的可视高度
    wx.createSelectorQuery().selectAll('.wrap-main').boundingClientRect((ret) => {
    ret.forEach((item, index) => {
      if (item.top <= height) { 
        list[index].show = true // 根据下标改变状态  
      }
    })
    this.setData({
      list
    })
    }).exec()
  },

  /**
   * 当前用户订单数
   */
  getOrderMentioned() {
    const params = {

    }
    app.ajax.getOrderMentioned(params).then(res => {
      let { pending_payment_count, mentioned_count, paid_count } = res.data,
        { tabs } = this.data;
      tabs[0]['total'] = pending_payment_count
      tabs[1]['total'] = paid_count
      tabs[2]['total'] = mentioned_count
      this.setData({
        tabs
      })
    })
  },

  /**
   * 选项切换
   */
  tabClick(e) {
    const selt = this,
     activeIndex = e.currentTarget.id,
     { lastTime } = this.data;
    let nowTime = new Date().getTime()
    if (nowTime - lastTime > 500) {
      this.setData({
        page_index: 1,
        activeIndex
      })
      this.ordersList()
      selt.setData({
        lastTime: nowTime,
      })
    }
  },
  /**
   * 确认自提
   */
  handleMelt(e){
    const self = this,
      { id } = e.currentTarget.dataset,
      params = {
        order_id:id
      };
    wx.showModal({
      title: '提示',
      content: '是否确认自提？',
      confirmColor:'#C3D939',
      cancelColor:'#949494',
      success(res) {
        if (res.confirm) {
          app.ajax.mention(params).then(res => {
            wx.showToast({
              title: '确认自提成功',
              duration: 2000
            })
            self.ordersList()
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
        id
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
            self.ordersList()
          })
        } else if (res.cancel) {

        }
      }
    })
  },

  /**
   * 支付跳转
   */
  handlePayment(e){
    const self = this,
      { name } = e.currentTarget.dataset;
      wx.navigateTo({
        url: '/pages/home/payment/index?list=' + JSON.stringify(name),
      })
  },

  /**
   * 跳转详情
   */
  handleDetails(e){
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: '/pages/my/order_details/index?order_id=' + id,
    })
  }
  
})