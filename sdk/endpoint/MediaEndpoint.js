/**
 * Created by ghostmac on 1/12/16.
 */
var debug = require('debug')('node-room-server:mediaendpoint')

var kurento = require('kurento-client');
var MutedMediaType = require('../api/MutedMediaType');
var RoomError = require('../exception/RoomException');

function noop(error, result) {
    if (error) console.trace(error);

    return result
}


var EndpointConfig = {web: false, owner: null, endpointName: null, pipeline: null, log: null}

/**
 * Constructor to set the owner, the endpoint's name and the media pipeline.
 * @param {EndpointConfig} endpointConfig
 * @constructor
 */
function MediaEndpoint(endpointConfig) {
    var self = this;
    endpointConfig = endpointConfig || {}

    self._log = endpointConfig.log || null;
    //private boolean web = false;
    self._web = endpointConfig.web || false;
    //private String endpointName;
    self._endpointName = endpointConfig.endpointName || null;
    //private MediaPipeline pipeline = null;
    self._pipeline = endpointConfig.pipeline || null;
    //private Participant owner;
    self._owner = endpointConfig.owner || null;
    //private WebRtcEndpoint webEndpoint = null;
    self._webRtcEndpoint = null; //WebRtcEndpoint
    //private  endpoint = null;
    self._endpoint = null; //RtpEndpoint
    //private ListenerSubscription endpointSubscription = null;
    self._endpointSubscription = null;
    //private LinkedList<IceCandidate> candidates = new LinkedList<IceCandidate>();
    self._candidates = [];
    //private MutedMediaType muteType;
    self._muteType = MutedMediaType.NONE
}


MediaEndpoint.prototype.isWeb = function () {
    return this._web;
};

MediaEndpoint.prototype.getOwner = function () {
    return this._owner;
};

MediaEndpoint.prototype.getEndpoint = function () {
    if (this.isWeb()) {
        return this._webRtcEndpoint;
    }
    else {
        return this._endpoint;
    }
};

MediaEndpoint.prototype.getWebEndpoint = function () {
    return this._webRtcEndpoint;
};

MediaEndpoint.prototype.getRtpEndpoint = function () {
    return this._endpoint;
};

MediaEndpoint.prototype.getEndpointName = function () {
    return this._endpointName;
};

MediaEndpoint.prototype.setEndpointName = function (endpointName) {
    this._endpointName = endpointName
};

MediaEndpoint.prototype.createEndpoint = function (cb) {
    console.log('createEndpoint');
    var self = this
    var old = self.getEndpoint();
    if (!old) {
        self.internalEndpointInitialization(cb);
    } else {

        if (self.isWeb()) {
            console.log('ice candidates : %s', self._candidates.length);
            while (self._candidates.length) {
                self.internalAddIceCandidate(self._candidates.shift());
            }
        }
    }

    return old;
};

MediaEndpoint.prototype.getPipeline = function () {
    return this._pipeline;
};

/**
 * @param pipeline {MediaPipeline}
 * */
MediaEndpoint.prototype.setMediaPipeline = function (pipeline) {
    this._pipeline = pipeline;

};

MediaEndpoint.unregisterErrorListeners = function () {
    this.unregisterElementErrListener(this._endpoint, this._endpointSubscription);
};

/**
 * @param muteType {MutedMediaType}
 */
MediaEndpoint.mute = function (muteType) {
};

MediaEndpoint.unmute = function () {
};

MediaEndpoint.prototype.getMuteType = function () {
};

/**
 * @param muteType {MutedMediaType}
 */
MediaEndpoint.prototype.setMuteType = function (muteType) {
    this._muteType = muteType;
};

/**
 *
 * @param newMuteType
 */
MediaEndpoint.prototype.resolveCurrentMuteType = function (newMuteType) {
    var self = this
    var prev = self.getMuteType();
    if (prev !== null) {
        switch (prev) {
            case MutedMediaType.AUDIO:
                if (self._muteType === MutedMediaType.VIDEO) {
                    self.setMuteType(MutedMediaType.ALL);
                    return;
                }
                break;
            case MutedMediaType.VIDEO:
                if (self._muteType === MutedMediaType.AUDIO) {
                    self.setMuteType(MutedMediaType.ALL);
                    return;
                }
                break;
            case MutedMediaType.ALL:
                break;
        }
    }
    self.setMuteType(newMuteType)
};

