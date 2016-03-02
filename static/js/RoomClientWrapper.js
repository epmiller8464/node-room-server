/**
 * Created by ghostmac on 10/14/15.
 */

var WebRtcTestClient = (function () {
  "use strict";


  function WebRtcTestClient() {
    "use strict";

    var self = this;
    self.clientId = "";//options.id;
    self.video = undefined;
    self.console = undefined;
    self.ws = undefined;
    self.webRtcPeer = undefined;
  };

  WebRtcTestClient.prototype.init = function (options) {
    "use strict";
    var self = this;

    self.clientId = options.id;
    self.video = document.getElementById('video_' + self.clientId);
    var console = document.getElementById('console_' + self.clientId);

    self.console = new Console(null,options);

    $('#call_' + self.clientId).click(function () {
      //var self = WebRtcTestClient;
      if (!self.webRtcPeer) {
        showSpinner(self.video);

        var options = {
          localVideo: self.video,
          onicecandidate: function(candidate){
            self.onIceCandidate(candidate);
          }
        };

        self.webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(options, function (error) {
          if (error)
            return this.onError(error);

          this.generateOffer(function (error, offerSdp) {
            if (error) return onError(error);

            var message = {
              id: 'presenter',
              sdpOffer: offerSdp
            };
            self.sendMessage(message);
          });
        });
      }
    });

    $('#viewer_' + self.clientId).click(function(){
      //self.ws = new WebSocket('ws://' + location.host + '/r');
      if (!self.webRtcPeer) {
        showSpinner(self.video);

        var options = {
          remoteVideo: self.video,
          onicecandidate: function(candidate){
            self.onIceCandidate(candidate);
          }
        };

        self.webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(options, function (error) {
          if (error) return onError(error);

          this.generateOffer(function(error, offerSdp) {
            if (error) return onError(error);

            var message = {
              id: 'viewer',
              sdpOffer: offerSdp
            };
            self.sendMessage(message);
          });
        });
      }
    });


    $('#terminate_' + self.clientId).click(function () {

      if (self.webRtcPeer) {
        var message = {
          id: 'stop'
        };
        self.sendMessage(message);
        self.dispose();
      }
    });

    self.ws = new WebSocket('ws://' + location.host + '/r');

    self.ws.onmessage = function (message) {
      var parsedMessage = JSON.parse(message.data);
      self.console.info('Received message: ' + message.data);

      switch (parsedMessage.id) {
        case 'presenterResponse':
          self.presenterResponse(parsedMessage);
          break;
        case 'viewerResponse':
          self.viewerResponse(parsedMessage);
          break;
        case 'stopCommunication':
          self.dispose();
          break;
        case 'iceCandidate':
          //console.log(message);
            self.webRtcPeer.addIceCandidate(parsedMessage.candidate);

          break;
        default:
          self.console.error('Unrecognized message', parsedMessage);
      }
    };
  };

  WebRtcTestClient.prototype.presenterResponse = function (message) {
    var self = this;
    if (message.response != 'accepted') {
      var errorMsg = message.message ? message.message : 'Unknow error';
      self.console.warn('Call not accepted for the following reason: ' + errorMsg);
      self.dispose();
    } else {
      self.webRtcPeer.processAnswer(message.sdpAnswer);
    }
  };

  WebRtcTestClient.prototype.viewerResponse = function (message) {
    var self = this;
    if (message.response != 'accepted') {
      var errorMsg = message.message ? message.message : 'Unknow error';
      self.console.warn('Call not accepted for the following reason: ' + errorMsg);
      dispose();
    } else {
      self.webRtcPeer.processAnswer(message.sdpAnswer);
    }
  };

  WebRtcTestClient.prototype.onIceCandidate = function (candidate) {
    var self = this;
    //self.webRtcPeer.addIceCandidate(parsedMessage.candidate)
//  var self = this;
    self.console.log('Local candidate' + JSON.stringify(candidate));

      var message = {
        id : 'onIceCandidate',
        candidate : candidate
      }
      self.sendMessage(message);
  };

  WebRtcTestClient.prototype.dispose = function () {
    var self = this;
    if (self.webRtcPeer) {
      self.webRtcPeer.dispose();
      self.webRtcPeer = null;
    }
    if (self.ws) {
      self.ws.close();
    }
    hideSpinner(self.video);
  };

  WebRtcTestClient.prototype.sendMessage = function (message) {
    var self = this;
    var jsonMessage = JSON.stringify(message);
    self.console.log('Senging message: ' + jsonMessage);
    self.ws.send(jsonMessage);
  };

  function showSpinner() {
    for (var i = 0; i < arguments.length; i++) {
      arguments[i].poster = './img/transparent-1px.png';
      arguments[i].style.background = 'center transparent url("./img/spinner.gif") no-repeat';
    }
  }

  function hideSpinner() {
    for (var i = 0; i < arguments.length; i++) {
      arguments[i].src = '';
      arguments[i].poster = './img/webrtc.png';
      arguments[i].style.background = '';
    }
  }

  window.onbeforeunload = function () {
    "use strict";
    WebRtcTestClient.dispose();
  };

  /**
   * Lightbox utility (to display media pipeline image in a modal dialog)
   */
  $(document).delegate('*[data-toggle="lightbox"]', 'click', function (event) {
    event.preventDefault();
    $(this).ekkoLightbox();
  });

  return WebRtcTestClient;

})(window);