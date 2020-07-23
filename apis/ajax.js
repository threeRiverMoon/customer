import request from './request.js';
import { testing as env } from '../env.js';
console.log(env)
class ajax {
  constructor() {
    this._baseUrl = env.baseUrl // 测试
    this._request = new request
    this._request.setErrorHandler(this.errorHander)
  }

  /**
   * 统一的异常处理方法
   */
  errorHander(res) {
    let reg = /request:fail/;
    if (reg.test(res.errMsg) || res.statusCode == '502') {
      wx.showToast({
        title: '网络异常，请检查再试!',
        icon: 'none'
      })
    } else {
      // wx.showToast({
      //   title: res.data.msg,
      //   icon: 'none'
      // })
    }
  }

  /**
   * 设置header
   */
  setHeader(header) {
    this._request.setHeader(header)
    return this;
  }

  
  /**
   * 微信小程序登录
   */
  oauth(data) {
    return this._request.getRequest(this._baseUrl + '/Oauth/wx_program_login', data)
  } 
  /**
   * 获取手机号
   */
  getPhone(data){
    return this._request.getRequest(this._baseUrl + '/Oauth/get_wx_program_phone', data)
  }
  /**
   * 绑定手机号
   */
  setPhone(data){
    return this._request.postRequest(this._baseUrl + '/User/set_phone', data)
  }
  /**
   * 获取热门搜索
   */
  get_top_searches(data){
    return this._request.getRequest(this._baseUrl + '/commodity/get_top_searches', data)
  }
  /**
   * 搜索商品列表
   */
  search_goods(data){
    return this._request.getRequest(this._baseUrl + '/commodity/search_goods', data)
  }

  /**
   * 自提门店列表
   */
  store_list(data){
    return this._request.getRequest(this._baseUrl + '/store/store_list', data)
  }

  /**
   * 门店详情
   */
  store_info(data){
    return this._request.postRequest(this._baseUrl + '/store/store_info', data)
  }
  
  /**
   * 选择自提门店
   */
  select_store(data){
    return this._request.postRequest(this._baseUrl + '/store/select_store', data)
  }
  /**
   * 默认选择自提门店
   */
  default_select_store(data) {
    return this._request.postRequest(this._baseUrl + '/store/default_select_store', data)
  }

  /**
   * 首页分类列表
   */
  categoriesList(data){
    return this._request.getRequest(this._baseUrl + '/index/commodity_categories_list', data)
  }

  /**
   * 首页轮播图
   */
  ads(data){
    return this._request.getRequest(this._baseUrl + '/index/ads', data)
  }

  /**
   * 是否显示广告
   */
  isShowAd(data) {
    return this._request.getRequest(this._baseUrl + '/oauth/is_show_ad', data)
  }

  /**
   * 首页公告
   */
  announcement(data){
    return this._request.getRequest(this._baseUrl + '/index/announcement', data)
  }

  /**
     * 公告详情
     */
  announcement_info(data) {
    return this._request.getRequest(this._baseUrl + '/index/announcement_info', data)
  }

  /**
   * 热销榜
   */
  hot_goods(data) {
    return this._request.getRequest(this._baseUrl + '/commodity/hot_goods', data)
  }

  /**
   * 人气榜
   */
  popularity_goods(data) {
    return this._request.getRequest(this._baseUrl + '/commodity/popularity_goods', data)
  }

  /**
   * 版块列表
   */
  activity_list(data) {
    return this._request.getRequest(this._baseUrl + '/index/activity_list', data)
  }

  /**
   * 几元版块
   */
  caps_set(data) {
    return this._request.getRequest(this._baseUrl + '/commodity/caps_set', data)
  }

  /**
   * 几元版块
   */
  section_list(data) {
    return this._request.getRequest(this._baseUrl + '/commodity/section_list', data)
  }

  /**
   * 查询用户代购金记录
   */
  goldList(data){
    return this._request.getRequest(this._baseUrl + '/User/gold', data)
  }

  /**
   * 获取当前用户可用代购金
   */
  getGold(data){
    return this._request.getRequest(this._baseUrl + '/User/get_gold', data)
  }

  /**
   * 获取当前用户可用的优惠券数量
   */
  getCouponNum(data) {
    return this._request.getRequest(this._baseUrl + '/User/get_coupon_num', data)
  }

  /**
   * 获取当前用户未自提的订单
   */
  getOrderMentioned(data) {
    return this._request.getRequest(this._baseUrl + '/User/get_order_mentioned', data)
  }

  /**
   * 获取商品列表（根据分类id）
   */
  categoryCommodityList(data) {
    return this._request.getRequest(this._baseUrl + '/commodity/category_commodity_list', data)
  }

  /**
   * 获取用户优惠券列表
   */
  couponList(data) {
    return this._request.getRequest(this._baseUrl + '/User/coupon', data)
  }

  /**
   * 下单时获取用户优惠券
   */
  order_coupons(data) {
    return this._request.getRequest(this._baseUrl + '/order/order_coupons', data)
  }

  /**
   * 领券中心
   */
  couponCenterList(data) {
    return this._request.getRequest(this._baseUrl + '/Coupon/coupon_center', data)
  }

  /**
   * 领取优惠券
   */
  receiveCoupons(data) {
    return this._request.postRequest(this._baseUrl + '/Coupon/receive_coupons', data)
  }

  /**
   * 经常买
   */
  oftenBuyList(data) {
    return this._request.getRequest(this._baseUrl + '/oftenBuy/often_buy', data)
  }

