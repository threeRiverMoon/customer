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
    page_index: 1,
    page_size: 10,
    page_count: "",
    list: [],
    button:'',
    name:'',
    type:'',
    activity_id:'',
    lastTime:0,

    time2: [],
    screen: 0,
    val: 0,
    tiem: [],
    index: '',
    navBarHeight: app.globalData.navBarHeight,
    menuRight: app.globalData.menuRight,
    menuBotton: app.globalData.menuBotton,
    menuHeight: app.globalData.menuHeight,
    isScroll: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    const { name, button, type, activity_id } = options,
	 { HOST, store_id } = app.globalData;
    this.setData({
      HOST,
      store_id,
      button,
      name,
      type,
      activity_id
    })
    wx.setNavigationBarTitle({
      title: name
    })
    this.activity_list()
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
    clearTimeout(timer)
    timer = null
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.setData({
      page_index: 1,
      list: []
    })
    clearTimeout(timer)
    timer = null
    this.activity_list()
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
    clearTimeout(timer)
    timer = null
    self.setData({
      page_index: ++page_index
    })
    self.activity_list()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  onPageScroll(){ // 滚动事件
    let isScroll = false;
    if (e.scrollTop <= 90) {
      isScroll = false;
    } else {
      isScroll = true;
    }
    this.setData({
      isScroll
    })
  },

  /**
  * 版块列表
  */
  activity_list() {
    let { activity_id, activityList, page_size, page_index, type } = this.data;
    const params = {
      store_id: this.data.store_id,
      activity_id,
      page_size,
      page_index
    },
      self = this;
    app.ajax.activityGoodsList(params).then(res => {
      clearTimeout(timer)
      timer = null
      const { data, page_count } = res.data;
      for (let i in data) {
        data[i].price = parseFloat(data[i].price)
        data[i].show = false
        data[i].price_whole = String(data[i].price).split('.')[0]
        data[i].price_small = String(data[i].price).split('.')[1] || ''
        data[i].tag_name = data[i].tag_name.split(',')
      }

      const timeGoFun = () => {
        for (let i = 0; i < data.length; i++) {
          const { end_time_of_time_limited_discount_whole } = data[i];
          let miao = '',
            micro = '',
            fen = '',
            xiaoshi = '';
          if (type == 3 && end_time_of_time_limited_discount_whole) {
            const getEndTime = new Date(end_time_of_time_limited_discount_whole.replace(/-/g, '/')).getTime(),
              now = new Date(),
              disTime = getEndTime - now.getTime();
            if (disTime > 0) {
              xiaoshi = Math.floor(disTime / 1000 / 60 / 60 % 24);
              fen = Math.floor(disTime / 1000 / 60 % 60);
              miao = Math.floor(disTime / 1000 % 60);
              micro = Math.floor(disTime % 1000 / 100);
              data[i].micro = self.toDouble(micro);
              data[i].miao = self.toDouble(miao);
              data[i].fen = self.toDouble(fen);
              data[i].xiaoshi = self.toDouble(xiaoshi);
            }else{
              clearTimeout(timer);
              timer = null;
              data[i].micro = '00'
              data[i].miao = '00';
              data[i].fen = '00';
              data[i].xiaoshi = '00';
            }
          } else {
            clearTimeout(timer);
            timer = null;
            data[i].micro = '00'
            data[i].miao = '00';
            data[i].fen = '00';
            data[i].xiaoshi = '00';
          }
          if (page_index == '1') {
            self.setData({
              activityList: data,
              page_count,
            })
          } else {
            self.setData({
              activityList: activityList.concat(data)
            })
          }
        }
        timer = setTimeout(() => {
          timeGoFun()
        }, 50)
      };
      timeGoFun()
      
      this.showImg()
    })
  },

  activity(e) {
    let { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: '/pages/home/goods_details/index?id=' + id,
    })
  },

  toDouble(val) {
    val = val < 10 ? '0' + val : val;
    return val;
  },

  /**
   * 加入购物车
   */
  handleCart(e) {
    let { id, index } = e.currentTarget.dataset,
      { activityList } = this.data,
      params = {
        commodity_id: id,
        count: 1
      };
    wx.showLoading({
      title: '加入购物车中',
      mask: true,
    })
    app.ajax.addCard(params).then(res => {
      wx.showToast({
        title: res.msg,
        mask: true
      })
      if (activityList[index].shopping_cart_num == '') {
        activityList[index].shopping_cart_num = 1
      } else {
        activityList[index].shopping_cart_num++
      }
      this.setData({
        activityList
      })
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
      { val } = this.data;
    for (let i = 0; i < tiem; i++) {
      dateTemp = this.toDouble(myDate.getMonth() + 1) + "月" + this.toDouble(myDate.getDate()) + "日";
      dateArray.push(dateTemp);
      myDate.setDate(myDate.getDate() + flag);
    }
    this.setData({
      time2: dateArray,
      tiem: dateArray[val]
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
      { activityList } = selt.data;
    if (id == 1) {
      selt.getTiem(activityList[index].deliver_date.day + 1, activityList[index].deliver_date.start_deliver, function () {
        // if (selt.data.time2.length <= 1) {
          selt.setData({
            index,
            screen: 0,
          })
          selt.bindJia('', selt.data.tiem, selt.data.index)
          // return false
        // }
        // selt.setData({
        //   screen: id,
        //   index
        // })
      })
    } else if (id == 2) {
      selt.bindJia('', selt.data.tiem, selt.data.index)
    } else {
      selt.setData({
        screen: id,
      })
    }
  },

  inp_focus(e) {
    let self = this,
      { index } = e.currentTarget.dataset,
      { value } = e.detail,
      { activityList } = this.data;
    activityList[index].shopping_cart_nums = value
    this.setData({
      activityList
    })

  },

  /**
   * 文本框 输入退款数量
   */
  bindInput(e) {
    let self = this,
      { index } = e.currentTarget.dataset,
      { value } = e.detail,
      { activityList } = this.data;
    if (value > 99) {
      wx.showToast({
        title: '单个购买数量不能大于99',
        icon: 'none'
      })
      return activityList[index].shopping_cart_num;
    }
    if (value <= 0 || value == '') {
      value = 0;
    }
    const params = {
      commodity_id: activityList[index]['id'],
      count: value
    }
    if (value == 0) {
      app.ajax.delCart(params).then(res => {
        activityList[index].shopping_cart_num = value
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
          activityList[index].shopping_cart_num = activityList[index].shopping_cart_nums
          this.setData({
            activityList,
          })
        } else {
          activityList[index].shopping_cart_num = value
          this.setData({
            activityList
          })
        }
      })
    }
  },

  /**
   * 加 数量
   */
  bindJia(e, delivery_date, index) {
    let { activityList } = this.data,
      id = '';
    if (index != undefined ){
      id = activityList[index].id
    }
    if (e != '') {
      id = e.currentTarget.dataset.id
    }
    let params = {
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
      title: '加载中',
      mask: true
    })
    app.ajax.addCard(params).then(res => {
      wx.hideLoading()
      if (index != undefined ){
        activityList[index].shopping_cart_num++
      }else{
        activityList[e.currentTarget.dataset.index].shopping_cart_num++
      }
      this.setData({
        activityList,
        screen:0
      })
    })

  },

  /**
   * 减 退款数量
   */
  bindJian(e) {
    let { index } = e.currentTarget.dataset,
      { activityList, lastTime } = this.data,
      shopping_cart_num = activityList[index].shopping_cart_num,
      params = {
        commodity_id: activityList[index].id,
        count: 1
      },
      nowTime = new Date().getTime()
    if (nowTime - lastTime > 500) {
      wx.showLoading({
        title: '加载中',
        mask: true
      })
      if (shopping_cart_num == 0) {
        app.ajax.delCart(params).then(res => {
          wx.hideLoading()
          activityList[index].shopping_cart_num = shopping_cart_num
          this.setData({
            activityList
          })
        })
      } else {
        app.ajax.subCart(params).then(res => {
          wx.hideLoading()
          activityList[index].shopping_cart_num--
          this.setData({
            activityList
          })
        })
      }
      lastTime = nowTime;
      this.setData({
        lastTime
      })
    }
    
  },
  // 返回页面
  navbar(){
    wx.navigateBack({
      
    })
  },

  showImg(){
    let { activityList } = this.data;
    let height = wx.getSystemInfoSync().windowHeight  // 页面的可视高度
    wx.createSelectorQuery().selectAll('.activity_list').boundingClientRect((ret) => {
    ret.forEach((item, index) => {
      if (item.top <= height+200) { 
        activityList[index].show = true // 根据下标改变状态  
      }
    })
    this.setData({
      activityList,
    })
    }).exec()
  },
})