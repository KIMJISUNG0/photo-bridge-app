const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let devices = [];

io.on('connection', socket => {
  console.log("✅ New client connected:", socket.id);

  // 기기 등록
  socket.on('announce', name => {
    console.log("📡 Announce:", name);
    devices.push({ name, id: socket.id });
    io.emit('deviceList', devices);
  });

  // 연결 요청
  socket.on('request', ({ from, to }) => {
    console.log(`➡️ Request from ${from} to ${to}`);
    const target = devices.find(d => d.name === to);
    if (target) {
      io.to(target.id).emit('request', { from });
    }
  });

  // 연결 수락
  socket.on('accept', ({ from, to }) => {
    console.log(`✅ Accept from ${from} to ${to}`);
    const roomId = from + '-' + to;
    const fromDevice = devices.find(d => d.name === from);
    const toDevice = devices.find(d => d.name === to);
    if (fromDevice && toDevice) {
      io.to(fromDevice.id).emit('pair', roomId);
      io.to(toDevice.id).emit('pair', roomId);
    }
  });

  // WebRTC 시그널링
  socket.on('join', roomId => {
    socket.join(roomId);
    socket.to(roomId).emit('ready');
  });

  socket.on('offer', ({ roomId, offer }) => {
    socket.to(roomId).emit('offer', offer);
  });

  socket.on('answer', ({ roomId, answer }) => {
    socket.to(roomId).emit('answer', answer);
  });

  socket.on('candidate', ({ roomId, candidate }) => {
    socket.to(roomId).emit('candidate', candidate);
  });

  // 연결 해제
  socket.on('disconnect', () => {
    devices = devices.filter(d => d.id !== socket.id);
    io.emit('deviceList', devices);
    console.log("❌ Client disconnected:", socket.id);
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log('🚀 Server running');
});
