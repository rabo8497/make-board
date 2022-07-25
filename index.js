
const express = require('express')
const fs = require('fs')
const ejs = require('ejs')
const mysql = require('mysql')
const path = require("path");
const bodyParser = require('body-parser')

/*
import express from 'express'
import fs from 'fs'
import ejs from 'ejs'
import mysql from 'mysql'
import path from 'path'
import bodyParser from 'body-parser'
*/
var d = new Date();
var week = new Array(6, 0, 1, 2, 3, 4, 5);
var day = week[d.getDay()]; 
var anime_name = [];
re_popular_file(day); //day : 월~일 = 0~6
re_popular_name(day)

//외부 파이썬 실행
var num_po = 0
function re_popular_file(num) {
  const spawn = require('child_process').spawn;
  const process = spawn('python3', ['test.py', num]); //0은 날짜를 나타낸다 -> 이후에 날짜 적용
  process.stdout.on('data', function (data) {

    num_po = data.toString();
  });
  process.stderr.on('data', function (data) {
  
  });
}

function re_popular_name(num) {
  const spawn = require('child_process').spawn;
  const process = spawn('python3', ['test-d.py', num]); //0은 날짜를 나타낸다 -> 이후에 날짜 적용
  process.stdout.on('data', function (data) {
  });
  process.stderr.on('data', function (data) {

  });
}

function get_name() {
  var array = fs.readFileSync('./views/anime_name.txt').toString().split("\n");
  for(i in array) {
    anime_name.push(array[i].slice(0, -1));
  }
}



//자바스크립트
const client = mysql.createConnection({
  user: 'root',
  password: 'kim00714',
  database: 'books' 
})


const app = express()

app.use(bodyParser.urlencoded({
  extended: false
}))

app.use("/views", express.static(__dirname + "/views"));


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views/book_search")); 
/////////////////////////////////////////////////////////////////////////






























/////////////////////////////////////////////////////
/*
app.listen(52273, function () {
  console.log('Server is running at : http://127.0.0.1:52273')
})
*/

//start
app.get('/', (req, res) => {
  get_name()
  //console.log(num_po)
  //console.log(anime_name)
  res.render("homePage", {data:num_po, value:anime_name});
});


//READ
app.get("/book", (req, res) => {
  const sql = "select * from bookList";
  client.query(sql, (err, data) => {
    //console.log(data);
    if(err) {
      return console.error(err);
    }
    res.render("book", {model: data});
  });
});


//UPDATE
app.get("/edit/:id", (req, res)=> {
  const id = req.params.id;
  const sql = "SELECT * FROM bookList WHERE id=?";
  client.query(sql, [id], (err, row)=>{
    if(err) {
      console.error(err.message);
    }
    console.log(row);
    res.render("edit", {model:row[0]});
  });
});

app.post("/edit/:id", (req, res)=>{
  const id = req.params.id;
  const book = [req.body.name, req.body.author, req.body.genre, id];
  const sql = "UPDATE bookList SET name=?, author=?, genre=? WHERE (id = ?)";
  client.query(sql, book, err=> {
    if(err) {
      console.error(err.message);
    }
    res.redirect("/book");
  })
});


//CREATE
app.get("/create", (req, res)=>{
  res.render("create", {model:{} });
});

app.post("/create", (req, res)=>{
  const book = [req.body.name, req.body.author, req.body.genre];
  const sql = "INSERT INTO bookList (name, author, genre) VALUES (?, ?, ?)";
  client.query(sql, book, err=> {
    if(err){
      console.error(err.message);
    }
    res.redirect("/book");
  });
});


//DELETE
app.get("/delete/:id", (req, res)=>{
  //var isDelete = confirm(`${req.body.name}\n삭제하시겠습니까?`);
  const id = req.params.id;
  const sql = "SELECT * FROM bookList WHERE id=?";
  client.query(sql, id, (err, row)=>{
    if(err) {
      console.error(err.message);
    }
    res.render("delete", {model: row[0]});
  });
});

app.post("/delete/:id", (req, res)=> {
  const id = req.params.id;
  const sql = "DELETE FROM bookList WHERE id=?";
  client.query(sql, id, err =>{
    if(err) {
      console.error(err.message);
    }
    res.redirect("/book");
  });
});










app.get("/request", (req, res)=>{
  res.render("chat");
});

/////////////////////////
















/*
import http from "http";
import { Server } from "socket.io";
*/
const http = require("http");
const { Server } = require("socket.io");

var time_now = 0;
const httpServer = http.createServer(app);
const wsServer = new Server(httpServer, {
  cors: {
      origin: ["https://admin.socket.io"],
      credentials: true,
  },
});
/*
instrument(app, {
  auth: false, 
});
*/
function publicRooms() {
  const {
      sockets: {
          adapter: { sids, rooms },
      },
  } =wsServer;
  const publicRooms = [];
  rooms.forEach((_,key) => {
      if (sids.get(key) === undefined) {
          publicRooms.push(key);
      }
  });
  return publicRooms;
}
function countRoom(roomName) {
  return wsServer.sockets.adapter.rooms.get(roomName).size;
}
wsServer.on("connection", (socket) => {
  socket["nickname"] = "Anon";
  socket.onAny((event) => {
      console.log(`Socket Event:${event}`);
  }); //소켓 이벤트를 찾는다
  socket.on("enter_room", (roomName, done) => {

      socket.join(roomName);
      //console.log(socket.rooms);
      done();
      socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));//방에 있는 모두에게 보내기
      wsServer.sockets.emit("room_change", publicRooms());
  });
  socket.on("disconnecting", () => {
      socket.rooms.forEach((room) => socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1));
  });
  socket.on("disconnect", () => {
      wsServer.sockets.emit("room_change", publicRooms());
  })
  socket.on("new_message", (msg, room, done) => {
      socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
      done();
  });
  socket.on("nickname", (nickname) => {
      socket["nickname"] = nickname;
  });
  ////////////////////////////////////////////
  socket.on("give_time", (time_) => {
      console.log(time_);
      time_now = time_;
      socket.broadcast.emit("same_state", time_now);
  })
  socket.on("choose_time", () => {
      socket.broadcast.emit("send_yuor_time");
  })
  socket.on("pause1", () => {
      socket.broadcast.emit("pause2");
  })
  socket.on("start1", () => {
      socket.broadcast.emit("start2");
  })
  ////////////////////////////////////////////
});

httpServer.listen(52273, () => console.log("http://localhost:52273")); //서버 시작
