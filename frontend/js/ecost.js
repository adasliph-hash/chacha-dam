async function loadEcost() {
  const container = document.getElementById('ecost-tab');
  container.innerHTML = '<p style="padding:1rem;color:#8a8574">Loading...</p>';

  try {
    const res = await api.apiFetch('/api/ecost');
    const data = res.data;

    let html = `
      <div class="stats">
        <div class="stat">
          <div class="label">Total Estimated</div>
          <div class="value">${formatMoney(data.totalEstimated)}</div>
        </div>
        <div class="stat">
          <div class="label">Total Actual</div>
          <div class="value">${formatMoney(data.totalActual)}</div>
        </div>
        <div class="stat">
          <div class="label">Variance</div>
          <div class="value" style="color:${data.totalVariance >= 0 ? '#dc2626' : '#1a7a4c'}">
            ${formatMoney(data.totalVariance)} (${data.totalVariancePercent}%)
          </div>
        </div>
      </div>
    `;

    let idx = 0;
    data.categories.forEach(cat => {
      const color = cat.status === 'over' ? '#dc2626' : cat.status === 'under' ? '#1a7a4c' : '#0ea5e9';
      const cardId = `ecost-cat-${idx++}`;
      html += `
        <div class="bill-card" id="${cardId}">
          <div class="bill-row" onclick="document.getElementById('${cardId}').classList.toggle('open')">
            <div class="bill-icon">${cat.icon || '📈'}</div>
            <div class="bill-info">
              <div class="bill-name">${cat.name}</div>
              <div class="bill-meta" style="color:${color}">${formatMoney(cat.variance)} (${cat.variancePercent}%)</div>
            </div>
            <div class="bill-chevron">▼</div>
          </div>
          <div class="bill-items">
            <table>
              <tr>
                <td>Estimated</td>
                <td>${formatMoney(cat.estimated)}</td>
              </tr>
              <tr>
                <td>Actual</td>
                <td>${formatMoney(cat.actual)}</td>
              </tr>
              <tr>
                <td>Variance</td>
                <td style="color:${color}">${formatMoney(cat.variance)} (${cat.variancePercent}%)</td>
              </tr>
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