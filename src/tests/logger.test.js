/**
 @Author: Bruce.wan
 @CreateTime: 2021/1/15 17:32
 @Description:
 */
import logger from './../../lib/logger';

test('测试用例1', () => {
  const formLogger = logger.create();
  formLogger.send({
    type: 'waring',
    message: '请求接口出错'
  })
  //
  expect(formLogger.loggerList.length).toBe(1);
  formLogger.send({
    type: 'error',
    message: '请求接口出错'
  })
  console.log(formLogger.loggerList)
  expect(formLogger.loggerList.length).toBe(2);
})
