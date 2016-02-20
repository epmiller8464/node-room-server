/**
 * Created by ghostmac on 2/17/16.
 */
//public abstract class DefaultJsonRpcHandler<P> implements JsonRpcHandler<P> {


function JsonRpcHandler() {
    var self = this
}

JsonRpcHandler.prototype.handleRequest = function (transaction, request) {
}

JsonRpcHandler.prototype.afterConnectionEstablished = function (session) {
}

JsonRpcHandler.prototype.afterConnectionClosed = function (session, status) {
}

JsonRpcHandler.prototype.handleTransportError = function (session, exception) {
}

JsonRpcHandler.prototype.handleUncaughtException = function (session, exception) {
}

JsonRpcHandler.prototype.getHandlerType = function () {
}

JsonRpcHandler.prototype.withSockJS = function () {
}

JsonRpcHandler.prototype.isSockJSEnabled = function () {
}

JsonRpcHandler.prototype.withAllowedOrigins = function (origins) {
}

JsonRpcHandler.prototype.allowedOrigins = function () {
}

JsonRpcHandler.prototype.withLabel = function (label) {
}

JsonRpcHandler.prototype.getLabel = function () {
}

JsonRpcHandler.prototype.withPingWatchdog = function (pingAsWachdog) {
}

JsonRpcHandler.prototype.isPingWatchdog = function () {
}

module.exports = JsonRpcHandler