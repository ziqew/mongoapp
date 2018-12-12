#!/usr/bin/env node

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
var fs = require('fs');
//var getAreaCodeList=require('./getAreaCodeList');
// Connection URL
let url = 'mongodb://hello:hello@192.168.100.100:27017/proj_db';
let dbName = 'proj_db';


const getAreaCodeList = (path, opts = 'utf8') =>
    new Promise((resolve, reject) => {
        fs.readFile(path, opts, (err, data) => {
            if (err) {
                reject(err)
            }
            else{
                let areaCodeList = JSON.parse(data);
                resolve(areaCodeList);
            }
        })
    });




async function processCodeArea(item, deviceTree) {


    let code = item.code;
    let name = item.name;
    let treeNode = null;
    if (code.endsWith('0000')) {
        //省或者直辖市
        treeNode = {};
        treeNode.nodeType = '1';
        treeNode.civilCode = code;
        treeNode.nodeName = name;
        treeNode.parentId = null;
        treeNode.level=1;
    } else if (code.endsWith('00') && code.substring(2, 4) !== '00') {
        //市
        treeNode = {};
        treeNode.nodeType = '1';
        treeNode.civilCode = code;
        treeNode.nodeName = name;
        treeNode.level=2;
        let parentNode = await deviceTree.findOne({civilCode: code.substring(0, 2) + '0000'});
        treeNode.parentId = parentNode._id;
        treeNode.ancestors = [parentNode._id];
    } else {
        //区或者县级市
        treeNode = {};
        treeNode.nodeType = '1';
        treeNode.civilCode = code;
        treeNode.nodeName = name;
        treeNode.level=3;
        let parentNode = await deviceTree.findOne({civilCode: code.substring(0, 4) + '00'});
        console.log('xxxxx');
        if (parentNode != null) {
            let grandParentNode = await deviceTree.findOne({civilCode: code.substring(0, 2) + '0000'});
            treeNode.parentId = parentNode._id;
            treeNode.ancestors = [grandParentNode._id, parentNode._id];
        } else {
            console.log('yyyyyy');
            parentNode = await deviceTree.findOne({civilCode: code.substring(0, 2) + '0000'});
            treeNode.parentId = parentNode._id;
            treeNode.ancestors = [parentNode._id];
        }

    }
    await deviceTree.insertOne(treeNode);

}


async function processAreaCodeList(areaCodeList,db){
    await areaCodeList.forEach(async (item) => {
        await processCodeArea(item, db.collection('DeviceTree'));
    });
}


async function insertTreeGroupMain(){
    const client = new MongoClient(url,{auto_reconnect: true,
        poolSize: 10});

    try {
        // Use connect method to connect to the Server
        await client.connect();
        const db = client.db(dbName);
        let areaCodeList=await getAreaCodeList('area_code.js');
        await processAreaCodeList(areaCodeList,db);



    } catch (err) {
        console.log(err.stack);
    }
    // Close connection
    //client.close();
}


async function insertInGroup(item, deviceTree) {

}

async function insertTreeDeviceMain(){
    const client = new MongoClient(url,{auto_reconnect: true,
        poolSize: 10});

    try {
        // Use connect method to connect to the Server
        await client.connect();
        const db = client.db(dbName);
        let groupNodesLevelThree=await db.collection('DeviceTree').find({level:3});

        await groupNodesLevelThree.forEach(async (item) => {
            await insertInGroup(item, db.collection('DeviceTree'));
        });


    } catch (err) {
        console.log(err.stack);
    }
}

insertTreeGroupMain();



/**

 MongoClient.connect(url, function (err, db) {
  assert.equal(null, err);
  console.log("Connected successfully to server");
  db.collection('DeviceTree', function (err, deviceTree) {

    getAreaCodeList().then(function (areaCodeList) {
      areaCodeList.forEach(async (item) => {
        await processCodeArea(item,deviceTreeFindOneAsync,deviceTree);
      });

    }).finally(() => {
        console.log("end")
        db.close();
    });

  });

});
 */


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
