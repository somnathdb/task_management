var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
const cors = require("cors");
var passport = require('passport');
const client = require('./config/redisConfig')
require("dotenv").config();
var app = express();

client.on('connect', function () {
  console.log('Redis connected');
  client.flushall();
});

client.on('error', function (err) {
  console.log('Something went wrong ' + err);
});

/*****************  Localhost *************/
app.locals.baseURL = "http://localhost:5003";

// view engine setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cors());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('app-assets'))

/************ Session Created ***********/
app.use(
  session({
    secret: "secretkey14555444",
    resave: false,
    saveUninitialized: false,
  })
);



app.use(passport.initialize());
app.use(passport.session());
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);
// app.use("/uploads", express.static("uploads"));

const mobileUser = require('./routes/mobileUser/mobileUserRoutes');
const group = require('./routes/group/groupRoute');
const subTask = require('./routes/subTask/subTaskRoute');
const task = require('./routes/task/taskRoute');
const template = require('./routes/template/templateRoute');



app.use('/mobileuser', mobileUser);
app.use('/group', group);
app.use('/subtask', subTask);
app.use('/task', task);
app.use('/template',template);

app.use((err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});



module.exports =app;
