const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// 정적 파일 서빙
app.use(express.static(path.join(__dirname)));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 방(Room) 기반 시그널링
io.on('connection', socket => {
  console.log('새 클라이언트 접속');

  socket.on('join', roomId => {
    socket.join(roomId);
    console.log(`클라이언트가 방 ${roomId}에 참여`);
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
});

// Render/Railway 환경에서 PORT 사용
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 서버 실행 중: ${PORT}`);
});
