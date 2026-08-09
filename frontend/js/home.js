const HOME_MENU_ITEMS = [
  { id: 'standard', icon: '📐', label: 'Standard' },
  { id: 'efficiency', icon: '⚙️', label: 'Efficiency' },
  { id: 'staff', icon: '👥', label: 'Staff' },
  { id: 'payroll', icon: '💵', label: 'Payroll' },
  { id: 'finance', icon: '📒', label: 'Finance' },
  { id: 'property-admin', icon: '🏢', label: 'Property Admin' },
  { id: 'payment-status', icon: '✅', label: 'Payment Status' }
];

const HOME_CENTER_ITEMS = [
  { id: 'report', icon: '📄', label: 'Report' },
  { id: 'payment', icon: '💳', label: 'Payment' }
];

let homeActiveSection = null;

function loadHome() {
  const container = document.getElementById('home-tab');

  container.innerHTML = `
    <button id="home-menu-btn" type="button" aria-label="Menu"
      style="position:fixed;top:0.9rem;left:0.9rem;z-index:15;width:2.4rem;height:2.4rem;border-radius:50%;
             border:none;background:rgba(255,255,255,0.9);box-shadow:0 2px 8px rgba(0,0,0,0.15);
             font-size:1.2rem;cursor:pointer;display:flex;align-items:center;justify-content:center">☰</button>

    <div id="home-drawer-overlay"
      style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.35);z-index:40"></div>

    <div id="home-drawer"
      style="position:fixed;top:0;left:0;bottom:0;width:78%;max-width:300px;background:#ffffff;
             box-shadow:2px 0 16px rgba(0,0,0,0.2);z-index:41;transform:translateX(-100%);
             transition:transform 0.25s ease;padding:1.2rem 0;overflow-y:auto">
      <div style="padding:0 1.2rem 1rem;font-weight:700;font-size:1.05rem;border-bottom:1px solid #eee;margin-bottom:0.5rem">
        🌊 Chacha Dam
      </div>
      ${HOME_MENU_ITEMS.map(item => `
        <button class="home-menu-item" data-id="${item.id}" type="button"
          style="display:flex;align-items:center;gap:0.8rem;width:100%;padding:0.8rem 1.2rem;
                 background:none;border:none;text-align:left;font-size:0.95rem;cursor:pointer;color:#1e2430">
          <span style="font-size:1.2rem">${item.icon}</span> ${item.label}
        </button>
      `).join('')}
    </div>

    <div id="home-content" style="padding-top:3.5rem">
      <div style="display:flex;flex-direction:column;gap:0.8rem;max-width:320px;margin:2rem auto 0">
        ${HOME_CENTER_ITEMS.map(item => `
          <button class="home-center-item bill-card" data-id="${item.id}" type="button"
            style="display:flex;align-items:center;gap:0.9rem;padding:1.1rem;border:none;cursor:pointer;
                   font-size:1.05rem;font-weight:600;color:#1e2430;width:100%;text-align:left">
            <span style="font-size:1.6rem">${item.icon}</span> ${item.label}
          </button>
        `).join('')}
      </div>
    </div>
  `;

  const menuBtn = document.getElementById('home-menu-btn');
  const drawer = document.getElementById('home-drawer');
  const overlay = document.getElementById('home-drawer-overlay');

  function openDrawer() {
    overlay.style.display = 'block';
    requestAnimationFrame(() => { drawer.style.transform = 'translateX(0)'; });
  }
  function closeDrawer() {
    drawer.style.transform = 'translateX(-100%)';
    setTimeout(() => { overlay.style.display = 'none'; }, 250);
  }

  menuBtn.addEventListener('click', openDrawer);
  overlay.addEventListener('click', closeDrawer);

  document.querySelectorAll('.home-menu-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const item = HOME_MENU_ITEMS.find(m => m.id === id);
      homeActiveSection = id;
      renderHomeSection(item);
      closeDrawer();
    });
  });

  document.querySelectorAll('.home-center-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const item = HOME_CENTER_ITEMS.find(m => m.id === id);
      homeActiveSection = id;
      renderHomeSection(item);
    });
  });
}

function renderHomeSection(item) {
  const content = document.getElementById('home-content');
  if (!content) return;

  // Placeholder — real data for each section will be added later
  content.style.display = 'block';
  content.style.textAlign = 'left';
  content.innerHTML = `
    <div class="bill-card">
      <div class="bill-name" style="margin-bottom:0.6rem">${item.icon} ${item.label}</div>
      <p style="color:#9c9686;font-size:0.9rem">ውሂብ በቅርቡ ይታከላል...</p>
    </div>
  `;
}

window.loadHome = loadHome;
