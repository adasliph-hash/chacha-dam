async function loadPercent() {
  const container = document.getElementById('percent-tab');
  container.innerHTML = '<p>Loading progress data...</p>';

  try {
    const res = await api.apiFetch('/api/percent');
    const data = res.data;

    let html = `
      <div class="stats">
        <div class="stat">
          <div class="label">Overall Progress</div>
          <div class="value">${data.overall}%</div>
          <div class="progress-bar">
            <div class="progress-fill" style="width:${data.overall}%"></div>
          </div>
        </div>
        <div class="stat">
          <div class="label">Time Progress</div>
          <div class="value">${data.timeProgress}%</div>
          <div class="progress-bar">
            <div class="progress-fill" style="width:${data.timeProgress}%"></div>
          </div>
        </div>
        <div class="stat">
          <div class="label">Elapsed / Planned</div>
          <div class="value">${data.elapsedMonths} / ${data.plannedMonths} months</div>
        </div>
      </div>
    `;

    data.categories.forEach(cat => {
      html += `
        <div class="card">
          <h2>${cat.icon} ${cat.name}</h2>
          <div style="display:flex;justify-content:space-between;margin-bottom:0.4rem">
            <span>${cat.percent}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width:${cat.percent}%"></div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<p class="error">Error: ${err.message}</p>`;
  }
}

window.loadPercent = loadPercent;