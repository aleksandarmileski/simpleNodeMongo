var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var objectId = require('mongodb').ObjectID;
var assert = require('assert');

var mongoUrl = 'mongodb://localhost:27017/test';

/* GET home page. */
router.get('/', function (req, res, next) {
	res.render('index', {
		title: 'Express',
		condition: true,
		anyArray: [1, 2, 3],
		success: req.session.success,
		errors: req.session.errors,
		items: req.items
	});
	req.session = null;
});

/* GET single test */
router.get('/test/:id', function (req, res, next) {
	res.render('test', {output: req.params.id});
});

/* POST test submit route */
router.post('/test/submit', function (req, res, next) {
	var id = req.body.id;
	res.redirect('/test/' + id);
});

/* POST submit route */
router.post('/submit', function (req, res, next) {
	req.check('name', 'Invalid email address').isEmail();
	req.check('pass', 'Password is invalid').isLength({min: 4}).equals(req.body.confirmPass);

	var errors = req.validationErrors();
	if (errors) {
		req.session.errors = errors;
		req.session.success = false;
	} else {
		req.session.success = true;
	}
	res.redirect('/');
});

/* GET user data */
router.get('/get-data', function (req, res, next) {
	var resultArr = [];
	mongo.connect(mongoUrl, function (err, database) {
		const myAwesomeDB = database.db('test');
		assert.equal(null, err);
		var cursor = myAwesomeDB.collection('user').find();
		cursor.forEach(function (doc, err) {
			assert.equal(null, err);
			resultArr.push(doc);
		}, function (mongoError) {
			res.render('index', {items: resultArr});
		});
	});
});
/* POST user data */
router.post('/insert', function (req, res, next) {
	var item = {
		title: req.body.title,
		content: req.body.content,
		author: req.body.author
	};
	mongo.connect(mongoUrl, function (error, database) {
		const db = database.db('test');
		assert.equal(null, error);
		db.collection('user').insertOne(item, function (err, result) {
			assert.equal(null, error);
			console.log('Item inserted');
		});
	});
	res.redirect('/get-data');
});
/* PUT user data */
router.post('/update', function (req, res, next) {
	var item = {
		title: req.body.title,
		content: req.body.content,
		author: req.body.author
	};
	const id = req.body.id;
	mongo.connect(mongoUrl, function (error, database) {
		const db = database.db('test');
		assert.equal(null, error);
		db.collection('user').updateOne({'_id': objectId(id)}, {$set: item}, function (err, result) {
			assert.equal(null, error);
			console.log('Item updated');
			res.redirect('/get-data');
		});
	});
});
/* DELETE user data */
router.post('/delete', function (req, res, next) {
	const id = req.body.id;
	mongo.connect(mongoUrl, function (error, database) {
		const db = database.db('test');
		assert.equal(null, error);
		db.collection('user').deleteOne({'_id': objectId(id)}, function (err, result) {
			assert.equal(null, error);
			console.log('Item deleted');
			res.redirect('/get-data');
		});
	});
});

/* insert forms */
router.get('/forms', function (req, res, next) {
	res.render('forms');
});

module.exports = router;
