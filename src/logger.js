/**
 @Author: Bruce.wan
 @CreateTime: 2020/11/27 11:22
 @Description:
 */
/**
 * localstorage相关方法
 * @type {{removeItem: loggerLocalStorage.removeItem, getItem: (function(*=): string), setItem: loggerLocalStorage.setItem}}
 */
const axios = require('axios')
// import axios from 'axios'
const loggerLocalStorage = {
  setItem: function (key, value) {
    window.localStorage.removeItem(key)
    //
    window.localStorage.setItem(key, value)
  },
  getItem: function (key) {
    return window.localStorage.getItem(key)
  },
  removeItem: function (key) {
    window.localStorage.removeItem(key)
  }
}

/**
 * 页面卸载前监听方法，有些浏览器需要用户对页面进行过操作之后才有效，
 * @param callback 回调
 */
function beforeunload(callback) {
  window.onbeforeunload = function (e) {
    if (callback) {
      callback()
    }
    //
    e = e || window.event;

    // 兼容IE8和Firefox 4之前的版本
    if (e) {
      e.returnValue = '关闭提示';
    }

    // Chrome, Safari, Firefox 4+, Opera 12+ , IE 9+
    return '关闭提示';
  }
}
// 生成uuid
function generateUuid() {
  const s = []
  const hexDigits = '0123456789abcdef'
  for (let i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
  }
  // bits 12-15 of the time_hi_and_version field to 0010
  s[14] = '4'
  // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1)
  s[8] = s[13] = s[18] = s[23] = '-'

  return s.join('')
}
/**
 * 合并两个对象
 * @param target 用来合并的对象
 * @param source 要合并的对象源
 * @returns {{}|*} 合并后的返回值
 */
function objectMerge(target, source) {
  //
  if (typeof target !== 'object') {
    target = {}
  }
  if (Array.isArray(source)) {
    return source.slice()
  }
  //
  const keys = []
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      keys.push(key)
    }
  }
  keys.forEach((property) => {
    const sourceProperty = source[property]
    if (typeof sourceProperty === 'object') {
      target[property] = objectMerge(target[property], sourceProperty)
    } else {
      if (sourceProperty !== undefined) {
        target[property] = sourceProperty
      }
    }
  })
  return target
}

/**
 * 计算字符串的字节数
 * @param str 要计算的字符串
 * @param charset 编码
 * @returns {number} 字符串的总字节数
 */
function getStrSize (str, charset) {
  if (!str) {return 0}
  //
  let total = 0;
  let charCode;
  charset = charset ? charset.toLowerCase() : '';
  //
  if (charset === 'utf-16' || charset === 'utf16') {
    for (let i = 0, len = str.length; i < len; i++) {
      charCode = str.charCodeAt(i);
      if (charCode <= 0xffff) {
        total += 2;
      } else {
        total += 4;
      }
    }
  } else {
    for (let i = 0, len = str.length; i < len; i++) {
      charCode = str.charCodeAt(i);
      if (charCode <= 0x007f) {
        total += 1;
      } else if (charCode <= 0x07ff) {
        total += 2;
      } else if (charCode <= 0xffff) {
        total += 3;
      } else {
        total += 4;
      }
    }
  }
  //
  return total;
}
/**
 * 日志构造函数
 * @constructor
 */
function Logger(options) {
  /**
   * 常量
   * @type {string}
   */
  // log的对应需要保存的级别
  this.LOG_TYPE = 'logType';
  // 保存到localstorage里面的字段名
  this.K2_LOGGER = 'k2Logger';
  //
  this.options = options
  // 日志基本信息
  this.baseInfo = {}
  this.loggerList = [];
  //
  const logType = loggerLocalStorage.getItem(this.LOG_TYPE) ||  this.options.logType;
  if (logType === 'off' || !logType) {
    return false;
  }
  //
  if (this.options.listenJsError) {
    this.baseErrorHandler();
  }
  //
  if (this.options.listenPromiseError) {
    this.promiseErrorHandler();
  }
  // 监听页面关闭
  if (this.options.listenBeforeUnload) {
    beforeunload(() => {
      this.saveLogger();
    })
  }
  //
  if (this.options.autoSave) {
    this.autoSaveLogger();
  }
  //
  if (loggerLocalStorage.getItem(this.LOG_TYPE) === 'clear') {
    loggerLocalStorage.removeItem(this.LOG_TYPE);
  }
  //
  this.handleHistoryLog()
}
/**
 * 一般异常处理
 */