/**
 * Creates the endpoint (RTP or WebRTC) and any other additional elements
 * (if needed).
 *
 */
MediaEndpoint.internalEndpointInitialization = function (cb) {
    var self = this;
    if (self.isWeb()) {

        self._pipeline.create('WebRtcEndpoint', function (error, webRtcEndpoint) {
            if (error) {
                //return callback(error, null);
                //throw new Error(error);
                return cb(error, null)
            }

            self._webRtcEndpoint = webRtcEndpoint;
            //self._endpointSubscription = self.registerElemErrListener(webRtcEndpoint);
            console.log("EP %s: Created a new WebRtcEndpoint", self._endpointName);
            return cb(null, self._webRtcEndpoint )
            //self.registerOnIceCandidateEventListener()
            //webRtcEndpoint.on('OnIceCandidate', function (event) {
            //    var candidate = kurento.register.complexTypes.IceCandidate(event.candidate);
            //    ws.send(JSON.stringify({
            //        id: 'iceCandidate',
            //        candidate: candidate,
            //        sessionId: sessionId
            //    }));
            //});
        });
    } else {
        self._pipeline.create('RtpEndpoint', function (error, endpoint) {
            if (error) {
                //return callback(error, null);
                throw new Error(error);
            }

            self._endpoint = endpoint;
            self._endpointSubscription = self.registerElemErrListener(endpoint);
            console.log("EP %s: Created a new RtpEndpoint", self._endpointName);
        });
    }
};

/**
 * Registers a listener for when the {@link MediaElement} triggers an
 * @param element {MediaElement}
 *
 * {@link ErrorEvent}. Notifies the owner with the error.
 *
 */
MediaEndpoint.prototype.registerElemErrListener = function (element) {
    if (!element)
        return

    var listener = this._owner.sendMediaError;
    return element.on('Error', listener)
};

/**
 *
 * @param element
 * @param subscription
 */
MediaEndpoint.prototype.unregisterElementErrListener = function (element, subscription) {
//element.addListener
    if (!(element || subscription))
        return;

    element.removeListener('Error', subscription)
};

/**
 *
 * @param offer {String}
 * @returns {*|external:Promise}
 */
MediaEndpoint.prototype.processOffer = function (offer, cb) {
    var self = this;
    cb = (cb || noop).bind(self)

    if (self.isWeb()) {

        if (!self._webRtcEndpoint)
            throw new RoomError('Cannot process offer when WebRtcEndpoint is null (ep: ' + self._endpointName + ')', RoomError.Code.MEDIA_WEBRTC_ENDPOINT_ERROR_CODE);

        //return self._webRtcEndpoint.processOffer(offer);
        return self._webRtcEndpoint.processOffer(offer, cb);
        //return self._webRtcEndpoint.processOffer(offer, function (err, sdpAnswer) {
        //    if (err) {
        //        console.log(err);
        //
        //    } else {
        //        console.log(sdpAnswer);
        //    }
        //    return sdpAnswer
        //})
    }
    else {
        if (!self._endpoint)
            throw new RoomError('Cannot process offer when RtpEndpoint is null (ep: ' + self._endpointName + ')', RoomError.Code.MEDIA_RTP_ENDPOINT_ERROR_CODE);

        return self._endpoint.processOffer(offer, cb);

        //return self._endpoint.processOffer(offer, function (err, sdpAnswer) {
        //    if (err) {
        //        console.log(err);
        //
        //    } else {
        //        console.log(sdpAnswer);
        //    }
        //    return sdpAnswer
        //})
    }
};

/**
 *
 * @returns {*|external:Promise}
 */
MediaEndpoint.prototype.generateOffer = function (cb) {
    console.log('generate offer');
    var self = this
    cb = (cb || noop).bind(self)

    if (self.isWeb()) {
        if (!self._webRtcEndpoint)
            throw new RoomError('Cannot process offer when WebRtcEndpoint is null (ep: ' + self._endpointName + ')', RoomError.Code.MEDIA_RTP_ENDPOINT_ERROR_CODE);

        return self._webRtcEndpoint.generateOffer(cb);
        //return self._webRtcEndpoint.generateOffer(cb)
    } else {
        if (!self._endpoint)
            throw new RoomError('Cannot process offer when RtpEndpoint is null (ep: ' + self._endpointName + ')', RoomError.Code.MEDIA_RTP_ENDPOINT_ERROR_CODE);

        return self._endpoint.generateOffer(cb);
        //return this._endpoint.generateOffer(cb);
    }
};

