document.addEventListener('DOMContentLoaded', () => {
  const map = L.map('map').setView([40.7128, -74.0060], 11);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map);

  const csvUrl = 'https://raw.githubusercontent.com/farhanazam98/collisions-scrape/main/data/latest_collisions.csv';

  function isWithinLastWeek(dateStr) {
    const crashDate = new Date(dateStr);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return crashDate >= oneWeekAgo;
  }

  function loadCsv() {
    const url = csvUrl + (csvUrl.includes('?') ? '&' : '?') + 'v=' + Date.now();
    Papa.parse(url, {
      download: true,
      header: true,
      dynamicTyping: true,
      skipEmptyLines: 'greedy',
      complete: res => {
        const allRows = Array.isArray(res.data) ? res.data : [];

        const recentRows = allRows.filter(row => isWithinLastWeek(row.crash_date));
        
        recentRows.forEach(row => {
          if (row.latitude && row.longitude) {
            const marker = L.marker([row.latitude, row.longitude]);
            const date = new Date(row.crash_date).toLocaleDateString();
            marker.bindPopup(`Crash Date: ${date}`);
            marker.addTo(map);
          }
        });

        const errCount = Array.isArray(res.errors) ? res.errors.length : 0;
        document.getElementById('status').textContent =
          `Showing ${recentRows.length} crashes from the last week (out of ${allRows.length} total)` +
          (errCount ? (' • ' + errCount + ' parse errors') : '');
      },
      error: err => {
        document.getElementById('status').textContent = 'Error loading CSV';
        console.error(err);
      }
    });
  }

  loadCsv();
});