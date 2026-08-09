// Detailed records for specific machinery items. Tapped inside a category's
// full detail view if a matching item name has data below (e.g. Loader log).
const COST_ITEM_DETAILS = {
  'Loader': {
    columns: ['Machine', 'Engine hr', 'hr', 'Fuel', 'Birr'],
    rows: [
      ['LD-023', 121.10, 123.33, 1555.00, 118676.97],
      ['LD-0011', 109.00, 112.01, 1565.00, 118676.97],
      ['LD-023', 96.90, 100.69, 1575.00, 118676.97],
      ['LD-0011', 84.80, 89.37, 1585.00, 118676.97],
      ['LD-023', 72.70, 78.05, 1595.00, 118676.97],
      ['LD-0011', 60.60, 66.73, 1605.00, 118676.97],
      ['LD-023', 48.50, 55.41, 1615.00, 118676.97],
      ['LD-0011', 36.40, 44.09, 1625.00, 118676.97]
    ]
  }
};

const COST_CATEGORY_ICONS = {
  admin: '📋',
  labour: '👷',
  material: '🧱',
  machinery: '🚜',
  overhead: '📊',
  staff: '👔'
};

let costsData = null;

async function loadCosts() {
  const container = document.getElementById('costs-tab');
  container.innerHTML = '<p style="padding:1rem;color:#8a8574">Loading...</p>';

  try {
    const res = await api.apiFetch('/api/costs');
    costsData = res.data;
    renderCostsGrid();
  } catch (err) {
    container.innerHTML = `<p class="error" style="padding:1rem">Error: ${err.message}</p>`;
  }
}

function renderCostsGrid() {
  const container = document.getElementById('costs-tab');
  const data = costsData;

  let html = `
    <div class="stats">
      <div class="stat">
        <div class="label">Total Cost</div>
        <div class="value">${formatMoney(data.total)}</div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0.7rem;margin-top:0.4rem">
      ${Object.entries(data.categories).map(([key, cat]) => `
        <button class="cost-tile" data-key="${key}" type="button"
          style="display:flex;flex-direction:column;align-items:center;gap:0.4rem;
                 background:#ffffff;border:none;border-radius:1rem;padding:1rem 0.5rem;
                 cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,0.06)">
          <div style="width:2.6rem;height:2.6rem;border-radius:50%;background:linear-gradient(135deg,#f8f0d8,#f3ecd4);
                      display:flex;align-items:center;justify-content:center;font-size:1.3rem">
            ${COST_CATEGORY_ICONS[key.toLowerCase()] || '💰'}
          </div>
          <div style="font-size:0.82rem;font-weight:700;text-align:center;text-transform:capitalize">${key}</div>
        </button>
      `).join('')}
    </div>
  `;

  container.innerHTML = html;

  document.querySelectorAll('.cost-tile').forEach(tile => {
    tile.addEventListener('click', () => openCostCategory(tile.dataset.key));
  });
}

function openCostCategory(key) {
  const container = document.getElementById('costs-tab');
  const cat = costsData.categories[key];

  let html = `
    <button id="cost-back-btn" type="button"
      style="display:flex;align-items:center;gap:0.4rem;background:none;border:none;
             color:#1a7a4c;font-weight:600;font-size:0.95rem;cursor:pointer;margin-bottom:0.8rem;padding:0.3rem 0">
      ← Back
    </button>

    <div class="stats">
      <div class="stat">
        <div class="label">${key.charAt(0).toUpperCase() + key.slice(1)} Total</div>
        <div class="value">${formatMoney(cat.total)}</div>
      </div>
    </div>

    <div class="bill-card">
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Amount (ETB)</th>
          </tr>
        </thead>
        <tbody>
          ${cat.items.map(item => {
            const hasDetail = !!COST_ITEM_DETAILS[item.name];
            return `
              <tr ${hasDetail ? `class="cost-item-clickable" onclick="showCostItemDetail('${item.name.replace(/'/g, "\\'")}')"` : ''}>
                <td>${item.name}${hasDetail ? ' 📋' : ''}</td>
                <td>${formatMoney(item.amount)}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;

  container.innerHTML = html;
  document.getElementById('cost-back-btn').addEventListener('click', renderCostsGrid);
}

function showCostItemDetail(itemName) {
  const detail = COST_ITEM_DETAILS[itemName];
  if (!detail) return;

  const existing = document.getElementById('cost-detail-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'cost-detail-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:50;display:flex;align-items:flex-end';

  overlay.innerHTML = `
    <div style="background:#ffffff;width:100%;max-height:80vh;overflow-y:auto;border-radius:1.2rem 1.2rem 0 0;padding:1.2rem">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.8rem">
        <div class="bill-name">🚜 ${itemName} — Detail Log</div>
        <button id="cost-detail-close" type="button" style="background:none;border:none;font-size:1.4rem;cursor:pointer;color:#9c9686">✕</button>
      </div>
      <table>
        <thead>
          <tr>${detail.columns.map(c => `<th>${c}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${detail.rows.map(row => `
            <tr>${row.map(v => `<td>${typeof v === 'number' ? formatMoney(v).replace('ETB', '').trim() : v}</td>`).join('')}</tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  document.body.appendChild(overlay);

  const close = () => overlay.remove();
  document.getElementById('cost-detail-close').addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
}

window.loadCosts = loadCosts;
window.showCostItemDetail = showCostItemDetail;
