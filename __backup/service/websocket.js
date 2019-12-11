const wb = function(server) {
	var io = require('socket.io')(server);
	var userPool = {};
	io.on('connection', function(socket){
	  socket.on('login',json=>{
		if(!userPool[json.userid]){
		  userPool[json.userid] = socket;
		}
	  })
	  socket.on('showOldMsg',function(json){
		var sqlstr = `select * from user_chat_records`;
		sqlQuery(sqlstr).then((result) => {
		  userPool[json.userid].emit('showOld',result)     
		}).catch((err) => {
	
		});
	  })
	  socket.on('sendMsg', function(json){
		if(json.to){
		  if(userPool[json.to]){
			userPool[json.to].emit('privateRecMsg', json);
		  }
		  var sqlstr = `insert into user_chat_records(msg_text,who_send,send_time,to_who) 
						values('${json.msg}','${json.userid}','${Date.now()}','${json.to}')`;
		  sqlQuery(sqlstr).then((result) => {
		  }).catch((err) => {
			
		  });
		}else{
		  io.emit('publicRecMsg', json);
		  var sqlstr = `insert into user_chat_records(msg_text,who_send,send_time,to_who) values('${json.msg}','${json.userid}','${Date.now()}','public')`;
		  sqlQuery(sqlstr).then((result) => {
		  }).catch((err) => {
			
		  });
		}
	  });
	  socket.on("disconnect", function() {
		  io.emit('leave', socket.id);
	  })
	});
}
exports = wb;