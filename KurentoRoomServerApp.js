//package org.kurento.room;
//import static org.kurento.commons.PropertiesManager.getPropertyJson;
//import java.util.List;
//
///**
// * @author Ivan Gracia (izanmail@gmail.com)
// * @author Micael Gallego (micael.gallego@gmail.com)
// * @since 1.0.0
// */
//@Import(JsonRpcConfiguration.class)
//@SpringBootApplication

var ws = require('ws')
var RoomJsonRpcHandler = require('./RoomJsonRpcHandler')
var AutodiscoveryKurentoClientProvider = require('./AutodiscoveryKurentoClientProvider')
var FixedOneKmsManager = require('./kms/FixedOneKmsManager')
var JsonRpcNotificationService = require('./rpc/JsonRpcNotificationService')
var JsonRpcUserControl = require('./rpc/JsonRpcUserControl')
var NotificationRoomManager = require('./sdk/NotificationRoomManager')
var hostAddress = 'wss://roomAddress:roomPort/room'
var KMSS_URIS_PROPERTY = 'kms.uris';
var KMSS_URIS_DEFAULT = '[ \'ws://localhost:8888/kurento\' ]';
function KurentoRoomServerApp() {

    var self = this
//	private static JsonRpcNotificationService userNotificationService = new JsonRpcNotificationService();
    self.userNotificationService = new JsonRpcNotificationService()
    self.log = null
}

KurentoRoomServerApp.kmsManager = function () {
    var self = this
    var kmsUris = []//getPropertyJson(KMSS_URIS_PROPERTY, KMSS_URIS_DEFAULT, JsonArray.class);
    var kmsWsUris = []// JsonUtils.toStringList(kmsUris);

    if (!kmsWsUris.length) {
        throw new Error(KMSS_URIS_PROPERTY + ' should contain at least one kms url');
    }

    var firstKmsWsUri = kmsWsUris[0]
    if (firstKmsWsUri === 'autodiscovery') {
        console.log('Using autodiscovery rules to locate KMS on every pipeline');
        return new AutodiscoveryKurentoClientProvider();

    } else {

        console.log('Configuring Kurento Room Server to use first of the following kmss: ' + kmsWsUris);
        return new FixedOneKmsManager(firstKmsWsUri);
    }
}

KurentoRoomServerApp.notificationService = function () {
    var self = this
    return self.userNotificationService
}
KurentoRoomServerApp.roomManager = function () {
    var self = this
    return new NotificationRoomManager(self.userNotificationService, self.kmsManager());
}
KurentoRoomServerApp.userControl = function () {
    return new JsonRpcUserControl();
}

KurentoRoomServerApp.registerJsonRpcHandlers = function () {
    //RoomJsonRpcHandler
}
KurentoRoomServerApp.roomHandler = function () {
    var self = this
    return new RoomJsonRpcHandler();
}
//
KurentoRoomServerApp.registerJsonRpcHandlers = function (registry) {
    var self = this
    registry.addHandler(self.roomHandler(), '/room');
}
//	public static void main(String[] args) throws Exception {
//		start(args);
//	}
//
// 	public static ConfigurableApplicationContext start(String[] args) {
//		return SpringApplication.run(KurentoRoomServerApp.class, args);
//	}
//}
