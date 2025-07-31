document.addEventListener('DOMContentLoaded', () => {
  const map = L.map('map').setView([40.7128, -74.0060], 11);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map);

  const csvUrl = 'https://raw.githubusercontent.com/farhanazam98/collisions-scrape/main/data/latest_collisions.csv';

  function loadCsv() {
    const url = csvUrl + (csvUrl.includes('?') ? '&' : '?') + 'v=' + Date.now();
    Papa.parse(url, {
      download: true,
      header: true,
      dynamicTyping: true,
      skipEmptyLines: 'greedy',
      complete: res => {
        const rows = Array.isArray(res.data) ? res.data : [];
        window.__rows = rows;
        const errCount = Array.isArray(res.errors) ? res.errors.length : 0;
        document.getElementById('status').textContent =
          'Loaded ' + rows.length + ' rows' + (errCount ? (' • ' + errCount + ' parse errors') : '');
      },
      error: err => {
        document.getElementById('status').textContent = 'Error loading CSV';
        console.error(err);
      }
    });
  }
    loadCsv();
    });