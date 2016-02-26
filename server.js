/**
 * Created by ghostmac on 2/24/16.
 */
var path = require('path');
var url = require('url');
var express = require('express');
var bodyParser = require('body-parser');
var minimist = require('minimist');
var ws = require('ws');
var wss = ws.Server({server:server,path:'/r'})
var uuid = require('node-uuid');

var clients = [];

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
var argv = minimist(process.argv.slice(2), {
    default: {
        as_uri: 'http://192.168.0.6:8181/',
        ws_uri: 'ws://192.168.99.100:8888/kurento'
    }
});

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


var ResponseType = {S: "SUCCESS", F: "FAIL"};
//app.post('/join/:id/:clientId', function (req, res) {
app.post('/getAllRooms/', function (req, res) {
    var data = req.body;
    var sessionId = data.id + '_' + data.roomId;

    var message = {
        id: data.id,
        result: ResponseType.S,
        params: {
            "is_initiator": "1",
            "room_id": data.roomId,
            "client_id": data.id,
            "messages": [],
            "wss_url": "ws://192.168.1.101:8181/one2many",
            "wss_post_url": "http://192.168.1.101:8181/one2many"
        }
    };
    console.log(message);
    res.send(JSON.stringify(message));

});


app.post('/close/:room', function (req, res) {
    var data = req.body;
    console.log(data);
    //var sessionId = data.id + '_'+ data.roomId;
    res.send(JSON.stringify({id: "masterResponse"}));
    //res.sendfile(__dirname + '/ws.html');
});

app.post('/getClientConfig', function (req, res) {
    var data = req.body;
    //var sessionId = data.id + '_'+ data.roomId;
    res.send(JSON.stringify({id: "masterResponse"}));
    //res.sendfile(__dirname + '/ws.html');
});

app.post('/leave', function (req, res) {
    var data = req.body;
    var sessionId = data.id + '_' + data.roomId;

    res.send(JSON.stringify({id: "masterResponse"}));
    //res.sendfile(__dirname + '/ws.html');
});

var wss = new ws.Server({
    server: server,
    path: '/call'
});


//function nextUniqueId() {
//    idCounter++;
//    return idCounter.toString();
//}

/*
 * Management of WebSocket messages
 */
wss.on('connection', function (ws) {

    var sessionId = uuid.v4()
    console.log('Connection received with sessionId ' + sessionId);

    ws.on('error', function (error) {
        console.log('Connection ' + sessionId + ' error');
        stop(sessionId);
    });

    ws.on('close', function () {
        console.log('Connection ' + sessionId + ' closed');
        stop(sessionId);
    });

    ws.on('message', function (_message) {
        var message = JSON.parse(_message);
        console.log('Connection ' + sessionId + ' received message ', message);

        switch (message.id) {
            case 'presenter':
                startPresenter(sessionId, ws, message.sdpOffer, function (error, sdpAnswer) {
                    if (error) {
                        return ws.send(JSON.stringify({
                            id: 'presenterResponse',
                            sessionId: sessionId,
                            response: 'rejected',
                            message: error
                        }));
                    }
                    ws.send(JSON.stringify({
                        id: 'presenterResponse',
                        sessionId: sessionId,
                        response: 'accepted',
                        sdpAnswer: sdpAnswer
                    }));
                });
                break;

            case 'viewer':
                startViewer(sessionId, ws, message.sdpOffer, function (error, sdpAnswer) {
                    if (error) {
                        return ws.send(JSON.stringify({
                            id: 'viewerResponse',
                            sessionId: sessionId,
                            response: 'rejected',
                            message: error
                        }));
                    }

                    ws.send(JSON.stringify({
                        "id": 'viewerResponse',
                        "sessionId": sessionId,
                        "response": 'accepted',
                        type: "answer",
                        "sdpAnswer": sdpAnswer
                    }));
                });
                break;

            case 'stop':
                stop(sessionId);
                break;

            case 'onIceCandidate':
                var candidate = message.candidate;
                //if (message.cid) {
                //  candidate = message.candidate.candidate;
                //}
                //  console.log(candidate);
                onIceCandidate(sessionId, candidate);
                break;

            default:
                ws.send(JSON.stringify({
                    id: 'error',
                    message: 'Invalid message ' + message
                }));
                break;
        }
    });
});

//wss.on('error', function (e) {
//    console.log("error time");
//});

//wss.on('connection', function (ws) {
//    var client_uuid = uuid.v4();
//    var nickname = "AnonymousUser" + clientIndex;
//    clientIndex += 1;
//    clients.push({"id": client_uuid, "ws": ws, "nickname": nickname});
//    console.log('client [%s] connected', client_uuid);
//
//    var connect_message = nickname + " has connected";
//    wsSend("notification", client_uuid, nickname, connect_message);
//
//    ws.on('message', function (message) {
//        if (message.indexOf('/nick') === 0) {
//            var nickname_array = message.split(' ');
//            if (nickname_array.length >= 2) {
//                var old_nickname = nickname;
//                nickname = nickname_array[1];
//                var nickname_message = "Client " + old_nickname + " changed to " + nickname;
//                wsSend("nick_update", client_uuid, nickname, nickname_message);
//            }
//        } else {
//            wsSend("message", client_uuid, nickname, message);
//        }
//    });
//
//    ws.on('error', function (e) {
//        console.log("error happens");
//    });
//
//    var closeSocket = function (customMessage) {
//        for (var i = 0; i < clients.length; i++) {
//            if (clients[i].id == client_uuid) {
//                var disconnect_message;
//                if (customMessage) {
//                    disconnect_message = customMessage;
//                } else {
//                    disconnect_message = nickname + " has disconnected";
//                }
//                wsSend("notification", client_uuid, nickname, disconnect_message);
//                clients.splice(i, 1);
//            }
//        }
//    }
//    ws.on('close', function () {
//        console.log("closing socket");
//        closeSocket();
//    });
//
//    process.on('SIGINT', function () {
//        console.log("Closing things");
//        closeSocket('Server has disconnected');
//        process.exit();
//    });
//});