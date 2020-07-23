// pages/tarbar/home/index.js
//获取应用实例
const app = getApp()
let timer1 = null,
  timer2 = null,
  timer = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    token:'',
    storeState:0,
    store_name:'',
    distance:'',
    HOST: '',
    userInfo:'',
    store: wx.getStorageSync('store'),
    longitude:'',
    
    banners: null,
    classifyList:[],

    notice: [],
    animation: null,
    timer: null,
    duration: 0,

    textWidth: 0,
    wrapWidth: 0,
    isAnimation: true,
    activitys: {
      bottom: null,
      top: []
    },
    list: [],
    tas: [],
    
    page_index: 1,
    page_size: 5,
    page_count: "",
    hotGoodsList:[],
    activityList:[],
    capsSetList:[],
    top:'',
    top2:'',
    lastTime: 0,
    // 选择自提日期
    time2: [],
    screen: 0,
    val: 0,
    tiem: [],
    type:undefined,
    index:null,
    show:1,
    lastTime:0,
    newtitle:'',

    navBarHeight: app.globalData.navBarHeight,
    menuRight: app.globalData.menuRight,
    menuBotton: app.globalData.menuBotton,
    menuHeight: app.globalData.menuHeight,
    menuWidth: app.globalData.menuWidth,
    isScroll:false,
    activityList:[],
    search_text:'',  //搜索提示的文字
    tabsIndex:0, 
    tabs:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad:async function (options) {
    const CODE = await app.wxLogin();
    console.log(CODE)
    if (!wx.getStorageSync('token')) {
      app.onLaunch()
    }
    const self = this,
      { longitude, latitude, token, store_id, store_name } = app.globalData;
    self.setData({
      token,
      store_name,
      store_id,
      page_index: 1,
    })
    self.store_id = store_id
    this.get_images_url()
    this.get_section_list()
    if (longitude == '') {
      app.getUserLocation(function (res) {
        let { longitude, latitude } = res
        app.globalData.longitude = longitude;
        app.globalData.latitude = latitude;
        self.longitude = longitude;
        self.latitude = latitude;
        wx.setStorageSync('longitude', longitude)
        wx.setStorageSync('latitude', latitude)
        self.getStore()
      })
    } else if (store_id == '') {
      this.longitude = longitude;
      this.latitude = latitude;
      this.getStore()
    } else {
      if (longitude != '') {
        app.getUserLocation(function (res) {
          const { longitude, latitude } = res
          app.globalData.longitude = longitude;
          app.globalData.latitude = latitude;
          self.longitude = longitude;
          self.latitude = latitude;
          wx.setStorageSync('longitude', longitude)
          wx.setStorageSync('latitude', latitude)
        })
      }
      this.longitude = longitude;
      this.latitude = latitude;
      this.store_info()
      this.get_ads()
      app.cart_list_count()
      // if (this.data.activityList == '') {
        this.activity_list()
      // }
      if (self.data.tasIndex == 3) {
        self.getOftenBuyList()
      } else if (self.data.tasIndex == 2) {
        self.popularity_goods()
      } else if (self.data.tasIndex == 1) {
        self.hot_goods()
      } else {
        self.caps_set()
      }
      this.getCategoriesList()
      if (token) {
        this.getAnnouncement()
      }
    }
    this.setData({
      storeState: 0,
      
    })
    setTimeout(function(){
      self.setData({
        show: 0,
      })
    },1000)
  },
  
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (e) {
    const self = this,
      { longitude, latitude, token, store_id, store_name } = app.globalData,
      { newtitle } = self.data;
    if (this.data.show == 0) {
      self.data.index = setTimeout(function () {
        if (newtitle == '不刷新' ){

        }else{
          self.onLoad()
        }
      }, 2000)
    }
    this.get_search_prompt_text()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    clearTimeout(this.data.index)
    this.destroyTimer()
    this.setData({
      timer: null,
      newtitle:''
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    clearTimeout(this.data.index)
    this.destroyTimer()
    this.setData({
      timer: null
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.showLoading({
      title: '刷新中',
      mask: true
    })
    clearTimeout(timer)
    timer = null
    this.onShow(1)
    this.activity_list(1)
    this.setData({
      page_index: 1,
      activityList: []
    })
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
  onPageScroll(e){ // 滚动事件
    let self = this;
    let isScroll = false;
    if (e.scrollTop <= 90) {
      isScroll = false;
    } else {
      isScroll = true;
    }
    this.setData({
      isScroll
    })
    return false;
    if (e.scrollTop <= 50) {
      self.setData({
        top2: 0
      })
    } else {
      self.setData({
        top2: 1
      })
    }
    
    this.showImg()
    var query = wx.createSelectorQuery()
    query.select('.weui-navbars').boundingClientRect(function (res) {
      if( res.top-70 <= 0 ){
        self.setData({
          top: 1
        })
      }else{
        self.setData({
          top: 0
        })
      }
    }).exec()
  },
  destroyTimer() {
    if (this.data.timer) {
      clearTimeout(this.data.timer);
    }
  },

  /**
   * 加载更多
   */
  onBottom(){
    let self = this;
    let { page_index, page_count, tasIndex, lastTime } = self.data;
    let nowTime = new Date().getTime()
    if (nowTime - lastTime > 1000) {
      if (page_index >= page_count) {
        return false;
      }
      self.setData({
        page_index: ++page_index
      })
      clearInterval(timer)
      timer = null
      wx.showLoading({
        title: '加载中...',
        mask:true
      })
      if (tasIndex == 3) {
        self.getOftenBuyList()
      } else if (tasIndex == 2) {
        self.popularity_goods()
      } else if (tasIndex == 1) {
        self.hot_goods()
      } else {
        self.caps_set()
      }
      self.setData({
        lastTime: nowTime,
      })
    }
    
  },

  /**
   * 获取门店信息
   */
  store_info() {
    const self = this,
      { longitude, latitude, store_id } = app.globalData,
      params = {
        longitude,
        latitude,
        store_id
      };
    app.ajax.store_info(params).then(res => {
      let { data, msg } = res;
      if (msg == '该门店不存在' ){
        self.setData({
          storeState:1
        })
        self.getStore()
        return false
      }
      app.globalData.store_id = data.id;
      app.globalData.store_name = data.name;
      wx.setStorageSync('store_id', data.id)
      wx.setStorageSync('store_name', data.name)
      this.setData({
        store_name: data.name,
        store_id: data.id,
      })
    })
  },

  /**
   * 开启公告字幕滚动动画
   * @param  {String} text 公告内容
   * @return {[type]} 
   */
  initAnimation(text) {
    let that = this
    this.data.duration = 15000
    this.data.animation = wx.createAnimation({
      duration: this.data.duration,
      timingFunction: 'linear'
    })
    this.data.animation.option.transition.duration = 0
    this.destroyTimer()
    this.setData({
      timer: null
    })
    let query = wx.createSelectorQuery()
    query.select('.notice_box').boundingClientRect()
    query.select('#text').boundingClientRect()
    query.exec((rect) => {
      that.setData({
        wrapWidth: rect[0].width,
        textWidth: rect[1].width
      }, () => {
        this.startAnimation()
      })
    })
  },

  // 定时器动画
  startAnimation() {
    //reset
    //this.data.animation.option.transition.duration = 0
    const resetAnimation = this.data.animation.translateX(this.data.wrapWidth).step({ duration: 0 })
    this.setData({
      animationData: resetAnimation.export()
    })
    // this.data.animation.option.transition.duration = this.data.duration
    const animationData = this.data.animation.translateX(-this.data.textWidth).step({ duration: this.data.duration })
    setTimeout(() => {
      this.setData({
        animationData: animationData.export()
      })
    }, 300)
    const timer = setTimeout(() => {
      this.startAnimation()
    }, this.data.duration)
    this.setData({
      timer
    })
  },

  /**
   * 获取图片的域名
   */
  get_images_url() {
    const params = {};
    app.ajax.images_url(params).then(res=>{
      const {images_url:HOST} = res.data;
      this.setData({
        HOST
      })
      app.globalData.HOST = HOST
    })
  },

  /**
   * 默认选择自提门店
   */
  getStore() {
    const { token } = app.globalData,
      params = {
        latitude: this.latitude,
        longitude: this.longitude
      }
    app.ajax.default_select_store(params).then(res => {
      const { id, name, distance } = res.data;
      app.globalData.store_id = id;
      app.globalData.store_name = name;
      wx.setStorageSync('store_id', id)
      wx.setStorageSync('store_name', name)
      if (this.store_id == '' ){
        this.store_id = id;
        this.setData({
          store_name: name,
          storeState: 1,
          distance
        })
      }else{
        this.setData({
          store_name: name,
          distance
        })
        const params = { params: '清空购物车' }
        app.ajax.delCartAll(params).then(res => {
          app.globalData.cart_num = ''
        })
        this.getAds()
        // this.hot_goods()
        app.cart_list_count()
        this.activity_list()
        if (this.data.tasIndex == 3) {
          this.getOftenBuyList()
        } else if (this.data.tasIndex == 2) {
          this.popularity_goods()
        } else if (this.data.tasIndex == 1 ) {
          this.hot_goods()
        }else {
          this.caps_set()
        }
        this.getCategoriesList()
        // this.getActivityList()
        if (token) {
          this.getAnnouncement()
          // this.getOftenBuyList()
        }
      }
    })
  },

  store(){
    const { token } = app.globalData;
    this.getAds()
    // this.hot_goods()
    this.activity_list()
    if (this.data.tasIndex == 3) {
      this.getOftenBuyList()
    } else if (this.data.tasIndex == 2) {
      this.popularity_goods()
    } else if (this.data.tasIndex == 1) {
      this.hot_goods()
    } else {
      this.caps_set()
    }
    this.getCategoriesList()
    // this.getActivityList()
    if (token) {
      this.getAnnouncement()
      // this.getOftenBuyList()
    }
    const params = { params: '清空购物车' }
    app.ajax.delCartAll(params).then(res => {
      app.globalData.cart_num = ''
    })  
    this.setData({
      storeState:0,
    })
  },

  /**
   * 搜索提示文字
   */
  get_search_prompt_text(){
    const params = {}
    app.ajax.search_prompt_text(params).then(res => {
      this.setData({
        search_text:res.data
      })
    })
  },

  /**
   * 轮播图
   */
  get_ads(){
    const params = {
      store_id: this.store_id
    }
    app.ajax.ads(params).then(res => {
      this.setData({
        banners: res.data
      })
    })
  },

  /**
   * 热销榜
   */
  hot_goods(){
    let { page_index, page_size, capsSetList } = this.data,
      params = {
        store_id: this.store_id,
        page_size,
        page_index
      }
    app.ajax.hot_goods(params).then(res => {
      const { data, page_count } = res.data;
      for( let i in data ){
        data[i].price = parseFloat(data[i].price)
        data[i].price_whole = String(data[i].price).split('.')[0]
        data[i].price_small = String(data[i].price).split('.')[1] || ''
        data[i].tag_name = data[i].tag_name.split(',')
      }
      if (page_index == '1') {
        this.setData({
          capsSetList: data,
          page_count,
        })
      } else {
        this.setData({
          capsSetList: capsSetList.concat(data)
        })
      }
      this.showImg()
    })
  },

  /**
  * 版块列表
  */
 activity_list(e) {
    const params = {
      store_id: this.store_id
    };
    app.ajax.activity_list(params).then(res => {
      const {activityList} = res.data;
      this.setData({
        activityList
      })
      if( e == 1 ){
        wx.showToast({
          title: '刷新成功',
          icon: 'none',
          mask:true
        })
      }
    })
  },

  toDouble(val) {
    val = val < 10 ? '0' + val : val;
    return val;
  },

  /**
  * 人气榜
  */
  popularity_goods() {
    let self = this,
     { page_index, page_size, capsSetList } = self.data,
     params = {
      store_id: this.store_id,
      page_size,
      page_index
    }
    app.ajax.popularity_goods(params).then(res => {
      const { data, page_count } = res.data;
      for (let i in data) {
        data[i].price = parseFloat(data[i].price)
        data[i].show = false
        data[i].price_whole = String(data[i].price).split('.')[0]
        data[i].price_small = String(data[i].price).split('.')[1] || ''
      }
      if (page_index == '1') {
        self.setData({
          capsSetList: data,
          page_count,
        })
      } else {
        self.setData({
          capsSetList: capsSetList.concat(data)
        })
      }
      self.showImg()
    })
  },
  // 首页板块标题
  get_section_list(){
    const { tabsIndex } = this.data,
      params = {};
    app.ajax.section_list(params).then(res => {
      const { data } = res;
      this.setData({
        tabs:data
      })
      if(tabsIndex==0){
        this.caps_set()
      }else if(tabsIndex==1){
        this.hot_goods()
      }else if(tabsIndex==2){
        this.popularity_goods()
      }else if(tabsIndex == 3){
        this.getOftenBuyList()
      }
    })
  },


  /**
  * 几元版块
  */
 caps_set() {
  const {
    page_index,
    page_size,
    capsSetList,
    tabsIndex,
    tabs,
    store_id} = this.data,
    params = {
      store_id,
      page_size,
      page_index,
    };
    app.ajax.caps_set(params).then(res => {
      const { goods_list } = res.data,
        {page_count,data} = goods_list;
        this.setData({
          capsSetList: capsSetList.concat(data),
          page_count
        })
    })
  },

  // 几元板块选项卡
  bindtas(e){
    const tasIndex = e.currentTarget.id
    this.setData({
      page_index: 1,
      tasIndex
    });
    if (tasIndex == 3 ){
      this.getOftenBuyList()
    } else if (tasIndex == 2 ){
      this.popularity_goods()
    } else if (tasIndex == 1 ){
      this.hot_goods()
    } else{
      this.caps_set()
    }
  },

  /**
   * 获取分类列表
   */
  getCategoriesList() {
    const params = {
      store_id: this.store_id
    }
    app.ajax.categoriesList(params).then(res => {
      this.setData({
        classifyList: res.data
      })
    })
  },

  /**
   * 首页公告
   */
  getAnnouncement() {
    const params = {
      store_id: this.store_id
    }
    app.ajax.announcement(params).then(res => {
      const { data } = res;
      this.setData({
        notice: data
      })
    })
  },

  /**
   * 首页活动专卖按钮名称+商品信息
   */
  getActivityList(e) {
    const params = {
      store_id: this.store_id
    }
    app.ajax.activityList(params).then(res => {
      wx.hideLoading()
      const { data } = res;
      for( let i in data.bottom.goods_list ){
        data.bottom.goods_list[i].price = parseFloat(data.bottom.goods_list[i].price)
        data.bottom.goods_list[i].original_price = parseFloat(data.bottom.goods_list[i].original_price)
      }
      this.setData({
        activitys: data
      })
      if( e == 1 ){
        wx.showToast({
          title: '刷新成功',
          icon: 'none'
        })
      }
    })
  },

  /**
   * 经常购
   */
  getOftenBuyList() {
    let self = this,
      { page_index, page_size, capsSetList } = self.data,
      params = {
        store_id: this.store_id,
        page_size,
        page_index
      }
    app.ajax.oftenBuyList(params).then(res => {
      const { data, page_count } = res.data;
      for (let i in data) {
        data[i].price = parseFloat(data[i].price)
        data[i].show = false
        data[i].price_whole = String(data[i].price).split('.')[0]
        data[i].price_small = String(data[i].price).split('.')[1] || ''
      }
      if (page_index == '1') {
        self.setData({
          capsSetList: data,
          page_count,
        })
      } else {
        self.setData({
          capsSetList: capsSetList.concat(data)
        })
      }
      self.showImg()
    })
  },

  showImg(){
    let { capsSetList, tasIndex } = this.data,
    height = wx.getSystemInfoSync().windowHeight  // 页面的可视高度
    if (tasIndex == 3 || tasIndex == 2 || tasIndex == 1 ){
      wx.createSelectorQuery().selectAll('.like_list').boundingClientRect((ret) => {
        ret.forEach((item, index) => {
          if (item.top <= height) {
            capsSetList[index].show = true // 根据下标改变状态  
          }
        })
        this.setData({
          capsSetList
        })
      }).exec()
    }
    wx.hideLoading()
  },

  /**
   * 获取用户授权信息
   */
  bindGetUserInfo(e) {
    const self = this;
    app.oauth(function (res) {
      const { data, session_key, token } = res;
      app.globalData.token = token;
      app.globalData.session_key = session_key;
      app.globalData.userInfo = data;
      wx.setStorageSync('token', token)
      wx.setStorageSync('session_key', session_key)
      wx.setStorageSync('userInfo', data)
      self.setData({
        token
      })
      app.handleStore()
      self.getAnnouncement()
      self.store()
      self.setData({
        storeState:0
      })
      // self.getOftenBuyList()
    })
  },

  /**
   * 跳转分类
   */
  handleMenu(e) {
    const { pid } = e.currentTarget.dataset;
    app.globalData.pid = pid;
    wx.switchTab({
      url: '/pages/tarbar/classify/index'
    })
  },

  /**
   * 跳转公告
   */
  notice(e){
    const { id } = e.currentTarget.dataset,
      { store_id } = this.data;
    if (store_id == '' || store_id == undefined ){
      return false;
    }
    wx.navigateTo({
      url: '/pages/home/notice/index?id=' + id
    })
  },

  /**
   * 轮播图跳转
   */
  handleBanner() {
    const { commodity_id } = this.data.banners,
      goods_id = commodity_id.split(','),
      url = goods_id.length > 1 ? '/pages/my/often/index?id=' : '/pages/home/goods_details/index?id=';
    wx.navigateTo({
      url: url + commodity_id
    })
  },

  /**
   * 加入购物车
   */
  handleCart(e) {
    let selt = this,
      { id, type, index, name } = e.currentTarget.dataset,
      { capsSetList, activityList } = this.data,
      params = {
        commodity_id: id,
        count: 1
      };
    if (type ){
      if (activityList[type].goods_list[index].deliver_date != '' ){
        if (name == 'activityList' ){
          selt.getTiem(activityList[type].goods_list[index].deliver_date.day + 1, activityList[type].goods_list[index].deliver_date.start_deliver, function () {
            selt.setData({
              screen: 1
            })
            return false
          })
        }
      }
      if (activityList[type].goods_list[index].shopping_cart_num >= 99) {
        wx.showToast({
          title: '单个购买数量不能超过99',
          icon: "none"
        })
        return false;
      }
    }else{
      if (capsSetList[index].shopping_cart_num >= 99) {
        wx.showToast({
          title: '单个购买数量不能超过99',
          icon: "none"
        })
        return false;
      }
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
      app.cart_list_count()
      if( type ){
        if (activityList[type].goods_list[index].shopping_cart_num == '') {
          activityList[type].goods_list[index].shopping_cart_num = 1
        } else {
          activityList[type].goods_list[index].shopping_cart_num++
        }
        this.setData({
          activityList
        })
      }else{
        if (capsSetList[index].shopping_cart_num == '') {
          capsSetList[index].shopping_cart_num = 1
        } else {
          capsSetList[index].shopping_cart_num++
        }
        this.setData({
          capsSetList
        })
      }
    })
  },

  activity(e){
    let { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: '/pages/home/goods_details/index?id='+id,
    })
  },

  inp_focus(e) {
    let self = this,
      { index, type } = e.currentTarget.dataset,
      { value } = e.detail,
      { activityList, capsSetList } = this.data;
    if (type != undefined ){
      activityList[index].goods_list[type].shopping_cart_nums = value
      this.setData({
        activityList
      })
    }else{
      capsSetList[index].shopping_cart_nums = value
      this.setData({
        capsSetList
      })
    }
    
  },

  /**
   * 文本框 输入退款数量
   */
  bindInput(e) {
    let self = this,
      { index, type } = e.currentTarget.dataset,
      { value } = e.detail,
      { activityList, capsSetList } = this.data;
    if (type != undefined  ){
      if (value >= 99) {
        wx.showToast({
          title: '单个购买数量不能大于99',
          icon: 'none'
        })
        return activityList[index].goods_list[type].shopping_cart_num;
      }
      if (value <= 0 || value == '') {
        value = 0;
      }
      const params = {
        commodity_id: activityList[index].goods_list[type]['id'],
        count: value
      }
      if (value == 0) {
        app.ajax.delCart(params).then(res => {
          activityList[index].goods_list[type].shopping_cart_num = value
          this.setData({
            activityList
          })
        })
      } else {
        app.ajax.editCart(params).then(res => {
          const { data } = res
          if (data == '0') {
            wx.showToast({
              title: '购买数量不能超过限购数量',
              icon: 'none'
            })
            activityList[index].goods_list[type].shopping_cart_num = activityList[index].goods_list[type].shopping_cart_nums
            this.setData({
              activityList,
            })
          } else {
            activityList[index].goods_list[type].shopping_cart_num = value
            this.setData({
              activityList
            })
          }
        })
      }
    }else{
      if (value >= 99) {
        wx.showToast({
          title: '单个购买数量不能大于99',
          icon: 'none'
        })
        return capsSetList[index].shopping_cart_num;
      }
      if (value <= 0 || value == '') {
        value = 0;
      }
      const params = {
        commodity_id: capsSetList[index]['id'],
        count: value
      }
      if (value == 0) {
        app.ajax.delCart(params).then(res => {
          capsSetList[index].shopping_cart_num = value
          this.setData({
            capsSetList
          })
        })
      } else {
        app.ajax.editCart(params).then(res => {
          const { data } = res
          if (data == '0') {
            wx.showToast({
              title: '购买数量不能超过限购数量',
              icon: 'none'
            })
            capsSetList[index].shopping_cart_num = capsSetList[index].shopping_cart_nums
            this.setData({
              capsSetList,
            })
          } else {
            capsSetList[index].shopping_cart_num = value
            this.setData({
              capsSetList
            })
          }
        })
      }
    }
    
  },

  /**
   * 加 数量
   */
  bindJia(e, delivery_date) {
    if (e !== '') {
      this.setData({
        index: '',
        type: undefined
      })
    }
    let { type, index } = this.data,
      { activityList, capsSetList } = this.data;
    if (type != undefined && index!=='' ){
      if (activityList[index].goods_list[type].shopping_cart_num >= 99) {
        wx.showToast({
          title: '单个购买数量不能超过99',
          icon: "none"
        })
        return false;
      }
      wx.showLoading({
        title: '加载中',
        mask: true
      })
      let datas = new Date(),
        params = {
          commodity_id: activityList[index].goods_list[type].id,
          count: 1,
          delivery_date: datas.getFullYear() + '-' + delivery_date
        };
      params['delivery_date'] = params['delivery_date'].replace("月", "-")
      params['delivery_date'] = params['delivery_date'].replace("日", "")
      app.ajax.addCard(params).then(res => {
        wx.hideLoading()
        app.cart_list_count()
        activityList[index].goods_list[type].shopping_cart_num++
        this.setData({
          activityList,
          type:undefined,
          index:''
        })
      })
    } else if (type == undefined && index !== '' ){
      if (capsSetList[index].shopping_cart_num >= 99) {
        wx.showToast({
          title: '单个购买数量不能超过99',
          icon: "none"
        })
        return false;
      }
      wx.showLoading({
        title: '加载中',
        mask: true
      })
      let datas = new Date(),
       params = {
        commodity_id: capsSetList[index].id,
        count: 1,
        delivery_date: datas.getFullYear() + '-' + delivery_date
      };
      params['delivery_date'] = params['delivery_date'].replace("月", "-")
      params['delivery_date'] = params['delivery_date'].replace("日", "")
      app.ajax.addCard(params).then(res => {
        wx.hideLoading()
        app.cart_list_count()
        capsSetList[index].shopping_cart_num++
        this.setData({
          capsSetList,
          type:undefined,
          index:'',
        })
      })
    } else{
      let { index, type } = e.currentTarget.dataset;
      if (capsSetList[index].shopping_cart_num >= 99) {
        wx.showToast({
          title: '单个购买数量不能超过99',
          icon: "none"
        })
        return false;
      }
      wx.showLoading({
        title: '加载中',
        mask: true
      })
      if (type != undefined) {
        let params = {
          commodity_id: activityList[index].goods_list[type].id,
          count: 1
        };
        
        this.setData({
          good_src: activityList[index].goods_list[type].thumbnail
        })
        this.touchOnGoods(e)
        app.ajax.addCard(params).then(res => {
          wx.hideLoading()
          app.cart_list_count()
          activityList[index].goods_list[type].shopping_cart_num++
          this.setData({
            activityList,
            type: undefined,
            index: ''
          })
        })
      } else {
        let params = {
          commodity_id: capsSetList[index].id,
          count: 1
        };
        app.ajax.addCard(params).then(res => {
          wx.hideLoading()
          app.cart_list_count()
          capsSetList[index].shopping_cart_num++
          this.setData({
            capsSetList,
            type: undefined,
            index: ''
          })
        })
      }
    }
    
  },

  /**
   * 减 退款数量
   */
  bindJian(e) {
    let { index, type } = e.currentTarget.dataset,
      { activityList, capsSetList, lastTime } = this.data,
      nowTime = new Date().getTime()
    if (nowTime - lastTime > 200) {      
      wx.showLoading({
        title: '加载中',
        mask: true
      })
      if (type != undefined) {
        let shopping_cart_num = activityList[index].goods_list[type].shopping_cart_num,
          params = {
            commodity_id: activityList[index].goods_list[type].id,
            count: 1,
          };
        if (shopping_cart_num == 0) {
          app.ajax.delCart(params).then(res => {
            wx.hideLoading()
            app.cart_list_count()
            activityList[index].goods_list[type].shopping_cart_num = shopping_cart_num
            this.setData({
              activityList
            })
          })
        } else {
          app.ajax.subCart(params).then(res => {
            wx.hideLoading()
            app.cart_list_count()
            activityList[index].goods_list[type].shopping_cart_num--
            this.setData({
              activityList
            })
          })
        }
      } else {
        let shopping_cart_num = capsSetList[index].shopping_cart_num,
          params = {
            commodity_id: capsSetList[index].id,
            count: 1,
          };
        if (shopping_cart_num == 0) {
          app.ajax.delCart(params).then(res => {
            wx.hideLoading()
            app.cart_list_count()
            capsSetList[index].shopping_cart_num = shopping_cart_num
            this.setData({
              capsSetList
            })
          })
        } else {
          app.ajax.subCart(params).then(res => {
            wx.hideLoading()
            app.cart_list_count()
            capsSetList[index].shopping_cart_num--
            this.setData({
              capsSetList
            })
          })
        }
      }
      lastTime = nowTime;
      this.setData({
        lastTime
      })
    }
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
      val:0
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
      { id, index, name, type } = e.currentTarget.dataset,
      { capsSetList, activityList } = selt.data;
      if( id == 1 ){
        selt.setData({
          index,
          type
        })
      }
    if (name == 'capsSetList' ){
      selt.getTiem(capsSetList[index].deliver_date.day + 1, capsSetList[index].deliver_date.start_deliver,function(){
        // if (selt.data.time2.length <= 1) {
          selt.bindJia('', selt.data.tiem)
          selt.setData({
            screen: 0,
          })
          // return false
        // }
        // selt.setData({
        //   screen: id
        // })
      })
    } else if (name == 'activityList' ){
      selt.getTiem(activityList[index].goods_list[type].deliver_date.day + 1, activityList[index].goods_list[type].deliver_date.start_deliver, function () {
        // if (selt.data.time2.length <= 1) {
          selt.bindJia('', selt.data.tiem)
          selt.setData({
            screen: 0,
          })
          // return false
        // }
        // selt.setData({
        //   screen: id
        // })
      })
    }
    if (id == 2) {
      selt.bindJia('', selt.data.tiem)
      selt.setData({
        screen: id,
      })
    }
    if( id == 0 ){
      selt.setData({
        screen: id,
        type: undefined,
        index: ''
      })
    }
  },

  touchOnGoods: function(e) {
    // 如果good_box正在运动
   if (!this.data.hide_good_box) return;
   this.finger = {};
   var topPoint = {};
   this.finger['x'] = e.touches["0"].clientX-100;
   this.finger['y'] = e.touches["0"].clientY;
   if (this.finger['y'] < this.busPos['y']) {
     topPoint['y'] = this.finger['y'] - 150;
   } else {
     topPoint['y'] = this.busPos['y'] - 150;
   }
   topPoint['x'] = Math.abs(this.finger['x'] - this.busPos['x']) / 2 + this.finger['x'];
   this.linePos = app.bezier([this.finger, topPoint, this.busPos], 30);
   this.startAnimation();
 },
 startAnimation: function() {
   var index = 0,
     that = this,
     bezier_points = that.linePos['bezier_points'];
   this.setData({
     hide_good_box: false,
     bus_x: that.finger['x'],
     bus_y: that.finger['y']
   })
   this.timer = setInterval(function() {
     index++;
     that.setData({
       bus_x: bezier_points[index]['x'],
       bus_y: bezier_points[index]['y']
     })
     if (index >= 28) {
       clearInterval(that.timer);
       that.setData({
         hide_good_box: true,
         hideCount: false,
         count: that.data.count += 1
       })
     }
   }, 33);
 }
})