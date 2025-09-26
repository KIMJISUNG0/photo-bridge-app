const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server); // 같은 오리진이면 CORS 불필요

// 정적 서빙
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

// 헬스체크(선택)
app.get('/healthz', (_req, res) => res.status(200).send('ok'));

// ── 간단 시그널링
const clients = new Map(); // socket.id -> { name }

io.on('connection', (socket) => {
  socket.on('announce', (name) => { clients.set(socket.id, { name }); broadcastList(); });
  socket.on('disconnect', () => { clients.delete(socket.id); broadcastList(); });

  function broadcastList() {
    const list = [...clients.entries()].map(([id, v]) => ({ id, name: v.name }));
    io.emit('deviceList', list);
  }

  socket.on('request', ({ from, to }) => {
    const target = [...clients.entries()].find(([,v]) => v.name === to)?.[0];
    if (target) io.to(target).emit('request', { from });
  });

  socket.on('accept', ({ from, to }) => {
    const a = [...clients.entries()].find(([,v]) => v.name === from)?.[0];
    const b = [...clients.entries()].find(([,v]) => v.name === to)?.[0];
    if (!a || !b) return;
    const roomId = `room-${a}-${b}-${Date.now()}`;
    io.to(a).emit('pair', { roomId, role: 'offerer' });
    io.to(b).emit('pair', { roomId, role: 'answerer' });
  });

  socket.on('join', (roomId) => socket.join(roomId));
  socket.on('offer', ({ roomId, offer }) => socket.to(roomId).emit('offer', offer));
  socket.on('answer', ({ roomId, answer }) => socket.to(roomId).emit('answer', answer));
  socket.on('candidate', ({ roomId, candidate }) => socket.to(roomId).emit('candidate', candidate));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('Photo Bridge LAN signaling on :' + PORT));
