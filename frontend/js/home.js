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

const HOME_SECTION_DATA = {
  finance: {
    columns: ['Description', 'Debits (ETB)'],
    rows: [
      ['Machinery transport', 51591468.21],
      ['Over time', 137410.35],
      ['Wage daily laborers', 5800674.32],
      ['Perdiem and traveling cost', 27089416.44],
      ['Telephone, Water, ...', 425790.38],
      ['Entertainment — Irrigation project', 654898.10],
      ['Tyre & Inner tube', 325550.00],
      ['Fuel & Lubricants', null],
      ['House rent', 300000.00],
      ['Machinery rent', 9428309.11],
      ['Vehicle expense', 1149836.87],
      ['Repair vehicle, machinery', 741877.84],
      ['Medical expense', 291274.30],
      ['Penalty', 11927.00],
      ['Sub contractor', 574832.83],
      ['Other Costs', 1188651.73]
    ],
    total: 99711917.48
  }
};

function loadHome() {
  const container = document.getElementById('home-tab');

  container.innerHTML = `
    <button id="home-menu-btn" type="button" aria-label="Menu"
      style="position:fixed;top:3.2rem;left:0.9rem;z-index:15;width:2.4rem;height:2.4rem;border-radius:50%;
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

    <div id="home-content" style="padding-top:5.8rem">
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

  const data = HOME_SECTION_DATA[item.id];

  content.style.display = 'block';
  content.style.textAlign = 'left';

  const backBtn = `
    <button id="home-back-btn" type="button"
      style="display:flex;align-items:center;gap:0.4rem;background:none;border:none;
             color:#1a7a4c;font-weight:600;font-size:0.95rem;cursor:pointer;margin-bottom:0.8rem;padding:0.3rem 0">
      ← Back
    </button>
  `;

  if (data) {
    content.innerHTML = `
      ${backBtn}
      <div class="stats">
        <div class="stat">
          <div class="label">${item.label} Total</div>
          <div class="value">${formatMoney(data.total)}</div>
        </div>
      </div>
      <div class="bill-card">
        <table>
          <thead>
            <tr>${data.columns.map(c => `<th>${c}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${data.rows.map(row => `
              <tr>
                <td>${row[0]}</td>
                <td>${row[1] != null ? formatMoney(row[1]) : '—'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } else {
    content.innerHTML = `
      ${backBtn}
      <div class="bill-card">
        <div class="bill-name" style="margin-bottom:0.6rem">${item.icon} ${item.label}</div>
        <p style="color:#9c9686;font-size:0.9rem">ውሂብ በቅርቡ ይታከላል...</p>
      </div>
    `;
  }

  document.getElementById('home-back-btn').addEventListener('click', () => {
    homeActiveSection = null;
    loadHome();
  });
}

function formatMoney(num) {
  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    maximumFractionDigits: 2
  }).format(num);
}

window.loadHome = loadHome;
