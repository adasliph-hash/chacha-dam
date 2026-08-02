function loadChat() {
  const container = document.getElementById('chat-tab');

  container.innerHTML = `
    <div class="bill-card" style="padding:1rem">
      <div class="bill-name" style="margin-bottom:0.8rem">📢 Send to Telegram</div>
      <div class="chat-messages" id="chat-messages">
        <p style="color:#9c9686;font-size:0.9rem">Messages will appear here after sending...</p>
      </div>
      <div id="chat-file-preview"></div>
      <div class="chat-input">
        <button id="chat-attach" type="button" title="Attach file" style="background:#f3ecd4;border:none;width:2.6rem;border-radius:999px;font-size:1.1rem;cursor:pointer">📎</button>
        <input type="file" id="chat-file-input" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" style="display:none" />
        <input type="text" id="chat-input" placeholder="Type your message..." />
        <button id="chat-send">Send</button>
      </div>
      <p id="chat-status" style="margin-top:0.8rem;font-size:0.85rem;color:#9c9686"></p>
    </div>
  `;

  document.getElementById('chat-send').addEventListener('click', sendChatMessage);
  document.getElementById('chat-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendChatMessage();
  });

  document.getElementById('chat-attach').addEventListener('click', () => {
    document.getElementById('chat-file-input').click();
  });

  document.getElementById('chat-file-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    const preview = document.getElementById('chat-file-preview');
    if (!file) {
      preview.innerHTML = '';
      return;
    }
    preview.innerHTML = `
      <div style="display:flex;align-items:center;gap:0.5rem;background:#f3ecd4;border-radius:0.6rem;padding:0.5rem 0.8rem;margin-bottom:0.6rem;font-size:0.85rem">
        <span>${fileIcon(file.type)} ${file.name}</span>
        <button id="chat-file-remove" type="button" style="margin-left:auto;background:none;border:none;color:#b5ae98;cursor:pointer;font-size:1rem">✕</button>
      </div>
    `;
    document.getElementById('chat-file-remove').addEventListener('click', () => {
      document.getElementById('chat-file-input').value = '';
      preview.innerHTML = '';
    });
  });
}

function fileIcon(mimeType) {
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType.includes('pdf')) return '📕';
  if (mimeType.includes('word') || mimeType.includes('document')) return '📘';
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📗';
  return '📎';
}

async function sendChatMessage() {
  const input = document.getElementById('chat-input');
  const fileInput = document.getElementById('chat-file-input');
  const status = document.getElementById('chat-status');
  const messages = document.getElementById('chat-messages');
  const text = input.value.trim();
  const file = fileInput.files[0];

  if (!text && !file) return;

  status.textContent = 'Sending...';
  status.style.color = '#9c9686';

  try {
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      if (text) formData.append('caption', text);

      const res = await fetch(`${window.API_BASE_URL}/api/chat/file`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${api.getToken()}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send file');

      const time = new Date().toLocaleTimeString();
      messages.innerHTML += `
        <div style="margin-bottom:0.6rem;padding:0.6rem;background:#f3ecd4;border-radius:0.6rem;font-size:0.9rem">
          <small style="color:#9c9686">${time}</small><br/>
          ${fileIcon(file.type)} ${file.name}${text ? `<br/>${text}` : ''}
        </div>
      `;

      document.getElementById('chat-file-preview').innerHTML = '';
      fileInput.value = '';
    } else {
      await api.apiFetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: text })
      });

      const time = new Date().toLocaleTimeString();
      messages.innerHTML += `
        <div style="margin-bottom:0.6rem;padding:0.6rem;background:#f3ecd4;border-radius:0.6rem;font-size:0.9rem">
          <small style="color:#9c9686">${time}</small><br/>
          ${text}
        </div>
      `;
    }

    messages.scrollTop = messages.scrollHeight;
    input.value = '';
    status.textContent = '✅ Sent successfully';
    status.style.color = '#1a7a4c';
  } catch (err) {
    status.textContent = '❌ ' + err.message;
    status.style.color = '#dc2626';
  }
}

// Make sure chat tab loads the UI when switched
document.addEventListener('DOMContentLoaded', () => {
  const chatBtn = document.querySelector('nav button[data-tab="chat"]');
  if (chatBtn) {
    chatBtn.addEventListener('click', () => {
      setTimeout(loadChat, 50);
    });
  }
});

window.loadChat = loadChat;
