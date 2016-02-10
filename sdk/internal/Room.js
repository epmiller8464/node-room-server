/**
 * Created by ghostmac on 1/12/16.
 */
var debug = require('debug')('node-room-server:mediaendpoint')

var RoomError = require('../exception/RoomException');
var Participant = require('./Participant')
var util = require('util')
function Room(roomName, kurentoClient, roomHandler, destroyKurentoClient) {

    var self = this
    self.participants = {}
    self.name = roomName
    self.pipeline = null
    self.kurentoClient = kurentoClient
    self.roomHandler = roomHandler
    self.destroyKurentoClient = destroyKurentoClient
    self.closed = false
    self.activePublishers = 0
    self.pipelineReleased = false
    console.log('New room instance named %s', self.name)
}

Room.prototype.getName = function () {
    return this.name
}
Room.prototype.getPipeline = function () {
    return this.pipeline
}
Room.prototype.join = function (participantId, userName, webParticipant) {

    var self = this
    self.checkClosed()

    if (!(userName) || userName === '')
        throw new RoomError('Empty userName is not allowed', RoomError.Code.GENERIC_ERROR_CODE)
//TODO look @ refector
    for (var key in self.participants) {
        var p = self.participants[key]
        if (self.name === p.getName())
            throw new RoomError('User  %s already exists in room', RoomError.Code.EXISTING_USER_IN_ROOM_ERROR_CODE)

    }

    self.createPipeline()
    self.participants[participantId] = new Participant(participantId, userName, self, self.getPipeline(), webParticipant)
    console.log('Room: %s Added participant %s', self.name, userName)

}
Room.prototype.newPublisher = function (participant) {
    var self = this
    self.registerPublisher()
    var existing = []
    for (var key in self.participants) {
        var p = self.participants[key]
        if (!p.equals(participant)) {
            p.getNewOrExistingSubscriber(participant.getName())
            existing.push(p.getName())
        }
    }
    console.log('Room: %s virtually subscribed other participants %s to new publisher %s', self.name, existing.join(','), participant.getName())
}
Room.prototype.cancelPublisher = function (participant) {
    var self = this
    self.deregisterPublisher()
    var existing = []
    for (var key in self.participants) {
        var subscriber = self.participants[key]
        if (!subscriber.equals(participant)) {
            subscriber.cancelReceivingMedia(participant.getName())
            existing.push(subscriber.getName())
        }
    }
    console.log('Room: %s unsubscribed other participants %s from the publisher %s', self.name, existing.join(','), participant.getName())

}
Room.prototype.leave = function (participantId) {
    var self = this
    self.checkClosed()
    var p = self.participants[participantId]
    if (!p)
        throw new RoomError(util.format('User: %s  not found in room %s ', participantId, self.name), RoomError.Code.USER_NOT_FOUND_ERROR_CODE)
    console.log('Participant: %s leaving room %s', p.getName(), self.name)

    if (p.isStreaming())
        self.deregisterPublisher()
    self.removeParticipant(p)
    p.close()
}
Room.prototype.getParticipants = function () {
    var self = this
    self.checkClosed()
    var result = []
    for (var key in self.participants) {
        result.push(self.participants[key])
    }

    return result
}
/**
 *
 * @returns {Array}
 */
Room.prototype.getParticipantIds = function () {
    var self = this
    self.checkClosed()
    return Object.keys(self.participants)
}
Room.prototype.getParticipant = function (participantId) {
    var self = this
    self.checkClosed()
    return self.participants[participantId]
}
Room.prototype.getParticipantByName = function (userName) {
    var self = this
    self.checkClosed()
    for (var key in self.participants) {
        var p = self.participants[key]
        if (p.getName() === userName)
            return p
    }
    return null
}
Room.prototype.close = function () {
    var self = this


    if (self.closed) {
        console.log('Room: is already closed', self.name)
        return
    }

    for (var key in self.participants) {
        var p = self.participants[key]
        if (p)
            p.close()

        delete self.participants[key]
    }
    self.closePipeline()
    console.log('Room: %s closed', self.name)

    if (self.destroyKurentoClient)
        self.kurentoClient.destroy()

    self.closed = true

}
Room.prototype.sendIceCandidate = function (pid, endpointName, candidate) {
    var self = this
    self.roomHandler.onIceCandidate(self.name, pid, endpointName, candidate)
}
Room.prototype.sendMediaError = function (pid, description) {
    var self = this
    self.roomHandler.onMediaElementError(self.name, pid, description)
}
Room.prototype.isClosed = function () {
    return this.closed
}

Room.prototype.checkClosed = function () {
    var self = this
    if (self.closed)
        throw new RoomError(util.format('Room %s is already closed', self.name), RoomError.Code.ROOM_CLOSED_ERROR_CODE)
}
Room.prototype.removeParticipant = function (participant) {
    var self = this

    self.checkClosed()
    var pid = participant.getId()
    delete self.participants[pid]

    for (var key in self.participants) {
        var p = self.participants[key]
        p.cancelReceivingMedia(participant.getName())
    }
}
Room.prototype.getActivePublishers = function () {
    return this.activePublishers
}
Room.prototype.registerPublisher = function () {
    this.activePublishers++
}
Room.prototype.deregisterPublisher = function () {
    this.activePublishers--
}
Room.prototype.createPipeline = function (callback) {
    var self = this
    if (self.pipeline) {
        return callback(null, self.pipeline)

    }
    else {
        console.log('Room %s creating Media Pipeline', self.name)
        try {
            self.kurentoClient.create('MediaPipeline', function (error, pipeline) {
                if (error) {
                    console.log('Room: %s Failed to create MediaPipeline', self.name)
                    return callback(error);
                } else {
                    self.pipeline = pipeline
                    console.log('Room: %s successfully created MediaPipeline', self.name)
                }
            })
        } catch (roomError) {
            console.log('Unable to create MediaPipeline for room %s, Error: %s ', self.name, roomError)
        }

        if (!self.getPipeline()) {
            throw new RoomError(util.format('Unable to create MediaPipeline for room %s', self.name), RoomError.Code.ROOM_CANNOT_BE_CREATED_ERROR_CODE)
        }
        self.pipeline.on('Error', function (evt) {

            if (evt) {
                var desc = util.format('Room: %s Pipeline error occurred. Room.prototype.createPipeline', self.name)
                self.roomHandler.onPipelineError(self.name, self.getParticipantIds(), desc)
            }

        })
    }

}
Room.prototype.closePipeline = function (callback) {
    var self = this
    if (!self.pipeline) {
        return callback()
    }
    else {
        self.getPipeline().release(function (err) {

            if (err) {
                console.log('An error occurred releasing the media pipeline for room %s, Error: %s ', self.name, err)
            } else {
                console.log('Room: %s released MediaPipeline ', self.name)
            }

            self.pipeline = true

        })
    }
}

module.exports = Room
