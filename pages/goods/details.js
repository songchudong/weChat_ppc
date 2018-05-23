// pages/goods/details.js
const app = getApp()
const util = require('../../utils/util')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrl: null,
    picDomain: null,
    productInfo:{},
    product_id: null,
    discount_id:null,
    hiddenLoading: false,
    showModalStatus: false,
    viewHeight:'200',
    userImage:null,
    systemInfo:{
      canvasWidth:0,
      canvasHeight:0
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.removeStorageSync('uid')
    app.globalData.uid = '';
    
    if (!app.globalData.uid || !app.globalData.userInfo) {
        app.getLogin();
    }
    var product_id, discount_id, activity_id;
    if (options.scene) {
      // 二维码扫描
      var scene = decodeURIComponent(options.scene)
      console.log(scene)
      product_id = util.getUrlParam(scene, 'product_id');
      discount_id = util.getUrlParam(scene, 'discount_id');
    } else {
      product_id = options.product_id;
      discount_id = options.discount_id;
    }

    this.setData({
      product_id: product_id,
      discount_id: discount_id,
      picDomain: app.cdnImg
    })
    this.getProductInfo(product_id, discount_id);
  },

  onShareAppMessage: function () {
    return {
      title: '餐餐拼',
      desc: '',
      path: '/goods/details?product_id=' + _this.data.product_id + '&discount_id=' + _this.data.discount_id
    }
  },
  // 获取产品信息
  getProductInfo: function (product_id, discount_id){
    var _this = this;
    wx.request({
      url: app.server + 'product/GetProductInfo',
      data: { product_id: product_id,discount_id:discount_id },
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        _this.setData({
          hiddenLoading:true,
          productInfo: res.data.data
        });
        console.log(res)
      }
    })
  },
  
  // 图片自动适应
  imageLoad:function(e){
    var res = wx.getSystemInfoSync();
    var imgwidth = e.detail.width,
      imgheight = e.detail.height,
      ratio = imgwidth / imgheight;
      this.setData({
        viewHeight: res.windowWidth / ratio
      })  
        //计算的高度值,设置高度
  },
  shareFun: function (e) {
    console.log(e);
    var _this = this
    // 显示
    if (e.target.dataset.state == 'open') {
      this.setData({
        showModalStatus: true
      });
      if (_this.data.userImage == null){
        _this.setData({ hiddenLoading:false });
        wx.request({
          url: app.server + 'Qrcode/create',
          data: { uid: app.globalData.uid, product_id: _this.data.product_id },
          method: 'GET',
          dataType: 'json',
          header: {
            'content-type': 'application/octet-stream',
          },
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
      }else{
        _this.setData({hiddenLoading: true});
      }
    } else {
      this.setData({
        showModalStatus: false
      });
    }
  },
  saveImg: function(e){
    var _this = this;
    wx.downloadFile({
      url:_this.data.userImage,
      success: function (res) {
        console.log(res.tempFilePath);
        if (res.statusCode == 200){
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
              }else{
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
      fail:function(err){
        console.log(err);
      }
    });
  },
  close_share:function(e){
  }
})