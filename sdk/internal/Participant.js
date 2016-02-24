/**
 * Created by ghostmac on 1/12/16.
 */
var debug = require('debug')('node-room-server:participant')

var MutedMediaType = require('../api/MutedMediaType');
var RoomError = require('../exception/RoomException');

function noop(error, result) {
    if (error) console.trace(error);

    return result
}

var PublisherEndpoint = require('../endpoint/PublisherEndpoint')
var SubscriberEndpoint = require('../endpoint/SubscriberEndpoint')

function Participant(id, name, room, pipeline, web) {
    var self = this

    self._web = web || false
    self._id = id || ''
    self.id = self._id
    self._name = name || ''
    self._room = room || null
    self._pipeline = pipeline || null
    self._publisher = new PublisherEndpoint({web: web, owner: self, endpointName: name, pipeline: pipeline, log: null})
    //private final ConcurrentMap<String, SubscriberEndpoint> subscribers =
    //    new ConcurrentHashMap<String, SubscriberEndpoint>();
    self._subscribers = {}
    self._streaming = false
    self._closed = true
    self._log = null

    for (var other in self._room.getParticipants()) {
        if (self._name !== other.getName()) {
            self.getNewOrExistingSubscriber(other.getName())
        }
    }

}

Participant.prototype.createPublishingEndpoint = function (cb) {
    var self = this
    self._publisher.createEndpoint(function (error, ep) {

        if (self.getPublisher().getEndpoint() === null) {

            //throw new RoomError("Unable to create publisher endpoint", RoomError.Code.MEDIA_ENDPOINT_ERROR_CODE);
            var error = new RoomError("Unable to create publisher endpoint", RoomError.Code.MEDIA_ENDPOINT_ERROR_CODE);
            return cb(error, null)
        }
        return cb(null, ep)
    })
}

Participant.prototype.getId = function () {
    var self = this
    return self._id
}
Participant.prototype.getName = function () {
    var self = this
    return self._name
}

Participant.prototype.shapePublisherMedia = function (element, type) {
    var self = this
    if (!type) {
        self._publisher.apply(element)
    } else {
        self._publisher.apply(element, type)
    }
}
Participant.prototype.getPublisher = function () {
    var self = this
    //try {
    //if (!endPointLatch.await(Room.ASYNC_LATCH_TIMEOUT, TimeUnit.SECONDS))
    //    throw new RoomException(Code.MEDIA_ENDPOINT_ERROR_CODE,
    //        "Timeout reached while waiting for publisher endpoint to be ready");
    //} catch (InterruptedException e) {
    //    throw new RoomException(Code.MEDIA_ENDPOINT_ERROR_CODE,
    //        "Interrupted while waiting for publisher endpoint to be ready: "
    //        + e.getMessage());
    //}

    return self._publisher
}

Participant.prototype.getRoom = function () {
    var self = this
    return self._room

}
Participant.prototype.getPipeline = function () {
    var self = this
    return self._pipeline

}
Participant.prototype.isClosed = function () {
    var self = this
    return self._closed
}
Participant.prototype.isStreaming = function () {
    var self = this
    return self._streaming
}
Participant.prototype.isSubscribed = function () {
    var self = this
    for (var key in self._subscribers) {
        var sub = self._subscribers[key]
        if (sub.isConnectedToPublisher())
            return true;
    }

    return false;
}
Participant.prototype.getConnectedSubscribedEndpoints = function () {
    var self = this
    var endPoints = []
    for (var key in self._subscribers) {
        var sub = self._subscribers[key]
        if (sub.isConnectedToPublisher())
            endPoints.push(sub.getEndpointName())
    }
    return endPoints
}
Participant.prototype.preparePublishConnection = function (cb) {
    var self = this
    //var subscribedToSet = []
    console.log('USER %s: Request to publish video in room %s by' + 'initiating connection from server', self.getName(), self._room.getName());

    self.getPublisher().preparePublishConnection(function (error, result) {
        var sdpOffer = result
        console.trace('USER %s: Publishing SdpOffer is %s', self._name, sdpOffer)
        console.info('USER %s: Generated Sdp offer for publishing in room %s', self.getName(), self._room.getName())
        return cb(error, sdpOffer)
    })
}

