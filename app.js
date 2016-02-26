var path = require('path');
var url = require('url');
var express = require('express');
var bodyParser = require('body-parser');
var minimist = require('minimist');
var ws = require('ws');

var argv = minimist(process.argv.slice(2), {
    default: {
        as_uri: 'http://192.168.0.6:8181/',
        ws_uri: 'ws://192.168.99.100:8888/kurento'
    }
});

var uuid = require('node-uuid');

var clients = [];

var app = express();
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'static')));
/*
 * Definition of global variables.
 */
var kurentoClient = null;
var noPresenterMessage = 'No active presenter. Try again later...';
/*
 * Server startup
 */
var asUrl = url.parse(argv.as_uri);
var port = asUrl.port;
var server = app.listen(port, function () {
    console.log('node-room-server started');
    console.log('Open ' + url.format(asUrl) + ' with a WebRTC capable browser');
});
var wss = new ws.Server({
    server: server,
    path: '/r'
});


var ResponseType = {S: "SUCCESS", F: "FAIL"};
app.get('/api/', function (req, res) {
    res.sendfile(__dirname + '/static/api.html');
});
//var sessionId = data.id + '_'+ data.roomId;
//app.post('/join/:id/:clientId', function (req, res) {

app.get('/getAllRooms/', function (req, res) {
    //var data = req.body;
    //var sessionId = data.id + '_' + data.roomId;
    res.send(JSON.stringify({path: 'getAllRooms'}));
});
app.get('/close/:room', function (req, res) {
    var data = req.body;
    console.log(data);
    res.send(JSON.stringify({id: "masterResponse"}));
});

app.get('/getClientConfig', function (req, res) {
    var data = req.body;
    //var sessionId = data.id + '_'+ data.roomId;
    res.send(JSON.stringify({id: "masterResponse"}));
    //res.sendfile(__dirname + '/ws.html');
});

function wsSend(type, client_uuid, nickname, message) {
    for (var i = 0; i < clients.length; i++) {
        var clientSocket = clients[i].ws;
        if (clientSocket.readyState === WebSocket.OPEN) {
            clientSocket.send(JSON.stringify({
                "type": type,
                "id": client_uuid,
                "nickname": nickname,
                "message": message
            }));
        }
    }
}
