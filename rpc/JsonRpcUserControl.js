/**
 * Controls the user interactions by delegating her JSON-RPC requests to the
 * room API.
 *
 * @author <a href='mailto:rvlad@naevatec.com'>Radu Tom Vlad</a>
 */

var ProtocolElements = require('../sdk/internal/ProtocolElement')
function JsonRpcUserControl() {
    var self = this
    self.roomManager = null
    self.log = null
}

JsonRpcUserControl.prototype.joinRoom = function (transaction, request, participantRequest) {
    var self = this
    var roomName = self.getStringParam(request, ProtocolElements.JOINROOM_ROOM_PARAM);
    var userName = self.getStringParam(request, ProtocolElements.JOINROOM_USER_PARAM);
    var participantSession = self.getParticipantSession(transaction);
    participantSession.setParticipantName(userName);
    participantSession.setRoomName(roomName);
    self.roomManager.joinRoom(userName, roomName, true, participantRequest);
}

JsonRpcUserControl.prototype.publishVideo = function (transaction, request, participantRequest) {
    var self = this
    var sdpOffer = self.getStringParam(request, ProtocolElements.PUBLISHVIDEO_SDPOFFER_PARAM);
    var doLoopback = self.getBooleanParam(request, ProtocolElements.PUBLISHVIDEO_DOLOOPBACK_PARAM);

    self.roomManager.publishMedia(participantRequest, sdpOffer, doLoopback);
}

JsonRpcUserControl.prototype.unpublishVideo = function (transaction, request, participantRequest) {
    var self = this
    self.roomManager.unpublishMedia(participantRequest);
}

JsonRpcUserControl.prototype.receiveVideoFrom = function (transaction, request, participantRequest) {
    var self = this

    var senderName = self.getStringParam(request, ProtocolElements.RECEIVEVIDEO_SENDER_PARAM);
    senderName = senderName.substring(0, senderName.indexOf('_'));

    var sdpOffer = self.getStringParam(request, ProtocolElements.RECEIVEVIDEO_SDPOFFER_PARAM);
    self.roomManager.subscribe(senderName, sdpOffer, participantRequest);
}

JsonRpcUserControl.prototype.unsubscribeFromVideo = function (transaction, request, participantRequest) {
    var self = this

    var senderName = self.getStringParam(request, ProtocolElements.UNSUBSCRIBEFROMVIDEO_SENDER_PARAM);
    senderName = senderName.substring(0, senderName.indexOf('_'));
    self.roomManager.unsubscribe(senderName, participantRequest);
}

JsonRpcUserControl.prototype.leaveRoomAfterConnClosed = function (sessionId) {
    var self = this
    try {
        self.roomManager.evictParticipant(sessionId);
        console.log('Evicted participant with sessionId %s', sessionId);
    } catch (e) {
        console.log('Unable to evict: %s', e);
        console.log('Unable to evict user', e);
    }
}

JsonRpcUserControl.prototype.leaveRoom = function (transaction, request, participantRequest) {
    var self = this
    var exists = false;
    var pid = participantRequest.getParticipantId();
    // trying with room info from session
    var roomName = null;
    if (transaction !== null)
        roomName = self.getParticipantSession(transaction).getRoomName();
    if (roomName === null) { // null when afterConnectionClosed
        console.log(
            'No room information found for participant with session Id %s. '
            + 'Using the admin method to evict the user.', pid);
        self.leaveRoomAfterConnClosed(pid);
    } else {
        // sanity check, don't call leaveRoom unless the id checks out
        for (var key in self.roomManager.getParticipants(roomName)) {
            var part = self.roomManager[key]
            var l = part.getParticipantId()
            var r = participantRequest.getParticipantId()
            if (l === r) {
                exists = true;
                break;
            }
        }
        if (exists) {
            console.log('Participant with sessionId %s is leaving room %s', pid, roomName);
            self.roomManager.leaveRoom(participantRequest);
            console.log('Participant with sessionId %s has left room %s', pid, roomName);
        } else {
            console.log('Participant with session Id %s not found in room %s. Using the admin method to evict the user.', pid, roomName);
            self.leaveRoomAfterConnClosed(pid);
        }
    }
}

JsonRpcUserControl.prototype.onIceCandidate = function (transaction, request, participantRequest) {
    var self = this
    var endpointName = self.getStringParam(request, ProtocolElements.ONICECANDIDATE_EPNAME_PARAM);
    var candidate = self.getStringParam(request, ProtocolElements.ONICECANDIDATE_CANDIDATE_PARAM);
    var sdpMid = self.getStringParam(request, ProtocolElements.ONICECANDIDATE_SDPMIDPARAM);
    var sdpMLineIndex = self.getIntParam(request, ProtocolElements.ONICECANDIDATE_SDPMLINEINDEX_PARAM);

    self.roomManager.onIceCandidate(endpointName, candidate, sdpMLineIndex, sdpMid, participantRequest);
}

JsonRpcUserControl.prototype.sendMessage = function (transaction,
                                                     request, participantRequest) {
    var self = this
    var userName = self.getStringParam(request, ProtocolElements.SENDMESSAGE_USER_PARAM);
    var roomName = self.getStringParam(request, ProtocolElements.SENDMESSAGE_ROOM_PARAM);
    var message = self.getStringParam(request, ProtocolElements.SENDMESSAGE_MESSAGE_PARAM);

    console.log('Message from %s in room %s: %s', userName, roomName, message)

    self.roomManager.sendMessage(message, userName, roomName, participantRequest);
}

JsonRpcUserControl.prototype.customRequest = function (transaction, request, participantRequest) {
    var self = this
    throw new Error('Unsupported method');
}

JsonRpcUserControl.prototype.getParticipantSession = function (transaction) {
    var self = this
    var session = transaction.getSession();
    var participantSession = session.getAttributes().get(ParticipantSession.SESSION_KEY);
    if (participantSession == null) {
        participantSession = new ParticipantSession();
        session.getAttributes().put(ParticipantSession.SESSION_KEY, participantSession);
    }
    return participantSession;
}

JsonRpcUserControl.prototype.getStringParam = function (request, key) {
    var self = this
    if (request.getParams() == null || request.getParams().get(key) == null)
        throw new Error('Request element is missing');
    return request.getParams().get(key).getAsString();
}

JsonRpcUserControl.prototype.getIntParam = function (request, key) {
    var self = this
    if (request.getParams() == null || request.getParams().get(key) == null)
        throw new Error('Request element is missing');
    return request.getParams().get(key).getAsInt();
}

JsonRpcUserControl.prototype.getBooleanParam = function (request, key) {
    var self = this
    if (request.getParams() == null || request.getParams().get(key) == null)
        throw new Error('Request element is missing');
    return request.getParams().get(key).getAsBoolean();
}

module.exports = JsonRpcUserControl