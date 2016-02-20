/**
 * Created by ghostmac on 1/12/16.
 */
/**
 * Created by ghostmac on 1/12/16.
 */

var debug = require('debug')('node-room-server:DefaultNotificationRoomHandler');
var inherits = require('inherits');
var DefaultNotificationRoomHandler = require('../api/DefaultNotificationRoomHandler');
var ProtocolElement = require('./ProtocolElement');

/**
 *
 * @param userNotificationService {JsonRpcNotificationService}
 * @constructor
 */
function NotificationRoomHandler(userNotificationService) {
    var self = this;
    NotificationRoomHandler.super_.call(self);
    self._userNotificationService = userNotificationService
}
inherits(NotificationRoomHandler, DefaultNotificationRoomHandler);


/**
 * Called as a result of
 * {@link NotificationRoomManager#joinRoom(, , ParticipantRequest)}
 * . The new participant should be responded with all the available
 * information: the existing peers and, for any publishers, their stream
 * names. The current peers should receive a notification of the join event.
 *
 * @param request instance of {@link ParticipantRequest} POJO to identify
 *        the user and the request
 * @param roomName the room's name
 * @param newUserName the new user
 * @param existingParticipants instances of {@link UserParticipant} POJO
 *        representing the already existing peers
 * @param error instance of {@link RoomException} POJO, includes a code and
 *        error message. If not null, then the join was unsuccessful and the
 *        user should be responded accordingly.
 */
NotificationRoomHandler.prototype.onParticipantJoined = function (request, roomName, newUserName, existingParticipants, error) {
    var self = this
    if (error) {
        self._userNotificationService.sendErrorResponse(request, null, error)
        return
    }
    var result = []
    for (var i = 0; i < existingParticipants.lenght; i++) {
        var participant = existingParticipants[i]
        var participantJson = {}
        participantJson[ProtocolElement.JOINROOM_PEERID_PARAM] = participant.getUserName()

        if (participant.isStreaming()) {
            var stream = {}
            stream[ProtocolElement.JOINROOM_PEERSTREAMID_PARAM] = 'webcam'
            participantJson[ProtocolElement.JOINROOM_PEERSTREAMS_PARAM] = [stream]
        }
        result.push(participantJson)
        var notifyParams = {}
        notifyParams[ProtocolElement.PARTICIPANTJOINED_USER_PARAM] = newUserName
        self._userNotificationService.sendNotification(participant.getParticipantId(), ProtocolElement.PARTICIPANTJOINED_METHOD, notifyParams)
    }
    self._userNotificationService.sendResponse(request, result)
};

/**
 * Called as a result of
 * {@link NotificationRoomManager#leaveRoom(, , ParticipantRequest)}
 * . The user should receive an acknowledgement if the operation completed
 * successfully, and the remaining peers should be notified of this event.
 *
 * @param request instance of {@link ParticipantRequest} POJO to identify
 *        the user and the request
 * @param userName the departing user's name
 * @param remainingParticipants instances of {@link UserParticipant}
 *        representing the remaining participants in the room
 * @param error instance of {@link RoomException} POJO, includes a code and
 *        error message. If not null, then the operation was unsuccessful
 *        and the user should be responded accordingly.
 */
NotificationRoomHandler.prototype.onParticipantLeft = function (request, userName, remainingParticipants, error) {
    var self = this
    if (error && request) {
        self._userNotificationService.sendErrorResponse(request, null, error)
        return
    }
    var params = {}
    params[ProtocolElement.PARTICIPANTLEFT_NAME_PARAM] = userName
    for (var i = 0; i < remainingParticipants.lenght; i++) {
        var participant = remainingParticipants[i]
        self._userNotificationService.sendNotification(participant.getParticipantId(), ProtocolElement.PARTICIPANTLEFT_METHOD, params)
    }
    if (request) {
        self._userNotificationService.sendResponse(request, {})
        self._userNotificationService.closeSession(request)
    }

};

/**
 * Called as a result of
 * {@link NotificationRoomManager#publishMedia(, ParticipantRequest, MediaElement...)}
 * . The user should receive the generated SPD answer from the local WebRTC
 * endpoint, and the other peers should be notified of this event.
 *
 * @param request instance of {@link ParticipantRequest} POJO to identify
 *        the user and the request
 * @param publisherName the user name
 * @param sdpAnswer  with generated SPD answer from the local WebRTC
 *        endpoint
 * @param participants instances of {@link UserParticipant} for ALL the
 *        participants in the room (includes the publisher)
 * @param error instance of {@link RoomException} POJO, includes a code and
 *        error message. If not null, then the operation was unsuccessful
 *        and the user should be responded accordingly.
 */
