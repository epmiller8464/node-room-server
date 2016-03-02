/**
 * Created by ghostmac on 1/12/16.
 */
//var EventEmitter = require('events').EventEmitter
var util = require('util')
var kurento = require('kurento-client');
var Room = require('./internal/Room')
var UserParticipant = require('./api/poco/UserParticipant')
var SdpType = require('./endpoint/SdpType')
var RoomError = require('./exception/RoomException')
function RoomManager(roomHandler, kcProvider) {
    //EventEmitter.call(this)
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
    var msg = 'Request [JOIN_ROOM] user=%s, room=%s, web=%s kcSessionInfo.room=%s (%s)'
    console.log(msg, userName, roomName, webParticipant, (kcSessionInfo || kcSessionInfo.getRoomName()), pid)
    var room = self.rooms[roomName]

    if (!room && kcSessionInfo) {
        room = self.createRoom(kcSessionInfo)
        if (!room) {
            msg = util.format('Room %s not found, must be create before %s can join', roomName, userName)
            console.log(msg)
            throw new RoomError(msg, RoomError.Code.ROOM_NOT_FOUND_ERROR_CODE)
        }

        if (room.isClosed()) {
            msg = util.format('%s is trying to join room %s but it is closing.', userName, roomName)
            console.log(msg)
            throw new RoomError(msg, RoomError.Code.ROOM_CLOSED_ERROR_CODE)
        }
    }
    var existingParticipants = self.getParticipants(roomName)
    room.join(pid, userName, webParticipant, function (error, participant) {

        if (error) {
            console.log(util.format('%s is trying to join room %s but an error occurred: %s.', userName, roomName, error))
        }
        if (participant) {
            console.log(util.format('%s joined room %s.', userName, roomName))
        }
        //cb(error, participant)
    })
    return existingParticipants

}

RoomManager.prototype.leaveRoom = function (participantId) {
    var self = this
    console.log('Request [LEAVE_ROOM] (%s)', participantId);
    var participant = self.getParticipant(participantId);
    var room = participant.getRoom();
    var roomName = room.getName();
    if (room.isClosed()) {
        var msg = util.format('\'%s\' is trying to leave from room \'%s\' but it is closing', participant.getName(), roomName)
        console.log(msg)
        throw new RoomError(msg, RoomError.Code.ROOM_CLOSED_ERROR_CODE)
    }
    room.leave(participantId);
    var remainingParticipants = null
    try {
        remainingParticipants = self.getParticipants(roomName);
    } catch (e) {
        console.log('Possible collision when closing the room \'%s\' (not found), %s', roomName, e)
        remainingParticipants = null;
    }
    if (!remainingParticipants) {
        console.log('No more participants in room \'%s\', removing it and closing it', roomName);
        room.close();
        delete self.rooms[roomName]
        console.log('Room \'%s\' removed and closed', roomName)
    }
    return remainingParticipants;
}

RoomManager.prototype.publishMedia = function (participantId,
                                               isOffer,
                                               sdp,
                                               loopbackAltSrc,
                                               loopbackConnType,
                                               doLoopback,
                                               mediaElements,
                                               cb) {
    var self = this
    console.log('Request [PUBLISH_MEDIA] isOffer=%s sdp=%s loopbackAltSrc=%s loopbackConnType=%s doLoopback=%s mediaElements=%s (%s)',
        isOffer, sdp, loopbackAltSrc === null, loopbackConnType, doLoopback, mediaElements, participantId);

    var sdpType = isOffer ? SdpType.OFFER : SdpType.ANSWER;
    var participant = self.getParticipant(participantId);
    var name = participant.getName();
    var room = participant.getRoom();
    participant.createPublishingEndpoint(function (error, endPoint) {
        //publisher.createPublishingEndpoint(function (error, result) {
        console.log(error, endPoint)


        if (error) {
        }

        for (var i = 0; i < mediaElements.length; i++) {
            var elem = mediaElements[i]
            participant.getPublisher().apply(elem);
        }

        var sdpResponse = participant.publishToRoom(sdpType, sdp, doLoopback, loopbackAltSrc, loopbackConnType);
        var msg = 'Error generating SDP response for publishing user: ' + name;
        if (!sdpResponse)
            throw new RoomError(msg, RoomError.Code.MEDIA_SDP_ERROR_CODE)

        room.newPublisher(participant);
        return cb(null, sdpResponse)
    });
}

