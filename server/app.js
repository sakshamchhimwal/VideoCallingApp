var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { Server } = require("socket.io");
const io = new Server(8000, {
  cors: true
});

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const emailToSocketIdMap = new Map();
const socketIdToEamilMap = new Map();

io.on("connection", (socket) => {
  console.log(socket.id);
  socket.on("room:join", (data) => {
    // console.log(data);
    const { email, room } = data;
    emailToSocketIdMap.set(email, socket.id);
    socketIdToEamilMap.set(socket.id, email);
    io.to(room).emit("user:joined", { email, id: socket.id });
    socket.join(room);
    io.to(socket.id).emit("room:join", data);
  })

  socket.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incoming:call", { from: socket.id, offer });
  })

  socket.on("call:accepted", ({ to, ans }) => {
    console.log(ans);
    io.to(to).emit("call:accepted", { from: socket.id, ans });
  })

  socket.on("peer:nego:needed", ({ offer, to }) => {
    console.log("Sent Offer: ", offer);
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  })

  socket.on("peer:nego:done", ({ to, ans }) => {
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  })

})

// app.use('/', indexRouter);
// app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
