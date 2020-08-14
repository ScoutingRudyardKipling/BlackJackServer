var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'BlackJack Eindhoven' });
});

router.get('/a', function(req, res, next) {
    res.render('index', { title: 'BlackJack Eindhoven' });
});

module.exports = router;
