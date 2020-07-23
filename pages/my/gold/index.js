// pages/my/gold/index.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    money:'',
    activeIndex:0,
    tabs: ["全部", "代购金","消费"],
    list: [],
    page_size: 7,
    page_index: 1,
    page_count: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getGold()
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
    this.getGoldList()
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
    this.getGoldList()
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
    this.getGoldList()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  /**
   * 代购金充值明细列表
   */
  getGoldList(){
    const self = this,
    { page_index, page_size, activeIndex } = self.data,
    { list } = self.data,
    params = {
      page_index, 
      page_size, 
      type: activeIndex == 0 ? '' : activeIndex-1
    };
    app.ajax.goldList(params).then(res => {
      let { page_count, data } = res.data;
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
    })
  },

  /**
   * 获取当前用户可用代购金
   */
  getGold(){
    const self = this,
    params = {

    };
    app.ajax.getGold(params).then(res => {
      const { money } = res.data
      self.setData({
        money
      })
    })
  },

  /**
   * 选项切换
   */
  tabClick(e) {
    const { id } = e.currentTarget
    this.setData({
      activeIndex: id,
      page_index: 1
    })
    this.getGoldList()
  },
})