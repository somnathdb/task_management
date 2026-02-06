var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('Auth/login', { title: 'Express', session: req.session });
});

router.get('/createTopic', function (req, res, next) {
  if (req.session != null) {
    res.render('PostTopic/createTopic', { title: 'Express', session: req.session });
  }
  else {
    req.session.destroy();
    res.redirect('/');
  }
});

router.get('/createCountry', function (req, res, next) {
  if (req.session != null) {
    res.render('Location/createCountry', { title: 'Express', session: req.session });
  }
  else {
    req.session.destroy();
    res.redirect('/');
  }
});
router.get('/createState', function (req, res, next) {
  if (req.session != null) {
    res.render('Location/createState', { title: 'Express', session: req.session });
  }
  else {
    req.session.destroy();
    res.redirect('/');
  }
});
router.get('/createCity', function (req, res, next) {
  if (req.session != null) {
    res.render('Location/createCity', { title: 'Express', session: req.session });
  }
  else {
    req.session.destroy();
    res.redirect('/');
  }
});

  
router.get('/profile', function (req, res, next) {
  if (req.session.userAccess != null) {
    res.render('Users/profile', { title: 'Express', session: req.session });
  }
  else {
    req.session.destroy();
    res.redirect('/');
  }
});

router.get('/change-password', function (req, res, next) {
  if (req.session.userAccess !=null) {
  res.render('Users/changePassword', { title: 'Express', session: req.session });
  }
  else{
    req.session.destroy();
    res.redirect('/');
  }
});

router.get('/otp', function (req, res, next) {
  res.render('Auth/otp', { title: 'Express', session: req.session });
});

router.get('/create-password', function (req, res, next) {
  res.render('Auth/createPassword', { title: 'Express', session: req.session });
});

module.exports = router;
