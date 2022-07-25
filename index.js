
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

const http = require("http");
const SocketIO = require("socket.io");

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

wsServer.on("connection", (socket) => {
  socket.on("join_room", (roomName) => {
    socket.join(roomName);
    socket.to(roomName).emit("welcome");
  });
  socket.on("offer", (offer, roomName) => {
    socket.to(roomName).emit("offer", offer);
  });
  socket.on("answer", (answer, roomName) => {
    socket.to(roomName).emit("answer", answer);
  });
  socket.on("ice", (ice, roomName) => {
    socket.to(roomName).emit("ice", ice);
  });
});

const handleListen = () => console.log(`Listening on http://localhost:3000`);

var port = process.env.PORT || 52273;
httpServer.listen(port, handleListen);