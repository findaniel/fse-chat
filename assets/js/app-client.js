var socket = io();

// Inform others of your arrival
socket.emit('report arrival', $('#username').html());

// Inform them also when you leave
$( window ).unload(function() {
	socket.emit('report departure', $('#username').html());
});

$('#send-chat').click(function(){
	var msg = '{"msg" : "' + $('#chat-msg').val() + '","username" : "' + $('#username').html() + '"}';
    socket.emit('chat message', msg);
    $('#chat-msg').val('');
    return false;
});

socket.on('chat message', function(msg){
	var msgObj = JSON.parse(msg);
    var chatmsg = '<a href="#" class="list-group-item">';
    chatmsg += '<div style="float:left; color:green;"><h6><strong> ' + msgObj.username  + ' </strong></h6></div>&nbsp;';
    chatmsg += '<div style="float:right ; color:green;"><h6><strong>' + msgObj.sendDate  + '</strong></h6></div>';
    chatmsg += '<div>&nbsp;</div>';
    chatmsg += '<div>' + msgObj.msg + '</div>';
    chatmsg += '</a>';
    $('#content-chats').append(chatmsg);
    $('#content-chats').animate({scrollTop: $('#content-chats').get(0).scrollHeight}, 2000);
});

socket.on('report arrival', function(msg){
	var chatmsg = '<a href="#" class="list-group-item">';
	chatmsg += '<div style="color:green;">' + msg + '</div>';
	chatmsg += '</a>';
    $('#content-chats').append(chatmsg);
    $('#content-chats').animate({scrollTop: $('#content-chats').get(0).scrollHeight}, 2000);
});

socket.on('report departure', function(msg){
    var chatmsg = '<a href="#" class="list-group-item">';
    chatmsg += '<div>' + msg + '</div>';
    chatmsg += '</a>';
    $('#content-chats').append(chatmsg);
    $('#content-chats').animate({scrollTop: $('#content-chats').get(0).scrollHeight}, 2000);
});
