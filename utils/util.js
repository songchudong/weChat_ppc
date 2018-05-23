const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}


const getUrlParam = (scene, name) => {
  var seg = scene.replace(/^\?/, '').split('&')
  for (var i in seg) {
    if (seg[i].indexOf(name) != -1) {
      return seg[i].split('=')[1]
    }
  }
}

const getLocalTime = time =>{
  time = time.toString();
  if (time.length > 10) time = time.substring(0, 10)
  return new Date(parseInt(time) * 1000).format("yyyy/MM/dd hh:mm:ss");
}

const promisify = fn =>{
  return function (obj = {}) {
    return new Promise((resolve, reject) => {
      obj.success = function (res) {
        resolve(res)
      }

      obj.fail = function (res) {
        reject(res)
      }
      fn(obj)//执行函数，obj为传入函数的参数
    })
  }
}

//时间格式
Date.prototype.format = function (format) {
  var o = {
    "M+": this.getMonth() + 1, //month
    "d+": this.getDate(), //day
    "h+": this.getHours(), //hour
    "m+": this.getMinutes(), //minute
    "s+": this.getSeconds(), //second
    "q+": Math.floor((this.getMonth() + 3) / 3), //quarter
    "S": this.getMilliseconds() //millisecond
  }
  if (/(y+)/.test(format)) format = format.replace(RegExp.$1,
    (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp("(" + k + ")").test(format))
      format = format.replace(RegExp.$1,
        RegExp.$1.length == 1 ? o[k] :
          ("00" + o[k]).substr(("" + o[k]).length));
  return format;
}

module.exports = {
  formatTime: formatTime,
  getUrlParam: getUrlParam,
  getLocalTime: getLocalTime,
  promisify: promisify
}


//封装Request请求方法
function httpRequst(url, method, data = {}) {
  wx.showNavigationBarLoading()
  data.method = method
  return new Promise((resove, reject) => {
    wx.request({
      url: url,
      data: data,
      header: {},
      method: method.toUpperCase(), // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      success: function (res) {
        wx.hideNavigationBarLoading()
        resove(res.data)
      },
      fail: function (msg) {
        console.log('reqest error', msg)
        wx.hideNavigationBarLoading()
        reject('fail')
      }
    })
  })
}