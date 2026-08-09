function loadHome() {
  const container = document.getElementById('home-tab');
  // Intentionally empty — this replaces the old Progress tab and its data.
  container.innerHTML = '';
}

window.loadHome = loadHome;
