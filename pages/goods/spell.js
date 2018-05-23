// pages/goods/spell.js
var common = require('../../utils/util.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hour: 0,
    minute: 0,
    seconds: 0,
    orderInfo: null,
    usersInfo: null,
    code_state: 0,
    picDomain: null,
    isRemoveLoginCache: true,
    remaiTime: null,
    SpellInfo: null,
    user_state: false,
    options: null,
    hiddenLoading: false,
    showModalStatus: false,
    userImage: null,
    telNumber: app.globalData.userInfo.telNumber,
    starttime: null,
    endtime: null,
    pastState: false,
    userUseState: false,
    orderState: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);

    this.getUserOrderInfo(options.order_id);

  },
  onShareAppMessage: function () {
    return {
      title: '餐餐拼',
      desc: '',
      path: '/page/goods/spell?order_id=' + _this.data.options
    }
  },
  // 倒计时
  calculRemaiTime: function (remaiTime, presentTime) {
    var _this = this, hour, minute, seconds;
    remaiTime = remaiTime - presentTime;
    setInterval(function () {
      remaiTime -= 0.1;
      hour = parseInt(remaiTime / 3600);
      minute = parseInt((remaiTime % 3600) / 60);
      seconds = (remaiTime % 60).toFixed(1);
      _this.setData({
        hour: hour < 9 ? ('0' + hour) : hour,
        minute: minute < 9 ? ('0' + minute) : minute,
        seconds: seconds
      });
    }, 100);
  },
  // 获取用户订单详情
  getUserOrderInfo: function (order_id) {
    var _this = this;
    app.post(app.server + '/Order/GetOrderInfo', { order_id: parseInt(order_id), uid: app.globalData.uid }).then((res) => {

      if (res.status) {
        var datas = res.data;
        var detail_list = res.data.detail;

        if (datas.type_id != 2) {
          if (datas.pt_endtime > datas.time) _this.calculRemaiTime(datas.pt_endtime, datas.time)
        } else {
          if (datas.activity_end_time > datas.time) _this.calculRemaiTime(datas.activity_end_time, datas.time)
        }
        var detail_curr;
        for (var i = 0; i < detail_list.length; i++) {
          if (detail_list[i].id == app.globalData.uid) {
            detail_curr = detail_list[i];
          }
        }

        if (detail_curr) {
          _this.setData({ telNumber: detail_curr.telNumber });
          if (datas.type_id == 1) {
            switch (datas.pt_status) {
              case 0:
                _this.setData({ code_state: 0 });//邀请拼团
                break;
              case 1:
                _this.setData({ code_state: 5 });//拼团失败，返回支付金额
                break;
              case 2:
                if (detail_curr['status'] == 1) {
                  _this.setData({ code_state: 4 });//拼团订单过期
                }
                else if (detail_curr['status'] == 2) {
                  _this.setData({ code_state: 9 });//拼团订单已使用
                } else {
                  if (datas.pt_endtime < datas.time) {
                    _this.setData({ code_state: 3 });//拼团成功,显示优惠卷
                  }
                  else {
                    _this.setData({ code_state: 2 });//邀请拼团,拼团成功,可以继续拼团
                  }
                }
                break;
            }
          }
          else if (datas.type_id == 2) {
            switch (datas.pt_status) {
              case 0:
                _this.setData({ code_state: 0 });//邀请拼团
                break;
              case 1:
                _this.setData({ code_state: 5 });//拼团失败，返回支付金额
                break;
              case 2:
                if (datas.activity_status == 0) {
                  _this.setData({ code_state: 6 });//拼团成功，等待抽奖
                } else {
                  if (detail_curr['award'] == 1) {
                    if (detail_curr['status'] == 1) {
                      _this.setData({ code_state: 4 });//拼团订单过期
                    }
                    else if (detail_curr['status'] == 2) {
                      _this.setData({ code_state: 9 });//拼团订单已使用
                    } else {
                      _this.setData({ code_state: 8 });//拼团中奖
                    }
                  }
                  else {
                    _this.setData({ code_state: 7 });//拼团抽奖失败
                  }
                }
                break;
            }
          }
        }
        else {
          if (datas.type_id == 1) {
            if (datas.time < datas.pt_endtime) {
              _this.setData({ code_state: 1 });//我要参团
            }
          }
          else if (datas.type_id == 2) {
            if (detail_list.length < datas.cluster_count) {
              _this.setData({ code_state: 1 });//我要参团
            }
            else {
              _this.setData({ code_state: 6 });//拼团成功，等待抽奖
            }
          }
        }
        datas.numbers = (datas.cluster_count - datas.detail.length);
        _this.setData({
          hiddenLoading: true,
          orderInfo: datas,
          usersInfo: datas.detail,
          starttime: common.getLocalTime(datas.pt_endtime),
          endtime: common.getLocalTime(datas.endtime),
          picDomain: app.cdnImg + datas.ico,
          options: order_id
        });
      } else {
        app.removeLoginCache();
      }
    }).catch((errMsg) => {

    });
  },
  // 参团
  gopay: function () {
    var url = 'pay?order_id=' + this.data.orderInfo.id;
    wx.navigateTo({
      url: url,
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  goHome: function () {
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
  shareFun: function (e) {
    var _this = this
    // 显示
    if (e.target.dataset.state == 'open') {
      this.setData({
        showModalStatus: true
      });
      if (_this.data.userImage == null) {
        _this.setData({ hiddenLoading: false });
        wx.request({
          url: app.server + 'Qrcode/create',
          data: { uid: app.globalData.uid, order_id: _this.data.options },
          method: 'GET',
          dataType: 'json',
          responseType: 'text',
          success: function (res) {
            if (res.statusCode == 200) {
              var imgUrl = res.data.data;
              _this.setData({
                userImage: imgUrl,
                hiddenLoading: true
              });
            }
          }
        });
      } else {
        _this.setData({ hiddenLoading: true });
      }
    } else {
      this.setData({
        showModalStatus: false
      });
    }
  },
  saveImg: function (e) {
    var _this = this;
    wx.downloadFile({
      url: _this.data.userImage,
      success: function (res) {
        console.log(res.tempFilePath);
        if (res.statusCode == 200) {
          wx.getSetting({
            success(ress) {
              if (!ress.authSetting['scope.writePhotosAlbum']) {
                wx.authorize({
                  scope: 'scope.writePhotosAlbum',
                  success() {
                    wx.saveImageToPhotosAlbum({
                      filePath: res.tempFilePath,
                      success: function (data) {
                        console.log(data);
                      }
                    })
                  }
                })
              } else {
                wx.saveImageToPhotosAlbum({
                  filePath: res.tempFilePath,
                  success: function (data) {
                    console.log(data);
                  }
                })
              }
            }
          })
        }
      },
      fail: function (err) {
        console.log(err);
      }
    });
  },
})