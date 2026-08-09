// Detailed records for specific machinery items. Click an item with matching
// data below to see its detail table (e.g. Loader fuel/hour log).
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

async function loadCosts() {
  const container = document.getElementById('costs-tab');
  container.innerHTML = '<p style="padding:1rem;color:#8a8574">Loading...</p>';

  try {
    const res = await api.apiFetch('/api/costs');
    const data = res.data;

    let html = `
      <div class="stats">
        <div class="stat">
          <div class="label">Total Cost</div>
          <div class="value">${formatMoney(data.total)}</div>
        </div>
      </div>
    `;

    const categoryIcons = { materials: '🧱', labor: '👷', equipment: '🚜', subcontract: '📋', other: '📦', machinery: '🚜', admin: '📋' };
    let idx = 0;

    for (const [key, cat] of Object.entries(data.categories)) {
      const cardId = `cost-cat-${idx++}`;
      html += `
        <div class="bill-card" id="${cardId}">
          <div class="bill-row" onclick="document.getElementById('${cardId}').classList.toggle('open')">
            <div class="bill-icon">${categoryIcons[key.toLowerCase()] || '💰'}</div>
            <div class="bill-info">
              <div class="bill-name">${key.charAt(0).toUpperCase() + key.slice(1)}</div>
              <div class="bill-meta">${formatMoney(cat.total)} <span class="count">(${cat.items.length} items)</span></div>
            </div>
            <div class="bill-chevron">▼</div>
          </div>
          <div class="bill-items">
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
        </div>
      `;
    }

    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<p class="error" style="padding:1rem">Error: ${err.message}</p>`;
  }
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
            <tr>${row.map((v, i) => `<td>${typeof v === 'number' ? formatMoney(v).replace('ETB', '').trim() : v}</td>`).join('')}</tr>
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
