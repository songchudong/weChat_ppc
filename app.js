//app.js
const utils = require('./utils/util.js')
App({
  // 生命周期_小程序加载初始化
  onLaunch: function () {
    // 展示本地存储
    this.globalData.uid = wx.getStorageSync('uid')
    this.globalData.userInfo = wx.getStorageSync('userInfo')
    if (!this.globalData.uid || !this.globalData.userInfo) {
      this.getLogin();
    }
  },
  //清除登录状态
  removeLoginCache: function () {
    wx.removeStorageSync('uid')
    this.globalData.uid = '';
    this.getLogin();
  },
  // 授权微信登录
  getLogin: function () {
    wx.login({
      success: res => {
        if (res.code) {
          var _this = this;
          wx.request({
            url: this.server + "Users/GetWxLogin?code=" + res.code,
            success: function (res) {
              console.log(res,'是否授权');
              _this.globalData.uid = res.data.data.id;
              wx.setStorageSync('uid',res.data.data.id);
            }
          });
        } else {
          console.log('获取用户登录态失败！' + res.errMsg);
        }
      }
    });
  },
  // 获取用户信息(uid用户)
  getUserInfo: function (uid){
    var _this = this;
    wx.getSetting({
      success:function(res){
        wx.getUserInfo({
          withCredentials: true,
          success: function (res) {
            console.log(res)
            _this.globalData.userInfo = res.userInfo;
            wx.setStorageSync('userInfo', res.userInfo);
            wx.request({
              method: 'POST',
              url: _this.server + 'Users/SetUserInfo',
              data: {
                uid: uid,
                encryptedData: res.encryptedData,
                iv: res.iv,
                rawData: res.rawData,
                signature: res.signature
              },
              success: function (res) { 
                console.log(res)
              }
            });
          },
          fail: function (res) {
            console.log(res);
          },
          complete: function (res) { },
        })
      }
    });
  },
  // 显示错误模块
  showErrorModal: function (content, title) {
    wx.showModal({
      title: title || '加载失败',
      content: content || '未知错误',
      confirmColor: "#1f7bff",
      showCancel: false
    });
  },
  /**
   * 支付请求
   * 微信支付请求二次封装
   * @param {string} obj.timeStamp  时间戳
   * @param {string} obj.nonceStr  随机串
   * @param {string} obj.package  数据包
   * @param {string} obj.signType  签名方式
   * @param {string} obj.paySign 签名
   * @param {object} fn 成功后的回调
   * @return null
   */
  paymentWx: function (obj,fn){
    wx.requestPayment({
      'timeStamp': obj.timeStamp,
      'nonceStr': obj.nonceStr,
      'package': obj.package,
      'signType': obj.signType,
      'paySign': obj.paySign,
      'success': function (ress) {fn()}
    })
  },
  request:function(){

  },
  post: function (url, data) {
    var promise = new Promise((resolve, reject) => {
      //init
      var that = this;
      var postData = data;
      /*
      //自动添加签名字段到postData，makeSign(obj)是一个自定义的生成签名字符串的函数
      postData.signature = that.makeSign(postData);
      */
      //网络请求
      wx.request({
        url: url,
        data: postData,
        method: 'POST',
        header: { 'content-type': 'application/x-www-form-urlencoded' },
        success: function (res) {
          console.log(res,'post');
          //服务器返回数据
          if (res.data.status == true) {
            resolve(res.data);
          } else {
            //返回错误提示信息
            reject(res.data.msg);
          }
        },
        error: function (e) {
          reject('网络出错');
        }
      })
    });
    return promise;
  },
  server: "https://pdc.muluo.org/api/",
  cdnImg: "https://pdc.muluo.org/static/",
  globalData: {
    uid: null,
    userInfo: null
  },
  utils
})