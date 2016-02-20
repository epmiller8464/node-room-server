/**
 * Created by ghostmac on 1/12/16.
 */


function RoomHandler() {
}

/**
 * Called as a result of an error intercepted on a media element of a
 * participant. The participant should be notified.
 *
 * @param roomName name of the room
 * @param participantId identifier of the participant
 * @param errorDescription description of the error
 */


RoomHandler.prototype.onIceCandidate = function onIceCandidate(roomName, participantId, endPointName, candidate) {
};

RoomHandler.prototype.onMediaElementError = function onMediaElementError(roomName, participantId, errorDescription) {
};

/**
 * Called as a result of an error intercepted on the media pipeline. The
 * affected participants should be notified.
 *
 * @param roomName the room where the error occurred
 * @param participantIds the participants identifiers
 * @param errorDescription description of the error
 */
RoomHandler.prototype.onPipelineError = function onPipelineError(roomName, participantIds, errorDescription) {
};

module.exports = RoomHandler