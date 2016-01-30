/**
 * Created by ghostmac on 1/12/16.
 */
/**
 * Created by ghostmac on 1/12/16.
 */

var debug = require('debug')('node-room-server:DefaultNotificationRoomHandler')
var inherits = require('inherits');
var NotificationRoomHandler = require('../api/NotificationRoomHandler');

function DefaultNotificationRoomHandler(userNotificationService) {
    var self = this
    DefaultNotificationRoomHandler.super_.call(self)
    self._userNotificationService = userNotificationService
}


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
DefaultNotificationRoomHandler.prototype.onParticipantJoined = function(request, roomName, newUserName, existingParticipants, error) {
}

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
DefaultNotificationRoomHandler.prototype.onParticipantLeft = function (request, userName, remainingParticipants, error) {
}

/**
 * Called as a result of
 * {@link NotificationRoomManager#evictParticipant()}
 * (application-originated action). The remaining peers should be notified
 * of this event.
 *
 * @param request instance of {@link ParticipantRequest} POJO to identify
 *        the user and the request
 * @param userName the departing user's name
 * @param remainingParticipants instances of {@link UserParticipant}
 *        representing the remaining participants in the room
 */
//DefaultNotificationRoomHandler.prototype.onParticipantLeft = function onParticipantLeft(userName, remainingParticipants) {
//}

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
DefaultNotificationRoomHandler.prototype.onPublishMedia = function (request, publisherName, sdpAnswer, participants, error) {
}

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
DefaultNotificationRoomHandler.prototype.onUnpublishMedia = function (request, publisherName, participants, error) {
}

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
DefaultNotificationRoomHandler.prototype.onSubscribe = function (request, sdpAnswer, error) {
}

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
DefaultNotificationRoomHandler.prototype.onUnsubscribe = function (request, error) {
}


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
DefaultNotificationRoomHandler.prototype.onSendMessage = function (request, message, userName, roomName, participants, error) {
}

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
DefaultNotificationRoomHandler.prototype.onRecvIceCandidate = function (request, error) {
}

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
DefaultNotificationRoomHandler.prototype.onRoomClosed = function (roomName, participants) {
}

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
DefaultNotificationRoomHandler.prototype.onParticipantEvicted = function (participant) {
}

inherits(DefaultNotificationRoomHandler, NotificationRoomHandler)