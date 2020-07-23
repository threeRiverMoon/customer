//获取应用实例
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    HOST: '',
    store_id:'',
    name:'',
    phone:'',
    store:[],
    nav:0,  //优惠券弹窗选项卡
    coupon:'',  //是否使用优惠券
    couponState:0,
    confirm:0,  //确认自提点弹窗
    tiem:'',
    shoppingTiem:'',  //选中自提时间
    tiemIndex:'',
    val:0,
    val3:0,
    screen:0, //是否显示时间选择器
    time2:[        //选择自提时间
    ],
    time3: [],
    date:'',  //自提日期
    money:'',   //总额
    user_comment: '', //备注
    goods_list:[],
    list:[],
    lists:[],
    from:'',
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let { HOST, userInfo, phone, list, date, money, from, store_id } = app.globalData,
      lists = JSON.parse(list),
      removal = '',
      goods_list = [],
      goodsList = [];
      this.setData({
        from,
        lists,
		    HOST,
        name: userInfo && userInfo.name || '',
        phone: phone || userInfo.phone,
        store_id,
      })
      if( wx.getStorageSync('phone')  ){
        this.setData({
          phone:wx.getStorageSync('phone')
        })
      }
      if( wx.getStorageSync('name')  ){
        this.setData({
          name:wx.getStorageSync('name')
        })
      }
      for (let i in lists ){
        goods_list.push(lists[i].deliver_time)
      }
    removal = Array.from(new Set(goods_list));
    for (let i in removal ){
      goodsList.push({
        date: removal[i],
        tiem:'13:00-14:00',
        list: []
      })
    }
    for (let i in lists ){
      for (let j in goodsList ){
        if (lists[i].deliver_time == goodsList[j].date ) {
          goodsList[j].list.push(lists[i])
        }
      }
    }
    this.setData({
      goods_list: goodsList,
      date,
      money
    })
    app.ajax.select_store({store_id}).then(res => {
    })
    this.couponList()
    this.store_info()
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
      let { data } = res,
        { time2, shoppingTiem, tiem, goods_list, val, store, time3, val3 } = self.data,
      tiems = JSON.parse(data.business_hours);
      self.setData({
        store: data,
      })
      tiem = time2[val]
       //获取今天日期
      let myDate = new Date(),
        dateTemp = (myDate.getMonth() + 1).toString().padStart(2, '0') + "-" + myDate.getDate().toString().padStart(2, '0');
      dateTemp = myDate.getFullYear() + '-' + dateTemp;
      let deliver_time = goods_list[0].date;
      if (deliver_time == dateTemp ){
        const params = { store_id, deliver_time, };
        app.ajax.cart_business_hours(params).then(res => {
          const { data } = res;
          time2 = data;
          time3 = data;
          shoppingTiem = time2[val]
          tiem = time2[val]
          for (let i in goods_list) {
            goods_list[i].tiem = time2[val] || '门店已暂停营业'
          }
          self.setData({
            time2,
            time3,
            shoppingTiem: shoppingTiem || '门店已暂停营业',
            tiem,
            goods_list
          })
        })
      }else{
        const params = { store_id, deliver_time, };
        app.ajax.cart_business_hours(params).then(res => {
          const { data } = res;
          time2 = data;
          time3 = data;
          shoppingTiem = time2[val]
          tiem = time2[val]
          for (let i in goods_list) {
            goods_list[i].tiem = time2[val] || '门店已暂停营业'
          }
          self.setData({
            time2,
            time3,
            shoppingTiem: shoppingTiem || '门店已暂停营业',
            tiem,
            goods_list
          })
        })
        return false;
      }
      if (goods_list.length >= 2 ){
        deliver_time = goods_list[1].date;
        const params = { store_id, deliver_time, };
        app.ajax.cart_business_hours(params).then(res => {
          const { data } = res;
          time2 = data;
          shoppingTiem = time2[val]
          tiem = time2[val]
          for (let i in goods_list) {
            if( i != 0 ){
              goods_list[i].tiem = data[val] || '门店已暂停营业'
            }
          }
          self.setData({
            time2,
            shoppingTiem: shoppingTiem || '门店已暂停营业',
            tiem,
            goods_list
          })
        })
      }
      
    })
  },

  /**
   * 显示、隐藏提货时间选择框
   */
  handleScreen(e) {
    const { id, index } = e.currentTarget.dataset,
    { time2 } = this.data;
    if( time2 == '' ){
      return false;
    }
    this.setData({
      screen: id,
    })
    if (id == 2) {
      let myDate = new Date(),
        dateTemp = (myDate.getMonth() + 1).toString().padStart(2, '0') + "-" + myDate.getDate().toString().padStart(2, '0');
      dateTemp = myDate.getFullYear() + '-' + dateTemp;
      let { tiemIndex, goods_list, tiem, tiems, shoppingTiem, time2, time3, val, val3 } = this.data;
      if (tiemIndex != -1 ) {
        if (tiemIndex == 0 ){
          goods_list[tiemIndex].tiem = tiems || time3[val3]
          if (goods_list.length == 1) {
            shoppingTiem = tiems || time3[val3]
          }
        }else{
          goods_list[tiemIndex].tiem = tiem
          if (goods_list.length == 1) {
            shoppingTiem = tiem
          }
        }
        
      } else {
        shoppingTiem = tiem
        for (let i in goods_list) {
          if (dateTemp == goods_list[i].date ){
            
          }else{
            goods_list[i].tiem = tiem
          }
        }
      }
      this.setData({
        shoppingTiem,
        goods_list
      })
    }else{
      this.setData({
        tiemIndex: index
      })
    }
  },

  /**
   * 滑动选择时间
   */
  bindChange: function (e) {
    let self = this,
      { id } = e.currentTarget.dataset,
      val = e.detail.value,
      { tiem, tiems } = self.data;
    if (id == 1 ){
      tiems = self.data.time3[val]
      self.setData({
        tiems,
        val3: val
      })
    }else{
      tiem = self.data.time2[val]
      self.setData({
        tiem,
        val
      })
    }
    
  },

  /**
   * 选择优惠券
   */
  bindCouponSelse(e) {
    const { id } = e.target.dataset
    this.setData({
      coupon: this.data.coupon === id ? '' : id,
      couponState:0
    })
    this.count()
  },

  /**
   * 优惠券弹窗选项卡
   */
  bindNavs(e) {
    this.setData({
      nav: e.target.dataset.id
    })
  },

  /**
   * 优惠券弹窗 显示隐藏
   */
  handleCoupon(e) {
    let self = this,
      { list, coupon } = self.data,
      { id } = e.target.dataset;
    if (list.yes == '' ){
      coupon = ''
    }
    self.setData({
      couponState: id,
      coupon,
    })
    if (list == '' && id == 1) {
      self.couponList()
    }
  },

  /**
   * 取消使用优惠券
   */
  handleCouponOn(){
    this.setData({
      couponState: 0,
      coupon:"",
    })
    this.count();
  },

  /**
   * 获取用户优惠券列表
   */
  couponList() {
    const self = this,
      { money } = self.data,
      params = {
        money,
        page_index:1,
        page_size:0
      };
    wx.showLoading({
      title: '加载中',
      mask: 'true'
    })
    app.ajax.order_coupons(params).then(res => {
	  wx.hideLoading()
      let { data } = res.data,
        list = { yes: [], no: [] };
      for (let i in data) {
        if( data[i].coupon_status == 1 ){
          list.yes.push(data[i])
        }else{
          list.no.push(data[i])
        }
      }
      if (list.yes != '' ){
        let max = list.yes[0].spec[1],
          index = 0;
        for (let i in list.yes) {
          if (max < parseFloat(list.yes[i].spec[1])) {
            max = list.yes[i].spec[1];
            index = i
          }
        }
        self.setData({
          coupon: index
        })
      }
      self.setData({
        list
      })
      this.count()
    })
  },

  /**
   * 计算金额
   */
  count(){
    let { goods_list, store_id, coupon, list, price_whole, price_small } = this.data,
     commodityLists = [];
    for (let i in goods_list) {
      for (let j in goods_list[i].list) {
        commodityLists.push(goods_list[i].list[j])
      }
    }
    const params = {
      commodityLists: JSON.stringify(commodityLists),
      store_id,
    }
    if (coupon !== '') {
      params['coupon_id'] = list.yes[coupon].id
    }
    app.ajax.calculate_price(params).then(res => {
      price_whole = String(parseFloat(res.data)).split('.')[0]
      price_small = String(parseFloat(res.data)).split('.')[1] || ''
      this.setData({
        money: parseFloat(res.data),
        price_whole: parseFloat(price_whole),
        price_small: parseFloat(price_small),
      })
    })
  },

  /**
   * 确认自提点弹窗 显示隐藏
   */
  bindConfirm(e) {
    const { name, phone } = this.data,
      reg = /^1[3456789]\d{9}$/;
    if (name == '') {
      wx.showToast({
        title: '请输入姓名',
        icon: 'none',
        duration: 2000
      })
      return false
    } else if (phone == '') {
      wx.showToast({
        title: '请输入联系方式',
        icon: 'none',
        duration: 2000
      })
    } else if (!reg.test(phone)) {
      wx.showToast({
        title: '请输入正确的联系方式',
        icon: 'none',
        duration: 2000
      })
    } else {
      this.setData({
        confirm: e.target.dataset.id
      })
    }
  },

  /**
   * 确认支付
   */
  bindPayment() {
    const self = this,
      { goods_list, store, name, phone, money, coupon, list, userInfo, user_comment, from, shoppingTiem  } = self.data,
      { id } = app.globalData.userInfo,
      commodityLists = [];
    if (shoppingTiem == '门店已暂停营业' ){
      wx.showToast({
        title: '门店已暂停营业',
        icon:'none'
      })
      return false;
    }
    for (let i in goods_list ){
      let list = goods_list[i];
      commodityLists.push({
        deliveryDate: list.date,
        deliveryTime: list.tiem,
        commodities:[]
      })
      for (let j in list.list) {
        const { id, count, price, thumbnail } = list.list[j];
        commodityLists[i].commodities.push({
          id,
          thumbnail,
          count: parseFloat(count),
          price: parseFloat(price),
        })
      }
    }
    const commodityList = JSON.stringify(commodityLists)
    let params = {
      commodityLists: commodityList,
      money,
      user_id: id,
      consignee_phone: phone,
      consignee_name: name,
      store_id: store.id,
      user_comment,
      from,
      };
    if (coupon !== '') {
      params['coupon_id'] = list.yes[coupon].id
    }
    wx.showLoading({
      title: "生成订单中",
      mask: true
    })
    app.ajax.createOrder(params).then(res => {
      const { lists } = self.data,
        list = {
          detail: { data: [] },
          store_name: store.name,
          amount: params.money,
          order_id: res.orderId
        }
      for (let i in commodityLists) {
        for (let j in commodityLists[i].commodities) {
          list['detail']['data'].push(commodityLists[i].commodities[j])
        }
      }
      wx.hideLoading()
      wx.redirectTo({
        url: '/pages/home/payment/index?list=' + JSON.stringify(list),
      })
    })
  },

  /**
   * 文本框
   */
  bindInput(e) {
    this.setData({
      [e.target.dataset.name]: e.detail.value
    })
    const {name, phone  } = this.data;
    wx.setStorageSync('name', name)
    wx.setStorageSync('phone', phone)
  },

  /**
   * 查看地图
   */
  handleMap() {
    wx.navigateTo({
      url: '/pages/home/carry_see/index?store=' + JSON.stringify(this.data.store),
    })
  },
  
})