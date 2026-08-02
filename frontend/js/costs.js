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

    const categoryIcons = { materials: '🧱', labor: '👷', equipment: '🚜', subcontract: '📋', other: '📦' };
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
                ${cat.items.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${formatMoney(item.amount)}</td>
                  </tr>
                `).join('')}
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

window.loadCosts = loadCosts;