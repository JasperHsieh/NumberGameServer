var express = require('express');
var bodyParser = require('body-parser');
var mongodb = require('mongodb');
var assert = require('assert');

var app = express();
var MONGODB_URL = 'mongodb://localhost:27017/test';
app.use(bodyParser.urlencoded({
	extended:true
}));

//var userID = "00000000";
//var rivalID = "00000000";

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


function dump(mID, rID, cursor){

	console.log("dump");
	console.log(cursor);
}

// insert mongo db
function insertMongodb(document, callback){

	console.log("insertMongodb");
	Users_coll.insert(document, function(err, result){
		assert.equal(null, err);
		console.log("insert successfuly:" + result[0]);
		callback(document.user_ID, document.rival_ID);
	});
}

// update mongo db
function updateMongodb(collection, selector, document){

	console.log("updateMongodb");
	collection.update(selector, document, function(err, numberUpdated){
		assert.equal(null, err);
		console.log("update:" + selector.user_ID + " successfully");
	});
}

// query mongo db
function queryMongodb(document, callback){

	console.log("queryMongodb");
	Users_coll.find(document).toArray(function(err, docs){

		assert.equal(err, null);
		console.log(docs);
		//console.log(docs[0].rival_ID);

		callback(document.user_ID, document.rival_ID, docs);
	});
}

// delete mongo db
function deleteMongodb(document){

	console.log("deleteMongodb");
}

// handle post request
// if the ID is legal, then insert the user to database
// check if the opponent is already in database
app.post('/registerUserId', function(req, res){

	// Need to parse: UserID and RivalID
	var userID = req.body.UserID;
	var rivalID = req.body.RivalID;
	console.log("handle post request:" + userID + " " + rivalID);

	var obj = {};

	if(isIdLegal(userID) && isIdLegal(rivalID)){

		var doc = {user_ID:userID, rival_ID:rivalID, Match:0};
		Users_coll.insert(doc, function(err, result){

			assert.equal(null, err);
			console.log("iinsert successfuly:" + result.insertedCount);

			obj = {PostType:"registerUserId", Result:"Success"}
			var jstr = JSON.stringify(obj);
			res.send(jstr);

			startCheckMatch(userID, rivalID);
		});
	}
	else{
		obj = {PostType:"registerUserId", Result:"Fail"};
		var jstr = JSON.stringify(obj);
		res.send(jstr);
	}

});

app.post('/checkPairState', function(req, res){

	// Need to parse: PollingID
	var pollingID = req.body.PollingID;
	console.log("handle polling request from:" + pollingID);

	var doc = {user_ID:pollingID};

	Users_coll.find(doc).toArray(function(err, docs){

		assert.equal(null, err);
		var obj = {};
		if(docs.length == 1){
			console.log("polling result:" + docs[0].Match);
			//var obj = {matchResult:docs[0].Match, tableName:docs[0].Table_Name};
			var matchResult = docs[0].Match;
			if(matchResult == 1){

				obj = {PostType:"checkPairState", Result:"Success", 
						TargetNumber:docs[0].Target_Number, StartFirst:"true",
						TableName:docs[0].Table_Name
						};
			}
			else{

				console.log("not match yet");
				obj  = {PostType:"checkPairState", Result:"Fail"};
			}
		}
		else{
			console.log("user not found:" + docs.length);
			obj  = {PostType:"checkPairState", Result:"Fail"};
		}
		var jstr = JSON.stringify(obj);
		res.send(jstr);
	});
});

