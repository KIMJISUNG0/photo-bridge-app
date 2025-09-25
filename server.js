const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let devices = [];

io.on('connection', socket => {
  socket.on('announce', name => {
    devices.push({ name, id: socket.id });
    io.emit('deviceList', devices);
  });

  socket.on('request', ({ from, to }) => {
    const target = devices.find(d => d.name === to);
    if (target) {
      io.to(target.id).emit('request', { from });
    }
  });

  socket.on('accept', ({ from, to }) => {
    const roomId = from + '-' + to;
    const fromDevice = devices.find(d => d.name === from);
    const toDevice = devices.find(d => d.name === to);
    if (fromDevice && toDevice) {
      io.to(fromDevice.id).emit('pair', roomId);
      io.to(toDevice.id).emit('pair', roomId);
    }
  });

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

  socket.on('disconnect', () => {
    devices = devices.filter(d => d.id !== socket.id);
    io.emit('deviceList', devices);
  });
});

server.listen(3000, () => {
  console.log('✅ Server running at http://localhost:3000');
});
