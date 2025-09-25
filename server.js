const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let devices = [];

io.on('connection', socket => {
  console.log("✅ Connected:", socket.id);

  socket.on('announce', name => {
    devices.push({ name, id: socket.id });
    io.emit('deviceList', devices);
  });

  // 연결 요청
  socket.on('request', ({ from, to }) => {
    const target = devices.find(d => d.name === to);
    if (target) io.to(target.id).emit('request', { from });
  });

  // 연결 수락
  socket.on('accept', ({ from, to }) => {
    const roomId = from + '-' + to;
    const fromDevice = devices.find(d => d.name === from);
    const toDevice = devices.find(d => d.name === to);
    if (fromDevice && toDevice) {
      io.to(fromDevice.id).emit('pair', { roomId, role: 'offerer' });
      io.to(toDevice.id).emit('pair', { roomId, role: 'answerer' });
    }
  });

  // WebRTC 시그널링
  socket.on('join', roomId => socket.join(roomId));
  socket.on('offer', ({ roomId, offer }) => socket.to(roomId).emit('offer', offer));
  socket.on('answer', ({ roomId, answer }) => socket.to(roomId).emit('answer', answer));
  socket.on('candidate', ({ roomId, candidate }) => socket.to(roomId).emit('candidate', candidate));

  socket.on('disconnect', () => {
    devices = devices.filter(d => d.id !== socket.id);
    io.emit('deviceList', devices);
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log('🚀 Server running');
});
