// pages/goods/pay.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    telNumber: null,
    userAddress: {},
    productInfo: null,
    picDomain: null,
    product_id: null,
    discount_id:null,
    orderId: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options.orderId)
    this.setData({
      telNumber: app.globalData.userInfo.telNumber,
      picDomain: app.cdnImg,
      orderId: options.orderId,
      product_id: options.product_id,
      discount_id: options.discount_id
    })
    // console.log(options)
    this.getOrderInfo(options.sid)

  },

  getOrderInfo: function (storeId) {
    var _this = this
    wx.request({
       url: app.server + 'product/GetProductInfo',
      header: { 'Session-Id': app.globalData.session_id },
      data: {
        'sid': storeId
      },
      method: 'GET',
      success: function (res) {
        _this.setData({ productInfo: res.data.data })
      }
    })
  },
  setTelNumber: function (e) {
    var _this = this
    console.log(e.detail.value.length)
    if (e.detail.value && e.detail.value.length == 11) {
      wx.request({
        url: app.server + '/set_user_tel_number',
        header: { 'Session-Id': app.globalData.session_id },
        data: {
          'telNumber': e.detail.value
        },
        method: 'POST',
        success: function (res) {
          _this.setData({
            telNumber: e.detail.value
          })
          app.globalData.userInfo.telNumber = e.detail.value
          wx.setStorageSync('userInfo', app.globalData.userInfo)
        }
      })
    }
    else {
      app.showErrorModal('请输入正确的手机号码', '手机号码有误')
      this.setData({
        telNumber: this.data.telNumber,
      });
      // console.log(this.data.telNumber)
    }
  },
  pay: function () {
    if (this.data.telNumber) {
      var _this = this
      wx.request({
        url: app.server + '/order/add_order',
        method: 'POST',
        header: { 'Session-Id': app.globalData.session_id },
        data: {
          'storeId': _this.data.storeId,
          'orderId': _this.data.orderId
        },
        success: function (res) {
          if (res.data.status == 200) {
            var orderId = res.data.orderId
            wx.requestPayment({
              'timeStamp': res.data.data.timeStamp,
              'nonceStr': res.data.data.nonceStr,
              'package': res.data.data.package,
              'signType': res.data.data.signType,
              'paySign': res.data.data.paySign,
              'success': function (res) {
                console.log('success', res)
                wx.redirectTo({
                  url: 'spell?orderId=' + orderId,
                })
              }
            })
          } else {
            app.showErrorModal(res.data.data, '支付失败')
          }
        }
      })
    }
    else {
      app.showErrorModal('用户收货地址为填写', '请完整填写手机号码')
    }

  }
})