// pages/my/often/index.js
//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    HOST: '',
    store_id:'',
    list:[],
    id:'',
    page_index: 1,
    page_size: 10,
    page_count: "",

    time2: [],
    screen: 0,
    val: 0,
    tiem: [],
    index: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
	  const { HOST, store_id } = app.globalData;
	  this.setData({
      HOST,
      store_id
	  })
    if (options.id ){
      this.id = options.id||'';
      this.setData({
        id: options.id||''
      })
      this.commodity_list_of_id()
      wx.setNavigationBarTitle({
        title: '商品列表',
      })
    }else{
      this.oftenBuyList()
      wx.setNavigationBarTitle({
        title: '经常购买',
      })
    }
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
    let self = this;
    if (self.data.id != '') {
      self.setData({
        page_index: 1,
        list: []
      })
      self.commodity_list_of_id()
      wx.stopPullDownRefresh()
    } else {
      self.setData({
        page_index: 1,
        list: []
      })
      self.oftenBuyList()
      wx.stopPullDownRefresh()
    }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let self = this;
    let { page_index, page_count, activeIndex } = self.data;
    if (page_index >= page_count) {
      return false;
    }
    self.setData({
      page_index: ++page_index
    })
    if (self.id != '' ){
      self.commodity_list_of_id()
    }else{
      self.oftenBuyList()
    }
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
   * 经常购
   */
  oftenBuyList(){
    const self = this,
      { page_index, page_size, list, store_id } = self.data,
    params = {
      store_id,
      page_index,
      page_size,
    }
    app.ajax.oftenBuyList(params).then(res => {
      let { page_count, data } = res.data;
      for( let i in data ){
        data[i].price = parseFloat(data[i].price)
        data[i].original_price = parseFloat(data[i].original_price)
        data[i].show = false
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
    wx.createSelectorQuery().selectAll('.like_list').boundingClientRect((ret) => {
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
   * 商品列表（根据商品id）
   */
  commodity_list_of_id(){
    const self = this,
      { page_index, page_size, list, store_id } = self.data,
      params = {
        store_id,
        page_index,
        page_size,
        id:self.id
      };
    app.ajax.commodity_list_of_id(params).then(res => {
      let { page_count, data } = res.data;
      for( let i in data ){
        data[i].price = parseFloat(data[i].price)
        data[i].original_price = parseFloat(data[i].original_price)
        data[i].show = false
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

  /**
   *  加入购物车
   */
  handleAddCard(e, delivery_date, goods_id) {
    let id = goods_id
    if (e != '') {
      id = e.currentTarget.dataset.id
    }
    let { list } = this.data,
      params = {
        commodity_id: id,
        count: 1
      },
      datas = new Date();
    if (delivery_date) {
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
      for (let i = 0; i < list.length; i++) {
        if (list[i].id == id) {
          list[i].shopping_cart_num++
        }
      }
      this.setData({
        list
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
  getTiem(tiem, start, fun) {
    start = start.replace(/-/g, '/'); //必须把日期'-'转为'/'
    let myDate = new Date(start),
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
      { list } = selt.data;
    if (id == 1) {
      selt.getTiem(list[index].deliver_date.day + 1, list[index].deliver_date.start_deliver, function () {
        // if (selt.data.time2.length <= 1) {
        selt.handleAddCard('', selt.data.tiem, list[selt.data.index].id)
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
    } else if (id == 2) {
      selt.handleAddCard('', selt.data.tiem, list[selt.data.index].id)
    } else {
      selt.setData({
        screen: id,
      })
    }
  },
})