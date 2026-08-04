const SITE_PHOTOS = [
  'images/site-photos/dam-1.jpg',
  'images/site-photos/dam-2.jpg',
  'images/site-photos/dam-3.jpg',
  'images/site-photos/dam-4.jpg'
];

let slideshowIndex = 0;
let slideshowTimer = null;

function goToSlide(i) {
  const track = document.getElementById('slideshow-track');
  if (!track) return;
  slideshowIndex = (i + SITE_PHOTOS.length) % SITE_PHOTOS.length;
  track.style.transform = `translateX(-${slideshowIndex * 100}%)`;

  document.querySelectorAll('.slide-dot').forEach((dot, idx) => {
    dot.style.background = idx === slideshowIndex ? '#ffffff' : 'rgba(255,255,255,0.6)';
  });
}

function initSlideshow() {
  if (slideshowTimer) clearInterval(slideshowTimer);
  slideshowIndex = 0;
  goToSlide(0);

  document.getElementById('slide-prev').addEventListener('click', () => {
    goToSlide(slideshowIndex - 1);
    resetSlideshowTimer();
  });
  document.getElementById('slide-next').addEventListener('click', () => {
    goToSlide(slideshowIndex + 1);
    resetSlideshowTimer();
  });
  document.querySelectorAll('.slide-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      goToSlide(Number(dot.dataset.i));
      resetSlideshowTimer();
    });
  });

  resetSlideshowTimer();
}

function resetSlideshowTimer() {
  if (slideshowTimer) clearInterval(slideshowTimer);
  slideshowTimer = setInterval(() => goToSlide(slideshowIndex + 1), 4000);
}

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

    <div class="bill-card" style="padding:0.9rem">
      <div class="bill-name" style="margin-bottom:0.7rem">📸 Site Photos</div>
      <div id="site-slideshow" style="position:relative;border-radius:0.8rem;overflow:hidden;background:#e5e3da">
        <div id="slideshow-track" style="display:flex;transition:transform 0.4s ease">
          ${SITE_PHOTOS.map(src => `
            <img src="${src}" style="width:100%;flex-shrink:0;height:48vh;object-fit:cover;display:block" />
          `).join('')}
        </div>
        <div style="position:absolute;bottom:0.6rem;left:0;right:0;display:flex;justify-content:center;gap:0.4rem">
          ${SITE_PHOTOS.map((_, i) => `<span class="slide-dot" data-i="${i}" style="width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,0.6);cursor:pointer"></span>`).join('')}
        </div>
        <button id="slide-prev" type="button" style="position:absolute;left:0.4rem;top:50%;transform:translateY(-50%);background:rgba(0,0,0,0.35);color:#fff;border:none;width:1.8rem;height:1.8rem;border-radius:50%;cursor:pointer">‹</button>
        <button id="slide-next" type="button" style="position:absolute;right:0.4rem;top:50%;transform:translateY(-50%);background:rgba(0,0,0,0.35);color:#fff;border:none;width:1.8rem;height:1.8rem;border-radius:50%;cursor:pointer">›</button>
      </div>
    </div>
  `;

  initSlideshow();

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
