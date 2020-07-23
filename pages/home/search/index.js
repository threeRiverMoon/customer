// pages/home/search/index.js
//获取应用实例
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    HOST: '',
    screenIndex:0,    //选项卡
    tabs: ["综合", "销量", "价格"],
    order:'', //升序降序
    size:'8',
    page_size: 10,
    page_index: 1,
    page_count: 0,
    history: [],
    popularList: [],
    search:'',
    value:'',
    list: [],
    text:'',
    searchs:0,

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
  const { HOST } = app.globalData,
    { text } = options;
	this.setData({
    HOST,
    text
	})
    this.get_top_searches()
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
    const history = wx.getStorageSync('searchList')
    if (history != '' && history != undefined ){
      this.setData({
        history
      })
    }
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
    this.getSearchList()
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let { page_index, page_count } = this.data;

    if (page_index >= page_count) {
      return false;
    }
    this.setData({
      page_index: ++page_index
    })
    this.getSearchList()
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
   * 获取热门搜索
   */
  get_top_searches(){
    const self = this,
    { size } = self.data,
    params = {
      size
    };
    app.ajax.get_top_searches(params).then(res => {
      self.setData({
        popularList:res.data
      })
    })
  },
  /**
   * 搜索
   */
  handleSearch(){
    this.setData({
      search:this.data.value
    })
    let self = this,
    { search, value } = self.data,
    searchList = wx.getStorageSync('searchList');
    self.setData({
      page_index: 1
    })
    self.getSearchList()
    if (search != '' && search != ' ' ){
      if (searchList == '' || searchList == undefined || searchList == null ){
        const data = [
          search
        ]
        wx.setStorage({
          key: "searchList",
          data,
        })
      }else{
        for( let i in searchList ){
          if( searchList[i] == search ){
            searchList.splice(i,1)
          }
        }
        console.log(searchList)
        searchList.unshift(search)
        wx.setStorage({
          key: "searchList",
          data: searchList,
        })
      }
    }
  },

  /**
   * 搜索、筛选商品
   */
  getSearchList(){
    const selt = this,
      { search, page_index, page_size, screenIndex, list, order } = selt.data,
    params = {
      search,
      page_index,
      page_size,
      field:'',
      order:screenIndex==1?1:order,
    };
    if( screenIndex == 1 ){
      params['field'] = 'sales_volume'
    }else if( screenIndex == 2 ){
      params['field'] = 'price'
    }
    app.ajax.search_goods(params).then(res => {
      let { page_count, data } = res.data;
      for( let i in data ){
        data[i].tag_name = data[i].tag_name.split(',')
        data[i].price = parseFloat(data[i].price)
        data[i].original_price = parseFloat(data[i].original_price)
        data[i].show = false
        data[i].price_whole = String(data[i].price).split('.')[0]
        data[i].price_small = String(data[i].price).split('.')[1]||''
      }
      if (page_index == '1') {
        this.setData({
          list: data,
          page_count,
          searchs:1
        })
      } else {
        this.setData({
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

  toDouble(val) {
    val = val < 10 ? '0' + val : val;
    return val;
  },

  handle(){

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
      this.setData({
        screen:0
      })
      this.getSearchList()
    })
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
          selt.setData({
            index,
            screen: 0,
          })
          selt.handleAddCard('', selt.data.tiem, list[selt.data.index].id)
          // return false
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

  /**
   * 筛选
   */
  tabClick(e){
    let { order, screenIndex } = this.data,
      { id } = e.currentTarget;
    if (id == 2 && screenIndex != 2) {
      order = 1
    } else if (id == 2 && screenIndex == 2 ){
      order = order==1?2:1
    } else if (id == 1 ){
      order = '';
    }else{
      order = '';
    }
    this.setData({
      screenIndex: id,
      order,
      page_index: 1
    })
    this.getSearchList()
  },

  /**
   * 选择热门搜索、历史搜索
   */
  handleSelect(e){
    this.setData({
      value: e.currentTarget.dataset.name,
    })
    this.handleSearch()
  },

  /**
   * 清空搜索历史记录
   */
  handleDel(){
    const self = this;
    wx.showModal({
      title: '提示',
      content: '确认删除全部历史记录？',
      success(res) {
        if (res.confirm) {
          wx.removeStorageSync('searchList')
          self.setData({
            history:wx.getStorageSync('searchList')
          })
        } else if (res.cancel) {
          
        }
      }
    })
  },

  /**
   * 搜索内容
   */
  bindInput(e){
    this.setData({
      value: e.detail.value
    })
  },
})