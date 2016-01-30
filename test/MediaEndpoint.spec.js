/**
 * Created by ghostmac on 1/22/16.
 */
var debug = require('debug')('node-room-server:mediaendpoint.spec')

var util = require('util')
//var inherits = require('inherits');
var should = require('should');
var assert = require('assert');
//var EventEmitter = require('events').EventEmitter;
var MediaEndpoint = require('../sdk/endpoint/MediaEndpoint')
var PublisherEndpoint = require('../sdk/endpoint/PublisherEndpoint')

describe('MediaEndpoint', function () {
    it('init', function (done) {
        //var x = [{s:1},{},{test:'test'}]
        var x = ['w','2','test']
        //console.log(x)
        //console.log(x.indexOf('test'))
        var i = x.indexOf('2')
        //var ii = x.indexOf('')

        var xs = x.splice(i, 1)
        console.log(xs,x, x.length)
         //xs = x.splice('2', 1,'fs')
        //console.log(xs,x)

        //debug('mep:init')
        //var x = ['a', 'b', 2]
        //var mep = new MediaEndpoint({web: true})
        //var pep = new PublisherEndpoint()
        //assert(mep.isWeb())
        //assert(!pep.isWeb())
        var t = {};
        [0x01, 0x02, 0x04, 0x08].forEach(function (e, x, c) {
            //console.log(~e,e, 0x0f << e,0x0f >> e)
            console.log((0x02 << ~e))
            t[x] = ~(0x0f << e);
        });
        //console.log(t);
        //delete t[0]

        //Object.keys(t).forEach(function (i) {
        //    console.log(t[i]);
        //
        //})
        done()
    });
});