NotificationRoomHandler.prototype.onPublishMedia = function (request, publisherName, sdpAnswer, participants, error) {
    var self = this
    if (error) {
        self._userNotificationService.sendErrorResponse(request, null, error)
        return
    }
    var result = {}
    result[ProtocolElement.PUBLISHVIDEO_SDPANSWER_PARAM] = sdpAnswer
    self._userNotificationService.sendResponse(request, result)

    var stream = {}
    stream[ProtocolElement.PARTICIPANTPUBLISHED_STREAMID_PARAM] = 'webcam'
    var params = {}
    params[ProtocolElement.PARTICIPANTPUBLISHED_USER_PARAM] = publisherName
    params[ProtocolElement.PARTICIPANTPUBLISHED_STREAMS_PARAM] = [stream]

    for (var i = 0; i < participants.lenght; i++) {
        var participant = participants[i]
        if (participant.getParticipantId() !== request.getParticipantId()) {
            self._userNotificationService.sendNotification(participant.getParticipantId(), ProtocolElement.PARTICIPANTPUBLISHED_METHOD, params)
        }
    }
};

/**
 * Called as a result of
 * {@link NotificationRoomManager#unpublishMedia(ParticipantRequest)}. The
 * user should receive an acknowledgement if the operation completed
 * successfully, and all other peers in the room should be notified of this
 * event.
 *
 * @param request instance of {@link ParticipantRequest} POJO to identify
 *        the user and the request
 * @param publisherName the user name
 * @param participants instances of {@link UserParticipant} for ALL the
 *        participants in the room (includes the publisher)
 * @param error instance of {@link RoomException} POJO, includes a code and
 *        error message. If not null, then the operation was unsuccessful
 *        and the user should be responded accordingly.
 */
NotificationRoomHandler.prototype.onUnpublishMedia = function (request, publisherName, participants, error) {
    var self = this
    if (error) {
        self._userNotificationService.sendErrorResponse(request, null, error)
        return
    }
    self._userNotificationService.sendResponse(request, {})

    var params = {}
    params[ProtocolElement.PARTICIPANTUNPUBLISHED_NAME_PARAM] = publisherName

    for (var i = 0; i < participants.lenght; i++) {
        var participant = participants[i]
        if (participant.getParticipantId() !== request.getParticipantId()) {
            self._userNotificationService.sendNotification(participant.getParticipantId(), ProtocolElement.PARTICIPANTUNPUBLISHED_METHOD, params)
        }
    }

};

/**
 * Called as a result of
 * {@link NotificationRoomManager#subscribe(, , ParticipantRequest)}
 * . The user should be responded with generated SPD answer from the local
 * WebRTC endpoint.
 *
 * @param request instance of {@link ParticipantRequest} POJO to identify
 *        the user and the request
 * @param sdpAnswer  with generated SPD answer from the local WebRTC
 *        endpoint
 * @param error instance of {@link RoomException} POJO, includes a code and
 *        error message. If not null, then the operation was unsuccessful
 *        and the user should be responded accordingly.
 */
NotificationRoomHandler.prototype.onSubscribe = function (request, sdpAnswer, error) {
    var self = this
    if (error) {
        self._userNotificationService.sendErrorResponse(request, null, error)
        return
    }
    self._userNotificationService.sendResponse(request, {})

    var result = {}
    result[ProtocolElement.RECEIVEVIDEO_SDPANSWER_PARAM] = sdpAnswer
    self._userNotificationService.sendResponse(request, result)

};

/**
 * Called as a result of
 * {@link NotificationRoomManager#unsubscribe(, ParticipantRequest)}.
 * The user should receive an acknowledgement if the operation completed
 * successfully (no error).
 *
 * @param request instance of {@link ParticipantRequest} POJO to identify
 *        the user and the request
 * @param error instance of {@link RoomException} POJO, includes a code and
 *        error message. If not null, then the operation was unsuccessful
 *        and the user should be responded accordingly.
 */
NotificationRoomHandler.prototype.onUnsubscribe = function (request, error) {
    var self = this
    if (error) {
        self._userNotificationService.sendErrorResponse(request, null, error)
        return
    }
    self._userNotificationService.sendResponse(request, {})
};


/**
 * Called as a result of
 * {@link NotificationRoomManager#sendMessage(, , , ParticipantRequest)}
 * . The user should receive an acknowledgement if the operation completed
 * successfully, and all the peers in the room should be notified with the
 * message contents and its origin.
 *
 * @param request instance of {@link ParticipantRequest} POJO to identify
 *        the user and the request
 * @param message  with the message body
 * @param userName name of the peer that sent it
 * @param roomName the current room name
 * @param participants instances of {@link UserParticipant} for ALL the
 *        participants in the room (includes the sender)
 * @param error instance of {@link RoomException} POJO, includes a code and
 *        error message. If not null, then the operation was unsuccessful
 *        and the user should be responded accordingly.
 */
