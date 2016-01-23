/**
 * Created by ghostmac on 1/22/16.
 */
var util = require('util')
//var inherits = require('inherits');
var should = require('should');
var assert = require('assert');
//var EventEmitter = require('events').EventEmitter;
var MediaEndpoint = require('../sdk/endpoint/MediaEndpoint')
var PublisherEndpoint = require('../sdk/endpoint/PublisherEndpoint')

describe('MediaEndpoint', function () {
    it('init', function (done) {
        var mep = new MediaEndpoint({web: true})
        var pep = new PublisherEndpoint()
        assert(mep.isWeb())
        assert(!pep.isWeb())
        done()
    });
});