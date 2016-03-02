var path = require('path');
var url = require('url');
var express = require('express');
var bodyParser = require('body-parser');
var minimist = require('minimist');
var uuid = require('node-uuid');
var ws = require('ws');
var morgan = require('morgan')
var ProtocolElements = require('./sdk/internal/ProtocolElement')
var rs = require('./KurentoRoomServerApp')
var argv = minimist(process.argv.slice(2), {
    default: {
        as_uri: 'http://127.0.0.1:8181/',
        ws_uri: 'ws://192.168.99.100:8888/kurento'
    }
});

var app = express();

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'static')));
app.use(morgan('dev'))

var asUrl = url.parse(argv.as_uri);
var port = asUrl.port;
var server = app.listen(port, function () {
    console.log('node-room-server started');
    console.log('Open ' + url.format(asUrl) + ' with a WebRTC capable browser');
});

app.get('/api/', function (req, res) {
    res.sendfile(__dirname + '/static/api.html');
});

app.get('/getAllRooms', function (req, res) {
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
});

//app.post('/join/:id/:clientId', function (req, res) {
var wss = new ws.Server({
    server: server,
    path: '/r'
});
//var c = server.connection({host: '192.168.0.6', port: 8181})
wss.on('connection', function (socket) {
    var sessionId = uuid.v4()
    console.log('connected to ws server - session: %s', sessionId);
    socket.on('error', function (error) {
        console.log('Error: ' + error);
    });

    socket.on('close', function () {
        console.log('Connection closing: ' + sessionId + ' closed');
    });

    socket.on('message', function (_message) {
        var message = JSON.parse(_message);
        console.log('Connection ' + sessionId + ' received message ', message);
        var jsonRpc = message

        roomServer.roomHandler.handleRequest()

    })
})


var kmsHostIp = '192.168.99.100'
var kmsHostPort = '8888'
var kmsWsUri = util.format('ws://%s:%s/kurento', kmsHostIp, kmsHostPort)

var roomServer = null

rs({kmsWsUri: kmsWsUri}, function (_roomServer) {

    roomServer = _roomServer
    if (roomServer) {
        console.log(util.inspect(roomServer))
    }
})
