/*
 * (C) Copyright 2015 Kurento (http://kurento.org/)
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the GNU Lesser General Public License
 * (LGPL) version 2.1 which accompanies this distribution, and is available at
 * http://www.gnu.org/licenses/lgpl-2.1.html
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 */

//package org.kurento.room.rpc;
//
//import java.util.Collection;
//import java.util.concurrent.ConcurrentHashMap;
//import java.util.concurrent.ConcurrentMap;
//
//import org.kurento.jsonrpc.Session;
//import org.kurento.jsonrpc.Transaction;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;

function SessionWrapper(session) {
    var self = this
    //private static final Logger log = LoggerFactory.getLogger(SessionWrapper.class);
    //private Session session;
    self.session = session
    //private ConcurrentMap<Integer, Transaction> transactions = new ConcurrentHashMap<Integer, Transaction>();
    self.transactions = {}

}

SessionWrapper.prototype.getSession = function () {
    var self = this
    return self.session;
}

SessionWrapper.prototype.getTransaction = function (requestId) {
    var self = this
    return self.transactions[requestId]
}

SessionWrapper.prototype.addTransaction = function (requestId, trans) {
    var self = this
    var oldT = self.transactions[requestId] //.putIfAbsent(requestId, trans);
    if (oldT)
        console.log('Found an existing transaction for the key %s', requestId);
    else
        self.transactions[requestId] = trans
}

SessionWrapper.prototype.removeTransaction = function (requestId) {
    var self = this
    delete self.transactions[requestId]
}

SessionWrapper.prototype.getTransactions = function () {
    var self = this
    return self.transactions
}

