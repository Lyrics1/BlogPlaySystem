// const chat=('../mysql/chat');

exports.chat =function(req,res){
	console.log(req.body);
	res.render('chat',{
			title:'chatWith',
			world: '往事无可回首,余生请多指教'
		})
}