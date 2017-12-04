// const mysql = require('mysql');连接本地数据库
const MYSQL = require('../mysql/do.js');
const USER = require('../mysql/user.js');
const crypto = require('crypto');//数据进行加密
const path = require('path');
const User = require('./user');
const Movie = require('./movie');
const Index = require('./index');
const Note = require('./note');
const Chat =require('./chat')
var  logger = require('../log4')





module.exports =function(app,io) {
	//设置持久化会话
app.use("*",function(req,res,next){
	if(req.session.username){
		app.locals.user = req.session.username;
	    app.locals.userImg =`../${req.session.userImg}`;
		app.locals.sex = req.session.sex;
		app.locals.tempNoteTitle = req.session.tempNoteTitle
		app.locals.tempNotes = req.session.tempNotes 
	}
	return next();//跳过
	
})

/* index*/
//index views 路由
app.get('/',Index.index)

//获取session .name
app.get('/get',Index.getName)



/* movie */

//detail
app.get('/movie/:id',Movie.detail)

//update
app.get('/admin/update/:id',User.requireSign,User.requireAdmin,Movie.update)

//admin post movie接受输入数据
app.post('/admin/movie/new',User.requireSign,User.requireAdmin,Movie.newMovie)

//admin
app.get('/admin/movie',User.requireSign,User.requireAdmin,Movie.admininsert)

//list
app.get('/admin/list',User.requireSign,User.requireAdmin,Movie.adminlist)

//list delete movie
app.post('/admin/list',User.requireSign,User.requireAdmin,Movie.del);

//搜索框搜索
app.post('/searchInfo',Movie.searchInfo)




/*user */
//注册
app.post('/user/signup',User.signup)

//登录
app.post('/user/signin',User.signin)

//登出
app.get('/logout',(req,res)=>{
	// console.log("LO4")
	delete req.session.username;
	delete req.session.userID;
	delete req.session.password;
	delete req.session.userImg;
	delete app.locals.user ;//如果不删除 app.licals.user 页面是不会改变的
	delete app.locals.userImg;
	delete app.locals.tempNoteTitle 
	delete app.locals.tempNotes 
	delete req.session.tempNoteTitle
	delete req.session.tempNotes
	logger.debug("loginout")


	res.redirect('/');
})
//个人设置
app.get('/information',User.info)
//修改头像
app.post('/updateImg',User.updateImg)
//修改信息
app.post('/updateinfo',User.updateinfo)
//查看其他人信息：
app.get('/information/:id',User.anotherInfo)
//评论
app.post('/comment',User.comment)
//回复评论
app.post('/receive',User.receive)
//点赞
app.post('/nice',User.nice)

//blog

//发表note
app.get('/newnote',Note.add)

//临时保存
app.post('/tempNote',Note.tempNote)

//发表
app.post('/show',Note.show);

//查看发表的博客

app.get('/newnote/:id/:T',Note.look)

//清除notsession:
app.get('/delnoteSession',Note.delnoteSession)

//查看所有用户的博客(对其他人可见的),包括上一页下一页
app.get('/allnotes/:id',Note.allnotes)

//chat
app.get('/chat/:id',Chat.chat);




	io.on('connection',function(socket){

	socket.on('message',function(data){
	// console.log(data)
		io.emit('message',data)
	})
})




}
