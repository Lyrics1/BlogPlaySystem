var db = require('./mysql-pool.config.js');

NOTE=(data,status,callback)=>{
	console.log(data,status)
	db.con(function(connect){

		if(status=="add"){

			const NoteSql = `insert into note(notes,type,userID) values("${data.notes}",${data.type},${data.userID})`;
			
			// console.log(data,status,NoteSql)
			connect.query(NoteSql,function(err,result){
				if(err){
					callback(false);
					return;
					console.log("失败")
				}

				connect.query(`select id from note where notes ="${data.notes}"`,function(err,result){
					if(err){
						callback(false);
						return;
						console.log("失败")
					}
					callback(result);
				})
				
			})
		}





	})
}
module.exports.NOTE = NOTE;