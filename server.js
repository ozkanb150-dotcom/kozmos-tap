const express = require("express");
const http = require("http");
const fs = require("fs");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const DB = "./db.json";

function load(){
  if(!fs.existsSync(DB)) fs.writeFileSync(DB,"[]");
  return JSON.parse(fs.readFileSync(DB));
}

function save(data){
  fs.writeFileSync(DB, JSON.stringify(data,null,2));
}

app.post("/update",(req,res)=>{
  let players = load();
  let p = req.body;

  let i = players.findIndex(x=>x.name===p.name);

  if(i>=0) players[i]=p;
  else players.push(p);

  save(players);

  io.emit("update", players);

  res.json({ok:true});
});

io.on("connection",(socket)=>{
  socket.emit("update", load());
});

server.listen(3000,()=>{
  console.log("SERVER RUNNING");
});
