function loadChat() {
  const container = document.getElementById('chat-tab');

  container.innerHTML = `
    <div class="card chat-box">
      <h2>📢 Send Message to Telegram</h2>
      <div class="chat-messages" id="chat-messages">
        <p style="color:#94a3b8">Messages will appear here after sending...</p>
      </div>
      <div class="chat-input">
        <input type="text" id="chat-input" placeholder="Type your message..." />
        <button id="chat-send">Send</button>
      </div>
      <p id="chat-status" style="margin-top:0.8rem;font-size:0.9rem;color:#94a3b8"></p>
    </div>
  `;

  document.getElementById('chat-send').addEventListener('click', sendChatMessage);
  document.getElementById('chat-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendChatMessage();
  });
}

async function sendChatMessage() {
  const input = document.getElementById('chat-input');
  const status = document.getElementById('chat-status');
  const messages = document.getElementById('chat-messages');
  const text = input.value.trim();

  if (!text) return;

  status.textContent = 'Sending...';
  status.style.color = '#94a3b8';

  try {
    await api.apiFetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: text })
    });

    // Show success in UI
    const time = new Date().toLocaleTimeString();
    messages.innerHTML += `
      <div style="margin-bottom:0.8rem;padding:0.6rem;background:#1e293b;border-radius:0.4rem">
        <small style="color:#64748b">${time}</small><br/>
        ${text}
      </div>
    `;
    messages.scrollTop = messages.scrollHeight;

    input.value = '';
    status.textContent = '✅ Message sent successfully';
    status.style.color = '#4ade80';
  } catch (err) {
    status.textContent = '❌ ' + err.message;
    status.style.color = '#f87171';
  }
}

// Make sure chat tab loads the UI when switched
document.addEventListener('DOMContentLoaded', () => {
  // Override the tab click for chat
  const chatBtn = document.querySelector('nav button[data-tab="chat"]');
  if (chatBtn) {
    chatBtn.addEventListener('click', () => {
      setTimeout(loadChat, 50);
    });
  }
});

window.loadChat = loadChat;