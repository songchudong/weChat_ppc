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
    SpellInfo:null

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getSussceSpellInfo(options.orderId)
    this.setData({
      picDomain: app.cdnImg
    })
    this.getUserOrderInfo(options.orderId)

  },


  calculRemaiTime: function (remaiTime) {
    console.log('remaiTime', remaiTime)
    var hour = 0
    var minute = 0
    var seconds = 0
    var _this = this
    setInterval(function () {
      remaiTime -= 0.1
      hour = parseInt(remaiTime / 3600)
      minute = parseInt((remaiTime % 3600) / 60)
      seconds = (remaiTime % 60).toFixed(1)
      _this.setData({
        hour: hour,
        minute: minute,
        seconds: seconds
      })
    }, 100)
  },

  getUserOrderInfo: function (orderId) {
    var _this = this
    wx.request({
      url: app.server + '/order/get_user_order_info',
      data: { orderId: orderId },
      header: { 'Session-Id': app.globalData.session_id },
      method: 'POST',
      success: function (res) {
        if (res.data.status == 200) {
          _this.setData({
            orderInfo: res.data.data.order_info,
            usersInfo: res.data.data.users_info,
            remaiTime: res.data.data.order_info.remaiTime
          })
          _this.calculRemaiTime(res.data.data.order_info.remaiTime)
        } else if(res.data.status == 404) {
          app.showErrorModal('商品不存在')
        }
        else {
          if (_this.data.isRemoveLoginCache) {
            // 第一次打开页面 401状态则清除缓存
            console.log('removeLoginCache', app.globalData)
            app.removeLoginCache()
            _this.setData({
              isRemoveLoginCache: false
            })
          }
          setTimeout(function () {
            if (!app.globalData.userInfo.nickName) {
              app.getUserInfo()
            }
            _this.getUserOrderInfo(orderId)
          }, 500)

        }
      },
      fail: function (res) { },
      complete: function (res) { },
    })
  },

  // 拼单成功，获取用户优惠
  getSussceSpellInfo: function (orderId) {
    console.log('strore_orderId', orderId)
    var _this = this
    wx.request({
      url: app.server + '/order/get_sussce_spell_info',
      method: 'POST',
      data: { orderId: orderId },
      header: { 'Session-Id': app.globalData.session_id },
      success: function (res) {
        console.log('get_sussce_spell_info', res.data.data)
        _this.setData({
          SpellInfo: res.data.data
        })

      }
    })
  },


  gopay: function () {

    var url = 'pay?orderId=' + this.data.orderInfo.orderId + '&sid=' + this.data.orderInfo.storeId
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