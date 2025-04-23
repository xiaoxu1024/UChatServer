const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 存储在线用户（可选扩展）
const onlineUsers = new Map();

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('新用户连接');

  // 设置设置
  socket.on('SetNickname', (nickname) => {
    if (Array.from(onlineUsers.values()).includes(nickname)) {
      socket.emit('nickname error', '该昵称已被使用');
      return;
    }

    // 存储昵称到socket对象
    socket.nickname = nickname;
    onlineUsers.set(socket.id, nickname);
    
    // 广播新用户加入
    io.emit('ChatMessage', {
      type: 'system',
      content: `${nickname} 加入了聊天室`
    });

    // 单独发送欢迎信息
    io.emit('ChatMessage', {
      type: 'system',
      content: `欢迎你，${nickname}!`
    });

    // 更新用户信息
    usersChange();
  });

  // 处理消息
  socket.on('ChatMessage', (msg) => {
    if (!socket.nickname) return;
    
    io.emit('ChatMessage', {
      type: 'user',
      isSelf: msg.isSelf,
      nickname: socket.nickname,
      content: msg.content,
      timestamp: new Date().toLocaleTimeString('zh-CN',{
        timeZone: 'Asia/Shanghai',
      })
    });
  });

  // 修改昵称
  socket.on('ChangeNickname', (newNickname) => {
    if (!newNickname) return
    if (Array.from(onlineUsers.values()).includes(newNickname)) {
      socket.emit('nickname error', '该昵称已被使用');
      return;
    }
  
    onlineUsers.set(socket.id, newNickname);
    socket.nickname = newNickname
  });

  // 处理断开连接
  socket.on('disconnect', () => {
    if (socket.nickname) {
      io.emit('chat message', {
        type: 'system',
        content: `${socket.nickname} 离开了聊天室`
      });
      onlineUsers.delete(socket.id);
      usersChange();
    }
  });
});

const usersChange = () => {
  io.emit('OnlineUsersChange', Array.from(onlineUsers.values()));
}

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});