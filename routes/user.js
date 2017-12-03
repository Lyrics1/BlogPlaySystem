const USER = require('../mysql/user.js');
const crypto = require('crypto');//数据进行加密
const path = require('path');
const Comment = require('../mysql/comment.js');
var  logger = require('../log4')
var formidable = require('formidable');

var fs = require('fs');
var nameRegExp = /^[\u4e00-\u9fa5]{2,12}$/;
var passRegExp = /^[\w]{6,12}$/;
//注册
exports.signup=(req,res)=>{
	logger.debug(path.basename(__dirname),"signup")
	var data = req.body;
	var name = req.body.username;
	var password = req.body.password;
	//正则验证
	if(!nameRegExp.test(name)){
		res.send({status:"用户名格式错误"})
	}
	if(!passRegExp.test(password)){
		res.send({status:"密码格式错误"})
	}
	if(nameRegExp.test(name) && passRegExp.test(password)){
		//对密码进行加密处理
		var  hash = crypto.createHash('md5');
		const newPass = hash.update(password).digest("hex");
		var data = {
			name :name,
			password:newPass
		}
		USER.SIGN(data,"signup",callback=(results)=>{
			
			if(results){
				res.send({status:"注册成功! 请登录"});
			}else{
				res.send({status:"用户名已经占用"});
			}
		})
	}else{
		res.send({status:"注册信息格式错误"});
		logger.debug("注册信息格式错误");
		
		
	}
}

//登录
exports.signin=(req,res,next)=>{
	logger.debug(path.basename(__dirname),"signin")
	const name = req.body.username;
	const password = req.body.password;
	if(nameRegExp.test(name) && passRegExp.test(password)){
		var  hash = crypto.createHash('md5');
		const newPass = hash.update(password).digest("hex");
		var data = {
			name :name,
			password:newPass
		}

		USER.SIGN(data,"signin",callback=(results)=>{
			
			if(results.length!=0){
				  req.session.username = name;					
				  req.session.password = password;
				  req.session.userID = results[0].id;
				  req.session.userImg=`../image/photo/${req.session.userID}/`+results[0].img;
				  req.session.introduce = results[0].introduce;
				  req.session.sex = results[0].sex;
				  req.session.birthday = results[0].birthday;
				  req.session.address =results[0].address;
				  //获取临时存储的博客
				  	if(req.session.userID){

						var dir = path.resolve(__dirname,'..')
						var fileName = req.session.userID;
						fs.exists(`${dir}/blog/temp/${fileName}.json`,function(exists){
							if(exists){
								 fs.readFile(`${dir}/blog/temp/${fileName}.json`,'utf-8',function(err,DATA){
								 	if(err){
								 		status=false;
								 		logger.debug("很抱歉 读取失败 ")
								 	}
								 	DATA= JSON.parse(DATA)
								 	req.session.tempNoteTitle =DATA.title;
									req.session.tempNotes =DATA.notes;	
									  res.send({status:"登录成功"})	 	
								 })
							}else{
									req.session.tempNoteTitle ="";
									req.session.tempNotes ="";
									res.send({status:"登录成功"})
							}
						})
					}else{
						res.send("请登录")
					}

			}else{
				res.send({status:"请先进行注册信息"});
			}
		})
	}else{
		logger.debug("登录信息不合格")
		res.send({status:"登录信息不合格"});
	}
}


exports.requireSign =function(req,res,next){
	logger.debug(path.basename(__dirname),"requireSign")
	var user  = req.session.username;
	if(!user){
		logger.debug("没有登录!")
		res.redirect('/');
	}
	logger.debug("登录!")
		next()
}


exports.requireAdmin = function(req,res,next){
	logger.debug(path.basename(__dirname),"requireAdmin")
		//判断管理员
		const name = req.session.username;
		const password = req.session.password;
		var  hash = crypto.createHash('md5');
		const newPass = hash.update(password).digest("hex");
		
		var data = {
			username:name,
			password:newPass
		}
		if(nameRegExp.test(name) && passRegExp.test(password)){
			
			var data = {
				name :name,
				password:newPass
			}
			USER.SIGN(data,"signin",callback=(results)=>{
				if(results.length!=0){
					req.session.username = name;
					if(results[0].role >=10){
						next()
					}else{
						logger.debug("不是管理员,没有权限查看")
						res.redirect('/');
					}
				}
			})
		}else{
			logger.debug("登录信息不合格")
		}
}

