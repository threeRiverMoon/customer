//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    HOST: '',
    nav: 0,
    screenIndex: 0,    //排序选项卡
    tabs: ["综合", "销量", "价格"],
    order: '', //升序降序

    navs: [],
    navsIndex: '',
    toView: '',
    pid: '',
    category: '',
    isScroll: false,
    children: [],
    showMask: false,
    toListView: '',
    cIndex: '',
    scrollTop: 0,

    navbarInitTop: 0, //导航栏初始化距顶部的距离
    isFixedTop: false, //是否固定顶部

    navList: [],
    classifyMask: 0,
    classifyId: '',
    classifyPid: '',
    classifyName: '全部',
    classifyList: [],
    tabid: '',
    nav: 0,
    classifyMask: 0,
    classifyId: '',
    classifyPid: '',
    classifyName: '全部',
    classifyList: [],
    list: [],
    page_size: 10,
    page_index: 1,
    page_count: 0,
    lastTime:0,

    time2: [],
    screen: 0,
    val: 0,
    tiem: [],
    index: '',
    show:1,
    classify:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const self = this,
      { HOST,token, pid, category, store_id } = app.globalData,
      { navbarInitTop } = this.data;
    this.setData({
      HOST,
      token,
      pid,
      category
    })
    if (navbarInitTop == 0) {
      //获取节点距离顶部的距离
      wx.createSelectorQuery().select('#navbar').boundingClientRect(function (rect) {
        if (rect && rect.top > 0) {
          const navbarInitTop = parseInt(rect.top);
          self.setData({
            navbarInitTop
          });
        }
      }).exec();
    }
    this.store_id = store_id;
    self.categoriesList()
    app.cart_list_count()
    setTimeout(function () {
      self.setData({
        show: 0,
      })
    }, 1000)
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
    let self = this;
    if(this.data.show == 0){
      
      self.data.classify = setTimeout(function () {
        self.categoriesList()
        app.cart_list_count()
      }, 2000)
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    clearTimeout(this.data.classify)
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    clearTimeout(this.data.classify)
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.setData({
      page_index: 1,
      list: []
    })
    this.categoriesList()
    // this.categoryCommodityList()
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
  /**
   * 监听页面滑动事件
   */
  onPageScroll: function (e) {
    this.showImg()    // 懒加载
    const { navbarInitTop, isFixedTop } = this.data,
      scrollTop = parseInt(e.scrollTop), //滚动条距离顶部高度
      isSatisfy = scrollTop >= navbarInitTop ? true : false;
    //判断'滚动条'滚动的距离 和 '元素在初始时'距顶部的距离进行判断
    //为了防止不停的setData, 这儿做了一个等式判断。 只有处于吸顶的临界值才会不相等
    if (isFixedTop === isSatisfy) {
      return false;
    }

    this.setData({
      isFixedTop: isSatisfy
    });
  },


  /**
   * 页面滚动事件
   */
  scrollTopFun(e) {
    const { scrollTop } = e.detail;
    this.setData({
      scrollTop
    })
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
      self.categoryCommodityList()
    })
  },

  /**
   * 分类列表
   */
  categoriesList() {
    let { token } = app.globalData,
      { pid, category } = this.data,
      params = {
        store_id: this.store_id,
        page_size: 0,
      };
    app.ajax.categoriesList(params).then(res => {
      let { data } = res,
        cIndex = 0,
        childrenIndex = 0;
      for (let i = 0; i < data.length; i++) {
        if (data[i].id === pid) {
          cIndex = i;
        }
      }
      let { children, id } = data[cIndex];

      for (let i = 0; i < children.length; i++) {
        if (children[i].id === category) {
          childrenIndex = i;
        }
      }

      this.setData({
        navs: data,
        pid: id,
        category: children[childrenIndex].id,
        toView: 'nav' + id,
        children,
        navsIndex: cIndex,
        cIndex: childrenIndex,
        page_index: 1,
      })

      if (token !== '') {
        this.categoryCommodityList()
      }
    })
  },

  /**
  * 筛选
  */
  tabClick(e) {
    let { order, screenIndex } = this.data,
      { id } = e.currentTarget;
    if (id == 2 && screenIndex != 2) {
      order = 1
    } else if (id == 2 && screenIndex == 2) {
      order = order == 1 ? 2 : 1
    } else if (id == 1) {
      order = '';
    } else {
      order = '';
    }
    this.setData({
      screenIndex: id,
      order,
      page_index: 1
    })
    this.categoryCommodityList()
  },

  /**
   * 获取商品列表（根据分类id）
   */
  categoryCommodityList() {
    const { pid, category, page_index, page_size, list, screenIndex, order } = this.data,
      params = {
        store_id: this.store_id,
        category,
        pid,
        page_size,
        page_index,
        field: '',
        order: screenIndex == 1 ? 1 : order,
      };
    if (screenIndex == 1) {
      params['field'] = 'sales_volume'
    } else if (screenIndex == 2) {
      params['field'] = 'price'
    }
    // wx.showLoading({
    //   title: '加载中',
    //   mask: true
    // })
    app.ajax.categoryCommodityList(params).then(res => {
      wx.hideLoading()
      const { page_count, data } = res.data;
      for( let i in data ){
        data[i].price = parseFloat(data[i].price)
        data[i].original_price = parseFloat(data[i].original_price)
        data[i].show = false
        data[i].price_whole = String(data[i].price).split('.')[0]
        data[i].price_small = String(data[i].price).split('.')[1] || ''
        data[i].tag_name = data[i].tag_name.split(',')
      }
      if (page_index == '1') {
        this.setData({
          list: data,
          page_count
        })
      } else {
        this.setData({
          list: list.concat(data),
        })
      }
      this.showImg()
    }).catch(err=>{
      wx.hideLoading()
    })
  },

  showImg(){
    let list = this.data.list,
    height = wx.getSystemInfoSync().windowHeight  // 页面的可视高度
    wx.createSelectorQuery().selectAll('.main-item').boundingClientRect((ret) => {
    ret.forEach((item, index) => {
      if (item.top <= height) { 
        list[index].show = true // 根据下标改变状态  
      }
    })
    this.setData({
      list
    })
    }).exec()
  },

  toDouble(val) {
    val = val < 10 ? '0' + val : val;
    return val;
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
      val: 0
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
      { list } = selt.data;
    if (id == 1) {
      selt.getTiem(list[index].deliver_date.day + 1, list[index].deliver_date.start_deliver, function () {
        // if (selt.data.time2.length <= 1) {
          selt.setData({
            index
          })
          selt.bindJia('', selt.data.tiem, list[selt.data.index].id)
          selt.setData({
            screen: 0,
          })
        //   return false
        // }
        // selt.setData({
        //   screen: id,
        //   index
        // })
      })
    } else if (id == 2) {
      selt.bindJia('', selt.data.tiem, list[selt.data.index].id)
    } else {
      selt.setData({
        screen: id,
      })
    }
  },

  /**
   * 加 数量
   */
  bindJia(e, delivery_date, goods_id) {
    let id = goods_id
    if (e != '') {
      id = e.currentTarget.dataset.id
    }
    let { list } = this.data,
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
      title: '加载中',
      mask: true
    })
    app.ajax.addCard(params).then(res => {
      wx.hideLoading()
      app.cart_list_count()
      for (let i in list ){
        if (list[i].id == id ){
          list[i].shopping_cart_num++
        }
      }
      this.setData({
        list,
        screen:0
      })
    })

  },

  /**
   * 减 退款数量
   */
  bindJian(e) {
    let { index } = e.currentTarget.dataset,
      { list, lastTime } = this.data,
      shopping_cart_num = list[index].shopping_cart_num,
      params = {
        commodity_id: list[index].id,
        count: 1,
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
          app.cart_list_count()
          list[index].shopping_cart_num--
          this.setData({
            list
          })
        })
      } else {
        app.ajax.subCart(params).then(res => {
          wx.hideLoading()
          app.cart_list_count()
          list[index].shopping_cart_num--
          this.setData({
            list
          })
        })
      }
      lastTime = nowTime;
      this.setData({
        lastTime
      })
    }
  },

  /**
   * 商品列表下拉事件
   */
  bindScroll() {
    let { page_index, page_count } = this.data;
    // 判断当前分类商品是否滑到最后一页
    if (page_index >= page_count) {
      let { nav, classifyId, navList } = this.data;
      if (navList.length - 1 <= nav) {
        return false;
      }
      // 下滑跳转下一个分类
      nav = nav || 0
      this.setData({
        nav: nav + 1,
        classifyId: navList[nav + 1].id,
        classifyPid: navList[nav + 1].pid,
        tabid: navList[nav + 1].id,
        page_index: 1
      })
      this.categoryCommodityList()
      return false;
    }
    // 正常下滑加载更多商品
    this.setData({
      page_index: ++page_index
    })
    this.categoryCommodityList()
  },

  /**
   * 左边菜单栏 切换
   */
  handleNavs(e) {
    const { navs } = this.data,
      { index } = e.currentTarget.dataset,
      { pid, id, children } = navs[index],
      childrenIndex = 0;
    this.setData({
      pid: id,
      toView: 'nav' + id,
      category: children[childrenIndex].id,
      children,
      navsIndex: index,
      showMask: false,
      cIndex: childrenIndex
    })
    app.globalData.pid = id;
    app.globalData.category = id;
    this.categoryCommodityList()
  },

  handleChildNavs(e) {
    const { children, pid, category } = this.data,
      { index } = e.currentTarget.dataset,
      { pid: parentId, id } = children[index];
    
    if (pid === parentId && category === id) {
      return false;
    }
    this.setData({
      pid,
      category: id,
      page_index: 1,
      toListView: index > 1 ? 'list' + (index - 1) : '',
      showMask: false,
      cIndex: index
    })
    this.categoryCommodityList()
  },

  /**
   * 是否显示选择分类下拉框
   */
  handleMask(e) {
    const { showMask } = this.data;
    this.setData({
      showMask: !showMask
    })
  },

  /**
   * 选择分类
   */
  bindClassify(e) {
    const { name, id, pid } = e.target.dataset;
    this.setData({
      classifyName: name,
      classifyId: id,
      classifyPid: pid,
      classifyMask: 0,
      page_index: 1,
    })
    this.categoryCommodityList()
  },

  handleNext() {
    let { navsIndex, cIndex, navs, children } = this.data;
    if (cIndex < children.length - 1) {
      cIndex++;
      this.setData({
        pid: navs[navsIndex].id,
        category: children[cIndex].id,
        page_index: 1,
        toListView: cIndex > 1 ? 'list' + (cIndex - 1) : '',
        cIndex,
        navsIndex
      })
      this.categoryCommodityList()
    } else {
      cIndex = 0;
      if (navsIndex < navs.length - 1) {
        navsIndex++
      } else {
        navsIndex = 0;
      }
      const { pid, id, children } = navs[navsIndex];
      this.setData({
        pid: id,
        toView: 'nav' + id,
        category: children[cIndex].id,
        children,
        navsIndex,
        cIndex
      })
      app.globalData.pid = id;
      app.globalData.category = id;
      this.categoryCommodityList()
    }
  }

})