var inherits = require('inherits')
var ProtocolElements = require('./sdk/internal/ProtocolElement')
var ParticipantRequest = require('./sdk/api/poco/ParticipantRequest')
var JsonRpcHandler = require('./rpc/JsonRpcHandler')
var ParticipantSession = require('./rpc/ParticipantSession')
/**
 * WebSocket interface
 * @param userControl
 * @param notificationService
 * @constructor
 */
function RoomJsonRpcHandler(userControl, notificationService) {
    JsonRpcHandler.call(this)
    var self = this
    self.log = null;
    self.useSockJs = false;
    self.label = '';
    self.pingWatchdog = false;
    self.allowedOrigins = [];
    self.userControl = userControl || null
    self.notificationService = notificationService || null
}

inherits(RoomJsonRpcHandler, JsonRpcHandler)

RoomJsonRpcHandler.HANDLER_THREAD_NAME = 'handler'
/**
 * Accepts client requests and process them through the pipline via
 * @param transaction
 * @param request
 */
RoomJsonRpcHandler.prototype.handleRequest = function (transaction, request) {
    var self = this
    var sessionId = null;
    try {
        sessionId = transaction.getSession().getSessionId();
    } catch (e) {
        console.log('Error getting session id from transaction %s', transaction, e);
        throw e;
    }

    console.log('Session #%s - request: %s', sessionId, request);
    self.notificationService.addTransaction(transaction, request);
    var participantRequest = new ParticipantRequest(sessionId, request.getId());
    //transaction.startAsync();

    switch (request.getMethod()) {
        case ProtocolElements.JOINROOM_METHOD:
            self.userControl.joinRoom(transaction, request, participantRequest);
            break;
        case ProtocolElements.PUBLISHVIDEO_METHOD:
            self.userControl.publishVideo(transaction, request, participantRequest);
            break;
        case ProtocolElements.UNPUBLISHVIDEO_METHOD:
            self.userControl.unpublishVideo(transaction, request, participantRequest);
            break;
        case ProtocolElements.RECEIVEVIDEO_METHOD:
            self.userControl.receiveVideoFrom(transaction, request, participantRequest);
            break;
        case ProtocolElements.UNSUBSCRIBEFROMVIDEO_METHOD:
            self.userControl.unsubscribeFromVideo(transaction, request, participantRequest);
            break;
        case ProtocolElements.ONICECANDIDATE_METHOD:
            self.userControl.onIceCandidate(transaction, request, participantRequest);
            break;
        case ProtocolElements.LEAVEROOM_METHOD:
            self.userControl.leaveRoom(transaction, request, participantRequest);
            break;
        case ProtocolElements.SENDMESSAGE_ROOM_METHOD:
            self.userControl.sendMessage(transaction, request, participantRequest);
            break;
        case ProtocolElements.CUSTOMREQUEST_METHOD:
            self.userControl.customRequest(transaction, request, participantRequest);
            break;
        default:
            console.log('Unrecognized request %s', request);
            break;
    }
}

RoomJsonRpcHandler.prototype.afterConnectionClosed = function (session, status) {
    var self = this
    var ps = null;
    if (session.getAttributes().containsKey(ParticipantSession.SESSION_KEY))
        ps = session.getAttributes().get(ParticipantSession.SESSION_KEY);

    var sid = session.getSessionId();
    console.log('CONN_CLOSED: sessionId=%s, participant in session: %s', sid, ps);
    var preq = new ParticipantRequest(sid, null);
    self.userControl.leaveRoom(null, null, preq);
}

RoomJsonRpcHandler.prototype.getHandlerType = function (session, status) {
    var self = this
    return 'RoomJsonRpcHandler'
}

RoomJsonRpcHandler.prototype.handleTransportError = function (session, exception) {
    console.log('Transport error for session id %s', session != null ? session.getSessionId() : 'NULL_SESSION', exception);
}

RoomJsonRpcHandler.prototype.afterConnectionEstablished = function (session) {
}

RoomJsonRpcHandler.prototype.handleUncaughtException = function (session, exception) {
    var self = this
    console.log('Uncaught exception in handler %s, %s', self.getHandlerType(), exception);
}

RoomJsonRpcHandler.prototype.withSockJS = function () {
    var self = this
    self.useSockJs = true;
    return this;
}

RoomJsonRpcHandler.prototype.isSockJSEnabled = function () {
    var self = this
    return self.useSockJs;
}

RoomJsonRpcHandler.prototype.withAllowedOrigins = function (origins) {
    var self = this

    self.allowedOrigins = new Array(origins);
    return self;
}

RoomJsonRpcHandler.prototype.allowedOrigins = function () {
    var self = this
    return self.allowedOrigins;
}

RoomJsonRpcHandler.prototype.withLabel = function (label) {
    var self = this
    self.label = label;
    return self;
}

RoomJsonRpcHandler.prototype.getLabel = function () {
    var self = this
    return self.label;
}

RoomJsonRpcHandler.prototype.withPingWatchdog = function (pingAsWachdog) {
    var self = this
    self.pingWatchdog = pingAsWachdog;
    return self;
}

RoomJsonRpcHandler.prototype.isPingWatchdog = function () {
    var self = this
    return self.pingWatchdog;
}


module.exports = RoomJsonRpcHandler