var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/index', function (req, res, next) {
  res.status(401)
  res.json({ message: "Working" })
});

module.exports = router;
