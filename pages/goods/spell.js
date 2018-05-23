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
    user_state: false,
    options:null,
    hiddenLoading:true,
    telNumber:app.globalData.userInfo.telNumber,
    starttime:null,
    endtime:null,
    pastState:false,
    userUseState:false,
    orderState:false,
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
        console.log(res.data.data.detail[0].id, app.globalData.uid)
        for (var i = 0; i<res.data.data.detail.length;i++){
          if (res.data.data.detail[i].id == app.globalData.uid) {
            _this.setData({
              user_state: true
            });
            break;
          } else {
            _this.setData({
              user_state: false
            });
          }
          console.log(res.data.data.detail[i].id == app.globalData.uid)
        }
        if (res.statusCode == 200){
          function getLocalTime(time) {
            time = time.toString();
            if (time.length > 10) time = time.substring(0, 10)
            return new Date(parseInt(time) * 1000).format("yyyy/MM/dd hh:mm:ss");
          }

          //时间格式
          Date.prototype.format = function (format) {
            var o = {
              "M+": this.getMonth() + 1, //month
              "d+": this.getDate(), //day
              "h+": this.getHours(), //hour
              "m+": this.getMinutes(), //minute
              "s+": this.getSeconds(), //second
              "q+": Math.floor((this.getMonth() + 3) / 3), //quarter
              "S": this.getMilliseconds() //millisecond
            }
            if (/(y+)/.test(format)) format = format.replace(RegExp.$1,
              (this.getFullYear() + "").substr(4 - RegExp.$1.length));
            for (var k in o)
              if (new RegExp("(" + k + ")").test(format))
                format = format.replace(RegExp.$1,
                  RegExp.$1.length == 1 ? o[k] :
                    ("00" + o[k]).substr(("" + o[k]).length));
            return format;
          }
          if (res.data.data.detail.length > 0){
            for (var i = 0; i < res.data.data.detail.length; i++) {
              if (res.data.data.detail[i].id == app.globalData.uid){
                _this.setData({
                  telNumber: res.data.data.detail[i].telNumber,
                  userUseState: res.data.data.detail[i].status === 2 ? true : false,
                  pastState: res.data.data.detail[i].status === 1 ? true : false,
                  orderState: res.data.data.detail[i].status === -1 || res.data.data.detail[i].status === 0? true : false,
                });
                if (_this.data.userUseState || _this.data.pastState) {
                  _this.setData({
                    orderState: false
                  });
                }
              }else{
                _this.setData({
                  orderState: res.data.data.detail[0].status === -1 || res.data.data.detail[i].status === 0? true : false
                });
                if (_this.data.userUseState || _this.data.pastState) {
                  _this.setData({
                    orderState: false
                  });
                }
              }
            }
            // console.log(_this.data.userUseState, _this.data.pastState);
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
              loginUser: app.globalData.uid,
              endtime: res.data.data.endtime
            },
            usersInfo: res.data.data.detail,
            starttime:getLocalTime(res.data.data.pt_endtime),
            endtime: getLocalTime(res.data.data.endtime)
          });
          if (res.data.data.pt_endtime > res.data.data.time){
            _this.calculRemaiTime(res.data.data.pt_endtime, res.data.data.time);
          }
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