//comment

exports.comment = function(req,res,next){
	logger.debug(path.basename(__dirname),"comment")
	var content = req.body.content
	content = content.trim();
	
	const user  = req.session.username;
	const password = req.session.password;
	const userID = req.session.userID ;
	const movieID = req.body.movieID;


	if(user){
	logger.debug("可以收纳评论了")
		var pushTime = new Date();
		var pushTime= pushTime.toLocaleDateString().replace(/\//g, "-") + " " + pushTime.toTimeString().substr(0, 8)
		var data ={
				commenterID:userID,
				content:content,
				time:pushTime,
				movieID:movieID
		}	
		Comment.COMMENT(data,'comment',(results)=>{
			if(results){
				var returnData ={
					id:userID,
					img:req.session.userImg,
					username:user,
					content:content,
					time:pushTime,
					status:results
				}
				res.send(returnData)
			}else{
				returnData ={
					status:false
				}
				res.send(returnData)
			}
		})

	}
}
//回复功能
exports.receive =function(req,res,next){
	logger.debug(path.basename(__dirname),"receive")
	var movieID = req.body.movieID;
	var content= req.body.content;
	var bcommentID = req.body.bcommentID;//被评论的id
	//根据bcommentID 查找被评论者的名字和评论的内容,然后插入comment
	var Judge = req.session.username;

	if(Judge==null){
		res.send(`status:false`);
		return ;
	}
	var DATA={
		movieID:movieID,
		bcommentID:bcommentID
	}
	Comment.COMMENT(DATA,'bcomment',callback=(results)=>{
		var pushTime = new Date();
		var pushTime= pushTime.toLocaleDateString().replace(/\//g, "-") + " " + pushTime.toTimeString().substr(0, 8)
			var data = {
				movieID:movieID,//电影的id
				content:content,//回复的内容
				buserID:results[0].id,//被回复者的id
				bcommentID:bcommentID,//被回复的内容的id
				bcontent:results[0].content,//被回复的内容
				bname:results[0].name,//被回复的用户名
				id:	req.session.userID,//回复者的id 
				time:pushTime//时间
			}
			Comment.COMMENT(data,'inserReceive',callback=(results)=>{
				var returnData ={
					id:1,
					img:"../image/2.jpg",
					username:req.session.username,
					content:content,
					time:pushTime,
					status:results
				}
				res.send(returnData)
			})
	})
}


exports.nice=function(req,res,next){
	logger.debug(path.basename(__dirname),"nice")
	var Judge = req.session.username;
	if(Judge==null){
		res.send(`status:false`);
		return ;
	}
	var id = req.body.id;
	var userID = req.session.userID;
	var data ={
		id : id,
		userID:userID
	}
	//向数据库发出请求,判断是否本用户已经对这条评论进行点赞
	Comment.COMMENT(data,'CheckNice',callback=(results)=>{
		res.send(results)
	})
}
//个人信息展示
exports.info=(req,res)=>{
	logger.debug(path.basename(__dirname),"info")
	var data = req.query;	
	var  hash = crypto.createHash('md5');
		const newPass = hash.update(req.session.password).digest("hex");
		var data = {
			name :req.session.username,
			password:newPass
		}
		USER.SIGN(data,"info",callback=(results)=>{
				  req.session.userImg=`../image/photo/${req.session.userID}/`+results[0].img;
				  req.session.introduce = results[0].introduce;
				  req.session.sex = results[0].sex;
				  req.session.birthday = results[0].birthday;
				  req.session.address =results[0].address;
			var man,woman,none;
			if(results[0].sex=='男'){
				man = "true";
				woman=none="false"
			}
			if(results[0].sex=='女'){
				woman = "true";
				man=none="false"
			}
			if(!results[0].sex=='女'&&results[0].sex=='男'){
				none="true";
				woman=man="false"
			}			
			res.render('information',{
				title:'个人设置',
				world: '写一段描述自己的话，用心去感受自己的内心',
				name:results[0].name,
				introduce:results[0].introduce,
				man:man,
				woman:woman,
				none:none,
				birthday:results[0].birthday

			})
			
		})

	
}
exports.updateImg=(req,res)=>{
	logger.debug(path.basename(__dirname),"updateImg")
	var  hash = crypto.createHash('md5');
		const newPass = hash.update(req.session.password).digest("hex");
	var NewImg={
			name:req.session.username,
			password:newPass,
			img:"ll"
		}
	var form = new formidable.IncomingForm();
	var dir = path.resolve(__dirname,'..')
	var filename = req.session.userID;

	fs.exists(`${dir}/views/includes/image/photo/${filename}`, function (exists) {
		if(exists){
				form.uploadDir = `${dir}/views/includes/image/photo/${filename}`;//指定上传文件路径，默认是系统缓存路径
				form.keepExtensions = true;//保留上传文件的格式名称
				form.parse(req,(error,fields,files)=>{
	       		logger.debug("解析完毕");
	        	if(error) {
	        		logger.debug(error)
	        	}

				var NewPath = new Date();
				var photoSRC = path.basename(files.picpath.path);
				NewImg.img=photoSRC
				req.session.userImg = `../image/photo/${filename}/${photoSRC}`;
				USER.SIGN(NewImg,"updateImg",callback=(results)=>{
						 res.redirect('/information');
				})
    		})
			

			
			}else{
					fs.mkdir(`${dir}/views/includes/image/photo/${filename}`,function(err){
						if(err){
						logger.debug("创建失败",err);	
						return;
					}
					logger.debug("创建成功")
				   form.uploadDir = `${dir}/views/includes/image/photo/${filename}`;//指定上传文件路径，默认是系统缓存路径
					form.keepExtensions = true;//保留上传文件的格式名称
					form.parse(req,(error,fields,files)=>{
		       		logger.debug("解析完毕");
		        	if(error) {
		        		logger.debug(error)
		        	}

					var NewPath = new Date();
					var photoSRC = path.basename(files.picpath.path);
					NewImg.img=photoSRC
					req.session.userImg = `../image/photo/${filename}/${photoSRC}`;
					USER.SIGN(NewImg,"updateImg",callback=(results)=>{
							 res.redirect('/information');
					})
	    		})
			
			})
		
		} 
	});
}

exports.updateinfo=function(req,res){
	logger.debug(path.basename(__dirname),"updateinfo")
	var  hash = crypto.createHash('md5');
	const newPass = hash.update(req.session.password).digest("hex");
	var INFO = {
		Newname :req.body.name,
		introduce:req.body.introduce,
		birthday:req.body.birthday,
		name:req.session.username,
		password:newPass
	}

	//进行信息正则验证
	USER.SIGN(INFO,'updateinfo',callback=(results)=>{
		req.session.username=req.body.name;
		res.send({status:"success"})
	})
}

exports.anotherInfo = function(req,res){
	logger.debug(path.basename(__dirname),"anotherInfo")
	var data = req.params;
		if(req.session.userID == data.id){
			res.redirect('/information')
		}
		USER.SIGN(data,"anotherInfo",callback=(results)=>{
			if(results){
				res.render('another',{
					title:'个人设置',
					world: '人说平凡可贵,却又嫌碌碌无为',
					name:results[0].name,
					introduce:results[0].introduce,
					birthday:results[0].birthday,
					sex:results[0].sex,
					photo:results[0].img,
					id:results[0].id
				})
			}else{
				res.end();
			}
			
			
		})

}
//某一部电影的评论全部加载
// exports.comments =function(req,res,next){
// 	const movieID =req.params.id
// 	console.log(movieID);
// 	var data={
// 		movieID:movieID
// 	}
// 	Comment.COMMENT(data,'ALL',(results)=>{
// 		if(results){
// 			res.render('detail',{
// 			title:'Lyrics ',
// 			movies:movie
// 		})
// 		}else{
// 			returnData ={
// 				status:false//表示当前没有评论
// 			}
// 			// res.send(returnData);
// 		}
// 	})
// }


