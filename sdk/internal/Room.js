/**
 * Created by ghostmac on 1/12/16.
 */
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
    console.log('New room instance named %s', self.name)
}

Room.prototype.getName = function () {
}
Room.prototype.getPipeline = function () {
}
Room.prototype.join = function (participantId, userName) {
}
Room.prototype.newPublisher = function (participant) {
}
Room.prototype.cancelPublisher = function (participant) {
}
Room.prototype.leave = function (participantId) {
}
Room.prototype.getParticipants = function () {
}
Room.prototype.getParticipantIds = function () {
}
Room.prototype.getParticipant = function (participantId) {
}
Room.prototype.getParticipantByName = function (userName) {
}
Room.prototype.close = function () {
}
Room.prototype.sendIceCandidate = function () {
}
Room.prototype.sendMediaError = function () {
}
Room.prototype.removeParticipant = function (participant) {
}
Room.prototype.getActivePublishers = function () {
}
Room.prototype.registerActivePublishers = function () {
}
Room.prototype.deregisterActivePublishers = function () {
}
Room.prototype.createPipeline = function () {
}
Room.prototype.closePipeline = function () {
}
Room.prototype.isClosed = function () {
}
Room.prototype.checkClosed = function () {
}

module.exports = Room