Logger.prototype.baseErrorHandler = function () {
  /**
   * @param {String}  e    错误信息
   */
  if (window.addEventListener) {
    window.addEventListener('error',(e) => {
      let item = null
      if (e.message) {
        //
        let temMessage = null;
        if (this.options.listenStackRecord) {
          temMessage = {
            id: generateUuid(),
            logLevel: 'error',
            logCreateDate: new Date(),
            url: window.location.href,
            message:{
              sign: 'networkErrorHandler',
              // 错误对象
              error: e.error,
              // 错误信息
              message: e.message,
              // 错误行号
              lineno: e.lineno,
              // 错误列号
              colno: e.colno,
              // 错误文件名
              filename: e.filename
            }
          }
        } else {
          temMessage = {
            id: generateUuid(),
            logLevel: 'error',
            logCreateDate: new Date(),
            url: window.location.href,
            message:{
              sign: 'networkErrorHandler',
              // 错误信息
              message: e.message,
              // 错误行号
              lineno: e.lineno,
              // 错误列号
              colno: e.colno
            }
          }
        }
        //
        item = Object.assign({}, this.baseInfo, temMessage)
      } else {
        item = Object.assign({}, this.baseInfo, {
          id: generateUuid(),
          logLevel: 'error',
          logCreateDate: new Date(),
          url: window.location.href,
          message: {
            sign: 'networkErrorHandler',
            message: e.type
          }
        })
      }
      //
      this.loggerList.push(item);
      //
      if (this.options.saveToLocalstorage) {
        //
        this.setLogToStorage();
      }
      //
      return true;
    }, true)
  } else {
    window.onerror = (message, filename, lineno, colno, error) => {
      let item = null;
      if (message) {
        //
        let temMessage = null;
        if (this.options.listenStackRecord) {
          temMessage = {
            id: generateUuid(),
            logLevel: 'error',
            logCreateDate: new Date(),
            url: window.location.href,
            message:{
              sign: 'networkErrorHandler',
              // 错误对象
              error: error,
              // 错误信息
              message: message,
              // 错误行号
              lineno: lineno,
              // 错误列号
              colno: colno,
              // 错误文件名
              filename: filename
            }
          }
        } else {
          temMessage = {
            id: generateUuid(),
            logLevel: 'error',
            logCreateDate: new Date(),
            url: window.location.href,
            message:{
              sign: 'networkErrorHandler',
              // 错误信息
              message: message,
              // 错误行号
              lineno: lineno,
              // 错误列号
              colno: colno,
              // 错误文件名
              filename: filename
            }
          }
        }
        item = Object.assign({}, this.baseInfo, temMessage)
      } else {
        item = Object.assign({}, this.baseInfo, {
          id: generateUuid(),
          logLevel: 'error',
          logCreateDate: new Date(),
          url: window.location.href,
          message: {
            sign: 'networkErrorHandler',
            message: ''
          }
        });
      }
      //
      this.loggerList.push(item);
      //
      if (this.options.saveToLocalstorage) {
        this.setLogToStorage();
      }
      //
      return true;
    }
  }
};
/**
 * promise异常处理
 */
