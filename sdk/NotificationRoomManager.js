/**
 * Created by ghostmac on 1/12/16.
 */
var util = require('util')
var inherits = require('inherits')
var EventEmitter = require('events').EventEmitter
var NotificationRoomHandler = require('./internal/NotificationRoomHandler')
var KurentoClientSessionInfo = require('./internal/KurentoClientSessionInfo')
var RoomManager = require('./RoomManager')
var RoomError = require('./exception/RoomException')

/**
 * Delegates requests to internalManager:RoomManager
 * Emits events handled by NotificationRoomHandler
 * @param notificationService
 * @param kcProvider
 * @constructor
 */
function NotificationRoomManager(notificationService, kcProvider) {
    var self = this
    EventEmitter.call(this)
    self.notificationRoomHandler = new NotificationRoomHandler(notificationService)
    self.internalManager = new RoomManager(self.notificationRoomHandler, kcProvider)

}

inherits(NotificationRoomManager, EventEmitter)

/**
 *
 * @param userName
 * @param roomName
 * @param webParticipant
 * @param request
 */
NotificationRoomManager.prototype.joinRoom = function (userName, roomName, webParticipant, request) {
    var self = this
    var existingParticipants = null
    try {
        var kcSessionInfo = new KurentoClientSessionInfo(request.getParticipantId(), roomName)
        existingParticipants = self.internalManager.joinRoom(userName, roomName, webParticipant, kcSessionInfo, request.getParticipantId())

    } catch (roomError) {
        console.log('Participant: %s Error joining/creating room %s Error: %s', userName, roomName, roomError)
        self.notificationRoomHandler.onParticipantJoined(request, roomName, userName, null, roomError)
    }

    if (existingParticipants) {
        //self.notificationRoomHandler.onParticipantJoined(request, roomName, userName, existingParticipants, null)
        console.log('Participant: %s  joining room %s.', userName, roomName)

    }
}
NotificationRoomManager.prototype.leaveRoom = function (request) {
    var self = this
    var pid = request.getParticipantId(),
        remainingParticipants = null,
        roomName = null,
        userName = null
    try {
        roomName = self.internalManager.getRoomName(pid)
        userName = self.internalManager.getParticipantName(pid)
        remainingParticipants = self.internalManager.leaveRoom(pid)
    } catch (roomError) {
        console.log('Participant: %s Error leaving room %s Error: %s', userName, roomName, roomError)
        self.notificationRoomHandler.onParticipantLeft(request, null, null, roomError)
    }
    if (remainingParticipants)
        self.notificationRoomHandler.onParticipantLeft(request, userName, remainingParticipants, null)

}
NotificationRoomManager.prototype.publishMedia = function (request, isOffer, sdp, loopbackAltSrc, loopbackConnType, doLoopback, mediaElements) {
    var self = this
    var pid = request.getParticipantId(),
        userName = null,
        roomName = null,
        participants = null,
        sdpAnswer = null

    try {
        userName = self.internalManager.getParticipantName(pid)
        roomName = self.internalManager.getRoomName(pid)
        participants = self.internalManager.getParticipants(roomName);
        sdpAnswer = self.internalManager.publishMedia(
            pid,
            isOffer,
            sdp,
            loopbackAltSrc,
            loopbackConnType,
            doLoopback,
            mediaElements,
            function () {

            })
    } catch (roomError) {
        console.log('Participant: %s Error publishing media : %s', userName, roomError)
        self.notificationRoomHandler.onPublishMedia(request, null, null, null, roomError)
    }
    if (sdpAnswer)
        self.notificationRoomHandler.onPublishMedia(request, userName, sdpAnswer, participants, null)

}
NotificationRoomManager.prototype.unpublishMedia = function (request) {
    var self = this
    var pid = request.getParticipantId(),
        userName = null,
        roomName = null,
        participants = null,
        unpublished = false

    try {
        userName = self.internalManager.getParticipantName(pid)
        self.internalManager.unpublishMedia(pid)
        unpublished = true
        roomName = self.internalManager.getRoomName(pid)
        participants = self.internalManager.getParticipants(roomName);
    } catch (roomError) {
        console.log('Participant: %s Error publishing media : %s', userName, roomError)
        self.notificationRoomHandler.onPublishMedia(request, null, null, null, roomError)
    }

    if (unpublished)
        self.notificationRoomHandler.onUnpublishMedia(request, userName, participants, null)

}
NotificationRoomManager.prototype.subscribe = function (remoteName, sdpOffer, request) {
    var self = this
    var pid = request.getParticipantId(),
        userName = null,
        roomName = null,
        participants = null,
        sdpAnswer = null

    try {
        userName = self.internalManager.getParticipantName(pid)
        self.internalManager.subscribe(remoteName, sdpOffer, pid)
    } catch (roomError) {
        console.log('Participant: %s Error subscribing to %s Error:%s', userName, remoteName, roomError)
        self.notificationRoomHandler.onSubscribe(request, null, roomError);
    }

    if (sdpAnswer)
        self.notificationRoomHandler.onSubscribe(request, sdpAnswer, null);

}
NotificationRoomManager.prototype.unsubscribe = function (remoteName, request) {
    var self = this
    var pid = request.getParticipantId(),
        userName = null,
        unsubscribed = false

    try {
        userName = self.internalManager.getParticipantName(pid)
        self.internalManager.unsubscribe(remoteName, pid)
        unsubscribed = true
    } catch (roomError) {
        console.log('Participant: %s Error unsubscribing from %s Error:%s', userName, remoteName, roomError)
        self.notificationRoomHandler.onUnsubscribe(request, roomError);
    }

    if (unsubscribed)
        self.notificationRoomHandler.onUnsubscribe(request, null);

}
NotificationRoomManager.prototype.onIceCandidate = function (endpointName, candidate, sdpMLineIndex, sdpMid, request) {
    var self = this
    var pid = request.getParticipantId(),
        userName = null
    try {
        userName = self.internalManager.getParticipantName(pid)
        self.internalManager.onIceCandidate(endpointName, candidate, sdpMLineIndex, sdpMid, pid)
        self.notificationRoomHandler.onRecvIceCandidate(request, null)
    } catch (roomError) {
        console.log('Participant: %s Error receiving ICE candidate (epName=%s, candidate=%s) Error:%s', userName, endpointName, candidate, roomError)
        self.notificationRoomHandler.onRecvIceCandidate(request, roomError)
    }
}
NotificationRoomManager.prototype.sendMessage = function (message, userName, roomName, request) {
    var self = this
    console.log('Request [SEND_MESSAGE] message=%s (%s)', message, request)
    try {
        var pid = request.getParticipantId(),
            e = null,
            msg = null
        if (self.internalManager.getParticipantName(pid) !== userName) {
            msg = util.format('Provided username %s differs from the participants name.', userName)
            e = new RoomError(msg, RoomError.Code.USER_NOT_FOUND_ERROR_CODE)
        }
        else if (self.internalManager.getRoomName(pid) !== roomName) {
            msg = util.format('Provided room name %s differs from the participants room.', roomName)
            e = new RoomError(msg, RoomError.Code.ROOM_NOT_FOUND_ERROR_CODE)
        }
        if (e) {
            console.log('Participant: %s Error sending message %s', userName, msg)
            self.notificationRoomHandler.onSendMessage(request, null, null, null, null, e);
        }
        else {
            var participants = self.internalManager.getParticipants(roomName)
            self.notificationRoomHandler.onSendMessage(request, message, userName, roomName, participants, null)
        }
    } catch (roomError) {
        console.log('Participant: %s Error sending message %s', userName, roomError)
        self.notificationRoomHandler.onSendMessage(request, null, null, null, null, roomError);
    }
}
NotificationRoomManager.prototype.close = function () {
    var self = this
    if (!self.internalManager.isClosed()) {
        self.internalManager.close()
    }
}
NotificationRoomManager.prototype.getRooms = function () {
    var self = this
    return self.internalManager.getRooms()

}
NotificationRoomManager.prototype.getParticipants = function (roomName) {
    var self = this
    return self.internalManager.getParticipants(roomName)
}
NotificationRoomManager.prototype.getPublishers = function (roomName) {
    var self = this
    return self.internalManager.getPublishers(roomName)
}
NotificationRoomManager.prototype.getSubscribers = function (roomName) {
    var self = this
    return self.internalManager.getSubscribers(roomName)
}
NotificationRoomManager.prototype.getPeerPublishers = function (participantId) {
    var self = this
    return self.internalManager.getPeerPublishers(participantId)
}
NotificationRoomManager.prototype.getPeerSubscribers = function (participantId) {
    var self = this
    return self.internalManager.getPeerSubscribers(participantId)
}
NotificationRoomManager.prototype.createRoom = function (kcSessionInfo) {
    var self = this
    return self.internalManager.createRoom(kcSessionInfo)
}
NotificationRoomManager.prototype.getPipeline = function (participantId) {
    var self = this
    return self.internalManager.getPipeline(participantId)
}
NotificationRoomManager.prototype.evictParticipant = function (participantId) {
    var self = this
    var participant = self.internalManager.getParticipantInfo(participantId)
    var remainingParticipants = self.internalManager.leaveRoom(participantId);
    self.notificationRoomHandler.onParticipantLeft(participant.getUserName(), remainingParticipants);
    self.notificationRoomHandler.onParticipantEvicted(participant);
}
NotificationRoomManager.prototype.closeRoom = function (roomName) {
    var self = this
    var participants = self.internalManager.closeRoom(roomName);
    self.notificationRoomHandler.onRoomClosed(roomName, participants);
}
NotificationRoomManager.prototype.generatePublishOffer = function (participantId) {
    var self = this
    return self.internalManager.generatePublishOffer(participantId);
}
NotificationRoomManager.prototype.addMediaElement = function (participantId, element, mediaType) {
    var self = this
    self.internalManager.addMediaElement(participantId, element, mediaType);
}
NotificationRoomManager.prototype.removeMediaElement = function (participantId, element) {
    var self = this
    self.internalManager.removeMediaElement(participantId, element);
}
NotificationRoomManager.prototype.mutePublishedMedia = function (muteType, participantId) {
    var self = this
    self.internalManager.mutePublishedMedia(muteType, participantId);
}
NotificationRoomManager.prototype.unmutePublishedMedia = function (participantId) {
    var self = this
    self.internalManager.unmutePublishedMedia(participantId);
}
NotificationRoomManager.prototype.muteSubscribedMedia = function (remoteName, muteType, participantId) {
    var self = this
    self.internalManager.muteSubscribedMedia(remoteName, muteType, participantId);
}
NotificationRoomManager.prototype.unmuteSubscribedMedia = function (remoteName, participantId) {
    var self = this
    self.internalManager.unmuteSubscribedMedia(remoteName, participantId);
}
NotificationRoomManager.prototype.getRoomManager = function () {
    var self = this
    return self.internalManager
}


module.exports = NotificationRoomManager