const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 提供静态文件
app.use(express.static('public'));

// 处理socket连接
io.on('connection', (socket) => {
  console.log('a user connected');

  // 接收客户端消息
  socket.on('chat message', (msg) => {
    console.log('message: ' + msg);
    // 广播消息给所有客户端
    io.emit('chat message', msg);
  });

  // 处理断开连接
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

// 启动服务器
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});