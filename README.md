#### 参数配置
autoSaveTime: 自动保存日志的间隔时间,默认值5分钟自动保存一次

saveToLocalstorage: 是否开启自动保存,默认值true(开启),

autoSave: 是否开启自动保存,默认值true(开启),

url: 日志保存接口地址, 无默认值，必填,

method: 日志保存接口请求方式，默认为POST方式,

logType: 日志级别 debug,info,warn,error,(clear, off)

currentAccount: 当前用户账号

currentName: 当前用户名称

loginDate: 登录时间

tokenId: tokenId

listenJsError: 是否开启监听js语法报错,默认值false(不开启)
  
listenStackRecord:是否记录堆栈信息, 默认值false(不开启),需要开启js语法报错才有用
  
listenPromiseError: 是否开启监听promise报错,默认值true(开启)
  
listenBeforeUnload: 是否开启页面关闭监听,默认值true(开启)

#### 使用方式
npm 安装

npm install k2-logger --save

yarn 安装

yarn add k2-logger

引用方式

import logger from 'k2-logger'

使用示例：

const loggerService = logger.create({

//相关配置信息

})

export default loggerService

#####loggerService实例上存在的方法有:

send(item) 新增日志; 参数形式{type: 'debug|info|warn|error', message: '日志信息', ...}

######以下四个方法可以不需要带type参数:

debug(item) 新增debug级别的日志

info(item) 新增info级别的日志

warn(item) 新增warn级别的日志

error(item) 新增error级别的日志