Participant.prototype.publishToRoom = function (sdpType, sdpString, doLoopback, loopbackAltSrc, loopbackConnType) {
    var self = this
    console.info('USER %s: Request to publish video in room %s (sdp type %s)',
        self._name, self._room.getName(), sdpType);
    console.trace('USER %s: Publishing Sdp (%s) is %s', self._name, sdpType, sdpString)


    function callback(error, sdpAnswer) {
        self._streaming = true

        if (error) {
            throw  new RoomError('Error publishing to room', RoomError.Code.MEDIA_ENDPOINT_ERROR_CODE)
        }

        console.trace('USER %s: Publishing Sdp (%s) is %s', self._name, sdpType, sdpAnswer);
        console.info('USER %s: Is now publishing video in room %s', self._name, self._room.getName());

        return sdpAnswer
    }

    self.getPublisher().publish(sdpType, sdpString, doLoopback, loopbackAltSrc, loopbackConnType, callback)
}
Participant.prototype.unpublishMedia = function () {
    var self = this
    console.debug('PARTICIPANT %s: unpublishing media stream from room %S', self._name, self._room.getName());
    self.releasePublisherEndpoint();
    self._publisher = new PublisherEndpoint({
        web: self._web,
        owner: self,
        endpointName: self._name,
        pipeline: self._pipeline,
        log: self._log
    });

    //log.debug("PARTICIPANT {}: released publisher endpoint and left it "
    //    + "initialized (ready for future streaming)", this.name);
}
Participant.prototype.receiveMediaFrom = function (sender, sdpOffer) {
    var self = this
    var senderName = sender.getName();

    console.info('USER %s: Request to receive media from %s in room %s', self._name, senderName, self._room.getName());
    console.trace('USER %s: SdpOffer for %s is %s', self._name, senderName, sdpOffer);

    if (senderName === self._name) {
        console.warn('PARTICIPANT %s: trying to configure loopback by subscribing', self._name);
        throw new RoomError('Can loopback only when publishing media', RoomError.Code.USER_NOT_STREAMING_ERROR_CODE);
    }

    if (sender.getPublisher() === null) {
        console.warn('PARTICIPANT %s: Trying to connect to a user without ' + 'a publishing endpoint', self._name);
        return null;
    }

    console.debug('PARTICIPANT %s: Creating a subscriber endpoint to user %s', self._name, senderName);

    var subscriber = self.getNewOrExistingSubscriber(senderName);

    //CountDownLatch subscriberLatch = new CountDownLatch(1);
    var oldMediaEndpoint = subscriber.createEndpoint();
    //try {
    //    if (!subscriberLatch.await(Room.ASYNC_LATCH_TIMEOUT, TimeUnit.SECONDS))
    //        throw new RoomException(Code.MEDIA_ENDPOINT_ERROR_CODE,
    //            'Timeout reached when creating subscriber endpoint');
    //} catch (InterruptedException)
    //{
    //    throw new RoomException(Code.MEDIA_ENDPOINT_ERROR_CODE,
    //        'Interrupted when creating subscriber endpoint: '
    //        + e.getMessage());
    //}
    if (oldMediaEndpoint !== null) {
        console.warn('PARTICIPANT %s: Two threads are trying to create at the same time a subscriber endpoint for user %s', self._name, senderName);
        return null;
    }
    if (subscriber.getEndpoint() === null)
        throw new RoomError('Unable to create subscriber endpoint', RoomError.Code.MEDIA_ENDPOINT_ERROR_CODE)

    console.debug('PARTICIPANT %s: Created subscriber endpoint for user %s',
        self.name, senderName);
    try {
        var sdpAnswer = subscriber.subscribe(sdpOffer, sender.getPublisher());
        console.trace('USER %s: Subscribing SdpAnswer is %s', self._name, sdpAnswer);
        console.info('USER %s: Is now receiving video from %s in room %s', self._name, senderName, self._room.getName());
        return sdpAnswer;
    } catch (err) {
        // TODO Check object status when KurentoClient sets this info in the
        // object
        if (err.getCode() === 40101)
            console.warn('Publisher endpoint was already released when trying to connect a subscriber endpoint to it', err);
        else
            console.error('Exception connecting subscriber endpoint to publisher endpoint', err);
        self._subscribers.remove(senderName);
        self.releaseSubscriberEndpoint(senderName, subscriber);
    }
    return null;
}