RoomManager.prototype.generatePublishOffer = function (participantId) {
    var self = this
    console.log('Request [GET_PUBLISH_SDP_OFFER] (%s)', participantId)
    var participant = self.getParticipant(participantId);
    var name = participant.getName();
    var room = participant.getRoom();
    participant.createPublishingEndpoint(function (error, endpoint) {

        participant.preparePublishConnection(function (error, sdpOffer) {

            if (!sdpOffer)
                throw new RoomError('Error generating SDP offer for publishing user ' + name, RoomError.Code.MEDIA_SDP_ERROR_CODE)
            room.newPublisher(participant)
            return sdpOffer

        })
    });
}

RoomManager.prototype.unpublishMedia = function (participantId) {
    var self = this
    console.log('Request [UNPUBLISH_MEDIA] (%s)', participantId);
    var participant = self.getParticipant(participantId)
    var name = participant.getName()
    if (!participant.isStreaming()) {
        var msg = util.format('Participant \'%s\' is not streaming media', name)
        throw new RoomError(msg, RoomError.Code.USER_NOT_STREAMING_ERROR_CODE)
    }

    var room = participant.getRoom()
    participant.unpublishMedia()
    room.cancelPublisher(participant)
}

RoomManager.prototype.subscribe = function (remoteName, sdpOffer, participantId) {
    var self = this
    console.log('Request [SUBSCRIBE] remoteParticipant=%s sdpOffer=%s (%s)', remoteName, sdpOffer, participantId);
    var participant = self.getParticipant(participantId);
    var name = participant.getName();
    var room = participant.getRoom();
    var msg = ''
    var senderParticipant = room.getParticipantByName(remoteName);
    if (!senderParticipant) {
        msg = util.format('PARTICIPANT %s: Requesting to recv media from user %s in room %s but user could not be found', name, remoteName, room.getName())
        console.log(msg)
        msg = util.format('User %s not found in room %s', remoteName, room.getName())
        throw new RoomError(msg, RoomError.Code.USER_NOT_FOUND_ERROR_CODE)
    }

    if (!senderParticipant.isStreaming()) {
        msg = util.format('PARTICIPANT %s: Requesting to recv media from user %s in room %s but user is not streaming media', name, remoteName, room.getName())
        console.log(msg)
        msg = util.format('User %s not streaming media in room %s', remoteName, room.getName())
        throw new RoomError(msg, RoomError.Code.USER_NOT_STREAMING_ERROR_CODE)
    }

    var sdpAnswer = participant.receiveMediaFrom(senderParticipant, sdpOffer);
    if (!sdpAnswer) {
        msg = util.format('Unable to generate SDP answer when subscribing to\'%s\'', remoteName)
        //msg = util.format('User %s not streaming media in room %s', remoteName, room.getName())
        throw new RoomError(msg, RoomError.Code.MEDIA_SDP_ERROR_CODE)
    }
    return sdpAnswer;
}

RoomManager.prototype.unsubscribe = function (remoteName, participantId) {
    var self = this
    console.log('Request [UNSUBSCRIBE] remoteParticipant=%s (%s)', remoteName, participantId)
    var participant = self.getParticipant(participantId)
    var name = participant.getName()
    var room = participant.getRoom()
    var senderPart = room.getParticipantByName(remoteName)
    if (!senderPart) {
        var msg = util.format('PARTICIPANT %s: Requesting to unsubscribe from user %s ' +
            'in room %s but user could not be found', name, remoteName, room.getName());
        console.log(msg)
        throw new RoomError(msg, RoomError.Code.USER_NOT_FOUND_ERROR_CODE)
    }
    participant.cancelReceivingMedia(remoteName)
}

RoomManager.prototype.onIceCandidate = function (endpointName,
                                                 candidate,
                                                 sdpMLineIndex,
                                                 sdpMid,
                                                 participantId) {
    var self = this
    console.log('Request [ICE_CANDIDATE] endpoint=%s candidate=%s sdpMLineIdx=%s sdpMid=%s (%s)',
        endpointName, candidate, sdpMLineIndex, sdpMid, participantId)
    var participant = self.getParticipant(participantId);
    var iceCandidate = kurento.register.complexTypes.IceCandidate({
        candidate: candidate,
        sdpMLineIndex: sdpMLineIndex,
        sdpMid: sdpMid
    });

    participant.addIceCandidate(endpointName, iceCandidate)
}

RoomManager.prototype.addMediaElement = function (participantId, element, type) {
    var self = this
    var eid = element.getId()
    console.log('Add media element %s (connection type: %s) to participant %s',
        eid, type, participantId)

    var participant = self.getParticipant(participantId);
    var name = participant.getName();
    if (participant.isClosed())
        throw new RoomError(
            util.format('Participant %s has been closed', name),
            RoomError.Code.USER_CLOSED_ERROR_CODE)

    participant.shapePublisherMedia(element, type);
}

