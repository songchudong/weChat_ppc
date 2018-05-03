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
    productInfo: {},
    product_id: null,
    discount_id:null,
    showModalStatus: false,
    viewHeight:'200',
    width:'300'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  	var product_id;
  	var discount_id; 
    if (options.scene) {
      // 二维码扫描
      var scene = decodeURIComponent(options.scene)
      console.log(scene)
      product_id = util.getUrlParam(scene, 'product_id');
      discount_id = util.getUrlParam(scene, 'discount_id')
    } else {
      product_id = options.product_id;
      discount_id = options.discount_id;
    }

    this.setData({
      product_id: product_id,
      discount_id: discount_id,
      picDomain: app.cdnImg
    })
    this.getProductInfo(product_id,discount_id)

  },

  share: function () {

  },
  onShareAppMessage: function () {
    // console.log('02101')
    // return {
    //   title: '微信小程序联盟',
    //   desc: '最具人气的小程序开发联盟!',
    //   path: '/page/user?id=123'
    // }
  },
  // 获取产品信息
  getProductInfo: function (product_id,discount_id) {
    var _this = this
    wx.request({
      url: app.server + 'product/GetProductInfo',
      data: { product_id: product_id,discount_id:discount_id },
      header: {},
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        _this.setData({
          productInfo: res.data.data
        });
      }
    })

  },
  imageLoad:function(e){
    const imgwidth = e.detail.width,
          imgheight = e.detail.height,
          ratio = imgwidth / imgheight;
        //计算的高度值,设置高度
        this.setData({
          viewHeight: 750 / ratio
        })
  },
  shareFun: function (e) {
    var _this = this
    var currentStatu = e.currentTarget.dataset.statu;
    // 显示
    if (currentStatu == "open") {

      wx.request({
        url: app.server + '/get_qrcode',
        data: {
          scene: 'sid=' + this.data.sid,
          page: 'pages/goods/details'
        },
        header: { 'Session-Id': app.globalData.session_id },
        method: 'POST',
        success: function (res) {
          console.log(app.cdnImg + '/' + res.data.data)
          _this.setData({ imgUrl: app.cdnImg + '/' + res.data.data })
        }
      })


      this.setData({
        showModalStatus: true
      });
    }
    //关闭
    else {
      this.setData({
        showModalStatus: false
      });
    }
  },

  saveImg: function(e){
    console.log(e.currentTarget.dataset.imgurl)
    wx.downloadFile({
      url: e.currentTarget.dataset.imgurl,
      success: function (res) {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: function (res) {
          },
          fail: function (res) {
          }
        })
      },
      fail: function (res) {
        console.log('fail', res)
      }
    })  
  }

})