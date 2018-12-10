#!/usr/bin/env node

var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

// Connection URL
var url = 'mongodb://hello:hello@192.168.100.100:27017/proj_db';

/**
 * docker exec -it mongo_mongo_1 bash
 * mongo --port 27017 -u root -p 'example' --authenticationDatabase 'admin'
 */

/**
 * 
use proj_db
db.createUser(
  {
    user: "hello",
    pwd: "hello",
    roles: [
       { role: "readWrite", db: "proj_db" }
    ]
  }
)
 */
// Use connect method to connect to the server
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected successfully to server");
  db.collection('Persons', function (err, collection) {
        
    collection.insert({ id: 1, firstName: 'Steve', lastName: 'Jobs' });
    collection.insert({ id: 2, firstName: 'Bill', lastName: 'Gates' });
    collection.insert({ id: 3, firstName: 'James', lastName: 'Bond' });
    
    

    db.collection('Persons').count(function (err, count) {
        if (err) throw err;
        
        console.log('Total Rows: ' + count);
    });
});
  db.close();
});
