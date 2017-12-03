//设置日志配置
var  log4js = require('log4js');//日志管理
var logger = log4js.getLogger();
logger.level = 'debug';
logger.debug("Some debug messages");
var logconfig = require('./log4.config.json');
log4js.configure(logconfig);

module.exports = logger;
