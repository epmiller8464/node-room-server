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
        var x = ['w', '2', 'test']
        //console.log(x)
        //console.log(x.indexOf('test'))
        var i = x.indexOf('2')
        //var ii = x.indexOf('')

        var xs = x.splice(i, 1)
        //console.log(xs, x, x.length)
        //xs = x.splice('2', 1,'fs')
        //console.log(xs,x)

        //debug('mep:init')
        //var x = ['a', 'b', 2]
        //var mep = new MediaEndpoint({web: true})
        //var pep = new PublisherEndpoint()
        //assert(mep.isWeb())
        //assert(!pep.isWeb())
        var t = {};
        //[0x01, 0x02, 0x04, 0x08].forEach(function (e, x, c) {
        //    console.log(~e,e, 0x0f << e,0x0f >> e)
        //console.log((0x02 << ~e))
        //t[x] = ~(0x0f << e);
        //});
        //delete t[0]

        //Object.keys(t).forEach(function (i) {
        //    console.log(t[i]);
        //
        //})
        console.log(stringToHash(null))
        console.log(hashCode('text', true, 'e'))
        console.log(hashCode(undefined, false, null))

        done()
    });
});

function hashCode(partId, streaming, userName) {
    var prime = 31;
    var result = 1;
    var pid = (partId) ? (util.isNumber(partId) ? partId : stringToHash(partId)) : 0
    result = prime * result + (pid);
    result = prime * result + (streaming ? 1231 : 1237);
    //TODO:userName to hex
    var uid = (userName) ? (util.isNumber(userName) ? userName : stringToHash(userName)) : 0
    result = prime * result + (uid)
    return result;
};

function stringToHash(string) {

    string = (string) ? string.toString() : ''
    var hash = 0
    for (var i = 0; i < string.length; i++)
        hash += string.charCodeAt(i)
    return hash
}