MediaEndpoint.prototype.processAnswer = function (answer, cb) {
    var self = this
    cb = (cb || noop).bind(self)

    if (self.isWeb()) {
        if (!self._webRtcEndpoint)
            throw new RoomError('Cannot process offer when WebRtcEndpoint is null (ep: ' + self._endpointName + ')', RoomError.Code.MEDIA_WEBRTC_ENDPOINT_ERROR_CODE);

        return self._webRtcEndpoint.processAnswer(answer, cb);
        //return self._webRtcEndpoint.processAnswer(answer, function (err) {
        //    if (err) {
        //        console.log(err);
        //
        //    } else {
        //        console.log(answer);
        //    }
        //})
    } else {
        if (!self._endpoint)
            throw new RoomError('Cannot process offer when RtpEndpoint is null (ep: ' + self._endpointName + ')', RoomError.Code.MEDIA_RTP_ENDPOINT_ERROR_CODE);

        return self._endpoint.processAnswer(answer, cb);

        //return self._endpoint.processAnswer(answer, function (err) {
        //    if (err) {
        //        console.log(err);
        //
        //    } else {
        //        console.log(answer);
        //    }
        //});
        //return self._endpoint.generateOffer(cb);
    }
};

/**
 *
 * @param candidate
 * @param cb
 */
MediaEndpoint.prototype.addIceCandidate = function (candidate, cb) {
    var self = this
    cb = (cb || noop).bind(self)

    if (!self.isWeb()) {
        throw new RoomError("Operation not supported", RoomError.Code.MEDIA_NOT_A_WEB_ENDPOINT_ERROR_CODE);
    }

    if (!self._webRtcEndpoint) {
        self._candidates.push(candidate)
    } else {
        self.internalAddIceCandidate(candidate, cb)
    }
};

MediaEndpoint.prototype.registerOnIceCandidateEventListener = function () {
    var self = this;

    if (!self.isWeb())
        return;

    if (!self._webRtcEndpoint)
        throw new RoomError('Cant register event listener for null WebRtcEndpoint ' + self._endpointName + ')',
            RoomError.Code.MEDIA_WEBRTC_ENDPOINT_ERROR_CODE);

    self._webRtcEndpoint.on('OnIceCandidate', function (event) {
        var candidate = kurento.register.complexTypes.IceCandidate(event.candidate);
        self._owner.sendIceCandidate(self._endpointName, candidate);
    });

};

/**
 *
 * @param cb
 * @returns {*|external:Promise}
 */
MediaEndpoint.prototype.gatherCandidates = function (cb) {
    var self = this
    cb = (cb || noop).bind(self)
    if (!self.isWeb())
        return cb();

    if (!self._webRtcEndpoint)
        throw new RoomError('Cannot process offer when WebRtcEndpoint is null (ep: ' + self._endpointName + ')', RoomError.Code.MEDIA_WEBRTC_ENDPOINT_ERROR_CODE);

    return self._webRtcEndpoint.gatherCandidates(cb)
};

MediaEndpoint.prototype.internalAddIceCandidate = function (candidate, cb) {
    var self = this;
    cb = (cb || noop).bind(self)

    if (!self._webRtcEndpoint)
        throw new RoomError('Cant add existing ICE candidates to null WebRtcEndpoint (ep: ' + self._endpointName + ')', RoomError.Code.MEDIA_WEBRTC_ENDPOINT_ERROR_CODE);

    var _candidate = kurento.register.complexTypes.IceCandidate(candidate);
    console.info('adding IceCandidate');
    self._webRtcEndpoint.addIceCandidate(_candidate, function (err) {
        if (err) {
            console.log(err);
            throw new RoomError('error:' + err + ',EP: %s ' + self._endpointName + ')', RoomError.Code.MEDIA_WEBRTC_ENDPOINT_ERROR_CODE);
        }
        return cb()
    });
};


module.exports = MediaEndpoint