  /**
   * 首页活动专卖按钮名称+商品信息
   */
  // activityList(data) {
  //   return this._request.getRequest(this._baseUrl + '/index/activity', data)
  // }

  /**
   * 活动商品列表
   */
  activityGoodsList(data) {
    return this._request.getRequest(this._baseUrl + '/activity/activity_goods', data)
  }

  /**
   * 获取商品列表（根据商品id）
   */
  commodity_list_of_id(data) {
    return this._request.getRequest(this._baseUrl + '/commodity/commodity_list_of_id', data)
  }

  /**
   * 搜索提示文字
   */
  search_prompt_text(data) {
    return this._request.getRequest(this._baseUrl + '/oauth/search_prompt_text', data)
  }

  /**
   * 商品详情
   */
  commodityDetails(data) {
    return this._request.getRequest(this._baseUrl + '/commodity/commodity_Details', data)
  }

  /**
   * 猜你喜欢
   */
  guessYouLove(data) {
    return this._request.getRequest(this._baseUrl + '/commodity/guess_you_love', data)
  }

  /**
   * 加入购物车
   */
  addCard(data) {
    return this._request.postRequest(this._baseUrl + '/cart/add_cart', data)
  }

  /**
   * 商品列表减少购物车数量
   */
  subCart(data) {
    return this._request.postRequest(this._baseUrl + '/cart/sub_cart', data)
  }

  /**
   * 清空购物车
   */
  delCartAll(data) {
    return this._request.getRequest(this._baseUrl + '/Cart/del_cart_all', data)
  }

  /**
   * 根据自提获取门店运营时间
   */
  cart_business_hours(data) {
    return this._request.postRequest(this._baseUrl + '/cart/cart_business_hours', data)
  }

  /**
   * 购物车数量
   */
  cart_list_count(data) {
    return this._request.postRequest(this._baseUrl + '/cart/cart_list_count', data)
  }

  /**
   * 购物车列表
   */
  cartList(data) {
    return this._request.getRequest(this._baseUrl + '/cart/cart_list', data)
  }
  /**
   * 购物车失效商品
   */
  invalidCartList(data){
    return this._request.getRequest(this._baseUrl + '/cart/invalid_cart_list', data)
  }
  
  /**
   * 清空失效商品
   */
  emptyInvalidCartCommodity(data){
    return this._request.postRequest(this._baseUrl + '/cart/empty_invalid_cart_commodity', data)
  }
  /**
   * 购物车猜你喜欢
   */
  addDelicious(data){
    return this._request.getRequest(this._baseUrl + '/cart/add_delicious', data)
  }
  /**
   * 修改购物车
   */
  editCart(data){
    return this._request.postRequest(this._baseUrl + '/cart/edit_cart', data)
  }
  /**
   * 删除购物车
   */
  delCart(data){
    return this._request.deleteRequest(this._baseUrl + '/cart/del_cart', data)
  }

  /**
   * 关于我们
   */
  about(data) {
    return this._request.getRequest(this._baseUrl + '/Oauth/about', data)
  }  

  /**
   * 用户协议
   */
  userAgreement(data) {
    return this._request.getRequest(this._baseUrl + '/Oauth/user_agreement', data)
  }  

  /**
   * 隐私政策
   */
  privacyPolicy(data) {
    return this._request.getRequest(this._baseUrl + '/Oauth/privacy_policy', data)
  }  

  /**
   * 营业执照
   */
  businessLicense(data) {
    return this._request.getRequest(this._baseUrl + '/Oauth/business_license', data)
  }  

  /**
   * 反馈
   */
  feedback(data) {
    return this._request.postRequest(this._baseUrl + '/feedback/feedback', data)
  }

  /**
   * 上传图片
   */
  uploadFile(data) {
    return this._request.postRequest(this._baseUrl + '/Upload/uploadFile', data)
  }  

  /**
   * 创建订单
   */
  createOrder(data) {
    return this._request.postRequest(this._baseUrl + '/Order/createOrder', data)
  }  

  /**
   * 订单列表包括赛选
   */
  ordersList(data) {
    return this._request.getRequest(this._baseUrl + '/orders/orders_list', data)
  }  

  /**
  * 订单自提
  */
  mention(data) {
    return this._request.putRequest(this._baseUrl + '/Order/mention', data)
  }  

  /**
  * 订单取消
  */
  order_cancel(data) {
    return this._request.putRequest(this._baseUrl + '/orders/order_cancel', data)
  }  

  /**
   * 订单详情
   */
  orderDetails(data){
    return this._request.getRequest(this._baseUrl + '/Orders/order_details', data)
  }

  /**
   * 发起售后
   */
  launchAfterSales(data){
    return this._request.postRequest(this._baseUrl + '/order/launch_after_sales', data)  
  }

  /**
   * 计算优惠券失效金额
   */
  calculate_coupons(data) {
    return this._request.postRequest(this._baseUrl + '/orders/calculate_coupons', data)
  }

  /**
   * 取消售后
   */
  cancelSales(data){
    return this._request.postRequest(this._baseUrl + '/order/cancel_sales', data)  
  }

  /**
   * 微信支付
   */
  pay(data) {
    return this._request.postRequest(this._baseUrl + '/pay/pay', data)
  }

  /**
   * 图片域名
   */
  images_url(data) {
    return this._request.getRequest(this._baseUrl + '/index/images_url', data)
  }

  /**
   * 计算价格
   */
  calculate_price(data) {
    return this._request.postRequest(this._baseUrl + '/Order/calculate_price', data)
  }
  
}
export default ajax;