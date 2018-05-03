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

module.exports = {
  formatTime: formatTime,
  getUrlParam: getUrlParam
}
