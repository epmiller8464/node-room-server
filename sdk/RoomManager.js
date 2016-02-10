/**
 * Created by ghostmac on 1/12/16.
 */

var util = require('util')
var DefaultNotificationRoomHandler = require('./internal/DefaultNotificationRoomHandler')
var KurentoClientSessionInfo = require('./internal/DefaultKurentoClientSessionInfo')
var Room = require('./internal/Room')
var UserParticipant = require('./api/poco/UserParticipant')
//var MutedMediaType = require('./api/MutedMediaType')
var RoomError = require('./exception/RoomException')
function RoomManager(roomHandler, kcProvider) {
    var self = this
    self.roomHandler = roomHandler
    self.kcProvider = kcProvider
    self.rooms = {}
    self.closed = false
    self.log = null
}


RoomManager.prototype.joinRoom = function (userName,
                                           roomName,
                                           webParticipant,
                                           kcSessionInfo,
                                           pid) {
    var self = this
    var existingParticipants = null
    try {
        var kcSessionInfo = new KurentoClientSessionInfo(participantId.getParticipantId(), roomName)
        existingParticipants = self.internalManager.joinRoom(userName, roomName, webParticipant, kcSessionInfo, participantId.getParticipantId())

    } catch (roomError) {
        console.log('Participant: %s Error joining/creating room %s Error: %s', userName, roomName, roomError)
        self.notificationRoomHandler.onParticipantJoined(participantId, roomName, userName, null, roomError)
    }

    if (existingParticipants) {
        self.notificationRoomHandler.onParticipantJoined(participantId, roomName, userName, existingParticipants, null)
    }
}
RoomManager.prototype.leaveRoom = function (participantId) {
    var self = this
    var pid = participantId.getParticipantId(),
        remainingParticipants = null,
        roomName = null,
        userName = null
    try {
        roomName = self.internalManager.getRoomName(pid)
        userName = self.internalManager.getParticipantName(pid)
        remainingParticipants = self.internalManager.leaveRoom(pid)
    } catch (roomError) {
        console.log('Participant: %s Error leaving room %s Error: %s', userName, roomName, roomError)
        self.notificationRoomHandler.onParticipantLeft(participantId, null, null, roomError)
    }
    if (remainingParticipants)
        self.notificationRoomHandler.onParticipantLeft(participantId, userName, remainingParticipants, null)

}
RoomManager.prototype.publishMedia = function (participantId,
                                               isOffer,
                                               sdp,
                                               loopbackAltSrc,
                                               loopbackConnType,
                                               doLoopback,
                                               mediaElements) {
    var self = this
    var pid = participantId.getParticipantId(),
        userName = null,
        roomName = null,
        participants = null,
        sdpAnswer = null

    try {
        userName = self.internalManager.getParticipantName(pid)
        roomName = self.internalManager.getRoomName(pid)
        participants = self.internalManager.getParticipants(roomName);
        sdpAnswer = self.internalManager.publishMedia(pid, isOffer, sdp, loopbackAltSrc, loopbackConnType, doLoopback, mediaElements)
    } catch (roomError) {
        console.log('Participant: %s Error publishing media : %s', userName, roomError)
        self.notificationRoomHandler.onPublishMedia(participantId, null, null, null, roomError)
    }
    if (sdpAnswer)
        self.notificationRoomHandler.onPublishMedia(participantId, userName, sdpAnswer, participants, null)

}
RoomManager.prototype.generatePublishOffer = function (participantId) {
    var self = this
    return self.internalManager.generatePublishOffer(participantId);
}
RoomManager.prototype.unpublishMedia = function (participantId) {
    var self = this
    var pid = participantId.getParticipantId(),
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
        self.notificationRoomHandler.onPublishMedia(participantId, null, null, null, roomError)
    }

    if (unpublished)
        self.notificationRoomHandler.onUnpublishMedia(participantId, userName, participants, null)

}
RoomManager.prototype.subscribe = function (remoteName, sdpOffer, participantId) {
    var self = this
    var pid = participantId.getParticipantId(),
        userName = null,
        roomName = null,
        participants = null,
        sdpAnswer = null

    try {
        userName = self.internalManager.getParticipantName(pid)
        self.internalManager.subscribe(remoteName, sdpOffer, pid)
    } catch (roomError) {
        console.log('Participant: %s Error subscribing to %s Error:%s', userName, remoteName, roomError)
        self.notificationRoomHandler.onSubscribe(participantId, null, roomError);
    }

    if (sdpAnswer)
        self.notificationRoomHandler.onSubscribe(participantId, sdpAnswer, null);

}
RoomManager.prototype.unsubscribe = function (remoteName, participantId) {
    var self = this
    var pid = participantId.getParticipantId(),
        userName = null,
        unsubscribed = false

    try {
        userName = self.internalManager.getParticipantName(pid)
        self.internalManager.unsubscribe(remoteName, pid)
        unsubscribed = true
    } catch (roomError) {
        console.log('Participant: %s Error unsubscribing from %s Error:%s', userName, remoteName, roomError)
        self.notificationRoomHandler.onUnsubscribe(participantId, roomError);
    }

    if (unsubscribed)
        self.notificationRoomHandler.onUnsubscribe(participantId, null);

}
RoomManager.prototype.onIceCandidate = function (endpointName, candidate, sdpMLineIndex, sdpMid, participantId) {
    var self = this
    var pid = participantId.getParticipantId(),
        userName = null
    try {
        userName = self.internalManager.getParticipantName(pid)
        self.internalManager.onIceCandidate(endpointName, candidate, sdpMLineIndex, sdpMid, pid)
        self.notificationRoomHandler.onRecvIceCandidate(participantId, null)
    } catch (roomError) {
        console.log('Participant: %s Error receiving ICE candidate (epName=%s, candidate=%s) Error:%s', userName, endpointName, candidate, roomError)
        self.notificationRoomHandler.onRecvIceCandidate(participantId, roomError)
    }
}
RoomManager.prototype.addMediaElement = function (participantId, element, mediaType) {
    var self = this
    self.internalManager.addMediaElement(participantId, element, mediaType);
}
RoomManager.prototype.removeMediaElement = function (participantId, element) {
    var self = this
    self.internalManager.removeMediaElement(participantId, element);
}
RoomManager.prototype.sendMessage = function (message, userName, roomName, participantId) {
    var self = this
    console.log('participantId [SEND_MESSAGE] message=%s (%s)', message, participantId)
    try {
        var pid = participantId.getParticipantId(),
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
            self.notificationRoomHandler.onSendMessage(participantId, null, null, null, null, e);
        }
        else {
            var participants = self.internalManager.getParticipants(roomName)
            self.notificationRoomHandler.onSendMessage(participantId, message, userName, roomName, participants, null)
        }
    } catch (roomError) {
        console.log('Participant: %s Error sending message %s', userName, roomError)
        self.notificationRoomHandler.onSendMessage(participantId, null, null, null, null, roomError);
    }
}
RoomManager.prototype.mutePublishedMedia = function (muteType, participantId) {
    var self = this
    self.internalManager.mutePublishedMedia(muteType, participantId);
}
RoomManager.prototype.unmutePublishedMedia = function (participantId) {
    var self = this
    self.internalManager.unmutePublishedMedia(participantId);
}
RoomManager.prototype.muteSubscribedMedia = function (remoteName, muteType, participantId) {
    var self = this
    self.internalManager.muteSubscribedMedia(remoteName, muteType, participantId);
}
RoomManager.prototype.unmuteSubscribedMedia = function (remoteName, participantId) {
    var self = this
    self.internalManager.unmuteSubscribedMedia(remoteName, participantId);
}
RoomManager.prototype.close = function () {
    var self = this
    if (!self.internalManager.isClosed()) {
        self.internalManager.close()
    }
}
RoomManager.prototype.isClosed = function () {
    var self = this
    return self.closed
}
RoomManager.prototype.getRooms = function () {
    var self = this
    return self.internalManager.getRooms()

}
RoomManager.prototype.getParticipants = function (roomName) {
    var self = this
    return self.internalManager.getParticipants(roomName)
}
RoomManager.prototype.getPublishers = function (roomName) {
    var self = this
    return self.internalManager.getPublishers(roomName)
}
RoomManager.prototype.getSubscribers = function (roomName) {
    var self = this
    return self.internalManager.getSubscribers(roomName)
}
RoomManager.prototype.getPeerPublishers = function (participantId) {
    var self = this
    return self.internalManager.getPeerPublishers(participantId)
}
RoomManager.prototype.getPeerSubscribers = function (participantId) {
    var self = this
    return self.internalManager.getPeerSubscribers(participantId)
}
RoomManager.prototype.isPublisherStreaming = function (participantId) {
    var self = this
    //return self.internalManager.getPeerSubscribers(participantId)
    var p =  self.getParticipant(participantId)
    //TODO throw RoomError is isClosed
    return p.isStreaming()
}
RoomManager.prototype.createRoom = function (kcSessionInfo) {
    var self = this
    var roomName = kcSessionInfo.getRoomName()
    var r = self.rooms[roomName]

    if (r) {
        throw new RoomError(util.format(''), RoomError.Code.ROOM_CANNOT_BE_CREATED_ERROR_CODE)
    }
    var kc = self.kcProvider.getKurentoClient(kcSessionInfo)
    r = new Room(roomName, kc, self.roomHandler, self.kcProvider.destroyWhenUnused())
    self.rooms[roomName] = r
    var kcName = "[NAME NOT AVAILABLE]";
    if (kc.getServerManager() !== null) {
        //kcName = kc.getServerManager(function(s){
        // return s.getName();
        // })
        kcName = kc.getServerManager().getName();

    }
    console.log("No room %s exists yet. Created one using KurentoClient %s .", roomName, kcName);
}
/**
 *
 * @param roomName
 */
