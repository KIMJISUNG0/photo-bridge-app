const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// 👉 정적 파일(index.html 포함) 서빙
app.use(express.static(path.join(__dirname)));

// (선택) 루트 경로에 index.html 직접 연결
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

server.listen(3000, () => {
  console.log('신고빙 서버 실행 중');
});
