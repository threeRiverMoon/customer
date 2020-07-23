//获取应用实例
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    startX: 0, //开始坐标
    startY: 0,
    HOST: '',
    store_id:'',
    idx:[],   //已选中商品id
    check_all:0,  //是否全选
    time2:[], //选择自提时间
    tiem:'',
    shoppingTiem:'',  //选中自提时间
    screen:0, //是否显示时间选择器
    list:[],
    deliver_date:{
      day:1,
    },
    page_size: 0,
    page_index: 1,
    page_count: 0,
    emptyList:[],
    deliciousDetails:[],
    money:0.00,
    val:0,
    money_whole:'',
    money_small:'',
    reft:0,
    state:0,
    lastTime:0,
    length:0,

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
    let self = this,
    { HOST, token, store_id } = app.globalData,
    { deliver_date } = this.data
    self.setData({
      HOST
    })
    // 获取当前日期之后7天
    this.setData({
      page_index: 1,
      token,
      store_id
    })
    if (token !== '') {
      this.getCartList();
      this.getInvalidCartList()
      this.getDddDelicious()
      app.cart_list_count()
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
    // let self = this,
    //   { token, store_id } = app.globalData,
    //   { deliver_date } = this.data;
    // this.setData({
    //   page_index: 1,
    //   token,
    //   store_id
    // })
    // if (token !== '') {
    //   this.getCartList();
    //   this.getInvalidCartList()
    //   this.getDddDelicious()
    //   app.cart_list_count()
    // }
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
    let { lastTime } = this.data,
    nowTime = new Date().getTime()
    if (nowTime - lastTime > 1000) {
      this.shuaxin()
      lastTime = nowTime;
      this.setData({
        lastTime
      })
    }
  },
  shuaxin(){
    this.setData({
      page_index: 1,
    })
    this.getCartList()
    this.getInvalidCartList()
    this.getDddDelicious()
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
    this.getCartList()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  onPageScroll(){ // 滚动事件
    this.cartListShowImg()
    this.InvalidShowImg()
    this.deliciousShowImg()
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
      self.getCartList();
      self.getInvalidCartList()
      self.getDddDelicious()
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
      val:0
    })
    fun()
  },

  toDouble(val) {
    let result = val < 10 ? '0' + val : val;
    return result;
  },

  /**
   * 滑动选择时间
   */
  bindChange: function (e) {
    const val = e.detail.value
      this.setData({
        tiem:this.data.time2[val],
        val,
      })
  },
  /**
   * 显示选择时间弹窗
   */
  handleScreen(e) {
    let selt = this,
      { id, index } = e.currentTarget.dataset,
      { deliciousDetails } = selt.data;
    if (id == 1) {
      selt.getTiem(deliciousDetails[index].deliver_date.day + 1, deliciousDetails[index].deliver_date.start_deliver, function () {
        // if (selt.data.time2.length <= 1) {
          selt.setData({
            index,
            screen: 0,
          })
          selt.handleAddCard('', selt.data.tiem, deliciousDetails[selt.data.index].id)
        //   return false
        // }
        // selt.setData({
        //   screen: id,
        //   index
        // })
      })
    } else if (id == 2) {
      selt.handleAddCard('', selt.data.tiem, deliciousDetails[selt.data.index].id)
    } else {
      selt.setData({
        screen: id,
      })
    }
  },

  /**
   * 查看地图
   */
  handleMap() {
    wx.navigateTo({
      url: '/pages/home/carry_see/index',
    })
  },
  /**
   * 全选
   */
  bindChecks_all(e){
    let { list, check_all, lastTime} = this.data,
      nowTime = new Date().getTime();
    if (nowTime - lastTime > 300) {
      for (let i in list) {
        for (let j in list[i].list) {
          if (list[i].list[j].is_order == 1) {
            list[i].list[j].check = check_all == 0 ? true : false
          }
        }
      }
      check_all = check_all == 1 ? 0 : 1
      this.initMoney();
      lastTime = nowTime;
      this.setData({
        lastTime,
        list,
        check_all,
      })
    }
    
  },
  /**
   * 选择框 是否选中
   */
  bindChecks(e){
    let { index, type } = e.currentTarget.dataset,
      { list, check_all, lastTime} = this.data,
      num = 0,
      length = 0,
      nowTime = new Date().getTime();
    if (nowTime - lastTime > 300) {
      if (list[type].list[index].is_order == 1) {
        list[type].list[index].check = !list[type].list[index].check
      }
      for (var i = 0; i < list.length-1; i++) {
        for (let j in list[i].list) {
          length++
          if (!list[i].list[j].check) {

          } else {
            num++
          }
        }
      }
      if (num == length) {
        check_all = 1
      } else {
        check_all = 0
      }
      this.initMoney();
      lastTime = nowTime;
      this.setData({
        lastTime,
        list,
        check_all
      })
    }
    

  },

  /**
   * 金额处理
   */
  initMoney(){
    let { list, store_id, money_whole, money_small } = this.data,
      commodityLists = [];
    app.cart_list_count()
    for(var i = 0; i < list.length; i++){
      for( let j in list[i].list ){
        if (list[i].list[j]['check']) {
          commodityLists.push(list[i].list[j])
        }
      }
    }
    if (commodityLists == '' ){
      this.setData({
        money: 0,
        money_whole:0,
        money_small:0,
        reft: 0
      })
      return false;
    }
    const params = {
      commodityLists: JSON.stringify(commodityLists),
      store_id
    }
    app.ajax.calculate_price(params).then(res => {
      const money = parseFloat(res.data);
      money_whole = String(money).split('.')[0]
      money_small = String(money).split('.')[1] || ''
      this.setData({
        money: parseFloat(res.data),
        money_whole,
        money_small,
        reft:0
      })
      
    })
  },

  bindblur(e){
    let self = this,
      { index, type } = e.currentTarget.dataset,
      { value } = e.detail,
      { list } = this.data;
    list[type].list[index].count = value == undefined || value == '' ? 1 : value
    this.setData({
      list
    })
  },

  inp_focus(e) {
    let self = this,
      { index, type } = e.currentTarget.dataset,
      { value } = e.detail,
      { list } = this.data;
    list[type].list[index].counts = value||1
    this.setData({
      list
    })
  },

  /**
   * 文本框 输入退款数量
   */
  bindInput(e){
    let self = this,
      { index, type } = e.currentTarget.dataset,
      { value } = e.detail,
      { list } = this.data;
    if (value > 99) {
      wx.showToast({
        title: '单个购买数量不能大于99',
        icon: 'none'
      })
      list[type].list[index].count = 99
      return list[type].list[index].count;
    }
    if (value <= 0 || value == '' ) {
      return '';
    } 
    const params = {
      commodity_id: list[type].list[index]['id'],
      count: value
    }
    app.ajax.editCart(params).then(res => {
      const { data } = res
      if (data === 0) {
        wx.showToast({
          title: '购买数量不能超过限购数量',
          icon:'none'
        })
        list[type].list[index].count = list[type].list[index].purchasable_count
        this.setData({
          list,
        })
        return false
      }else{
        list[type].list[index].count = value
        this.setData({
          list
        })
        this.initMoney();
      }
      if (value <= 0) {
        wx.showModal({
          title: '提示',
          content: '确认要删除该商品吗？',
          confirmColor: '#C3D939',
          cancelColor: '#949494',
          success(res) {
            if (res.confirm) {
              self.handleDelCart(list[type].list[index]['id'], list[type].list[index]['cart_id'])
            } else if (res.cancel) {

            }
          }
        })
        return 1;
      } else {
        list[type].list[index].count = value
      }
      this.setData({
        list
      })
    })
  },
  /**
   * 加 退款数量
   */
  bindJia(e){
    let { index, type } = e.currentTarget.dataset,
      {list, reft} = this.data;
    if (list[type].list[index].count >= 99 ){
      wx.showToast({
        title: '单个购买数量不能大于99',
        icon:'none'
      })
      this.setData({
        reft: 0
      })
      return list[type].list[index].count;
    }
    if (this.data.reft == 1 ){
      return false
    }
    this.setData({
      reft:1
    })
    let count = list[type].list[index].count
    const params = {
      commodity_id: list[type].list[index]['id'],
      count: count+1,
      cart_id: list[type].list[index]['cart_id']
    }
    app.ajax.editCart(params).then(res => {
      const { data } = res
      if (data == '0') {
        list[type].list[index].gounum = true
        wx.showToast({
          title: '购买数量不能超过限购数量',
          icon: 'none'
        })
        this.setData({
          reft: 0,
          list
        })
        return false;
      }
      list[type].list[index].count++
      this.setData({
        list,
      })
      this.initMoney();
    })
  },
  /**
   * 减 退款数量
   */
  bindJian(e){
    let self = this,
      { index, type } = e.currentTarget.dataset,
      { list } = this.data;
    if (list[type].list[index].count <= 1 ){
        wx.showModal({
          title: '提示',
          content: '确认要删除该商品吗？',
          confirmColor: '#C3D939',
          cancelColor: '#949494',
          success(res) {
            if (res.confirm) {
              self.handleDelCart(list[type].list[index]['id'], list[type].list[index]['cart_id'])
            } else if (res.cancel) {

            }
          }
        })
        return false;
      }
      if (this.data.reft == 1) {
        return false
      }
      this.setData({
        reft: 1
      })
    list[type].list[index].count--
      this.setData({
        list
      })
      this.initMoney();
    this.handleEditCart(list[type].list[index]['id'], list[type].list[index]['count'], list[type].list[index]['cart_id'])
  },

  /**
   * 修改购物车
   */
  handleEditCart(commodity_id, count, cart_id){
    const params = {
      commodity_id,
      count,
      cart_id,
    }
    app.ajax.editCart(params).then(res => {
    })
  },

  /**
   * 删除购物车
   */
  handleDelCart(commodity_id, cart_id){
    const params = {
      commodity_id,
      cart_id
    }
    wx.showLoading({
      title: '删除中',
      mask:"true"
    })
    app.ajax.delCart(params).then(res => {
      wx.showToast({
        title: '删除成功',
        icon: 'none',
        duration: 2000
      })
      this.setData({
        money:0,
        val:0,
        shoppingTiem:this.data.time2[0],
        tiem:this.data.time2[0]
      })
      this.getCartList();
      this.getInvalidCartList()
    })
  },

  /**
   * 结算
   */
  bindSettlement(){
    let { list, shoppingTiem, money } = this.data,
    goods_list = [],
    count = 0;
    for( let i in list ){
      for( let j in list[i].list ){
        if (list[i].list[j].check) {
          goods_list.push(list[i].list[j])
          count += parseFloat(list[i].list[j].count)
        }
      }
    }
    if (goods_list != '' ){
      if( parseFloat(count) > 99 ){
        wx.showToast({
          title: '下单总数量不能超过99',
          icon:'none'
        })
        return false;
      }
      if( parseFloat(money) > 10000 ){
        wx.showToast({
          title: '下单总金额不能超过10000',
          icon:'none'
        })
        return false;
      }
      app.globalData.list = JSON.stringify(goods_list)
      app.globalData.date = shoppingTiem
      app.globalData.money = money
      app.globalData.from = 1
      wx.navigateTo({
        url: '/pages/my/confirm_order/index',
      })
    }else{
      wx.showToast({
        title: '请先选择商品',
        icon: 'none',
        mask:'true'
      })
    }
  },

  /**
   * 获取购物车列表
   */
  getCartList(){
    const self = this,
      { page_index, page_size, shoppingTiem, state, length } = self.data,
    { list } = self.data,
      datas = new Date(),
    params = {
      page_index,
      page_size,
      deliver_time: datas.getFullYear()+'-'+shoppingTiem
      
    };
    params['deliver_time'] = params['deliver_time'].replace("月", "-")
    params['deliver_time'] = params['deliver_time'].replace("日", "")
    app.ajax.cartList(params).then(res => {
      let { page_count, data, deliver_date } = res.data,
        removal = '',
        goods_list = [],
        goodsList = [],
        splice = [];
        self.setData({
          length: data.length
        })
      for(var i = 0; i < data.length; i++){
        data[i]['check'] = false;
        data[i]['price'] = parseFloat(data[i]['price']);
        data[i]['original_price'] = parseFloat(data[i]['original_price']);
        data[i].show = false
        data[i].price_whole = String(data[i].price).split('.')[0]
        data[i].price_small = String(data[i].price).split('.')[1] || ''
        goods_list.push(data[i].deliver_time)
      }
      removal = Array.from(new Set(goods_list));
      for (let i in removal) {
        goodsList.push({
          date: removal[i],
          list: []
        })
        if (i == removal.length-1 ){
          goodsList.push({
            date: '失效',
            list: []
          })
        }
      }
      for (let i in data) {
        for (let j in goodsList) {
          if (data[i].deliver_time == goodsList[j].date) {
            goodsList[j].list.push(data[i])
          }
        }
      }
      for (let i = 0; i <self.data.length; i++ ){
        for (let i in goodsList) {
          for (let j in goodsList[i].list) {
            if (goodsList[i].list[j].is_order == 0) {
              if (goodsList.length - 1 !== i) {
                goodsList[goodsList.length - 1].list.push(goodsList[i].list[j])
                goodsList[i].list.splice(j, 1)
              }
            }
          }

        }
      }
      if (page_index == '1') {
        self.setData({
          list: goodsList,
          page_count,
        })
      } else {
        self.setData({
          list: list.concat(goodsList)
        })
      }
      self.setData({
        check_all:0,
        money:0,
        deliver_date
      })
      if (state == 0 ){
        self.setData({
          state:1
        })
        self.bindChecks_all(1)
      }
      // 获取当前日期之后7天
      // self.getTiem(deliver_date.day+1);
      self.initMoney()
      this.cartListShowImg()
    })
  },
  
  /**
   * 获取失效商品
   */
  getInvalidCartList(){
    const self = this,
      { page_index, page_size, shoppingTiem } = self.data,
      data = new Date(),
      params = {
        page_index:1,
        page_size:0,
        deliver_time: data.getFullYear() + '-' +shoppingTiem
      };
    params['deliver_time'] = params['deliver_time'].replace("月", "-")
    params['deliver_time'] = params['deliver_time'].replace("日", "")
    app.ajax.invalidCartList(params).then(res => {
      let { data } = res.data;
      for( let i in data ){
        data[i].show = false
      }
      self.setData({
        emptyList: data
      })
      this.InvalidShowImg()
    })
  },
  /**
   * 清空失效商品
   */
  handleEmptyInvalidCartCommodity() {
    let self = this,
      { shoppingTiem, emptyList } = self.data,
      data = new Date(),
      params = {
        deliver_time: data.getFullYear() + '-' + shoppingTiem
      };
    params['deliver_time'] = params['deliver_time'].replace("月", "-")
    params['deliver_time'] = params['deliver_time'].replace("日", "")
    wx.showModal({
      title: '提示',
      content: '确认清空失效商品吗？',
      success:function(res){
        if(res.confirm){
          wx.showLoading({
            title: '删除中',
            mask:"true"
          })
          app.ajax.emptyInvalidCartCommodity(params).then(res => {
            const { msg } = res;
            emptyList = ''
            wx.showToast({
              title: msg,
            })
            self.setData({
              emptyList
            })
          })
        }else{
        }
      }
    })
  },
  /**
   * 获取猜你喜欢
   */
  getDddDelicious(){
    let self = this;
    const params = {}
    app.ajax.addDelicious(params).then(res => {
      let { data } = res;
      for( let i in data ){
        data[i].price = parseFloat(data[i].price)
        data[i].original_price = parseFloat(data[i].original_price)
        data[i].show = false
        data[i].price_whole = String(data[i].price).split('.')[0]
        data[i].price_small = String(data[i].price).split('.')[1] || ''
      }
      self.setData({
        deliciousDetails:data
      })
      this.deliciousShowImg()
    })
  },

  cartListShowImg(){
    let { list } = this.data,
    height = wx.getSystemInfoSync().windowHeight  // 页面的可视高度
    wx.createSelectorQuery().selectAll('.list').boundingClientRect((ret) => {
    ret.forEach((item, index) => {
      if (item.top <= height) {
        list[item.dataset.type].list[item.dataset.index].show = true // 根据下标改变状态  
      }
    })
    this.setData({
      list
    })
    }).exec()
  },
  InvalidShowImg(){
    let { emptyList } = this.data,
    height = wx.getSystemInfoSync().windowHeight  // 页面的可视高度
    wx.createSelectorQuery().selectAll('.list_emptyList').boundingClientRect((ret) => {
      ret.forEach((item, index) => {
        if (item.top <= height) { 
          emptyList[index].show = true // 根据下标改变状态  
        }
      })
      this.setData({
        emptyList
      })
    }).exec()
  },
  deliciousShowImg(){
    let { deliciousDetails } = this.data,
    height = wx.getSystemInfoSync().windowHeight  // 页面的可视高度
    wx.createSelectorQuery().selectAll('.like_list').boundingClientRect((ret) => {
      ret.forEach((item, index) => {
        if (item.top <= height) { 
          deliciousDetails[index].show = true // 根据下标改变状态  
        }
      })
      this.setData({
        deliciousDetails
      })
    }).exec()
  },

  /**
   *  加入购物车
   */
  handleAddCard(e, delivery_date, goods_id) {
    let id = goods_id
    if (e != '') {
      id = e.currentTarget.dataset.id
    }
    let { deliciousDetails } = this.data,
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
      for (let i = 0; i < deliciousDetails.length; i++) {
        if (deliciousDetails[i].id == id) {
          deliciousDetails[i].shopping_cart_num++
        }
      }
      this.setData({
        deliciousDetails,
        screen:0
      })
      this.getCartList()
      this.getInvalidCartList()
    })
  },

  //手指触摸动作开始 记录起点X坐标
  touchstart: function (e) {
    let { index, type } = e.currentTarget.dataset;
    //开始触摸时 重置所有删除
    this.data.list[type].list.forEach(function (v, i) {
      if (v.isTouchMove)//只操作为true的
        v.isTouchMove = false;
    })
    this.setData({
      startX: e.changedTouches[0].clientX,
      startY: e.changedTouches[0].clientY,
      list: this.data.list
    })
  },

  //滑动事件处理
  touchmove: function (e) {
    var that = this,
      { index, type } = e.currentTarget.dataset,//当前索引
      startX = that.data.startX,//开始X坐标
      startY = that.data.startY,//开始Y坐标
      touchMoveX = e.changedTouches[0].clientX,//滑动变化坐标
      touchMoveY = e.changedTouches[0].clientY,//滑动变化坐标
      //获取滑动角度
      angle = that.angle({ X: startX, Y: startY }, { X: touchMoveX, Y: touchMoveY });
    that.data.list[type].list.forEach(function (v, i) {
      v.isTouchMove = false
      //滑动超过30度角 return
      if (Math.abs(angle) > 30) return;
      if (i == index) {
        if (touchMoveX > startX) //右滑
          v.isTouchMove = false
        else //左滑
          v.isTouchMove = true
      }
    })
    //更新数据
    that.setData({
      list: that.data.list
    })
  },

  /**
  * 计算滑动角度
  * @param {Object} start 起点坐标
  * @param {Object} end 终点坐标
  */
  angle: function (start, end) {
    var _X = end.X - start.X,
      _Y = end.Y - start.Y
    //返回角度 /Math.atan()返回数字的反正切值
    return 360 * Math.atan(_Y / _X) / (2 * Math.PI);
  },

  //删除事件
  remove: function (e) {
    let that = this;
    let { id, ids } = e.currentTarget.dataset;
    wx.showModal({
      title: '温馨提示！',
      content: '你确认删除吗？',
      success: function (res) {
        if (res.confirm) {
          that.handleDelCart(id, ids)
        } else {
        }
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