RoomManager.prototype.closeRoom = function (roomName) {
    var self = this
    var room = self.rooms[roomName]

    if (!room)
        throw  new RoomError(util.format('Room %s not found', roomName), RoomError.Code.ROOM_NOT_FOUND_ERROR_CODE)

    if (room.isClosed())
        throw  new RoomError(util.format('Room %s already closed', roomName), RoomError.Code.ROOM_CLOSED_ERROR_CODE)

    var participants = self.getParticipants(roomName)
    var pids = room.getParticipantIds()
    for (var i = 0; i < pids.length; i++) {
        var pid = pids[i]
        try {
            room.leave(pid)
        } catch (re) {
            console.log('Error evicting participant with id %s from room %s', pid, roomName)
        }
    }
    room.close()
    delete self.rooms[roomName]
    console.log('Room %s removed and closed', roomName)
    return participants
}

RoomManager.prototype.getPipeline = function (participantId) {
    var self = this
    var p = self.getParticipant(participantId)
    return p.getPipeline()
}

RoomManager.prototype.getRoomName = function (participantId) {
    var self = this
    var p = self.getParticipant(participantId)
    return p.getRoom().getName()
}

RoomManager.prototype.getParticipantName = function (participantId) {
    var self = this
    var p = self.getParticipant(participantId)
    return p.getName()
}
RoomManager.prototype.getParticipantInfo = function (participantId) {
    var self = this
    var p = self.getParticipant(participantId)
    return new UserParticipant(participantId, p.getName())
}

RoomManager.prototype.getParticipant = function (participantId) {
    var self = this
    //return self.internalManager.getPipeline(participantId)
    for (var key in self.rooms) {
        var r = self.rooms[key]
        if (!r.isClosed()) {
            var p = r.getParticipant(participantId)
            if (p) {
                return p
            }
            //var exists = r.getParticipantIds().find(function (pid) {
            //    return pid === participantId
            //});
            //if (exists) {
            //}
        }
        var m = util.format('No participant with id %s was found', participantId)
        throw new RoomError(m, RoomError.Code.USER_NOT_FOUND_ERROR_CODE)
    }
}
//Array.prototype.map
module.exports = RoomManager