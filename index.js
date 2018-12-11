#!/usr/bin/env node

var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');
var fs = require('fs');
const {promisify} = require('util');
//var getAreaCodeList=require('./getAreaCodeList');
// Connection URL
var url = 'mongodb://hello:hello@192.168.100.100:27017/proj_db';


function getAreaCodeList() {
  let areaCodeList;
  return new Promise(function (resolve) {
    fs.readFile('area_code.js', 'utf8', function (err, data) {
      if (err) throw err;
      areaCodeList = JSON.parse(data);
      resolve(areaCodeList);
    });
  });


}

MongoClient.connect(url, function (err, db) {
  assert.equal(null, err);
  console.log("Connected successfully to server");
  db.collection('DeviceTree', function (err, collection) {
    const deviceTreeFindOneAsync = promisify(db.collection('DeviceTree').findOne);
    getAreaCodeList().then(function (areaCodeList) {
      for (var key in areaCodeList) {
        if (areaCodeList.hasOwnProperty(key)) {
          let code = areaCodeList[key].code;
          let name = areaCodeList[key].name;
          let treeNode = null;
          if (code.endsWith('0000')) {
            //省或者直辖市
            treeNode = {};
            treeNode.nodeType = '1';
            treeNode.civilCode = code;
            treeNode.nodeName = name;
            treeNode.parentId = null;
          } else if (code.endsWith('00') && code.substring(2, 4) !== '00') {
            //市
            treeNode = {};
            treeNode.nodeType = '1';
            treeNode.civilCode = code;
            treeNode.nodeName = name;
            let parentNode = db.collection('DeviceTree').findOne({ civilCode: code.substring(0, 2) + '0000' });
            treeNode.parentId = parentNode.id;
            treeNode.ancestors = [parentNode.id];
          } else {
            //区或者县级市
            treeNode = {};
            treeNode.nodeType = '1';
            treeNode.civilCode = code;
            treeNode.nodeName = name;
            let parentNode = db.collection('DeviceTree').findOne({ civilCode: code.substring(0, 4) + '00' });
            let grandParentNode = db.collection('DeviceTree').findOne({ civilCode: code.substring(0, 2) + '0000' });
            treeNode.parentId = parentNode.id;
            treeNode.ancestors = [grandParentNode.id, parentNode.id];
          }

          if(treeNode!==null){
             collection.insert(treeNode);
          }
        }
      }
    });

  });
  db.close();
});






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

/**
 * 

MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected successfully to server");
  db.collection('Persons', function (err, collection) {
    
    console.log("insert start time:" + Date.now());
    for(let i=0; i < 10000;i++){
      collection.insert({ id: i, firstName: 'Node' + i });
    }
    console.log("insert end time:" + Date.now());
    
    
    console.log("query start time:" + Date.now());
    db.collection('Persons').count(function (err, count) {
        if (err) throw err;
        console.log('Total Rows: ' + count);
        console.log("query end time:" + Date.now());
    });
    
});
  db.close();
});
 */
