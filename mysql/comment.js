var  logger = require('../log4')
COMMENT=(data,status,callback)=>{
	// console.log(data)
	logger.debug("COMMENT")
	const mysql = require('mysql');
	const config = require('./config.js');
	const connection = mysql.createConnection(config);
	connection.connect((err)=>{
		if(err){
			return console.error('error'+err.message);
		}
		logger.debug("connection success");
		if(status=="comment"){//评论
			//insert
			const commentSql = `insert into comment(movieID,commenterID,time,content) values(${data.movieID},${data.commenterID},"${data.time}","${data.content}")`;
			connection.query(commentSql,(err,results,fields)=>{
				if(err){
					return console.error('error signUP'+err.message);
				}
				connection.end(function(){
					logger.debug("connection.end")
				});
				callback(true);
			})
		}
		if(status=="receive"){//回复
			const receiveSql = `select * from comment where name= "${data.name}" and password = "${data.password}"`;
			
			connection.query(receiveSql,(err,results,fields)=>{
				if(err){
					return console.error('error signin'+err.message);
				}
				if(results.length!=0){
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
		if(status=="ALL"){
			//按时间顺序返回所有信息
			const allSql = `select comment.id,comment.messageID,comment.observerID,comment.commenterID,comment.obName,comment.obcontent,comment.time,comment.content,comment.nice,user.name,user.img,user.id as userid from comment,user where comment.movieID = ${data.movieID} and comment.commenterID=user.id order by time desc`;
			
			connection.query(allSql,(err,results,fields)=>{
				if(err){
					return console.error('error signin'+err.message);
				}
					connection.end(function(){
						logger.debug("connection.end")
					});
					callback(results);
				
			})
		}
		//查找b被评论的name 和 内容
		if(status=='bcomment'){
			const bSql = `select comment.content,user.name,user.id from comment,user where comment.movieID= ${data.movieID} and comment.commenterID = user.id and comment.id= ${data.bcommentID}`;
			
			connection.query(bSql,(err,results,fields)=>{
				if(err){
					return console.error('error signin'+err.message);
				}
				connection.end(function(){
					logger.debug("connection.end")
				});
				callback(results);
				
			})
		}
		//存储回复
		if(status=="inserReceive"){
			const breceiveSql = `insert into comment(messageID,movieID,observerID,obcontent,obName,commenterID,time,content) values(${data.bcommentID},${data.movieID},${data.buserID},"${data.bcontent}","${data.bname}",${data.id},"${data.time}","${data.content}")`;
			
			connection.query(breceiveSql,(err,results,fields)=>{
				if(err){
					return console.error('errorReceive'+err.message);
				}

				connection.end(function(){
					logger.debug("connection.end")
				});

				callback(true);
			})
		}
		//点赞查询
		if(status=="CheckNice"){
			const niceSql = `select * from nice where messageid =${data.id} and userid = ${data.userID}` ;
		
			connection.query(niceSql,(err,results,fields)=>{
				if(err){
					return console.error('ERR CheckNice'+err.message);
				}
			
				if(results.length==0){
					//添加本条评论的赞
					// console.log("添加赞")
					const insertNiceSql = `insert into nice (messageid,userid) values(${data.id},${data.userID})`
					
					connection.query(insertNiceSql,(err,results,fields)=>{
						if(err){
							return console.error('insertNiceSql'+err.message);
						}

						const updateNiceCountADD = `update comment set nice =nice+1 where id=${data.id}`//进行数据更新
						connection.query(updateNiceCountADD,(err,results,fields)=>{

							if(err){
								return console.error('in'+err.message);
							}
							connection.end(function(){
								logger.debug("connection.end")
							});
							callback(true);
						})
						
					})
				}else{
					//删除赞
					// console.log("删除赞")
					const deleteNiceSql = `delete from nice where messageid =${data.id} and userid = ${data.userID}`
					connection.query(deleteNiceSql,(err,results,fields)=>{
						if(err){
							return console.error('i'+err.message);
						}
						const updateNiceCountReduce = `update comment set nice =nice-1 where id=${data.id}`

						connection.query(updateNiceCountReduce,(err,results,fields)=>{

							if(err){
								return console.error('update'+err.message);
							}
							connection.end(function(){
								logger.debug("connection.end")
							});
							callback(false)
						})
						
					})
				}
			})
		}


	});

}

module.exports.COMMENT =COMMENT;