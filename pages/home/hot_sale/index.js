// pages/home/seckill/index.js
const app = getApp()
let timer = '';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    HOST: '',
    store_id:'',
    activity_id:'',
    page_index: 1,
    page_size: 10,
    page_count: "",
    list: [],
    button:'',
    hotGoodsList: [],

    time2: [],
    screen: 0,
    val: 0,
    tiem: [],
    index:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
	 const { HOST, store_id } = app.globalData;
    this.setData({
      HOST,
      store_id,
    })
    this.hot_goods()
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
    this.setData({
      page_index: 1,
      list: []
    })
    this.hot_goods()
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    // let self = this;
    // let { page_index, page_count } = self.data;
    // if (page_index >= page_count) {
    //   return false;
    // }
    // self.setData({
    //   page_index: ++page_index
    // })
    // self.hot_goods()
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
   * 热销榜
   */
  hot_goods() {
    let { page_index, page_size, hotGoodsList } = this.data,
     params = {
      store_id: this.data.store_id,
       page_size,
       page_index
    }
    app.ajax.hot_goods(params).then(res => {
      const { data, page_count } = res.data;
      for (let i in data) {
        data[i].price = parseFloat(data[i].price)
        data[i].show = false
        data[i].price_whole = String(data[i].price).split('.')[0]
        data[i].price_small = String(data[i].price).split('.')[1] || ''
      }
      if (page_index == '1') {
        this.setData({
          hotGoodsList: data,
          page_count,
        })
      } else {
        this.setData({
          hotGoodsList: hotGoodsList.concat(data)
        })
      }
      this.showImg()
    })
  },

  /**
   * 加入购物车
   */
  handleCart(e, delivery_date,goods_id) {
    let id = goods_id
    if( e != '' ){
      id = e.currentTarget.id
    }
    let { hotGoodsList } = this.data,
      params = {
        commodity_id: id,
        count: 1
      },
      datas = new Date();
    if (delivery_date ){
      params['delivery_date'] = datas.getFullYear() + '-' + delivery_date
      params['delivery_date'] = params['delivery_date'].replace("月", "-")
      params['delivery_date'] = params['delivery_date'].replace("日", "")
    }
    wx.showLoading({
      title: '加入购物车中',
      mask: true,
    })
    app.ajax.addCard(params).then(res => {
      wx.showToast({
        title: res.msg,
        mask: true
      })
      for (let i = 0; i < hotGoodsList.length; i++) {
        if (hotGoodsList[i].id == id) {
          hotGoodsList[i].shopping_cart_num++
        }
      }
      this.setData({
        hotGoodsList,
        screen: 0
      })
    })
  },

  toDouble(val) {
    val = val < 10 ? '0' + val : val;
    return val;
  },
  /**
    * 选择自提日期计算
    */
  getTiem(tiem, start,fun) {
    start = start.replace(/-/g, '/'); //必须把日期'-'转为'/'
    let myDate  = new  Date(start),
      dateArray = [],
      dateTemp,
      flag = 1,
      val = 0
    for (let i = 0; i < tiem; i++) {
      dateTemp = this.toDouble(myDate.getMonth() + 1) + "月" + this.toDouble(myDate.getDate()) + "日";
      dateArray.push(dateTemp);
      myDate.setDate(myDate.getDate() + flag);
    }
    this.setData({
      time2: dateArray,
      tiem: dateArray[val],
      val: 0
    })
    fun()
  },
  /**
   * 滑动选择时间
   */
  bindChange: function (e) {
    const val = e.detail.value
    this.setData({
      tiem: this.data.time2[val],
      val,
    })
  },
  /**
   * 显示选择时间弹窗
   */
  handleScreen(e) {
    let selt = this,
      { id, index } = e.currentTarget.dataset,
      { hotGoodsList } = selt.data;
    if (id == 1) {
      selt.getTiem(hotGoodsList[index].deliver_date.day + 1, hotGoodsList[index].deliver_date.start_deliver, function () {
        // if (selt.data.time2.length <= 1) {
          selt.setData({
            index
          })
          selt.handleCart('', selt.data.tiem, hotGoodsList[selt.data.index].id)
          selt.setData({
            screen: 0,
          })
        //   return false
        // }
        // selt.setData({
        //   screen: id,
        //   index
        // })
      })
    }else if (id == 2) {
      selt.handleCart('', selt.data.tiem, hotGoodsList[selt.data.index].id)
    }else{
      selt.setData({
        screen: id,
      })
    }
  },

  showImg(){
    let hotGoodsList = this.data.hotGoodsList,
    height = wx.getSystemInfoSync().windowHeight  // 页面的可视高度
    wx.createSelectorQuery().selectAll('.list_emptyList').boundingClientRect((ret) => {
    ret.forEach((item, index) => {
      if (item.top <= height) { 
        hotGoodsList[index].show = true // 根据下标改变状态  
      }
    })
    this.setData({
      hotGoodsList
    })
    }).exec()
  },
})