//'use strict';
//
///**
// * Created by ghostmac on 2/26/16.
// */
//var ws = require('ws');
//var path = require('path')
//var hapi = require('hapi')
//var inert = require('inert')
//var hostConfig = {host: '192.168.0.6', port: 8181}
//var wsConfig = {host: '192.168.0.6', port: 8282, path: '/r'}
//var uuid = require('node-uuid');
//
//var options = {
//    opsInterval: 1000,
//    filter: {
//        access_token: 'censor'
//    },
//    reporters: [{
//        reporter: require('good-console'),
//        events: {log: '*', response: '*'}
//    }, {
//        reporter: require('good-file'),
//        events: {ops: '*'},
//        config: './test/fixtures/awesome_log'
//    }, {
//        reporter: 'good-http',
//        events: {error: '*'},
//        config: {
//            //endpoint: 'http://prod.logs:3000',
//            endpoint: path.join('http://192.168.0.6:8181', 'log'),
//            wreck: {
//                headers: {'x-api-key': 12345}
//            }
//        }
//    }]
//}
//
//var server = new hapi.Server({
//    connections: {
//        routes: {
//            files: {
//                relativeTo: path.join(__dirname, 'static')
//            }
//        }
//    }
//})
//
//server.connection(hostConfig)
//
//var wss = ws.Server(wsConfig)
////var c = server.connection({host: '192.168.0.6', port: 8181})
//wss.on('connection', function (socket) {
//    var sessionId = uuid.v4()
//    console.log('connected to ws server - session: %s', sessionId);
//    socket.on('error', function (error) {
//        console.log('Error: ' + error);
//    });
//
//    socket.on('close', function () {
//        console.log('Connection closing: ' + sessionId + ' closed');
//    });
//
//    socket.on('message', function (_message) {
//        var message = JSON.parse(_message);
//        console.log('Connection ' + sessionId + ' received message ', message);
//        var jsonRpc = message
//        switch (jsonRpc.method) {
//            case 'joinRoom':
//                break;
//            case 'participantJoined':
//                break;
//            case 'publishVideo':
//                break;
//            case 'participantPublished':
//                break;
//            case 'unpublishVideo':
//                break;
//            case 'participantUnpublished':
//                break;
//            case 'receiveVideoFrom':
//                break;
//            case 'unsubscribeFromVideo':
//                break;
//            case 'onIceCandidate':
//                break;
//            case 'iceCandidate':
//                break;
//            case 'leaveRoom':
//                break;
//            case 'participantLeft':
//                break;
//            case 'sendMessage':
//                break;
//            case 'mediaError':
//                break;
//            case 'customRequest':
//                break;
//            default:
//                //ws.send(JSON.stringify({
//                //    id: 'error',
//                //    message: 'Invalid message ' + message
//                //}));
//                break;
//        }
//    })
//})
//
//server.register(inert, function () {
//})
//
//server.register({
//    register: require('good'),
//    options: options
//}, function (err) {
//    if (err) {
//        console.error(err);
//        throw err;
//    }
//    else {
//        server.start(function () {
//            console.info('Server started at ' + server.info.uri);
//        });
//    }
//});
//
//
//server.route({
//    method: 'GET',
//    path: '/{param*}',
//    handler: {
//        directory: {
//            path: '.',
//            redirectToSlash: true,
//            index: true
//        }
//    }
//})
//
//server.route({
//    method: 'GET',
//    path: '/api',
//    handler: function (request, reply) {
//        reply('Hello, world!');
//    }
//})
//
//server.route({
//    method: 'GET',
//    path: '/getAllRooms',
//    handler: function (request, reply) {
//        reply({ok: 'getAllRooms', hapi: 'bitches'});
//    }
//})
