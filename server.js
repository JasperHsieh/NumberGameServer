var express = require('express');
var bodyParser = require('body-parser');
var mongoClient = require('mongodb').MongoClient;
var assert = require('assert');

var app = express();
var url = 'mongodb://localhost:27017/NumberGame';
/*
app.get('/', function(req, res){
	res.send('Hello World I am Jasper');
});
*/
app.use(bodyParser.urlencoded({
	extended:true
}));

var userID = "00000000";
var rivalID = "00000000";

app.use(bodyParser.json());
app.post('/', function(req, res){
	console.log("handle post request");
	
	console.log(req.body.UserID);
	console.log(req.body.RivalID);
	userID = req.body.UserID;
	rivalID = req.body.RivalID;
		
	res.send('You have posted the form');
});

app.listen(3000);
