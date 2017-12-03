var  logger = require('../log4')
SIGN=(data,status,callback)=>{
	logger.debug("SIGN")
	const mysql = require('mysql');
	const config = require('./config.js');
	const connection = mysql.createConnection(config);

	connection.connect((err)=>{
		if(err){
			return logger.debug('error'+err.message);
		}
		logger.debug("connection success");
		if(status=="signup"){
			//insert
			//先判断用户是否已经注册过
			const checkUser = `select * from user where name="${data.name}" and password="${data.password}"`;
			connection.query(checkUser,(err,results,fields)=>{
				if(err){
					return logger.debug('error signUP'+err.message);
				}

				if(results.length==0){
					const SignupSql = `insert into user(name,password) values("${data.name}","${data.password}")`;

					connection.query(SignupSql,(err,results,fields)=>{
						if(err){
							return logger.debug('error signUP'+err.message);
						}
						connection.end(function(){
							logger.debug("connection.end")
						});
					callback(true);
				})
				}else{
					connection.end(function(){
							logger.debug("connection.end")
						});
					callback(false);
				}
				
			})
			
		}
		if(status=="signin"){
			const SigninSql = `select * from user where name= "${data.name}" and password = "${data.password}"`;
			connection.query(SigninSql,(err,results,fields)=>{
				if(err){
					return logger.debug('error signin'+err.message);
				}
				if(results){
					connection.end(function(){
							logger.debug("connection.end")
						});
					callback(results);
				}else{
					connection.end(function(){
							logger.debug("connection.end")
						});
					callback(false);
				}
			})
		}
		
		if(status=="info"){
			const userImg = `select * from user where name= "${data.name}" and password = "${data.password}"`;

			connection.query(userImg,(err,results,fields)=>{
				if(err){
					return logger.debug('error signin'+err.message);
				}
						connection.end(function(){
							logger.debug("connection.end")
						});
				callback(results)
			})
		}

		if(status=='updateImg'){
			const updateImg = `update user set img = "${data.img}" where name= "${data.name}" and password = "${data.password}"`;
			connection.query(updateImg,(err,results,fields)=>{
				if(err){
					return logger.debug('error signin'+err.message);
				}
						connection.end(function(){
							logger.debug("connection.end")
						});
				callback(true)
			})
		}

		if(status=='updateinfo'){
			const updateInfo = `update user set name = "${data.Newname}", introduce ="${data.introduce}",birthday="${data.birthday}" where name= "${data.name}" and password = "${data.password}"`;

			connection.query(updateInfo,(err,results,fields)=>{
				if(err){
					return logger.debug('error signin'+err.message);
				}

				connection.end(function(){
					logger.debug("connection.end")
				});
				callback(true)
			})
		}
		

		if(status=='anotherInfo'){
			const anotherInfo = `select * from user where id= ${data.id}`;
			connection.query(anotherInfo,(err,results,fields)=>{
				if(err){
					callback(false)
					return logger.debug(err.message);
				}
				connection.end(function(){
					logger.debug("connection.end")
				});
				callback(results)
			})
		}	

	});
}

module.exports.SIGN = SIGN;