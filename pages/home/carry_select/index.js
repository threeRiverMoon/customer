//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    search:'',
    page_size: 10,
    page_index: 1,
    page_count: 0,
    list:[],
    common_store:[],
    latitude:'',
    longitude:'',
    near_distance:'3',  //多少KM内显示
    name:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const selt = this,
    { latitude, longitude } = app.globalData;
    selt.setData({
      latitude,
      longitude,
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
    this.store_list()
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
    this.store_list()
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
    this.store_list()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  /**
   * 自提门店列表
   */
  store_list(e){
    let selt = this,
      { search, page_index, page_size, list, latitude, longitude, near_distance } = selt.data,
    params = {
      latitude,
      longitude,
      search,
      page_index,
      page_size,
      is_obtain_common:search?0:1,
      near_distance
    };
    if( e ){
      let { index } = e.currentTarget.dataset;
      if (index == 1) {
        near_distance = 99999
        params['near_distance'] = 99999
      }
    }
    app.ajax.store_list(params).then(res => {
      const { common_store, nearby_store } = res.data,
      { data, page_count } = nearby_store;
      if (page_index == '1') {
        selt.setData({
          common_store,
          list: data,
          page_count,
          near_distance
        })
        if (data == '' && near_distance == 3) {
          this.setData({
            near_distance: 99999
          })
          this.store_list()
        }
      } else {
        selt.setData({
          list: list.concat(data),
          near_distance
        })
      }
    })
  },
  /**
   * 选择自提点
   */
  handleStore(e){
    const self = this;
    const { id } = e.currentTarget,
      { name, location } = e.currentTarget.dataset,
    params = {
      store_id:id
    };
    wx.showModal({
      title: '提示',
      content: '切换门店会清空购物车，是否继续切换',
      confirmColor: '#C3D939',
      cancelColor: '#949494',
      success(res) {
        if (res.confirm) {
          app.ajax.select_store(params).then(res => {
            // wx.showToast({
            //   title: name + '选择成功',
            //   duration: 2000,
            //   mask: true,
            //   icon: 'none'
            // })
            const locations = location.split(',');
            wx.setStorageSync('store_id', id)
            wx.setStorageSync('store_name', name)
            app.globalData.store_id = id;
            app.globalData.store_name = name;
            self.setData({
              name,
            })
            const params = { }
            app.ajax.delCartAll(params).then(res => {
            })
            var pages = getCurrentPages(); // 当前页面
            var beforePage = pages[pages.length - 2]; // 前一个页面
            beforePage.onShow(1)
            setTimeout(function () {
              wx.navigateBack({

              })
            }, 2000)

          })
        } else if (res.cancel) {

        }
      }
    })
    
  },

  /**
   * 导航
   */
  handleditu(e){
    const self = this,
      { location } = e.currentTarget.dataset,
      locations = location.split(',');
    wx.openLocation({
      latitude: parseFloat(locations[1]),
      longitude: parseFloat(locations[0]),
      scale: 18
    })
  },

  /**
   * 搜索
   */
  bindInput(e){
    this.setData({
      [e.target.dataset.name]: e.detail.value
    })
    if( this.data.search != '' ){
      wx.setNavigationBarTitle({
        title: '搜索自提点'
      })
      this.setData({
        near_distance: 99999,
      })
    }else{
      wx.setNavigationBarTitle({
        title: '选择自提点'
      })
      this.setData({
        near_distance: 3,
      })
    }
    this.store_list()
  },

})