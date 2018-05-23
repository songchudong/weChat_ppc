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
    orderInfo: null,
    picDomain: null,
    product_id: null,
    discount_id: null,
    activity_id: null,
    order_id: null,
    hiddenLoading: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.onLaunch();
    if (options.order_id != undefined) {
      this.getUserOrderInfo(options.order_id);     
    } else {
      this.getProductInfo(options);
    }
  },
  // 获取产品信息
  getProductInfo: function (options) {
    var _this = this;
    app.post(app.server + 'product/GetProductInfo', { 
      'product_id': options.product_id, 
      'discount_id': options.discount_id 
    }).then((res) => {
      _this.setData({
        productInfo: res.data,
        hiddenLoading: true,       
        product_id: options.product_id,
        discount_id: options.discount_id,     
        picDomain: app.cdnImg+res.data.ico,
      });
      if(options.activity_id)
      {
        _this.setData({
          activity_id: options.activity_id,
        });
      }
    }).catch((errMsg) => {
    });  
  },
  // 设置电话号码
  setTelNumber: function (e) {
    var _this = this
    if (e.detail.value && e.detail.value.length == 11) {
      this.setData({
        telNumber: e.detail.value
      });
    } else {
      app.showErrorModal('请输入正确的手机号码', '手机号码有误')
      this.setData({
        telNumber: '',
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
            picDomain: app.cdnImg + res.data.data.ico,
            hiddenLoading: true,
            order_id: order_id,
            productInfo: res.data.data
          });
        } else {
          app.removeLoginCache();
        }
      }
    })
  },
  // 个人购买
  pay: function () {
    app.getUserInfo(app.globalData.uid);
    console.log(this.data.telNumber);
    if (this.data.telNumber != null && this.data.telNumber.length == 11) {
      console.log(app.globalData.uid);
      if (app.globalData.uid)
      {
        //设置手机号码
        app.post(app.server + '/Users/SetUserPhone', { 
          'uid': app.globalData.uid, 
          'telNumber': this.data.telNumber 
          }).then((res) => 
        {
          app.globalData.userInfo.telNumber = this.data.telNumber;
          wx.setStorageSync('userInfo', app.globalData.userInfo);

          if (this.data.order_id == null) {
            var _this = this, obj = '';
            this.setData({
              'order_id': null
            });

            obj = {
              'userid': app.globalData.uid,
              'product_id': _this.data.product_id,
              'discount_id': _this.data.discount_id
            }
            if (_this.data.activity_id != null) {
              obj.activity_id = _this.data.activity_id;
            }
            //添加订单
            app.post(app.server + '/Order/AddOrder', obj).then((res_add) =>{
              console.log(res_add, 'test');
              if (!res_add.status) {
                app.showErrorModal(res_add.data.msg, '支付失败');
                return false;
              }
              _this.setData({
                order_id: res_add.data.order_id
              });
              
              wx.requestPayment({
                'timeStamp': res_add.data.timeStamp + '',
                'nonceStr': res_add.data.nonceStr,
                'package': res_add.data.package,
                'signType': res_add.data.signType,
                'paySign': res_add.data.paySign,
                'success': function (ress) {
                  wx.redirectTo({
                    url: 'spell?order_id=' + _this.data.order_id
                  })
                }
              })
             
            }).catch((errMsg) => {
              console.log(errMsg,'error');
              app.showErrorModal(errMsg, '操作失败');
            });           
          } else {
            this.getSpell(this.data.order_id);
          }
        }).catch((errMsg) => {
          app.showErrorModal('设置手机号码失败', '设置手机号码失败');
        });
      }
      else{
        app.showErrorModal('用户id获取错误', '用户id获取错误');
      }
    } else {
      app.showErrorModal('请完整填写手机号码', '手机号码格式错误');
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
          app.showErrorModal(res.data.data, '支付失败');
        }
      }
    })
  },
})