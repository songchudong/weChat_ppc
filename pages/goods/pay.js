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
    orderInfo:null,
    picDomain: null,
    product_id: null,
    discount_id:null,
    order_id: null,
    hiddenLoading:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    if (options.order_id != undefined){
      this.getUserOrderInfo(options.order_id);
      this.setData({
        picDomain: app.cdnImg,
        order_id: options.order_id
      })
    }else{
      this.getOrderInfo(options.product_id,options.discount_id);
      this.setData({
        uid: app.globalData.uid,
        telNumber: app.globalData.userInfo.telNumber,
        product_id: options.product_id,
        discount_id: options.discount_id,
        picDomain: app.cdnImg,
      });
    }
  },

  // 获取订单信息
  getOrderInfo: function(product_id,discount_id) {
    var _this = this
    wx.request({
      url: app.server + '/product/GetProductInfo',
      data: { 'product_id': product_id, 'discount_id': discount_id },
      header: {},
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        console.log(res)
        _this.setData({
          productInfo: res.data.data,
          hiddenLoading:false
        });
      }
    })
  },
  // 设置电话号码
  setTelNumber: function (e) {
    var _this = this
    if (e.detail.value && e.detail.value.length == 11) {
      wx.request({
        url: app.server + '/Users/SetUserPhone',
        data: {
          'uid': _this.data.uid,
          'telNumber': e.detail.value
        },
        method: 'POST',
        success: function (res) {
          _this.setData({
            telNumber: e.detail.value
          });
          app.globalData.userInfo.telNumber = e.detail.value;
          wx.setStorageSync('userInfo', app.globalData.userInfo);
        }
      })
    }else {
      app.showErrorModal('请输入正确的手机号码','手机号码有误')
      this.setData({
        telNumber: this.data.telNumber,
      });
    }
  },
  getUserOrderInfo: function (order_id) {
    var _this = this
    wx.request({
      url: app.server + '/Order/GetOrderInfo',
      data: { order_id: parseInt(order_id) },
      method: 'POST',
      success: function (res) {
        if (res.statusCode == 200) {
          _this.setData({
            hiddenLoading: false,
            productInfo: {
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
              time: res.data.data.time,
              orderUser: res.data.data.user_id,
              loginUser: app.globalData.uid
            },
            usersInfo: res.data.data.detail
          });
        } else {
          app.removeLoginCache();
        }
      }
    })
  },
  // 个人购买
  pay: function () {
    console.log(this.data.telNumber);
    if (this.data.telNumber != '' && this.data.telNumber.length == 11) {
        if (this.data.order_id == null) {
          var _this = this
          wx.request({
            url: app.server + '/Order/AddOrder',
            method: 'POST',
            data: {
              'userid': app.globalData.uid,
              'product_id': _this.data.product_id,
              'discount_id': _this.data.discount_id
            },
            success: function (res) {
              console.log(res.data.data.order_id);
              _this.setData({
                order_id: res.data.data.order_id
              });
              console.log(res);
              if (res.statusCode == '200') {
                if(!res.data.data.status){
                  app.showErrorModal(res.data.data.msg, '支付失败');
                }
                wx.requestPayment({
                  'timeStamp': res.data.data.timeStamp + '',
                  'nonceStr': res.data.data.nonceStr,
                  'package': res.data.data.package,
                  'signType': res.data.data.signType,
                  'paySign': res.data.data.paySign,
                  'success': function (ress) {
                    console.log(ress)
                    
                    wx.redirectTo({
                      url: 'spell?order_id=' + _this.data.order_id
                    })
                  }
                })
              } else {
                app.showErrorModal(res.data.data, '支付失败');
              }
            }
          })
        }else{
          this.getSpell(this.data.order_id);
        }
      }else {
        app.showErrorModal('请完整填写手机号码','手机号码格式错误');
      }
  },

  // 参团购买
  getSpell: function (order_id) {
    var _this = this;
    wx.request({
      url: app.server + '/Order/AddUserOrder',
      method: 'POST',
      data: {
        order_id: order_id,
        userid: app.globalData.uid
      },
      success: function (res) {
        console.log(res);
        if (res.statusCode == '200') {
          wx.requestPayment({
            'timeStamp': res.data.data.timeStamp + '',
            'nonceStr': res.data.data.nonceStr,
            'package': res.data.data.package,
            'signType': res.data.data.signType,
            'paySign': res.data.data.paySign,
            'success': function (ress) {
              console.log(ress)
              wx.redirectTo({
                url: 'spell?order_id=' + _this.data.order_id,
              })
            }
          })
        } else {
          app.showErrorModal(res.data.data, '支付失败')
        }
      }
    })
  },
})