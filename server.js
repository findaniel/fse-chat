var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var ejs = require('ejs');
var fs = require("fs");
var moment = require("moment");
var bodyParser = require('body-parser'); // To parse my post params

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('assets'));

var Message = function(msg, username) {
	this.msg = msg;
	this.username = username;

	// Lets add a timestamp to the message
	var timeStr = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
	this.sendDate = timeStr;
}

Message.prototype.saveMsg = function () {
}

Message.prototype.jsonify = function () {
	return '{"msg" : "' + this.msg + '","username" : "' + this.username + '", "sendDate" : "' + this.sendDate  +'"}';
}

app.get('/', function (req, res) {
	res.sendFile( __dirname + "/" + "index.html" );
});

app.post('/chat', function (req, res) {
    var data = {username: req.body.username};
	var html = fs.readFileSync(__dirname + "/" + "chat.html");
	var renderedHtml = ejs.render(html.toString(), data);
	res.send(renderedHtml);
});

io.on('connection', function(socket){
    socket.on('chat message', function(msg){
		var msgObj = JSON.parse(msg);
		var chatMsg = new Message(msgObj.msg, msgObj.username);
		io.emit('chat message', chatMsg.jsonify());
	});

	socket.on('report arrival', function(username){
		io.emit('report arrival', username + ' has joined');
	});

	socket.on('report departure', function(username){
        io.emit('report departure', username + ' has left');
    });
});

var server = http.listen(8008, function () {
	var host = server.address().address
	var port = server.address().port

	console.log("Started server and listening on IP: %s, Port: %s", host, port)
});
