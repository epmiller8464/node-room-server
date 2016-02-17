/**
 * Created by ghostmac on 2/17/16.
 */
//public abstract class DefaultJsonRpcHandler<P> implements JsonRpcHandler<P> {


function JsonRpcHandler() {
    var self = this
    //private final Logger log = LoggerFactory.getLogger(DefaultJsonRpcHandler.class);
    self.log = null;
    self.useSockJs = false;
    self.label = '';
    self.pingWatchdog = false;
    self.allowedOrigins = [];
}
JsonRpcHandler.prototype.handleRequest = function (transaction, request) {}

JsonRpcHandler.afterConnectionEstablished = function (session) {}

JsonRpcHandler.afterConnectionClosed = function (session, status) {}

JsonRpcHandler.handleTransportError = function (session, exception) {
    //var self = this
    console.log('Transport error. Exception %s, Session: %s', exception, session)
}

JsonRpcHandler.handleUncaughtException = function (session, exception) {
    var self = this
    console.log('Uncaught exception in handler %s, %s', self.getHandlerType(), exception);
}

JsonRpcHandler.getHandlerType = function () {
    var self = this
    //return self.getClass();
    return 'JsonRpcHandler'
}

JsonRpcHandler.withSockJS = function () {
    var self = this
    self.useSockJs = true;
    return this;
}

JsonRpcHandler.isSockJSEnabled = function () {
    var self = this
    return self.useSockJs;
}

JsonRpcHandler.withAllowedOrigins = function (origins) {
    var self = this

    self.allowedOrigins = new Arrary(origins);
    return self;
}

JsonRpcHandler.allowedOrigins = function () {
    var self = this
    return self.allowedOrigins;
}

JsonRpcHandler.withLabel = function (label) {
    var self = this
    self.label = label;
    return self;
}

JsonRpcHandler.getLabel = function () {
    var self = this
    return self.label;
}

JsonRpcHandler.withPingWatchdog = function (pingAsWachdog) {
    var self = this
    self.pingWatchdog = pingAsWachdog;
    return self;
}

JsonRpcHandler.isPingWatchdog = function () {
    var self = this
    return self.pingWatchdog;
}
