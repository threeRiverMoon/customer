//获取应用实例
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    HOST: '',
    order_status: '',  //订单状态
    cancel:0, //是否显示取消退款弹窗
    confirm:0, //是否显示申请退款弹窗
    detailsData:[],
    num:0,
    money:0,
    refund_reason:"",
    order_id:'',
    lost_coupon_amount:0,
    all_sale_amount:0,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
	 const { HOST } = app.globalData;
    this.setData({
      order_id: options.order_id,
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
    this.getOrderDetails();
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
   * 获取订单详情
   */
  getOrderDetails() {
    let self = this;
    let { num, money, order_id, all_sale_amount } = self.data
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
          let { data } = res,
          sale_ok = 0;
          data.price_whole = String(data.pay_amount).split('.')[0]
          data.price_small = String(data.pay_amount).split('.')[1] || ''
          for(var i = 0; i < data.comm_list.length; i++){
            if (data.comm_list[i]['sale_ok'] == 0 ){
              sale_ok++;
              if (num == null ){
                num = 0;
                money = 0;
              }
              data.comm_list[i]['nums'] = 0
            }else{
              num = num + data.comm_list[i]['num']
              data.comm_list[i]['nums'] = data.comm_list[i]['num']
              money += (parseFloat(data.comm_list[i]['price'])) * parseInt(data.comm_list[i]['nums'])
              all_sale_amount += (parseFloat(data.comm_list[i]['price'])) * parseInt(data.comm_list[i]['nums'])
            }
            data.comm_list[i]['price'] = parseFloat(data.comm_list[i]['price'])
            data.comm_list[i]['original_price'] = parseFloat(data.comm_list[i]['original_price'])
            data.comm_list[i].price_whole = String(data.comm_list[i].price).split('.')[0]
            data.comm_list[i].price_small = String(data.comm_list[i].price).split('.')[1] || ''
          }
          if (sale_ok == data.comm_list.length ){
            wx.showToast({
              title: '订单商品超过售后保障日期',
              icon:'none'
            })
            setTimeout(function(){
              wx.navigateBack({
                
              })
            },1500)
            return false;
          }
          self.setData({
            detailsData: data,
            num,
            // money: parseFloat(money).toFixed(2),
            all_sale_amount: parseFloat(all_sale_amount).toFixed(2)
          })
          self.calculate_coupons(parseFloat(all_sale_amount).toFixed(2))
        })
      },
      fail: function (res) {
      }
    })
  },

  /**
   * 计算失效优惠券 
   */
  calculate_coupons(all_sale_amount){
    let { detailsData } = this.data,
      params = {
        order_id: detailsData.order_id,
        delivery_date: detailsData.delivery_date,
        comm_list:[]
      };
    for (let i in detailsData.comm_list) {
      if (detailsData.comm_list[i]['sale_ok'] == 0 ){

      }else{
        params['comm_list'].push({
          num: detailsData.comm_list[i].nums,
          id: detailsData.comm_list[i].order_detail_id
        })
      }
    }
    app.ajax.calculate_coupons(params).then(res => {
      let { data } = res,
        datas = data;
      if (data == '0.00' || data < '0.00'){
        datas = 0
      }
      let money = parseFloat(all_sale_amount) - parseFloat(datas)
      this.setData({
        lost_coupon_amount: parseFloat(datas),
        money: parseFloat(money).toFixed(2)
      })
    })
  },

  /**
   * 赋值售后备注
   */
  handleRefundReason(e){
    this.setData({
      refund_reason: e.detail.value
    })
  },
  /**
   * 是否显示取消退款弹窗
   */
  handleCancel(e) {
    var id = e.currentTarget.dataset.id;
    this.setData({
      cancel: id
    })
    if (this.data.cancel == 2) {
      wx.navigateBack({
        
      })
    }
  },
  /**
   * 是否显示申请退款弹窗
   */
  handleConfirm(e) {
    var id = e.currentTarget.dataset.id;
    this.setData({
      confirm: id
    })
    if (this.data.confirm == 2) {
      this.bindApply()
    }
  },
  /**
   * 申请退款
   */
  bindApply() {
    let self = this;
    let sales_data = []
    let { detailsData, refund_reason, num } = self.data;
    if( num == 0 ){
      wx.showToast({
        title: '请至少选择一个商品售后',
        icon: "none"
      })
      return false;
    }
    // if (refund_reason == '') {
    //   wx.showToast({
    //     title: '请输入售后备注',
    //     icon: "none"
    //   })
    //   return false;
    // }
    wx.requestSubscribeMessage({
      tmplIds: ["xvXavRIg31rbFCGIEKzkeNhZ28JNwaIlPUGe7uhvoVU","xvXavRIg31rbFCGIEKzkeLHnFlXMJ1OQTWK2bB6SSFY"],
      success: (res) => {
        if (res['xvXavRIg31rbFCGIEKzkeNhZ28JNwaIlPUGe7uhvoVU'] === 'accept'&&res['xvXavRIg31rbFCGIEKzkeLHnFlXMJ1OQTWK2bB6SSFY'] === 'accept') {
          for (var i = 0; i < detailsData.comm_list.length; i++) {
            if (detailsData.comm_list[i].sale_ok == 1 ){
              sales_data.push({
                num: detailsData.comm_list[i]['nums'],
                id: detailsData.comm_list[i]['order_detail_id']
              })
            }
          }
          const params = {
            order_id: detailsData.order_id,
            delivery_date: detailsData.delivery_date,
            refund_reason,
            sales_data: JSON.stringify(sales_data)
          }
          app.ajax.launchAfterSales(params).then(res => {
            const { data } = res
            wx.showToast({
              title: '申请成功，等待审核',
              icon:'none',
              duration: 1500,
            })
            setTimeout(function () {
              wx.redirectTo({
                url: '/pages/my/refund_details/index?sale_id=' + data + '&order_id=' + self.data.order_id
              })
            }, 1500)
          })
        }else{
          wx.showToast({
            title: '需要先获取订阅消息',
            icon:'none'
          })
        }
      },
      fail(err) {
        if (err.errMsg == 'requestSubscribeMessage:fail can only be invoked by user TAP gesture.') {
          wx.showModal({
            title: '订阅消息',
            content: '需要获取订阅消息',
            showCancel: false,
            cancelText: '取消',
            confirmText: '确认授权',
            success: res => {
              
              wx.openSetting({
                withSubscriptions: true,
                success(res) {
                  
                }
              })
            },
            fail: () => { },
            complete: () => {

            }
          });
        }
      }
    })
  },
  /**
   * 查看地图
   */
  handleMap() {
    wx.navigateTo({
      url: '/pages/home/carry_see/index',
    })
  },

  bindblur(e) {
    let self = this,
      index = e.currentTarget.dataset.index,
      { value } = e.detail,
      { detailsData } = self.data;
    detailsData['comm_list'][index].nums = value == undefined || value == '' ? 0 : value
    this.setData({
      detailsData
    })
  },
  /**
   * 文本框 输入退款数量
   */
  bindInput(e) {
    let self = this,
     { index } = e.currentTarget.dataset,
     { value } = e.detail,
     { detailsData } = self.data;
    if (parseInt(value) > parseInt(detailsData['comm_list'][index].num)){
      wx.showToast({
        title: '退款数量不能大于' + detailsData['comm_list'][index].num,
        icon: 'none',
      })
      detailsData['comm_list'][index].nums = detailsData['comm_list'][index].num
    }else{
      detailsData['comm_list'][index].nums = value
    }
    if (value == undefined || value == '') {
      self.setData({
        num: 0,
        detailsData,
        money:0
      })
    } else {
      self.setData({
        detailsData,
      })
      self.calculation()
    }

  },
  /**
   * 加 退款数量
   */
  bindJia(e) {
    let self = this;
    const { index } = e.currentTarget.dataset
    const { detailsData } = self.data
    if (detailsData['comm_list'][index].nums >= detailsData['comm_list'][index].num) {
      wx.showToast({
        title: '退款数量不能大于' + detailsData['comm_list'][index].num,
        icon: 'none',
      })
      return false;
    }
    detailsData['comm_list'][index].nums++
    self.setData({
      detailsData: detailsData
    })
    self.calculation()
  },
  /**
   * 减 退款数量
   */
  bindJian(e) {
    let self = this;
    const { index } = e.currentTarget.dataset
    const { detailsData } = self.data
    if (detailsData['comm_list'][index].nums <= 0) {
      return 0;
    }
    detailsData['comm_list'][index].nums--
    self.setData({
      detailsData: detailsData
    })
    self.calculation()
  },

  /**
   * 计算退款金额、数量
   */
  calculation(){
    let self = this,
      money = 0,
      all_sale_amount = 0,
      num = 0, 
     { detailsData } = self.data;
    for (let i in detailsData['comm_list'] ){
      if (detailsData.comm_list[i]['sale_ok'] == 1 && detailsData.comm_list[i]['nums'] != 0){
        num += parseInt(detailsData['comm_list'][i].nums);
        money = parseFloat(money) + (parseFloat(detailsData['comm_list'][i].nums) * parseFloat(detailsData['comm_list'][i].price))
        all_sale_amount = parseFloat(all_sale_amount) + (parseFloat(detailsData['comm_list'][i].nums) * parseFloat(detailsData['comm_list'][i].price))
      }
    }
    self.setData({
      // money: parseFloat(money).toFixed(2),
      num,
      all_sale_amount: parseFloat(all_sale_amount).toFixed(2)
    })
    self.calculate_coupons(parseFloat(all_sale_amount).toFixed(2))
  },
})