Participant.prototype.cancelReceivingMedia = function (senderName) {
    var self = this
    var subscriberEndpoint = self._subscribers[senderName]
    delete  self._subscribers[senderName]
    if (!subscriberEndpoint || subscriberEndpoint.getEndpoint() === null) {
        console.log('PARTICIPANT: %s not connected to room: %s', self._name, senderName)
    } else {
        console.log('PARTICIPANT: %s cancel subscriber endpoint linked to user %s', self._name, senderName)
        self.releaseSubscriberEndpoint(senderName, subscriberEndpoint)
    }

}
Participant.prototype.mutePublishedMedia = function (muteType) {
    var self = this
    if (muteType === null) {
        throw new RoomError('MuteType cannot be null', RoomError.Code.MEDIA_MUTE_ERROR_CODE)
    }
    self.getPublisher().mute(muteType)
}
Participant.prototype.unmutePublishedMedia = function () {
    var self = this
    if (self.getPublisher().getMuteType() === null) {
        console.log('Media not muted')
    } else {
        self.getPublisher().unmute()
    }
}
Participant.prototype.muteSubscribedMedia = function (sender, muteType) {
    var self = this
    if (!muteType)
        throw new RoomError('MuteType cannot be null', RoomError.Code.MEDIA_MUTE_ERROR_CODE)

    var sn = sender.getName()
    var subEndpoint = self._subscribers[sn]
    if (!(subEndpoint || subEndpoint.getEndpoint())) {
        console.log('PARTICIPANT: %s No subscriber EP found  to mute for %s', self._name, sn)
    } else {
        subEndpoint.mute(muteType)
    }

}
Participant.prototype.unmuteSubscribedMedia = function (sender) {
    var self = this

    var sn = sender.getName()
    var subEndpoint = self._subscribers[sn]
    if (!(subEndpoint || subEndpoint.getEndpoint())) {
        console.log('PARTICIPANT: %s No subscriber EP found to unmute for %s', self._name, sn)
    } else {
        if (subEndpoint.getMuteType())
            subEndpoint.unmute()
    }
}
Participant.prototype.close = function () {
    var self = this

    console.log('closing user %s', self._name)

    if (self.isClosed()) {
        console.log('User %s already closed', self._name)
        return
    }
    self._closed = true

    for (var subscriberName in self._subscribers) {
        var subscriber = self._subscribers[subscriberName]
        if (subscriber && subscriber.getEndpoint()) {
            self.releaseSubscriberEndpoint(subscriberName, subscriber)
        }
    }
    self.releasePublisherEndpoint()
}
Participant.prototype.getNewOrExistingSubscriber = function (remoteName) {
    var self = this

    var sendingEndpoint = new SubscriberEndpoint({
        web: self._web,
        owner: self,
        endpointName: remoteName,
        pipeline: self._pipeline,
        log: self._log
    })

    var existingSendingEndpoint = self._subscribers[remoteName]
    if (!existingSendingEndpoint)
        self._subscribers[remoteName] = sendingEndpoint
    else
        sendingEndpoint = existingSendingEndpoint

    return sendingEndpoint

}
Participant.prototype.addIceCandidate = function (endpointName, iceCandidate) {
    var self = this
    var publisher = self._name === endpointName ? self.getPublisher() : self.getNewOrExistingSubscriber(endpointName)

    publisher.addIceCandidate(iceCandidate)
}
Participant.prototype.sendIceCandidate = function (endpointName, iceCandidate) {
    var self = this
    self._room.sendIceCandidate(self._id, endpointName, iceCandidate)
}
Participant.prototype.sendMediaError = function (event) {
    var self = this
    console.log(event)

    self._room.sendMediaError(self._id, 'Participant.prototype.sendMediaError')
}
Participant.prototype.releasePublisherEndpoint = function () {
    var self = this
    if (self._publisher && self._publisher.getEndpoint()) {
        self._streaming = false
        self._publisher.unregisterErrorListeners()
        var elements = self._publisher.getMediaElements()
        for (var key in elements) {
            var el = elements[key]
            self.releaseElement(self._name, el)
        }
        self.releaseElement(self._name, self._publisher.getEndpoint())
        self._publisher = null
    } else {
        console.log('Participant: %s trying to release publisher endpoint but is null', self._name)
    }
}
Participant.prototype.releaseSubscriberEndpoint = function (senderName, subscriber) {
    var self = this
    if (subscriber) {
        subscriber.unregisterErrorListeners()
        self.releaseElement(senderName, subscriber.getEndpoint())
    } else {
        console.log('Participant: %s trying to release subscriber endpoint for %s but is null', self._name, senderName)
    }
}
Participant.prototype.releaseElement = function (senderName, element) {
    var self = this
    try {
        element.release(function (err) {

            if (err) {

                console.log(err)
            }

        })
    } catch (err) {
        console.log(err)
    }
}
Participant.prototype.toString = function () {
    var self = this
    return '[User: ' + self._name + ']';
}
Participant.prototype.hashCode = function () {
    var self = this

    var id = self.id(),
        name = self._name(),
        prime = 31,
        result = 1;

    var pid = (id) ? (util.isNumber(id) ? id : stringToHash(id)) : 0
    var uid = (name) ? (util.isNumber(name) ? name : stringToHash(name)) : 0

    result = prime * result + (pid);
    result = prime * result + (uid);
    return result;
}
Participant.prototype.equals = function (obj) {
    var self = this
    if (!obj || !(obj instanceof Participant))
        return false

    return self.id === obj.id && self.name === obj.name

}

function stringToHash(string) {
    var hash = 0
    for (var i = 0; i < string.length; i++)
        hash += string.charCodeAt(i)
    return hash
}
module.exports = Participant