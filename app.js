//app.js

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
              _this.globalData.uid = res.data.data.id;
              wx.setStorageSync('uid',res.data.data.id);
              _this.getUserInfo(res.data.data.id);
              if (!res.data.data.nickname || !res.data.data.head_img_url) {
                _this.getUserInfo(res.data.data.id);
              }else{
                _this.globalData.userInfo = {
                  nickname:res.data.data.nicknam,
                  head_img_url:res.data.data.head_img_url,
                };
                wx.setStorageSync('userInfo', _this.globalData.userInfo);
              }
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
    wx.getUserInfo({
      withCredentials: true,
      success: function (res){
        _this.globalData.userInfo = res.userInfo;
        wx.setStorageSync('userInfo', res.userInfo);
        wx.request({
          method: 'POST',
          url: _this.server + 'Users/SetUserInfo',
          data: {
            uid:uid,
            encryptedData: res.encryptedData,
            iv: res.iv,
            rawData: res.rawData,
            signature: res.signature
          },
          success: function (res) {}
        });
      },
      fail: function (res) { },
      complete: function (res) { },
    })
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


  // getSetting: function(){
  //   // 获取用户信息
  //   wx.getSetting({
  //     success: res => {
  //       if (res.authSetting['scope.userInfo']) {
  //         // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
  //         wx.getUserInfo({
  //           success: res => {
  //             // 可以将 res 发送给后台解码出 unionId
  //             this.globalData.userInfo = res.userInfo
  //             console.log(res.userInfo)
  //             // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
  //             // 所以此处加入 callback 以防止这种情况
  //             if (this.userInfoReadyCallback) {
  //               this.userInfoReadyCallback(res)
  //             }
  //           }
  //         })
  //       }
  //     }
  //   })
  // },
  
  server: "https://pdc.muluo.org/api/",
  cdnImg: "https://pdc.muluo.org/static/",
  globalData: {
    uid: null,
    userInfo: null
  }
})