async function loadEcost() {
  const container = document.getElementById('ecost-tab');
  container.innerHTML = '<p style="padding:1rem;color:#8a8574">Loading...</p>';

  try {
    const res = await api.apiFetch('/api/ecost');
    const data = res.data;

    let html = `
      <div class="stats">
        <div class="stat">
          <div class="label">Overhead / Other</div>
          <div class="value">${formatMoney(data.overheadTotal)}</div>
        </div>
        <div class="stat">
          <div class="label">Machinery Cost</div>
          <div class="value">${formatMoney(data.machineryTotal)}</div>
        </div>
        <div class="stat">
          <div class="label">Grand Total</div>
          <div class="value">${formatMoney(data.grandTotal)}</div>
        </div>
      </div>
    `;

    data.categories.forEach((cat, idx) => {
      const cardId = `ecost-cat-${idx}`;
      html += `
        <div class="bill-card" id="${cardId}">
          <div class="bill-row" onclick="document.getElementById('${cardId}').classList.toggle('open')">
            <div class="bill-icon">${cat.icon || '💰'}</div>
            <div class="bill-info">
              <div class="bill-name">${cat.name}</div>
              <div class="bill-meta">${formatMoney(cat.total)} <span class="count">(${cat.items.length} items)</span></div>
            </div>
            <div class="bill-chevron">▼</div>
          </div>
          <div class="bill-items">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Description</th>
                  <th>Amount (ETB)</th>
                </tr>
              </thead>
              <tbody>
                ${cat.items.map(item => `
                  <tr>
                    <td>${item.no}</td>
                    <td>${item.description}</td>
                    <td>${item.amount ? formatMoney(item.amount) : '—'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<p class="error" style="padding:1rem">Error: ${err.message}</p>`;
  }
}

window.loadEcost = loadEcost;
