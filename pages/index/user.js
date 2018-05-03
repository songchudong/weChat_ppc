// pages/index/user.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    orderlist: [],
    picDomain: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      userInfo: app.globalData.userInfo,
      picDomain: app.cdnImg
    })

    
  },

  onShow: function(){
    this.getUserOrderList()

  },


  getUserOrderList: function () {
    var _this = this
    wx.request({
      url: app.server + '/order/get_user_order_list',
      header: { 'Session-Id': app.globalData.session_id },
      method: 'POST',
      success: function (res) {
        console.log(res)
        if (res.data.data) {
          _this.setData({
            orderlist: res.data.data
          })
        }
        console.log(res.data.data)
      },
      fail: function (res) { },
      complete: function (res) { 
        wx.stopPullDownRefresh() //停止下拉刷新
        wx.hideNavigationBarLoading() //完成停止加载
      },
    })

  },


  onPullDownRefresh: function () {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    this.getUserOrderList()
  }



})