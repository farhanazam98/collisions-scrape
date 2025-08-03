document.addEventListener('DOMContentLoaded', () => {
    const map = L.map('map').setView([40.7128, -74.0060], 11);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(map);

    const csvUrl = 'https://raw.githubusercontent.com/farhanazam98/collisions-scrape/main/data/latest_collisions.csv';
    let markers = L.layerGroup().addTo(map);
    let collisionsData = [];
    let mostRecentCrashDate = null

    function isWithinTimeRange(dateStr, daysAgo) {
        const crashDate = new Date(dateStr);
        const startDate = new Date();
        if (!mostRecentCrashDate || crashDate > mostRecentCrashDate) {
            mostRecentCrashDate = crashDate;
            document.getElementById('mostRecentCrashDate').textContent = mostRecentCrashDate.toLocaleDateString();
        }
        startDate.setDate(startDate.getDate() - daysAgo);        
        return crashDate >= startDate;
    }

    function updateMap(daysAgo) {
        markers.clearLayers();
        
        const filteredRows = collisionsData.filter(row => isWithinTimeRange(row.crash_date, daysAgo));
        
        filteredRows.forEach(row => {
            if (row.latitude && row.longitude) {
                const marker = L.marker([row.latitude, row.longitude]);
                const date = new Date(row.crash_date).toLocaleDateString();
                marker.bindPopup(`Crash Date: ${date}`);
                marker.addTo(markers);
            }
        });

        document.getElementById('status').textContent =
        `Showing ${filteredRows.length} crashes from the last ${daysAgo} days (out of ${collisionsData.length} total)`;
    }

    function loadCsv() {
        const url = csvUrl + (csvUrl.includes('?') ? '&' : '?') + 'v=' + Date.now();
        Papa.parse(url, {
            download: true,
            header: true,
            dynamicTyping: true,
            skipEmptyLines: 'greedy',
            complete: res => {
                collisionsData = Array.isArray(res.data) ? res.data : [];
                updateMap(7); 

                const slider = document.getElementById('timeRange');
                const daysLabel = document.getElementById('daysLabel');
                const mostRecentCrashDateLabel = document.getElementById('mostRecentCrashDate');
                
                slider.addEventListener('input', (e) => {
                    const daysAgo = parseInt(e.target.value * -1); 
                    daysLabel.textContent = daysAgo;
                    updateMap(daysAgo);
                });
            },
            error: err => {
                document.getElementById('status').textContent = 'Error loading CSV';
                console.error(err);
            }
        });
    }

    loadCsv();
});