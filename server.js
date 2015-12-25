var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var ejs = require('ejs');
var fs = require("fs");
var moment = require("moment");
var bodyParser = require('body-parser'); // To parse my post params
var sqlite3 = require('sqlite3');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('assets'));

// Initialize DB
var db = new sqlite3.Database('chat.db');

db.run("CREATE TABLE chats (username TEXT, msg TEXT, sendDate TEXT)", function (err) {
	if (err)
    	console.log("Table already exists. Proceeding...");
});

// Define Message Class
var Message = function(msg, username) {
	this.msg = msg;
	this.username = username;

	// Lets add a timestamp to the message
	var timeStr = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
	this.sendDate = timeStr;
}

Message.prototype.saveMsg = function () {
	db.run("INSERT INTO chats VALUES (?, ?, ?)", this.username, this.msg, this.sendDate);
}

Message.prototype.jsonify = function () {
	return '{"msg" : "' + this.msg + '","username" : "' + this.username + '", "sendDate" : "' + this.sendDate  +'"}';
}

// Express routes
app.get('/', function (req, res) {
	res.sendFile( __dirname + "/" + "index.html" );
});

app.post('/chat', function (req, res) {
    var data = {username: req.body.username};
	var html = fs.readFileSync(__dirname + "/" + "chat.html");
	var renderedHtml = ejs.render(html.toString(), data);
	res.send(renderedHtml);
});

// Define events, handlers
io.on('connection', function(socket){

	// On first connection, send user chat history
	db.each("SELECT * FROM chats WHERE ?", "1", function(err, row) {
		socket.emit('chat message', '{"msg" : "' + row.msg + '","username" : "' + row.username + '", "sendDate" : "' + row.sendDate  +'"}');
	});

    socket.on('chat message', function(msg){
		var msgObj = JSON.parse(msg);
		var chatMsg = new Message(msgObj.msg, msgObj.username);
		io.emit('chat message', chatMsg.jsonify());

		// Save the message
		chatMsg.saveMsg();
	});

	socket.on('report arrival', function(username){
		io.emit('report arrival', username + ' has joined');
	});

	socket.on('report departure', function(username){
        io.emit('report departure', username + ' has left');
    });
});

// Start the server
var server = http.listen(8008, function () {
	var host = server.address().address
	var port = server.address().port

	console.log("Started server and listening on IP: %s, Port: %s", host, port)
});
