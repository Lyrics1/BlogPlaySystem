SIGN=(data,status,callback)=>{
	console.log("SIGN")
	// console.log(data)
	const mysql = require('mysql');
	const config = require('./config.js');
	const connection = mysql.createConnection(config);

	connection.connect((err)=>{
		if(err){
			return console.error('error'+err.message);
		}
		console.log("connection success");
		if(status=="signup"){
			//insert
			//先判断用户是否已经注册过
			const checkUser = `select * from user where name="${data.name}" and password="${data.password}"`;
			connection.query(checkUser,(err,results,fields)=>{
				if(err){

					return console.error('error signUP'+err.message);
				}
				// console.log(results)
				if(results.length==0){
					const SignupSql = `insert into user(name,password) values("${data.name}","${data.password}")`;
					// console.log(SignupSql)
					connection.query(SignupSql,(err,results,fields)=>{
						if(err){
							return console.error('error signUP'+err.message);
						}
						connection.end(function(){
							console.log("connection.end")
						});
					callback(true);
				})
				}else{
					connection.end(function(){
							console.log("connection.end")
						});
					callback(false);
				}
				
			})
			
		}
		if(status=="signin"){
			const SigninSql = `select * from user where name= "${data.name}" and password = "${data.password}"`;
			// console.log(SigninSql)
			connection.query(SigninSql,(err,results,fields)=>{
				if(err){
					return console.error('error signin'+err.message);
				}
				if(results){
					connection.end(function(){
							console.log("connection.end")
						});
					console.log(results)
					callback(results);
				}else{
					connection.end(function(){
							console.log("connection.end")
						});
					callback(false);
				}
			})
		}
		
		if(status=="info"){
			const userImg = `select * from user where name= "${data.name}" and password = "${data.password}"`;
			// console.log(userImg)
			connection.query(userImg,(err,results,fields)=>{
				if(err){
					return console.error('error signin'+err.message);
				}
						connection.end(function(){
							console.log("connection.end")
						});
				// console.log('img',results)
				callback(results)
			})
		}

		if(status=='updateImg'){
			const updateImg = `update user set img = "${data.img}" where name= "${data.name}" and password = "${data.password}"`;
			// console.log(updateImg)
			connection.query(updateImg,(err,results,fields)=>{
				if(err){
					return console.error('error signin'+err.message);
				}
						connection.end(function(){
							console.log("connection.end")
						});
				// console.log('img',results)
				callback(true)
			})
		}

		if(status=='updateinfo'){
			const updateInfo = `update user set name = "${data.Newname}", introduce ="${data.introduce}",birthday="${data.birthday}" where name= "${data.name}" and password = "${data.password}"`;
			// console.log(updateInfo)
			connection.query(updateInfo,(err,results,fields)=>{
				if(err){
					return console.error('error signin'+err.message);
				}

				connection.end(function(){
					console.log("connection.end")
				});
				// console.log('Newinfo',results)
				callback(true)
			})
		}
		

		if(status=='anotherInfo'){
			const anotherInfo = `select * from user where id= ${data.id}`;
			// console.log(anotherInfo)
			connection.query(anotherInfo,(err,results,fields)=>{
				if(err){
					callback(false)
					return console.error('error signin'+err.message);
				}
				connection.end(function(){
					console.log("connection.end")
				});
				// console.log('anotherInfo',results)
				callback(results)
			})
		}
		
		// connection.end(()=>console.log("connection.end"));	

	});
}

module.exports.SIGN = SIGN;