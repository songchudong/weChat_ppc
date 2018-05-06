// pages/goods/spell.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hour: 0,
    minute: 0,
    seconds: 0,
    orderInfo: null,
    usersInfo: null,
    picDomain: null,
    isRemoveLoginCache: true,
    remaiTime: null,
    SpellInfo:null,
    user_state: true,
    options:null,
    hiddenLoading:true,
    telNumber:app.globalData.userInfo.telNumber
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    // this.getSussceSpellInfo(options.order_id)
    this.setData({
      picDomain: app.cdnImg,
      options:options.order_id
    })
    this.getUserOrderInfo(options.order_id)

  },
  // 倒计时
  calculRemaiTime: function (remaiTime,presentTime) {
    var _this = this, hour,minute,seconds;
    remaiTime = remaiTime - presentTime;
    setInterval(function () {
      remaiTime -= 0.1;
      hour = parseInt(remaiTime / 3600);
      minute = parseInt((remaiTime % 3600) / 60);
      seconds = (remaiTime % 60).toFixed(1);
      _this.setData({
        hour: hour<9?('0'+ hour):hour,
        minute: minute < 9 ? ('0' + minute):minute,
        seconds: seconds
      });
      if (remaiTime < 0){
        _this.getUserOrderInfo(_this.data.order_id);
      }
    }, 100);
  },
  // 获取用户订单详情
  getUserOrderInfo: function (order_id) {
    var _this = this;
    wx.request({
      url: app.server + '/Order/GetOrderInfo',
      data: { order_id: parseInt(order_id) },
      method: 'POST',
      success: function (res) {
        if (res.statusCode == 200){
          if (res.data.data.detail.length >1){
            for (var i = 1; i < res.data.data.detail; i++) {
              if (i.id == app.globalData.uid) {
                _this.setData({
                  user_state: false
                });
              }
            }
          }
          _this.setData({
            hiddenLoading:false,
            orderInfo:{
              id: res.data.data.id,
              ico: res.data.data.ico,
              discount: res.data.data.discount,
              price: res.data.data.price,
              product_name: res.data.data.product_name,
              remark1: res.data.data.remark1,
              remark2: res.data.data.remark2,
              shop_name: res.data.data.shop_name,
              limit: res.data.data.limit,
              numbers: (3 - res.data.data.detail.length),
              pt_endtime: res.data.data.pt_endtime,
              time:res.data.data.time,
              orderUser: res.data.data.user_id,
              loginUser: app.globalData.uid
            },
            usersInfo: res.data.data.detail
          });
          _this.calculRemaiTime(res.data.data.pt_endtime,res.data.data.time);
        }else{
          app.removeLoginCache();
        }
      }
    })
  },
  // 参团

  gopay: function () {
    var url = 'pay?order_id=' + this.data.orderInfo.id;
    wx.navigateTo({
      url: url,
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },

  goHome: function () {
    wx.switchTab({
      url: '/pages/index/index',
    })
  }
})