Logger.prototype.promiseErrorHandler = function () {
  /**
   * @param {String}  e    错误信息
   */
  window.addEventListener("unhandledrejection", (e) => {
    e.preventDefault()
    console.log('unhandledrejection is running...');
    console.log(e.reason);
    const item = Object.assign({}, this.baseInfo, {
      id: generateUuid(),
      logLevel: 'error',
      logCreateDate: new Date(),
      url: window.location.href,
      message: {
        sign: 'promiseErrorHandler',
        message: e.reason
      }
    })
    this.loggerList.push(item);
    //
    if (this.options.saveToLocalstorage) {
      this.setLogToStorage();
    }
    //
    return true;
  });
};
/**
 * 新增日志
 * @param item 日志内容
 */
Logger.prototype.send = function (item) {
  const tempItem = Object.assign({}, this.baseInfo, item);
  if (!tempItem.logCreateDate) {
    tempItem.logCreateDate = new Date();
  }
  this.loggerList.push(tempItem)
  //
  if (this.options.saveToLocalstorage) {
    this.setLogToStorage()
  }
};
/**
 * 新增debug级别的日志
 * @param item
 */
Logger.prototype.debug = function (item) {
  const tempItem = Object.assign({}, this.baseInfo, item);
  tempItem.logLevel = 'debug';
  if (!tempItem.logCreateDate) {
    tempItem.logCreateDate = new Date();
  }
  this.loggerList.push(tempItem)
  //
  if (this.options.saveToLocalstorage) {
    this.setLogToStorage()
  }
};
/**
 * 新增信息级别的日志
 * @param item
 */
Logger.prototype.info = function (item) {
  const tempItem = Object.assign({}, this.baseInfo, item);
  tempItem.logLevel = 'info';
  if (!tempItem.logCreateDate) {
    tempItem.logCreateDate = new Date();
  }
  this.loggerList.push(tempItem)
  //
  if (this.options.saveToLocalstorage) {
    this.setLogToStorage()
  }
}
/**
 * 新增警告级别的日志
 * @param item
 */
Logger.prototype.warn = function (item) {
  const tempItem = Object.assign({}, this.baseInfo, item);
  tempItem.logLevel = 'warn';
  if (!tempItem.logCreateDate) {
    tempItem.logCreateDate = new Date();
  }
  this.loggerList.push(tempItem)
  //
  if (this.options.saveToLocalstorage) {
    this.setLogToStorage()
  }
}
/**
 * 新增错误级别的日志
 * @param item
 */
Logger.prototype.error = function (item) {
  const tempItem = Object.assign({}, this.baseInfo, item);
  tempItem.logLevel = 'error';
  if (!tempItem.logCreateDate) {
    tempItem.logCreateDate = new Date();
  }
  this.loggerList.push(tempItem);
  //
  if (this.options.saveToLocalstorage) {
    this.setLogToStorage();
  }
}
/**
 * 获取当前所有日志
 * @returns {[]} 返回所有日志内容
 */
Logger.prototype.getValue = function () {
  return this.loggerList
}
/**
 * 通过ajax发送日志请求到服务端
 *  * @param loggerList 需要保存的内容
 */
Logger.prototype.requestLog = function(param) {
  //todo 调用后端提供的保存日志接口
  return axios({
    url: this.options.url,
    method: this.options.method,
    headers: {
      'Accept-Language': 'zh_CN',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.options.access_token
    },
    data: param
  })
};
/**
 * 保存日志
 */
