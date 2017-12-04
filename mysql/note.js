var db = require('./mysql-pool.config.js');
var  logger = require('../log4')
NOTE=(data,status,callback)=>{
	logger.debug("NOTE")
	// console.log(data,status)
	db.con(function(connect){

		if(status=="add"){

			const NoteSql = `insert into note(notes,type,userID,noteTitle) values("${data.notes}",${data.type},${data.userID},"${data.Title}")`;
			
			// console.log(data,status,NoteSql)
			connect.query(NoteSql,function(err,result){
				if(err){
					callback(false);
					return;
					logger.debug("失败")
				}

				connect.query(`select id from note where notes ="${data.notes}"`,function(err,result){
					if(err){
						callback(false);
						return;
						logger.debug("失败",err)
					}
					callback(result);
				})
				
			})
		}

		if(status=="findFile"){
			var findFileSql;
			if(data.isYou==1){
				 findFileSql =`select notes,noteTitle from note where id ="${data.T}"`;
			}else{
				findFileSql =`select notes,noteTitle from note where id ="${data.T}" and type != 3`;
			}
			
			// console.log(findFileSql)

				connect.query(findFileSql,function(err,result){
					if(err){
						callback(false);
						return;
						logger.debug("失败",err)
					}
					callback(result);
				})							
		}
		if(status=="allnotes"){
			var findAllSql;
			if(data.id!=undefined){
				 findAllSql =`select * from note where type !=3 limit ${data.parper*8} ,${data.parper*8+8} union select * from note where userID=${data.id} limit ${data.parper*8} ,${data.parper*8+8}`;
			}else{
				findAllSql =`select * from note where  type != 3 limit  ${data.parper*8} ,${data.parper*8+8}`;
			}
			
			logger.debug(findAllSql,"))",data.id)

				connect.query(findAllSql,function(err,result){
					if(err){
						callback(false);
						return;
						logger.debug("失败",err)
					}

					callback(result);
				})							
		}
	})
}
module.exports.NOTE = NOTE;