RoomManager.prototype.removeMediaElement = function (participantId, element) {
    var self = this
    var eid = element.getId()
    console.log('Remove media element %s from participant %s', eid, participantId)

    var participant = self.getParticipant(participantId);
    var name = participant.getName();
    if (participant.isClosed())
        throw new RoomError(
            util.format('Participant %s has been closed', name),
            RoomError.Code.USER_CLOSED_ERROR_CODE)
    //"");
    participant.getPublisher().revert(element);
    //participant.shapePublisherMedia(element, type);
}

//RoomManager.prototype.sendMessage = function (message, userName, roomName, participantId) {
//    var self = this
//    console.log('participantId [SEND_MESSAGE] message=%s (%s)', message, participantId)
//    try {
//        var pid = participantId.getParticipantId(),
//            e = null,
//            msg = null
//        if (self.internalManager.getParticipantName(pid) !== userName) {
//            msg = util.format('Provided username %s differs from the participants name.', userName)
//            e = new RoomError(msg, RoomError.Code.USER_NOT_FOUND_ERROR_CODE)
//        }
//        else if (self.internalManager.getRoomName(pid) !== roomName) {
//            msg = util.format('Provided room name %s differs from the participants room.', roomName)
//            e = new RoomError(msg, RoomError.Code.ROOM_NOT_FOUND_ERROR_CODE)
//        }
//        if (e) {
//            console.log('Participant: %s Error sending message %s', userName, msg)
//            self.notificationRoomHandler.onSendMessage(participantId, null, null, null, null, e);
//        }
//        else {
//            var participants = self.internalManager.getParticipants(roomName)
//            self.notificationRoomHandler.onSendMessage(participantId, message, userName, roomName, participants, null)
//        }
//    } catch (roomError) {
//        console.log('Participant: %s Error sending message %s', userName, roomError)
//        self.notificationRoomHandler.onSendMessage(participantId, null, null, null, null, roomError);
//    }
//}

RoomManager.prototype.mutePublishedMedia = function (muteType, participantId) {
    var self = this
    //TODO add logic
    //self.internalManager.mutePublishedMedia(muteType, participantId);
}

RoomManager.prototype.unmutePublishedMedia = function (participantId) {
    var self = this
    //TODO add logic
    //self.internalManager.unmutePublishedMedia(participantId);
}

RoomManager.prototype.muteSubscribedMedia = function (remoteName, muteType, participantId) {
    var self = this
    //self.internalManager.muteSubscribedMedia(remoteName, muteType, participantId);
    //TODO add logic
}

RoomManager.prototype.unmuteSubscribedMedia = function (remoteName, participantId) {
    var self = this
    //self.internalManager.unmuteSubscribedMedia(remoteName, participantId);
    //TODO add logic
}

RoomManager.prototype.close = function () {
    var self = this
    self.closed = true;
    console.log('Closing all rooms');
    for (var roomName in self.rooms) {
        try {
            self.closeRoom(roomName);

        } catch (e) {
            console.log('Error closing room %s', roomName, e);
        }
    }
}

RoomManager.prototype.isClosed = function () {
    var self = this
    return self.closed
}

RoomManager.prototype.getRooms = function () {
    var self = this
    return Object.keys(self.rooms)
}

RoomManager.prototype.getParticipants = function (roomName) {
    var self = this
    var r = self.rooms[roomName];
    if (!r)
        throw new RoomError(
            util.format('Room %s not found', roomName),
            RoomError.Code.USER_NOT_STREAMING_ERROR_CODE)

    var participants = r.getParticipants();
    var userParts = {}
    for (var key in participants) {
        var p = participants[key]
        if (!p.isClosed()) {
            var pid = p.getId()
            userParts[pid] = new UserParticipant(pid, p.getName(), p.isStreaming())
        }
    }
    return userParts;
}

RoomManager.prototype.getPublishers = function (roomName) {
    var self = this
    var r = self.rooms[roomName];
    if (!r)
        throw new RoomError(
            util.format('Room %s not found', roomName),
            RoomError.Code.USER_NOT_STREAMING_ERROR_CODE)

    var participants = r.getParticipants();
    var userParts = {}
    for (var key in participants) {
        var p = participants[key]
        if (!p.isClosed() && p.isStreaming()) {
            var pid = p.getId()
            userParts[pid] = new UserParticipant(pid, p.getName(), true)
        }
    }
    return userParts;
}