NotificationRoomHandler.prototype.onSendMessage = function (request, message, userName, roomName, participants, error) {
    var self = this
    if (error) {
        self._userNotificationService.sendErrorResponse(request, null, error)
        return
    }
    self._userNotificationService.sendResponse(request, {})

    var params = {}
    params[ProtocolElement.PARTICIPANTSENDMESSAGE_ROOM_PARAM] = roomName
    params[ProtocolElement.PARTICIPANTSENDMESSAGE_USER_PARAM] = userName
    params[ProtocolElement.PARTICIPANTSENDMESSAGE_MESSAGE_PARAM] = message
    for (var i = 0; i < participants.lenght; i++) {
        var participant = participants[i]
        self._userNotificationService.sendNotification(participant.getParticipantId(), ProtocolElement.PARTICIPANTSENDMESSAGE_METHOD, params)
    }
};

/**
 * Called as a result of
 * {@link NotificationRoomManager#onIceCandidate(, , int, , ParticipantRequest)}
 * . The user should receive an acknowledgement if the operation completed
 * successfully (no error).
 *
 * @param request instance of {@link ParticipantRequest} POJO to identify
 *        the user and the request
 * @param error instance of {@link RoomException} POJO, includes a code and
 *        error message. If not null, then the operation was unsuccessful
 *        and the user should be responded accordingly.
 */
NotificationRoomHandler.prototype.onRecvIceCandidate = function (request, error) {
    var self = this
    if (error) {
        self._userNotificationService.sendErrorResponse(request, null, error)
        return
    }
    self._userNotificationService.sendResponse(request, {})
};

/**
 * Called as a result of {@link NotificationRoomManager#closeRoom()} -
 * application-originated method, not as a consequence of a client request.
 * All resources on the server, associated with the room, have been
 * released. The existing participants in the room should be notified of
 * this event so that the client-side application acts accordingly.
 *
 * @param roomName the room that's just been closed
 * @param participants instances of {@link UserParticipant} POJO
 *        representing the peers of the closed room
 */
NotificationRoomHandler.prototype.onRoomClosed = function (roomName, participants) {
    var self = this

    var notifyParams = {}
    notifyParams[ProtocolElement.ROOMCLOSED_ROOM_PARAM] = roomName
    for (var i = 0; i < participants.lenght; i++) {
        var participant = participants[i]
        self._userNotificationService.sendNotification(participant.getParticipantId(), ProtocolElement.ROOMCLOSED_METHOD, notifyParams)
    }

};

/**
 * Called as a result of
 * {@link NotificationRoomManager#evictParticipant()} -
 * application-originated method, not as a consequence of a client request.
 * The participant should be notified so that the client-side application
 * would terminate gracefully.
 *
 * @param participant instance of {@link UserParticipant} POJO representing
 *        the evicted peer
 */
NotificationRoomHandler.prototype.onParticipantEvicted = function (participant) {
    var self = this
    self._userNotificationService.sendNotification(participant.getParticipantId(), ProtocolElement.PARTICIPANTEVICTED_METHOD, {})
};


/**
 * Called as a result of an error intercepted on a media element of a
 * participant. The participant should be notified.
 *
 * @param roomName name of the room
 * @param participantId identifier of the participant
 * @param errorDescription description of the error
 */
NotificationRoomHandler.prototype.onIceCandidate = function (roomName, participantId, endPointName, candidate) {
    var self = this
    var params = {}
    params[ProtocolElement.ICECANDIDATE_EPNAME_PARAM] = endPointName
    params[ProtocolElement.ICECANDIDATE_SDPMLINEINDEX_PARAM] = candidate.getSdpMLineIndex()
    params[ProtocolElement.ICECANDIDATE_SDPMID_PARAM] = candidate.getSdpMid()
    params[ProtocolElement.ICECANDIDATE_CANDIDATE_PARAM] = candidate.getCandidate()
    self._userNotificationService.sendNotification(participantId, ProtocolElement.ICECANDIDATE_METHOD, params)
};

NotificationRoomHandler.prototype.onMediaElementError = function (roomName, participantId, errorDescription) {
    var self = this
    var notifyParams = {}
    notifyParams[ProtocolElement.MEDIAERROR_ERROR_PARAM] = errorDescription
    self._userNotificationService.sendNotification(participantId, ProtocolElement.MEDIAERROR_METHOD, notifyParams)
};

/**
 * Called as a result of an error intercepted on the media pipeline. The
 * affected participants should be notified.
 *
 * @param roomName the room where the error occurred
 * @param participantIds the participants identifiers
 * @param errorDescription description of the error
 */
NotificationRoomHandler.prototype.onPipelineError = function (roomName, participantIds/*[string]*/, errorDescription) {
    var self = this
    var notifyParams = {}
    notifyParams[ProtocolElement.MEDIAERROR_ERROR_PARAM] = errorDescription
    for (var i = 0; i < participantIds.length; i++) {
        var pid = participantIds[i]
        self._userNotificationService.sendNotification(pid, ProtocolElement.MEDIAERROR_METHOD, notifyParams)
    }
};


module.exports = NotificationRoomHandler