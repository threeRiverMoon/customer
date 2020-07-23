// pages/home/feed_back/index.js
const app = getApp()
import { testing as env } from '../../../env.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    baseUrl:app.globalData.Url,
	HOST: app.globalData.HOST,
    num: 0,
    content: '',
    imgs: [],
    phone: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
   * 上传图片
   */
  chooseImage() {
    const self = this,
      { imgs, baseUrl } = this.data,
      lens = imgs.length,
      url = '/Upload/uploadFile';
    wx.chooseImage({
      count: 3 - lens,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        const { tempFilePaths } = res;
        let totalUploadLength = tempFilePaths.length,
          hasUploadLength = 0;
        wx.showLoading({
          title: "文件上传中",
          mask: true
        })
        for (let i = 0; i < tempFilePaths.length; i++) {
          wx.uploadFile({
            url: env.baseUrl + url,//调用后台接口的路径
            method: 'POST',
            filePath: tempFilePaths[i],
            name: 'file_upload',//此处注意要与后台保持一致
            header: {
              "auth": app.globalData.token
            },
            formData: {
              upload_type: 'c-feedback',
              file_upload: tempFilePaths[i]
            },
            success: function (res) {
			  wx.hideLoading()
              const { data } = res,
                img = JSON.parse(data);
              imgs.push(img.data)
              hasUploadLength++
              self.setData({
                imgs
              })
              return false;
            },
            fail(err) {
              totalUploadLength--
			  wx.hideLoading()
            },
            complete() {
              if (totalUploadLength === hasUploadLength) {
                wx.hideLoading()
              }
            }
          })
        }
      }
    })
  },

  /**
   * 提交反馈
   */
  handleConfirm() {
    const { phone, content, imgs } = this.data,
      reg = /^1[3456789]\d{9}$/;
    if (content == '') {
      wx.showToast({
        title: '请输入意见反馈描述',
        icon: 'none',
        duration: 2000
      })
      return false;
    } else if (phone == '') {
      wx.showToast({
        title: '请输入手机号码',
        icon: 'none',
        duration: 2000
      })
      return false
    } else if (!reg.test(phone)) {
      wx.showToast({
        title: '请输入正确的手机号码',
        icon: 'none',
        duration: 2000
      })
      return false
    }
    const params = {
      img: imgs.join(','),
      phone,
      content
    };
    wx.showLoading({
      title: "提交反馈中",
      mask: true
    })
    app.ajax.feedback(params).then(res => {
      wx.redirectTo({
        url: '/pages/my/feed_back_two/index',
      })
    })
  },

  /**
   * 删除操作
   */
  handleDel: function (e) {
    const { index } = e.currentTarget.dataset,
      { imgs } = this.data;
    imgs.splice(index, 1);
    this.setData({ imgs });
  },

  /**
   * 预览
   */
  previewImage(e) {
    const { src } = e.currentTarget.dataset,
      { imgs, HOST } = this.data;
    let img = JSON.parse(JSON.stringify(imgs))
    for (let i in img ){
      if (img[i].indexOf('http') == -1 ){
        img[i] = HOST + img[i]
      }
    }
    wx.previewImage({
      current: src, // 当前显示图片的http链接
      urls: img // 需要预览的图片http链接列表
    })
  },

  /**
  * 获取输入框的值
  */
  bindInput(e) {
    const { value } = e.detail,
      { content } = this.data,
      { name } = e.currentTarget.dataset,
      length = value.length;
    this.setData({
      [name]: value,
      num: name === 'content' ? length : content.length
    })
  },
})