RoomManager.prototype.getSubscribers = function (roomName) {
    var self = this
    var r = self.rooms[roomName];
    if (!r)
        throw new RoomError(
            util.format('Room %s not found', roomName),
            RoomError.Code.USER_NOT_STREAMING_ERROR_CODE)
    //RoomError.Code.ROOM_NOT_FOUND_ERROR_CODE,
    var participants = r.getParticipants();
    var userParts = {}
    for (var key in participants) {
        var p = participants[key]
        if (!p.isClosed() && p.isSubscribed()) {
            var pid = p.getId()
            userParts[pid] = new UserParticipant(pid, p.getName(), p.isStreaming())
        }
    }
    return userParts;
}

RoomManager.prototype.getPeerPublishers = function (participantId) {
    var self = this
    var participant = self.getParticipant(participantId);
    //if (participant == null)
    //    throw new RoomException(Code.USER_NOT_FOUND_ERROR_CODE,
    //        "No participant with id '" + participantId + "' was found");
    var subscribedEndpoints = participant.getConnectedSubscribedEndpoints()
    var room = participant.getRoom()
    var userParts = {}
    for (var epName in subscribedEndpoints) {
        var p = room.getParticipantByName(epName);
        //userParts.add(new UserParticipant(p.getId(), p.getName()));
        var pid = p.getId()
        userParts[pid] = new UserParticipant(pid, p.getName())
    }
    return userParts;
}

RoomManager.prototype.getPeerSubscribers = function (participantId) {
    var self = this
    var participant = self.getParticipant(participantId);

    if (!participant.isStreaming())
        throw new RoomError(
            util.format('Participant with id %s is not a publisher yet', participantId),
            RoomError.Code.USER_NOT_STREAMING_ERROR_CODE)

    var userParts = {}
    var room = participant.getRoom()
    var endpointName = participant.getName()
    var parts = room.getParticipants()
    for (var key in parts) {
        var p = parts[key]
        if (!p.equals(participant)) {
            var subscribedEndpoints = p.getConnectedSubscribedEndpoints();
            //var ep = subscribedEndpoints[endpointName]
            var ep = subscribedEndpoints[subscribedEndpoints.indexOf(endpointName)]
            //var ep = subscribedEndpoints.find(function (epn) {
            //    return epn === endpointName
            //});
            //if (subscribedEndpoints.contains(endpointName))
            if (ep) {
                var pid = p.getId()
                userParts[pid] = new UserParticipant(pid, p.getName())
            }
        }
    }
    return userParts;
}

RoomManager.prototype.isPublisherStreaming = function (participantId) {
    var self = this
    var p = self.getParticipant(participantId)
    //TODO throw RoomError is isClosed

    if (p.isClosed())
        throw new RoomError(util.format('Participant %s has been closed.', participantId),
            RoomError.Code.USER_CLOSED_ERROR_CODE)

    return p.isStreaming()
}

RoomManager.prototype.createRoom = function (kcSessionInfo, cb) {
    var self = this
    var roomName = kcSessionInfo.getRoomName()
    var room = self.rooms[roomName]

    if (room) {
        throw new RoomError(util.format('Room %s already exists', roomName),
            RoomError.Code.ROOM_CANNOT_BE_CREATED_ERROR_CODE)
    }
    var kc = self.kcProvider.getKurentoClient(kcSessionInfo)
    room = new Room(roomName, kc, self.roomHandler, self.kcProvider.destroyWhenUnused())
    self.rooms[roomName] = room
    var kcName = '[NAME NOT AVAILABLE]';
    //var sm = kc.getServerManager().then().getName()
    //xs kcName = sm.getName()
    console.log(util.inspect(kc.getServerManager()))
    //kc.getServerManager(function (manager) {
    //
    //    if (manager !== null) {
    //        kcName = manager.getName();
    //    }
    //
    //    console.log("No room %s exists yet. Created one using KurentoClient %s .", roomName, kcName);
    //
    //    //return cb(room)
    //})
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
    //noinspection UnterminatedStatementJS
    var self = this
    var p = self.getParticipant(participantId)
    return new UserParticipant(participantId, p.getName())
}

RoomManager.prototype.getParticipant = function (participantId) {
    var self = this
    for (var key in self.rooms) {
        var r = self.rooms[key]
        if (!r.isClosed()) {
            var p = r.getParticipant(participantId)
            if (p) {
                return p
            }
        }
    }
    var m = util.format('No participant with id %s was found', participantId)
    throw new RoomError(m, RoomError.Code.USER_NOT_FOUND_ERROR_CODE)
}
//var exists = r.getParticipantIds().find(function (pid) {
//    return pid === participantId
//});
//if (exists) {
//}
//Array.prototype.map
module.exports = RoomManager