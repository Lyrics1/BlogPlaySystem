
const crypto = require('crypto');//数据进行加密
const path = require('path');
const Comment = require('../mysql/note.js');
var formidable = require('formidable');
var fs = require('fs');
var NOTE = require('../mysql/note.js');
const marked = require('marked');


exports.add=(req,res)=>{
	
	var data = req.query;
	console.log(path.basename(__dirname),"add")

	res.render('note',{
		title:'Note',
		world:"别错过年少的疯狂，时光很匆忙"
	})
	
}

exports.tempNote=(req,res)=>{

	console.log(path.basename(__dirname),"tempNote")
	if(!req.session.userID){
		res.send("请先登录 ！")
	}
	if(req.body.title.length==0 || req.body.notes.length==0  ){
		res.send("写点东西,再保存吧 ！")
	}else{
		// console.log("*()",req.body.title)
		req.session.tempNoteTitle =req.body.title;
		req.session.tempNotes =req.body.notes;
		//临时长期存储
		var data = {
			title:req.body.title,
			notes:req.body.notes
		}

		//保存为文件：每个人只有一个临时保存文件 id 为文件名
		if(req.session.userID){
			var dir = path.resolve(__dirname,'..')
			var fileName = req.session.userID;
			fs.exists(`${dir}/blog/temp`,function(exists){
				if(exists){
					 fs.writeFile(`${dir}/blog/temp/${fileName}.json`,JSON.stringify(data),function(err){
					 	if(err){
					 		status=false;
					 		res.send("很抱歉 保存失败 ")
					 	}
					 	res.send("保存成功")				 	
					 })
				}else{
					fs.mkdir(`${dir}/blog/temp`,function(err){
						if(err){
							console.log("创建文件失败");
							res.send("很抱歉 保存失败 ")
						}
						fs.writeFileSync(`${dir}/blog/temp/${fileName}.json`,data,function(err){
					 	if(err){
					 		status=false;
					 		res.send("很抱歉 保存失败 ")
					 	}
					 	res.send("保存成功")					 	
					 })						
					})
				}
			})
		}else{
			res.send("请登录")
		}
	}
}

exports.delnoteSession=(req,res)=>{
	 req.session.tempNoteTitle="";
	  req.session.tempNotes ="";
	  res.end()
}
exports.show=(req,res)=>{
	//删除sessioNote
	 req.session.tempNoteTitle=""
	  req.session.tempNotes =""
	console.log(path.basename(__dirname),"show")
	
	var data = req.body.content;
	// console.log(data,"***",req.session.id);
	if(req.session.username){
		// 先为每个用户建立一个独立的文件
		var dir = path.resolve(__dirname,'..')
		var fileName = req.session.userID;
		var blogName = new Date();
		var status =true;
		// console.log(`${dir}/blog/${fileName}/${blogName}`)
		fs.exists(`${dir}/blog/${fileName}`,function(exists){
			if(exists){
				 fs.writeFile(`${dir}/blog/${fileName}/${blogName}`,data,function(err){
				 	if(err){
				 		status=false;
				 		res.send("很抱歉 发表失败 ")
				 	}				 	
				 })
				 if(status) {
				 	//将文件名存储进数据库notes,type,userID
				 	var Data ={
						notes:blogName,
						type:req.body.type,
						userID:req.session.userID,
						Title:req.body.Title
				 	}
					NOTE.NOTE(Data,'add',callback=(results)=>{
						// res.send("发表成功")
						// console.log(results,"222")
						var REdata= {
								userID:req.session.userID,
								notId:results[0].id,

							}
							res.send(REdata)
					})
				 	
				 }
			}else{
				fs.mkdir(`${dir}/blog/${fileName}`,function(err){
					if(err){
						console.log("创建文件失败");
						res.send("很抱歉 发表失败 ")
					}
					fs.writeFileSync(`${dir}/blog/${fileName}/${blogName}`,data,function(err){
				 	if(err){
				 		status=false;
				 		res.send("很抱歉 发表失败 ")
				 	}
				 	//将文件名存储进数据库notes,type,userID
				 	var Data ={
						notes:blogName,
						type:req.body.type,
						userID:req.session.userID,
						Title:req.body.Title
				 	}
					NOTE.NOTE(Data,'add',callback=(results)=>{
						// console.log(results,"333")
						
							var REdata= {
								userID:req.session.userID,
								notId:results[0].id
							}
							res.send(REdata)
					})

		
				 	
				 })
					 if(status) {
					 	//将文件名存储进数据库notes,type,userID
					 	var Data ={
							notes:blogName,
							type:req.body.type,
							userID:req.session.userID,
							Title:req.body.Title
					 	}
					 	// console.log(Data,"first--")
						NOTE.NOTE(Data,'add',callback=(results)=>{
							// console.log(results,"444")
							// console.log(results)
							var REdata= {
								userID:req.session.userID,
								notId:results[0].id
							}
							res.send(REdata)
						})
				 		
					}
						
				})
			}
		})

	}else{
		res.send("请登录")
	}	
}


exports.look=(req,res)=>{
	
	var Data = req.params;
	// console.log(req.session.userID);
	console.log(path.basename(__dirname),"look")
	Data.isYou=1;
	//判断是否是本人
	if(Data.id!=req.session.userID){
		Data.isYou=0;
		// console.log("not**")
	}
    //先开始从数据库中得到文件名
    NOTE.NOTE(Data,'findFile',callback=(results)=>{
    	// console.log(results,"OO");
    	if(results.length!=0){
	    	var fileName=results[0].notes;
	    	var NoteTitle = results[0].noteTitle;
	    	// 开始异步读取文件
			var readDir = path.resolve(__dirname,'..');
			var ReadPath = `${readDir}/blog/${Data.id}/${fileName}`
			// console.log(ReadPath);
			fs.exists(ReadPath,function(exists){
				if(exists){
						fs.readFile(ReadPath,'utf-8',function(err,DATA){
						if(err){
							console.log(err)
							return;
						}
							// console.log(marked(DATA))
							// DATA =	marked(DATA)
							// res.send(DATA)
							res.render('look',{
								title:'Note',
								NoteTitle:NoteTitle,
								world:"别错过年少的疯狂，时光很匆忙",
								content:DATA
							})
							// res.end();
					})
					}else{
						res.redirect('/newnote')
					}
			})
		
    	}else{
    		res.redirect('/newnote')
    	}
    	

    })
	
}

exports.allnotes=(req,res)=>{
	// console.log(req.params);
	console.log(path.basename(__dirname),"allnotes")

	
	var data = req.params;

	// console.log(data,"***---");
	data={
		id:req.session.userID,
		parper:data.id
	}
	NOTE.NOTE(data,"allnotes",callback=(results)=>{
		res.render('allNotes',{
			title:'Notes',
			world:"希望你往后路途别灰心,因为这世界上总有和你合拍的人 ",
			notes:results
		})
	})
	
	
	
}
