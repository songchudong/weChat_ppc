//app.js
App({
  onLaunch: function () {
    // 展示本地存储能力
    this.globalData.session_id = wx.getStorageSync('session_id')
    this.globalData.userInfo = wx.getStorageSync('userInfo')
    if (!this.globalData.session_id || !this.globalData.userInfo) {
      console.log("登录")
      // 登录
      this.getLogin()
    }
  },
  //清除登录缓存
  removeLoginCache: function () {
    wx.removeStorageSync('session_id')
    this.globalData.session_id = ''
    // 重新登录
    console.log("重新登录")
    this.getLogin()
  },

  getLogin: function () {
    wx.login({
      success: res => {
        if (res.code) {
          var _this = this;
          wx.request({
            url: this.server + "/login_by_wechat?code=" + res.code,
            success: function (res) {
              _this.globalData.session_id = res.data.data.session_id
              wx.setStorageSync('session_id', res.data.data.session_id)
              if (!res.data.data.user_info || !res.data.data.user_info.avatarUrl) {
                _this.getUserInfo()
              } else {
                _this.globalData.userInfo = res.data.data.user_info
                wx.setStorageSync('userInfo', res.data.data.user_info)
              }

            }
          });
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      }
    })
  },

  getUserInfo: function () {
    var _this = this
    wx.getUserInfo({
      withCredentials: true,
      success: function (res) {
        _this.globalData.userInfo = res.userInfo
        wx.setStorageSync('userInfo', res.userInfo)

        wx.request({
          method: 'POST',
          url: _this.server + '/set_user_info',
          header: { 'Session-Id': _this.globalData.session_id },
          data: {
            encryptedData: res.encryptedData,
            iv: res.iv,
            rawData: res.rawData,
            signature: res.signature
          },
          success: function (res) {
          }
        });
      },
      fail: function (res) { },
      complete: function (res) { },
    })
  },

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
    session_id: null,
    userInfo: null
  }

})