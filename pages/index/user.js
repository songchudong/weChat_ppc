// pages/index/user.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    orderlist: [],
    picDomain: null,
    checked:0,
    hiddenLoading:false,
  },
  // 生命周期函数--监听页面加载
  onLoad: function (options) {
    console.log(app.globalData.userInfo);
    this.setData({
      userInfo: app.globalData.userInfo,
      picDomain: app.cdnImg
    })
  },
  onShow: function(){
    this.getUserOrderList(this.data.checked);
  },
  // 获取用户订单列表
  getUserOrderList: function (item) {
    var _this = this;
    wx.request({
      url: app.server + '/Order/GetOrderList',
      data: {
        userid: app.globalData.uid,
        status:item
      },
      method: 'POST',
      success: function (res) {
        if (res.data.data) {
          _this.setData({
            orderlist: res.data.data,
            hiddenLoading: true
          })
        }
      },
      fail: function (res) { },
      complete: function (res) { 
        wx.stopPullDownRefresh() //停止下拉刷新
        wx.hideNavigationBarLoading() //完成停止加载
      },
    })

  },
  // 选项卡事件
  switchType:function(e){
    this.setData({
      checked: parseInt(e.target.id),
      hiddenLoading:false
    });
    this.getUserOrderList(parseInt(e.target.id));

  },
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    this.getUserOrderList(this.data.checked);
  }
});