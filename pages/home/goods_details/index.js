//获取应用实例
const app = getApp()
let timer = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    HOST: '',
    store_id: '',
    id: '',
    muted: true, //是否静音播放
    swiperIndex: "1", //当前轮播页数
    list: [],
    cart_num: '',
    goodsDetails: [],
    guessYouLoveList: [],
    autoplay: true,
    activite: [],
    goodsInfo: null,
    images: {
      carousel: [],
      details_figure: null
    },
    labelList: [],
    lastTime: 0,
    duration: 5,
    isFullScreen: false,
    initialtime: 0,
    time2:[],
    screen:0,
    val: 0,
    tiem: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    let { id } = options,
      { HOST, store_id } = app.globalData;
    this.setData({
      HOST,
      store_id,
      id
    })
    this.id = id;
    this.isFirstTime = true
    this.initGuessYouLove()
    // this.cart_list_count()
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
    clearInterval(timer)
    this.initCommodityDetails()
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
    clearInterval(timer)
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

  handleError(err) {
    
  },

  /**
   *  商品详情
   */
  initCommodityDetails() {
    const self = this,
     { store_id, id } = self.data,
      params = {
        commodity_id: id,
        store_id
      };
    app.ajax.commodityDetails(params).then(res => {
      wx.hideLoading()
      const { activite, goodsInfo, images, labelList } = res.data;
      goodsInfo.count = 1;
      goodsInfo.price = parseFloat(goodsInfo.price)
      goodsInfo.original_price = parseFloat(goodsInfo.price)
      goodsInfo.price_whole = String(goodsInfo.price).split('.')[0]
      goodsInfo.price_small = String(goodsInfo.price).split('.')[1] || ''
      // 判断近几日送货日期 
      if (!goodsInfo.start_deliver_date) {
        const time2 = [],
          tiem = goodsInfo.after_day_deliver,
          date1 = new Date(),
          time1 = (date1.getMonth() + 1) + "-" + date1.getDate() + "-";   //time1表示当前时间
        const date2 = new Date(date1);
        date2.setDate(date1.getDate() + tiem);
        time2.push(date2.getFullYear() + "-" + (date2.getMonth() + 1).toString().padStart(2, '0') + "-" + date2.getDate().toString().padStart(2, '0'));
        goodsInfo.start_deliver_date = time2.join(',')
      }
      // if (goodsInfo.deliver_date != '' ){
      //   self.getTiem(goodsInfo.deliver_date.day + 1, goodsInfo.deliver_date.start_deliver);
      // }
      self.setData({
        activite, goodsInfo, images, labelList
      })
      const  { 
          price,
          original_price,
          activity_status,
          sell_out,
          purchasable_count,
          rule_type,
          start_time_of_time_limited_discount_whole,
          end_time_of_time_limited_discount_whole } = goodsInfo,
        getStartTime = new Date(start_time_of_time_limited_discount_whole.replace(/-/g, '/')).getTime(),
        getEndTime = new Date(end_time_of_time_limited_discount_whole.replace(/-/g, '/')).getTime();
      let miao = '',
        micro = '',
        fen = '',
        xiaoshi = '',
        tian = '';
      goodsInfo.rule_types = rule_type.indexOf('2') !== -1 ? true : false;
      

      this.setData({
        activite, goodsInfo, images, labelList
      })
      // 判断是否活动商品 不是活动商品不计时差
      if (!goodsInfo.rule_types) {
        return false;
      }
      const timeGoFun = () => {
        let now = new Date(),
          disTime = activity_status == '0' ? getStartTime-now.getTime() : getEndTime - now.getTime();
        if (goodsInfo.is_end_deliver == 1) {
          wx.showToast({
            icon: 'none',
            title: '该商品已过期',
            mask: true,
            duration: 2000
          })
          goodsInfo.micro = '00'
          goodsInfo.miao = '00';
          goodsInfo.fen = '00';
          goodsInfo.xiaoshi = '00';
          goodsInfo.tian = '00';
          clearInterval(timer)
        }else if (disTime <= 0 && activity_status == '0') {
          wx.showToast({
            icon: 'none',
            title: '秒杀时间已开始',
            mask: true,
            duration: 2000
          })
          self.initCommodityDetails()
          clearInterval(timer)
        } else if (disTime <= 0 && activity_status == '1') {
          wx.showToast({
            icon: 'none',
            title: '秒杀时间已结束',
            mask: true,
            duration: 2000
          })
          goodsInfo.activity_status = 2;
          goodsInfo.micro = '00'
          goodsInfo.miao = '00';
          goodsInfo.fen = '00';
          goodsInfo.xiaoshi = '00';
          goodsInfo.tian = '00';
          clearInterval(timer)
        } else if (disTime <= 0 && activity_status == '2') {
          wx.showToast({
            icon: 'none',
            title: '秒杀时间已结束',
            mask: true,
            duration: 2000
          })
          goodsInfo.activity_status = 2;
          goodsInfo.micro = '00'
          goodsInfo.miao = '00';
          goodsInfo.fen = '00';
          goodsInfo.xiaoshi = '00';
          goodsInfo.tian = '00';
          clearInterval(timer)
        } else if ( sell_out == 1 || purchasable_count == 0 ){
          wx.showToast({
            icon: 'none',
            title: '该商品已售完',
            mask: true,
            duration: 2000
          })
          goodsInfo.micro = '00'
          goodsInfo.miao = '00';
          goodsInfo.fen = '00';
          goodsInfo.xiaoshi = '00';
          goodsInfo.tian = '00';
          clearInterval(timer)
        } else {
          //disTime = Math.floor(disTime / 1000);
         
          tian = Math.floor(disTime / 1000 / 60 / 60) / 24;
          xiaoshi = Math.floor(disTime / 1000 / 60 / 60 % 24);
          fen = Math.floor(disTime / 1000 / 60 % 60);
          miao = Math.floor(disTime / 1000 % 60);
          micro = Math.floor(disTime % 1000 / 100);
          
          goodsInfo.micro = self.toDouble(micro);
          goodsInfo.miao = self.toDouble(miao);
          goodsInfo.fen = self.toDouble(fen);
          goodsInfo.xiaoshi = self.toDouble(xiaoshi);
          tian = tian.toString()
          if (tian.indexOf('.') != -1 ){
            goodsInfo.tian = self.toDouble(tian.split('.')[0]);
          }else{
            goodsInfo.tian = self.toDouble(tian);
          }
          
        }
        self.setData({
          goodsInfo
        })
      };

      timeGoFun()

      timer = setInterval(() => {
        timeGoFun()
      }, 50)

    }).catch(err=>{
      wx.hideLoading()
    })
  },

  /**
    * 选择自提日期计算
    */
  getTiem(tiem, start,fun) {
    start = start.replace(/-/g, '/'); //必须把日期'-'转为'/'
    let myDate = new Date(start),
      dateArray = [],
      dateTemp,
      flag = 1,
      val = 0;
    for (let i = 0; i < tiem; i++) {
      dateTemp = this.toDouble(myDate.getMonth() + 1) + "月" + this.toDouble(myDate.getDate()) + "日";
      dateArray.push(dateTemp);
      myDate.setDate(myDate.getDate() + flag);
    }
    this.setData({
      time2: dateArray,
      tiem: dateArray[val],
      val
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
      {id, index, type} = e.currentTarget.dataset,
      { goodsInfo, tiem, list } = this.data;
    if (id == 1 && index != undefined) {
      selt.getTiem(list[index].deliver_date.day + 1, list[index].deliver_date.start_deliver, function () {
        // if (selt.data.time2.length <= 1) {
          selt.setData({
            index,
            screen: 0,
          })
        let datas = new Date(),
          tiem = datas.getFullYear() + '-' + selt.data.tiem;
          tiem = tiem.replace("月", "-");
          tiem = tiem.replace("日", "");
        selt.handleAddCard('', tiem, list[selt.data.index].id, 2)
          return false
        // }
        // selt.setData({
        //   screen: id,
        //   index
        // })
      })
    } else if (id == 1 && index == undefined ){
      if( type == 1 ){
        selt.setData({
          index,
          screen: 0,
        })
        selt.handleAddCard('', goodsInfo.start_deliver_date, goodsInfo.id, 1)
      }else{
        selt.getTiem(goodsInfo.deliver_date.day + 1, goodsInfo.deliver_date.start_deliver, function () {
          if (selt.data.time2.length <= 1) {
            selt.setData({
              index,
              screen: 0,
            })
            // selt.handleAddCard('', selt.data.tiem, goodsInfo.id, 1)
            return false
          } else {
            selt.setData({
              screen: id,
              index
            })
          }
        })
      }
    }
    if (id == 2 && selt.data.index != undefined) {
      // selt.handleAddCard('', selt.data.tiem, list[selt.data.index].id,2)

    } else if (id == 2 && selt.data.index == undefined) {
      // selt.handleAddCard('', selt.data.tiem, goodsInfo.id, 1)
      let datas = new Date(),
        tiem = datas.getFullYear() + '-' + selt.data.tiem;
        tiem = tiem.replace("月", "-");
        tiem = tiem.replace("日", "");
      goodsInfo.start_deliver_date = tiem
      selt.setData({
        goodsInfo,
        screen: id
      })
    }
    if( id == 0 ){
      selt.setData({
        screen: id,
        index:undefined
      })
    }
  },

  /**
   * 猜你喜欢
   */
  initGuessYouLove() {
    const { store_id, id } = this.data,
     params = {
      commodity_id: id,
      store_id
    }
    app.ajax.guessYouLove(params).then(res => {
      const { data } = res;
      for( let i in data ){
        data[i].price = parseFloat(data[i].price)
        data[i].original_price = parseFloat(data[i].original_price)
        data[i].price_whole = String(data[i].price).split('.')[0]
        data[i].price_small = String(data[i].price).split('.')[1] || ''
      }
      this.setData({
        list: data
      })
    })
  },

  /**
   *  加入购物车
   */
  handleAddCard(e, delivery_date, id, name) {
    if (delivery_date ){
      let { list, cart_num, goodsInfo } = this.data,
        datas = new Date(),
        params = {
          commodity_id: id,
          count: 1,
          delivery_date,
        };
      this.throttles(params, 500, '', name)
    }else{
      let { id, name } = e.currentTarget.dataset,
        { list, cart_num, goodsInfo } = this.data,
        params = {
          commodity_id: id,
          count: 1,
        };
      this.throttles(params, 500, e)
    }
    
  },
  // 加入购物车防多点
  throttles(params, wait,e,zhuangtai) {
    let { lastTime, goodsInfo } = this.data,
      { list, cart_num } = this.data,
      name = '',
      id = ''
    if( e != '' ){
      id = e.currentTarget.dataset.id;
      name = e.currentTarget.dataset.name;
    } else {
      name = zhuangtai
    }
    let nowTime = new Date().getTime()
    if (goodsInfo.shopping_cart_num >= 99) {
      wx.showToast({
        title: '单个购买数量不能超过99',
        icon:"none"
      })
      return false;
    }
    if (goodsInfo.sell_out == 1 || goodsInfo.t_sell_out == 1) {
      wx.showToast({
        title: '商品已售罄',
        icon: "none"
      })
      return false;
    }
    if (nowTime - lastTime > wait) {
      app.ajax.addCard(params).then(res => {
          if (name == 1) {
            goodsInfo.shopping_cart_num++
            this.setData({
              goodsInfo,
              screen:0
            })
          } else {
            if (e != '') {
              for (let i = 0; i < list.length; i++) {
                if (list[i].id == id) {
                  list[i].shopping_cart_num++
                }
              }
            }else{
              for (let i = 0; i < list.length; i++) {
                if (list[i].id == params['commodity_id']) {
                  list[i].shopping_cart_num++
                }
              }
            }
            this.setData({
              list,
              screen:0
            })
          }
        
      })
      lastTime = nowTime;
      this.setData({
        lastTime
      })
    }
  },

  /**
   * 加 退款数量
   */
  bindJia(e){
    const self = this,
    { goodsInfo } = self.data;
    if( goodsInfo.purchasable_count == -1  ){
      if( goodsInfo.count >= 99 ){
        wx.showToast({
          title: '购买数量最大不能超过99',
          icon:'none'
        })
        return false;
      }
    }else{
      if (goodsInfo.count >= goodsInfo.purchasable_count ){
        wx.showToast({
          title: '购买数量不能超过限购数量',
          icon:'none'
        })
        return false;
      }
    }
    goodsInfo.count++
    this.setData({
      goodsInfo
    })
  },
  /**
   * 减 退款数量
   */
  bindJian(){
    let self = this,
      { goodsInfo } = self.data;
    if (goodsInfo.count <= 1 ){
      return false;
    }
    goodsInfo.count--
    this.setData({
      goodsInfo
    })
  },

  /**
   * 猜你喜欢跳转到详情
   */
  handleLike(e) {
    const { id } = e.currentTarget;
    this.id = id;
    this.setData({
      id
    })
    // this.initCommodityDetails()
    // this.initGuessYouLove()
    wx.redirectTo({
      url: '/pages/home/goods_details/index?id=' + id,
    })
  },

  /**
   * 购物车数量
   */
  // cart_list_count(){
  //   const { shoppingTiem } = app.globalData,
  //     data = new Date(),
  //     params = {
  //       deliver_time:shoppingTiem
  //     };
  //   if( shoppingTiem ){
  //     params['deliver_time'] = data.getFullYear()+'-'+params['deliver_time']
  //     params['deliver_time'] = params['deliver_time'].replace("月", "-")
  //     params['deliver_time'] = params['deliver_time'].replace("日", "")
  //   }
  //   app.ajax.cart_list_count(params).then(res => {
  //     this.setData({
  //       cart_num:res.data
  //     })
  //   })
  // },

  /**
   * 立即秒杀
   */
  handlePayment() {
    const { goodsInfo } = this.data,
    { store_id } = app.globalData;
    goodsInfo.deliver_time = goodsInfo.end_deliver_time;
    app.globalData.list = JSON.stringify([goodsInfo])
    app.globalData.money = goodsInfo.price
    app.globalData.date = ''
    app.globalData.from = 0
    const params = {
      commodityLists: JSON.stringify([goodsInfo]),
      store_id,
    }
    app.ajax.calculate_price(params).then(res => {
      const { data } = res;
      if( data > 10000 ){
        wx.showToast({
          title: '下单总金额不能超过10000',
          icon:'none'
        })
        return false;
      }
      wx.navigateTo({
        url: '/pages/my/confirm_order/index'
      })
    })
  },

  tis(e){
    let { name } = e.currentTarget.dataset;
    wx.showToast({
      title: name,
      icon:'none'
    })
  },

  /**
   * 轮播图切换
   */
  handleSwiper(e) {
    let index = e.detail.current + 1;
    this.setData({
      swiperIndex: index,
      autoplay:false
    })
    let videoCtx = wx.createVideoContext('video', this)
    if (index == 1 ){
      videoCtx.play()
    }else{
      videoCtx.pause()
    }
  },

  timeupdate(e) {
    const { currentTime } = e.detail,
      videoCtx = wx.createVideoContext('video', this);
    if (this.isFirstTime && currentTime >= 5) {
      this.isFirstTime = false;
      videoCtx.pause()
    }
  },

  handleFullScreenChange(e) {
    const { fullscreen } = e.detail
    this.setData({
      duration: fullscreen ? 'auto' : 5,
      isFullScreen: fullscreen
    })
  },

  /**
   * 是否静音播放
   */
  handleMuted() {
    this.setData({
      muted: !this.data.muted
    })
  },

  toDouble(val) {
    val = val < 10 ? '0' + val : val;
    return val;
  }
})