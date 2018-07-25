var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var mongoClient = require('mongodb').MongoClient;
var mongoUrl = "mongodb://localhost:27017/";
var dbName = 'mentalhealthdb';


// Collections
var usersColl = "Users";
var topicsColl = "Topics";
var chatsColl = "Chats";

app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());

app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

app.set('port', process.env.PORT || 3000);


app.post('/signup', function(postReq, postRes){
	var obj = postReq.body;
	var username = obj.username;

	mongoClient.connect(mongoUrl, obj, function(connerErr, db) {
		if (connerErr) throw connerErr;
		var dbo = db.db(dbName);

		// Verify if user already exists
		dbo.collection(usersColl).find({username : username}).toArray(function(findErr, findRes) {
			if (findErr) throw findErr;
			if (findRes.length != 0) {
				console.log("username already exists: ", username)
				db.close();
				postRes.json({statusMessage : -1});
				return;
			}

			// Insert user into db
			dbo.collection(usersColl).insertOne(obj, function(insertErr, insertRes) {
				if (insertErr) throw insertErr;
				console.log("user created: ", username);
				db.close();
				postRes.json({statusMessage : 1});
			});
		});
	});
});


app.post('/login', function(postReq, postRes) {
	var obj = postReq.body;

	mongoClient.connect(mongoUrl, obj, function(connerErr, db) {
		if (connerErr) throw connerErr;
		var dbo = db.db(dbName);

		// Verify if entry exists in users collection
		dbo.collection(usersColl).find(obj).toArray(function(findErr, findRes) {
			if (findErr) throw findErr;
			if (findRes.length != 0) {
				db.close();
				postRes.json({statusMessage : 1});
				return;
			}

			postRes.json({statusMessage : -1});
		});
	});
});


app.get('/gettopics', function(postReq, postRes) {
	console.log("Retrieving topics");
	var obj = postReq.body;

	mongoClient.connect(mongoUrl, obj, function(connerErr, db) {
		if (connerErr) throw connerErr;
		var dbo = db.db(dbName);

		dbo.collection(topicsColl).find().toArray(function(findErr, findRes) {
			if (findErr) throw findErr;
			db.close();
			postRes.json(findRes);
		});
	});
});


app.get('/getchatpreviews', function(postReq, postRes) {
	var obj = postReq.query;

	mongoClient.connect(mongoUrl, function(err, db) {
		if (err) throw err;
		var dbo = db.db("mentalhealthdb");
		dbo.collection(chatsColl).aggregate(
			[
			{ $lookup:
				  {
					from: 'Users',
					localField: 'username',
					foreignField: 'username',
					as: 'userdetail'
				  }
			},
			{ $unwind:
				{
					path: "$userdetail",
					preserveNullAndEmptyArrays: false
				}
			},
			{ $match:
				{
					TopicID : obj.topicId
				}
			}
			]
		).toArray(function(chatErr, chatRes) {
			if (chatErr) throw chatErr;

			if (chatRes.length <= 0) {
				postRes.json([]);
				return;
			}

			var chatPreviewsObj = [];
			for (var i = 0; i < chatRes.length; i ++) {
				var chatPreviewObj = {};
				chatPreviewObj.avatarId = chatRes[i].userdetail.avatarID;
				chatPreviewObj.chatId = chatRes[i].chatID
				chatPreviewObj.chatTitle = chatRes[i].chatTitle
				chatPreviewObj.chatDescription = chatRes[i].desc
				chatPreviewObj.authorName = chatRes[i].username
				chatPreviewObj.numberOfViews = chatRes[i].numberofviews
				chatPreviewObj.postedDate = chatRes[i].PostedDate
				chatPreviewsObj.push(chatPreviewObj)
			}

			postRes.json(chatPreviewsObj);
			db.close();
		});
	});
});


app.listen(app.get('port'), function(){
    console.log('Listening...');
})