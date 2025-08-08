document.addEventListener('DOMContentLoaded', () => {
    const map = L.map('map').setView([40.7128, -74.0060], 11);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(map);

    const csvUrl = 'https://raw.githubusercontent.com/farhanazam98/collisions-scrape/main/data/latest_collisions.csv';
    let markers = L.markerClusterGroup().addTo(map);
    let currentDistrict = null;
    let councilDistricts;
    let collisionsData = [];
    let oldestCrashDate = null;
    let newestCrashDate = null;

    function updateDistrictLayer(districtNum) {
        if (councilDistricts) {
            map.removeLayer(councilDistricts);
        }
        
        fetch('../data/city_council_district_geo.json')
            .then(response => response.json())
            .then(data => {
                // Filter for selected district
                const filteredData = {
                    ...data,
                    features: data.features.filter(f => 
                        f.properties.CounDist === districtNum
                    )
                };
                
                councilDistricts = L.geoJSON(filteredData, {
                    style: {
                        color: '#2c3e50',
                        weight: 2,
                        opacity: 0.8,
                        fillOpacity: 0.4
                    },
                    onEachFeature: (feature, layer) => {
                        layer.bindPopup(`Council District: ${feature.properties.CounDist}`);
                    }
                }).addTo(map);

                // Fit map to selected district bounds
                councilDistricts.eachLayer(layer => {
                    map.fitBounds(layer.getBounds());
                });
            })
            .catch(err => console.error('Error loading council districts:', err));
    }

 

    function getDaysAgo(date) {
        const now = new Date();
        const diffTime = now - date;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    function findDateBoundaries(data) {
        if (!data.length) {
            return {
                oldest: null,
                newest: null,
                oldestDaysAgo: null,
                newestDaysAgo: null
            };
        }
        let oldest = new Date(data[0].crash_date);
        let newest = new Date(data[0].crash_date);
        
        data.forEach(row => {
            const crashDate = new Date(row.crash_date);
            if (crashDate < oldest) oldest = crashDate;
            if (crashDate > newest) newest = crashDate;
        });
        
        return {
            oldest: oldest,
            newest: newest,
            oldestDaysAgo: getDaysAgo(oldest),
            newestDaysAgo: getDaysAgo(newest)
        };
    }

    function isWithinTimeRange(dateStr, startDays, endDays) {
        const crashDate = new Date(dateStr);
        const startDate = new Date();
        const endDate = new Date();
        
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
                const boundaries = findDateBoundaries(collisionsData);
                oldestCrashDate = boundaries.oldest;
                newestCrashDate = boundaries.newest;
                
                // Initialize number input handler
                const numberInput = document.getElementById('numberInput');
                numberInput.addEventListener('change', (e) => {
                    const value = parseInt(e.target.value);
                    if (value >= 1 && value <= 51) {
                        currentDistrict = value;
                        updateDistrictLayer(value);
                    }
                });
                
                const slider = document.getElementById('slider');
                noUiSlider.create(slider, {
                    start: [-boundaries.oldestDaysAgo, -boundaries.newestDaysAgo],
                    connect: true,
                    step: 1,
                    range: {
                        'min': -boundaries.oldestDaysAgo,
                        'max': -boundaries.newestDaysAgo
                    }
                });

                slider.noUiSlider.on('update', (values) => {
                    const [startDays, endDays] = values.map(v => Math.round(v));
                    document.getElementById('startLabel').textContent = Math.abs(startDays);
                    document.getElementById('endLabel').textContent = Math.abs(endDays);
                    updateMap(Math.abs(startDays), Math.abs(endDays));
                });
                
                // Initialize with all available data
                updateMap(boundaries.oldestDaysAgo, boundaries.newestDaysAgo);
            },
            error: err => {
                document.getElementById('status').textContent = 'Error loading CSV';
                console.error(err);
            }
        });
    }

    loadCsv();
});