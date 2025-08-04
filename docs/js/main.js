document.addEventListener('DOMContentLoaded', () => {
    const map = L.map('map').setView([40.7128, -74.0060], 11);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(map);

    const csvUrl = 'https://raw.githubusercontent.com/farhanazam98/collisions-scrape/main/data/latest_collisions.csv';
    let markers = L.layerGroup().addTo(map);
    let collisionsData = [];
    let mostRecentCrashDate = null

    function isWithinTimeRange(dateStr, startDays, endDays) {
        const crashDate = new Date(dateStr);
        const startDate = new Date();
        const endDate = new Date();
        
        if (!mostRecentCrashDate || crashDate > mostRecentCrashDate) {
            mostRecentCrashDate = crashDate;
            // document.getElementById('mostRecentCrashDate').textContent = mostRecentCrashDate.toLocaleDateString();
        }
        
        startDate.setDate(startDate.getDate() - startDays);
        endDate.setDate(endDate.getDate() - endDays);
        return crashDate >= startDate && crashDate <= endDate;
    }

    function updateMap(startDays, endDays) {
        markers.clearLayers();
        
        const filteredRows = collisionsData.filter(row => 
            isWithinTimeRange(row.crash_date, startDays, endDays)
        );
        
        filteredRows.forEach(row => {
            if (row.latitude && row.longitude) {
                const marker = L.marker([row.latitude, row.longitude]);
                const date = new Date(row.crash_date).toLocaleDateString();
                marker.bindPopup(`Crash Date: ${date}`);
                marker.addTo(markers);
            }
        });

        document.getElementById('status').textContent =
            `Showing ${filteredRows.length} crashes from ${startDays} to ${endDays} days ago (out of ${collisionsData.length} total)`;
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
                
                const slider = document.getElementById('slider');
                noUiSlider.create(slider, {
                    start: [-7, -1],
                    connect: true,
                    step: 1,
                    range: {
                        'min': -7,
                        'max': -1
                    }
                });

                slider.noUiSlider.on('update', (values) => {
                    const [startDays, endDays] = values.map(v => Math.round(v));
                    document.getElementById('startLabel').textContent = startDays;
                    document.getElementById('endLabel').textContent = endDays;
                    updateMap(Math.abs(startDays), Math.abs(endDays));
                });
                
                updateMap(7, 1);
            },
            error: err => {
                document.getElementById('status').textContent = 'Error loading CSV';
                console.error(err);
            }
        });
    }

    loadCsv();
});