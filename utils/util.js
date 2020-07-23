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

const deepClone = obj => {
  let objClone = Array.isArray(obj) ? [] : {};
  if (obj && typeof obj === "object") {
    for (let attr in obj) {
      if (obj.hasOwnProperty(attr)) {
        //判断ojb子元素是否为对象，如果是，递归复制
        if (obj[attr] && typeof obj[attr] === "object") {
          objClone[attr] = deepClone(obj[attr]);
        } else {
          //如果不是，简单复制
          objClone[attr] = obj[attr];
        }
      }
    }
  }
  return objClone;
}

module.exports = {
  formatTime: formatTime,
  deepClone: deepClone,
}
