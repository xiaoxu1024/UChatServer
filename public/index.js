const socket = io();
console.log('初始化socket', socket)

init();

// 初始化
function init() {
  // 1. 页面加载时自动检查昵称
  document.addEventListener('DOMContentLoaded', () => {
    const nickname = localStorage.getItem('nickname') || ''; // 自动读取存储的昵称
    nickname ? enterChatRoom(nickname) : showLogin();
    addListener();
  });

  // 2. 监听push消息
  socket.on('ChatMessage', (data) => {
    const li = document.createElement('li');
    const messages = document.getElementById('messages');

    if (data.type === 'system') {
      li.className = 'system_message';
      li.textContent = `[系统通知] ${data.content}`;
    } else {
      li.className = 'user_message';
      li.innerHTML = `
        <span class="nickname">${data.nickname}</span>
        <span class="time">[${data.timestamp}]</span>
        <div class="content">${data.content}</div>
      `;
    }
    messages.appendChild(li);
    messages.scrollTop = messages.scrollHeight;
  });

  // 3. 监听成员变化
  socket.on('OnlineUsersChange', (users) => {
    const chatOnline = document.querySelector('.chat_online');
    chatOnline.innerHTML = `<span class="green"></span>当前在线 ${users.length} 人`
  })
}

// 设置和修改昵称
function setNickname() {
  const input = document.getElementById('nicknameInput');

  if (input?.value?.trim()) {
    const nickname = input?.value?.trim() || ''
    enterChatRoom(nickname);
    localStorage.setItem('nickname', nickname);
  }
}

// 进入房间
function enterChatRoom(nickname) {
  document.getElementById('login').style.display = 'none';
  document.getElementById('chat').classList.remove('hidden');
  socket.emit('SetNickname', nickname);
}

// 显示登录页面
function showLogin() {
  document.getElementById('login').style.display = 'flex';
  document.getElementById('chat').classList.add('hidden');
}

function addListener() {
  const form = document.getElementById('chatForm');

  form.addEventListener('submit', onSendClick);
}

function onSendClick(e) {
  e.preventDefault();
  const input = document.getElementById('chatInput');

  if (input.value) {
    socket.emit('ChatMessage', { isSelf: true, content: input.value });
    input.value = '';
  }
}

function onModifyNickNameClick() {
  const dom = document.querySelector('.modify_nickname')

  dom.style.display = 'flex'
}

function hideModifyDialog() {
  const dom = document.querySelector('.modify_nickname')

  dom.style.display = 'none'
}

function modifyNickname() {
  const input = document.getElementById('mNicknameInput');

  if (input?.value?.trim()) {
    const nickname = input?.value?.trim() || ''
    localStorage.setItem('nickname', nickname);
    socket.emit('ChangeNickname', nickname);
    input.value = '';
    hideModifyDialog()
  }
}