app.post('/checkTable', function(req, res){

	// Need to parse: UserID, RivalID and Table
	console.log("/checkTable");
	var userID = req.body.UserID;
	var rivalID = req.body.RivalID;
	var userCollName = req.body.Table;
	//var isFirst = req.body.IsFirst;
	var user_coll = db.collection(userCollName);

	console.log("userID:" + userID + " rivalID:" + rivalID + " table:" + userCollName);

	user_coll.find().toArray(function(err, docs){

		assert.equal(null, err);
		var rowSize = docs.length;
		//console.log("rowSize:" + rowSize);
		//var lastRowUser = docs[rowSize-1].User_name;
		var obj = {};

		if(isReadyForNextPlayer(userID, rivalID, userCollName, docs)){
			// rival has submited the numbers
			obj = {PostType:"checkTable", Result:"Success", RivalNumbers:docs[rowSize-1].guess, 
						RivalResult:docs[rowSize-1].guess_result};
		}
		else{
			// rival hasn't submit numbers
			obj = {PostType:"checkTable", Result:"Fail"};
		}

		var jstr = JSON.stringify(obj);
		res.send(jstr);
	});

});


app.post('/submitNumbers', function(req, res){

	console.log("/submitNumbers");
	// Need to parse: UserID, guessNumber, guessResult and Table
	var userID = req.body.UserID;
	var guessNumber = req.body.guessNumber;
	var guessResult = req.body.guessResult;
	var userCollName = req.body.Table;
	var user_coll = db.collection(userCollName);

	console.log("user:" + userID + " table:" + userCollName);
	console.log("submit:" + guessNumber + "," + guessResult);

	var doc = {User_name:userID, guess:guessNumber, guess_result:guessResult};
	user_coll.insert(doc, function(err, result){

		assert.equal(null, err);
		console.log("submit successfully");

		var obj = {PostType:"submitNumbers", Result:"Success"};
		var jstr = JSON.stringify(obj);
		res.send(jstr);
	});

});

function isReadyForNextPlayer(mID, rID, collName, cursor){

	var rowSize = cursor.length;

	if(rowSize < 1){
		// should not happen
		return false;
	}
	else{

		var lastUser = cursor[rowSize-1].User_name;
		if(lastUser == rID){
			return true;
		}
		else{
			return false;
		}
	}
	return false;
}

function isIdLegal(ID){

	console.log("isIdLegal():" + ID);

	if(!isNaN(ID)){
		return true;
	}
	else{
		return false;
	}

}

function addUser(mID, rID, callback){

	console.log("addUser()");
	var doc = {user_ID:mID, rival_ID:rID, Match:0};
	insertMongodb(doc, callback);

}

function startCheckMatch(mID, rID){

	console.log("startCheckMatch()");
	var doc = {user_ID:rID, rival_ID:mID, Match:0};
	queryMongodb(doc, checkMatch);
}

function checkMatch(mID, rID, cursor){

	console.log("checkMatch");
	console.log(cursor);
	if(cursor.length == 0){
		// Opponent hasn't input the ID, tell user to wait
		console.log("can't not find opponent");
	}
	else if(cursor.length == 1){
		// ID fetched, game start
		console.log("Opponent found");
		handleFetched(mID, rID);
	}
	else{
		// found more than one opponent, should not happen
		console.log("Something wrong");
	}
}

// create collection for users and set match flag
function handleFetched(mID, rID){

	console.log("handleFetched");
	var collection_name = "table_" + mID + "_" + rID;
	var new_coll = db.collection(collection_name);
	new_coll.insert({User_name:'test', guess:'0000', guess_result:'0A0B'}, function(err, result){
		assert.equal(null, err);
	});
	var sel = {user_ID:mID}
	var random = targetNumberGenerater();
	var doc = {$set:{Match:1, Table_Name:collection_name, Target_Number:random}};

	updateMongodb(Users_coll, sel, doc);

	sel = {user_ID:rID};
	updateMongodb(Users_coll, sel, doc);
}

function targetNumberGenerater(){
	var rn;
	var tn = "";
	var set = new Set();

	while(set.size < 4){
		rn  = Math.floor(Math.random()*10);
		set.add(rn);
	}
	for(item of set){
		tn = tn + item;
	}
	console.log("Generate random number:" + tn);
	return tn;
}