Logger.prototype.saveLogger = function(callback) {
  //
  const logType = loggerLocalStorage.getItem(this.LOG_TYPE) ||  this.options.logType;
  if (logType === 'off' || !logType) {
    return false;
  }

  if (logType === 'clear') {
    loggerLocalStorage.removeItem(this.LOG_TYPE);
    return false
  }
  //
  if (this.loggerList.length === 0) {
    return
  }
  //
  let loggerList = [];

  if (logType === 'debug') {
    loggerList = this.loggerList;
    this.loggerList.forEach(v => {
      v.isSend = true;
    })
  }

  if (logType === 'info') {
    this.loggerList.forEach(v => {
      if (v.type !== 'debug' && !v.isSend) {
        loggerList.push(v);
      }
      v.isSend = true;
    })
  }

  if (logType === 'warn') {
    this.loggerList.forEach(v => {
      if (v.type !== 'debug' && v.type !== 'info' && !v.isSend) {
        loggerList.push(v);
      }
      v.isSend = true;
    })
  }

  if (logType === 'error') {
    this.loggerList.forEach(v => {
      if (v.type === 'error' && !v.isSend) {
        loggerList.push(v);
      }
      v.isSend = true;
    })
  }
  //
  const tempLogList = JSON.parse(JSON.stringify(loggerList));
  tempLogList.forEach(v => {
    delete v.isSend
  });
  //
  const param = {
    logList: tempLogList,
    currentAccount: this.options.currentAccount,
    currentName: this.options.currentName,
    loginDate: this.options.loginDate,
    tokenId: this.options.tokenId,
  }
  //
  this.requestLog(param).then(res => {
    this.removeLogOfStorage();
    this.loggerList = [];
    //
    if (callback) {
      callback()
    }
  })
};
/**
 * 自动保存日志
 */
Logger.prototype.autoSaveLogger = function() {
  setInterval(() => {
    this.saveLogger();
  }, this.options.autoSaveTime)
};
/**
 * 把日志保存到localstorage
 */
Logger.prototype.setLogToStorage = function() {
  // 保存之前校验localstorage里面是否超过容量
  const k2Logger = loggerLocalStorage.getItem(this.K2_LOGGER);
  const strSize = getStrSize(k2Logger, '');
  const info = {
    loggerList: this.loggerList,
    currentAccount: this.options.currentAccount,
    currentName: this.options.currentName,
    loginDate: this.options.loginDate,
    tokenId: this.options.tokenId,
  }
  //
  if (strSize >= 4 * 1024 * 1024) {
    this.saveLogger(() => {
      loggerLocalStorage.setItem(this.K2_LOGGER, JSON.stringify(info));
    });
  } else {
    //
    loggerLocalStorage.setItem(this.K2_LOGGER, JSON.stringify(info));
  }

};
/**
 * 从localstorage中获取日志
 */
Logger.prototype.getLogByStorage = function() {
  return JSON.parse(loggerLocalStorage.getItem(this.K2_LOGGER));
};
/**
 * 从localstorage中清除日志
 */
Logger.prototype.removeLogOfStorage = function() {
  return loggerLocalStorage.removeItem(this.K2_LOGGER);
}
/**
 * 处理之前存在localstorage里面的日志信息
 */
Logger.prototype.handleHistoryLog = function() {
  const logInfo = this.getLogByStorage();
  if (logInfo) {
    if ( logInfo.currentAccount && this.options.currentAccount && logInfo.currentAccount === this.options.currentAccount) {
      this.loggerList = logInfo.loggerList|| [];
    } else {
      // 如果和当前登录人的信息不一致就直接清空
      this.removeLogOfStorage();
    }
  }
}
/**
 * 默认的配置信息
 * @type {{method: string, autoSaveTime: number, saveToLocalstorage: boolean, autoSave: boolean, url: string}}
 */
const defaultOptions = {
  // 是否开启自动保存,默认开启
  autoSave: true,
  // 自动保存日志的间隔时间
  autoSaveTime: 5 * 60 * 1000,
  // 是否需要开启保存在localstorage
  saveToLocalstorage: true,
  // 日志保存地址
  url: '',
  // 接口请求方式
  method: 'POST',
  // 日志
  logType: 'debug',
  currentAccount: '',
  currentName: '',
  loginDate: '',
  tokenId: '',
  // 是否开启监听js语法报错
  listenJsError: false,
  // 是否记录堆栈信息
  listenStackRecord: false,
  // 是否开启监听promise报错
  listenPromiseError: true,
  // 是否开启页面关闭监听
  listenBeforeUnload: true
}
//
const logger = {}
const creatInstance = function (options) {
  return new Logger(options)
}
logger.create = function (config) {
  return creatInstance(objectMerge(defaultOptions, config))
}
window.logger = logger
//
export default logger
