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
  res.render('admin');
});

module.exports = router;
