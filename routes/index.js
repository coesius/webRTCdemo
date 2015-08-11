var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'webRTCdemo' });
});

router.get('/admin', function(req, res) {
  res.render('admin', { title: 'webRTCdemo' });
});

router.get('/chat', function(req, res) {
  res.render('chat');
});

router.get('/rock-paper-scissors', function(req, res) {
  res.render('rock-paper-scissors');
});

router.get('/rock-paper-scissors/login', function(req, res) {
  res.render('login');
});

router.get('/closeeye', function(req, res) {
  res.render('closeeye');
});

router.get('/closeeye/create-game', function(req, res) {
  res.render('create-closeeye-game');
});

router.get('/closeeye/pick-player', function(req, res) {
  res.render('pick-player');
});

module.exports = router;
