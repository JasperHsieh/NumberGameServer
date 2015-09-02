var express = require('express');
var bodyParser = require('body-parser');
var mongodb = require('mongodb');
var assert = require('assert');

var app = express();
var MONGODB_URL = 'mongodb://localhost:27017/test';
app.use(bodyParser.urlencoded({
	extended:true
}));

var userID = "00000000";
var rivalID = "00000000";

app.use(bodyParser.json());

var db;
var Users_coll;

// Initialize connection once
mongodb.MongoClient.connect(MONGODB_URL, function(err, database){

	if(err){
		console.log('mongodb connect failed :', err);
		//throw err;
	}
	else{
		console.log('mongodb connect successfully');
		db = database;
		Users_coll = db.collection('Users');
		//assert(1===3, 'assert fail');
		//console.log(Users_coll);
		//console.log(database);
		queryMongodb({}, dump);

		app.listen(3000);
		console.log('NumberGame server listening on port 3000');
	}
	
});


function dump(cursor){

	console.log("dump");
	console.log(cursor);
}

// insert mongo db
function insertMongodb(document){

	console.log("insertMongodb:");
	Users_coll.insert(document, function(err, result){
		assert.equal(null, err);
		//console.log("result:" + result);
	});
}

// update mongo db
function updateMongodb(document){

	console.log("updateMongodb:" + document);
}

// query mongo db
function queryMongodb(document, callback){

	console.log("queryMongodb:");
	Users_coll.find(document).toArray(function(err, docs){

		assert.equal(err, null);
		console.log(docs);
		//console.log(docs[0].rival_ID);

		callback(docs);
	});
}

// delete mongo db
function deleteMongodb(document){

	console.log("deleteMongodb:" + document);
}


// handle post request
// if the ID is legal, then insert the user to database
// check if the opponent is already in database
app.post('/', function(req, res){
	//console.log(req.body.UserID);
	//console.log(req.body.RivalID);
	userID = req.body.UserID;
	rivalID = req.body.RivalID;
	console.log("handle post request:" + userID + " " + rivalID);

	if(isIdLegal(userID, rivalID)){

		addUser(userID, rivalID);
	}

	startCheckMatch(userID, rivalID);

	res.send('You have posted the form');
});

function isIdLegal(mID, rID){

	console.log("isIdLegal()" + " mID:" + mID + " rID:" + rID);

	if((!isNaN(mID)) && (!isNaN(rID))){
		return true;
	}
	else{
		return false;
	}

}

function addUser(mID, rID){

	console.log("addUser()");
	var doc = {user_ID:mID, rival_ID:rID, Match:0};
	insertMongodb(doc);

}

function startCheckMatch(mID, rID){

	console.log("startCheckMatch()");
	var doc = {user_ID:rID, rival_ID:mID, Match:0};
	queryMongodb(doc, checkMatch);
}

function checkMatch(cursor){

	console.log("checkMatch");
	console.log(cursor);
	if(cursor.length == 0){
		// Opponent hasn't input the ID, tell user to wait
		console.log("can't not find opponent");
	}
	else if(cursor.length == 1){
		// ID fetched, game start
		console.log("Opponent found");
		handleFetched();
	}
	else{
		// found more than one opponent, should not happen
		console.log("Something wrong");
	}
}

// create collection for users and set match flag
function handleFetched(){

	console.log("handleFetched");
	var collection_name = "table_" + userID + "_" + rivalID;
	var new_coll = db.collection(collection_name);
	new_coll.insert({Username:'test', guess:'0A0B'}, function(err, result){
		assert.equal(null, err);
	});
	Users_coll.update({user_ID:userID}, {$set:{Match:1}});
	Users_coll.update({user_ID:rivalID}, {$set:{Match:1}});
}
