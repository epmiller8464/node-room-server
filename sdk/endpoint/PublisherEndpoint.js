/**
 * Created by ghostmac on 1/12/16.
 */
var inherits = require('inherits');
var MediaEndpoint = require('./MediaEndpoint');

function PublisherEndpoint() {
    var self = this;
    PublisherEndpoint.super_.call(self);
}

inherits(PublisherEndpoint, MediaEndpoint);


module.exports = PublisherEndpoint