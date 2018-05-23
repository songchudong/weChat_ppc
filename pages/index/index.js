//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    isFirst: true,
    picDomain: null,
    hiddenLoading:false,
    userInfo: {},
    storeList: [],
    tipsView:false
  },
  onLoad: function () {
    this.setData({
      picDomain: app.cdnImg
    })
    this.getProductList()
  },
  goAd:function (e) {
    wx.navigateTo({
      url: '../goods/details',
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { }
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
              hiddenLoading: true
            });
          }
          setTimeout(function () { _this.getStoreList() }, 500)
        }
        else {
          _this.setData({
            productList: res.data.data,
            hiddenLoading: true
          })
        }
      },
      complete: function (res) {
        wx.stopPullDownRefresh() //停止下拉刷新
        wx.hideNavigationBarLoading() //完成停止加载
      },
    })
  },
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    this.getProductList()
  },
  opentips:function(e){
    console.log(e);
    if (e.currentTarget.dataset.type == 'open'){
      this.setData({
        tipsView:true
      })
    }else{
      this.setData({
        tipsView: false
      })
    }
  }
})
