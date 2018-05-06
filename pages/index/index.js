//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    isFirst: true,
    picDomain: null,
    hiddenLoading:true,
    userInfo: {},
    storeList: [],
    gdImgUrls: [
      { url: app.cdnImg + '/static/img/0.jpg', id: '1' },
      { url: app.cdnImg + '/static/img/1.jpg', id: '1' },
      { url: app.cdnImg + '/static/img/2.jpg', id: '1' },
      { url: app.cdnImg + '/static/img/3.jpg', id: '1' }]
  },

  onLoad: function () {
    this.setData({
      picDomain: app.cdnImg
    })
    this.getProductList()
  },

  goAd: function (e) {
    wx.navigateTo({
      url: '../goods/details',
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },


  getProductList: function () {
    var _this = this
    wx.request({
      url: app.server + 'product/GetProductList',
      data: '',
      header: { 'Session-Id': app.globalData.session_id },
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        if (res.data.status == 401) {
          if (_this.data.isFirst) {
            // 第一次打开页面 401状态则清除缓存
            console.log('removeLoginCache', app.globalData)
            app.removeLoginCache()
            _this.setData({
              isFirst: false,
              hiddenLoading:false
            });
          }
          setTimeout(function () { _this.getStoreList() }, 500)
        }
        else {
          _this.setData({
            productList: res.data.data,
            hiddenLoading:false
          })
        }
      },
      complete: function (res) {
        wx.stopPullDownRefresh() //停止下拉刷新
        wx.hideNavigationBarLoading() //完成停止加载
      },
    })
  },

  onShareAppMessage: function () {

  },

  onPullDownRefresh: function () {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    this.getProductList()
  }


})
