// Import/Export Map Component
// Fetches cross-border power flow data and displays on SVG map

const mapDatasetIds = {
    northern_sweden: 87,
    central_sweden: 89,
    oland: 90,
    estonia: 180,
    norway: 187,
    net_ie: 194
};

let mapPowerData = {};

async function fetchWithRetry(url) {
    // Throttle: ensure 6s between API calls
    const now = Date.now();
    const elapsed = now - (window._lastApiCallTime || 0);
    if (elapsed < 6000) {
        await new Promise(r => setTimeout(r, 6000 - elapsed));
    }
    window._lastApiCallTime = Date.now();

    for (let attempt = 0; attempt < 3; attempt++) {
        const res = await fetch(url);
        if (res.status === 429) {
            console.warn(`fetchWithRetry: 429 received, waiting 6s (attempt ${attempt + 1}/3)`);
            await new Promise(r => setTimeout(r, 6000));
            window._lastApiCallTime = Date.now();
            continue;
        }
        return await res.json();
    }
    console.warn('fetchWithRetry: max retries reached for', url);
    return null;
}

async function fetchMapData() {
    const infoDisplay = document.getElementById('map-info-display');
    infoDisplay.innerHTML = '<h2>Loading power transfer data...</h2>';

    try {
        const ids = Object.entries(mapDatasetIds);
        const results = {};

        for (const [key, id] of ids) {
            const data = await fetchWithRetry(`/api/datasets/${id}/data/latest`);
            if (!data) { results[key] = 'N/A'; continue; }
            results[key] = data.value != null ? Math.round(data.value * 100) / 100 : 'N/A';
            if (key === 'net_ie') {
                results.timestamp = data.startTime;
            }
        }

        mapPowerData = results;
        mapPowerData.label = 'Latest';
        resetMapDisplay();
    } catch (err) {
        console.error('Error fetching map data:', err);
        infoDisplay.innerHTML = '<h2>Error loading power transfer data</h2><p>Check console for details.</p>';
    }
}

async function fetchMapDataForRange(startYear, startMonth, startDay, startHour, startMinute, startSeconds, endYear, endMonth, endDay, endHour, endMinute, endSeconds) {
    const infoDisplay = document.getElementById('map-info-display');
    infoDisplay.innerHTML = '<h2>Loading power transfer data...</h2>';

    try {
        const ids = Object.entries(mapDatasetIds);
        const results = {};

        for (const [key, id] of ids) {
            const url = `/api/datasets/${id}/data?startTime=${startYear}-${startMonth}-${startDay}T${startHour}:${startMinute}:${startSeconds}Z&endTime=${endYear}-${endMonth}-${endDay}T${endHour}:${endMinute}:${endSeconds}Z&format=json&pageSize=20000&sortBy=startTime&sortOrder=asc`;
            const data = await fetchWithRetry(url);
            if (!data || !data.data || data.data.length === 0) {
                results[key] = 'N/A';
                continue;
            }
            const avg = data.data.reduce((sum, d) => sum + d.value, 0) / data.data.length;
            results[key] = Math.round(avg * 100) / 100;
            if (key === 'net_ie' && data.data && data.data.length > 0) {
                results.timestamp = data.data[0].startTime + ' – ' + data.data[data.data.length - 1].startTime;
            }
        }

        mapPowerData = results;
        mapPowerData.label = document.getElementById('selected').innerHTML;
        resetMapDisplay();
    } catch (err) {
        console.error('Error fetching map data:', err);
        infoDisplay.innerHTML = '<h2>Error loading power transfer data</h2><p>Check console for details.</p>';
    }
}

function displayMapPowerData(country) {
    const infoDisplay = document.getElementById('map-info-display');
    const isAvg = mapPowerData.label && mapPowerData.label !== 'Latest';
    const unit = isAvg ? 'MW (avg)' : 'MW';
    const periodLabel = mapPowerData.label || 'Latest';
    let content = `<h2>${country} Power Transfer (${periodLabel})</h2>`;

    if (country === 'Finland') {
        content += `
            <p>Sweden (Central): ${mapPowerData.central_sweden ?? 'N/A'} ${unit}</p>
            <p>Sweden (North): ${mapPowerData.northern_sweden ?? 'N/A'} ${unit}</p>
            <p>Norway: ${mapPowerData.norway ?? 'N/A'} ${unit}</p>
            <p>Estonia: ${mapPowerData.estonia ?? 'N/A'} ${unit}</p>
            <p>Åland: ${mapPowerData.oland ?? 'N/A'} ${unit}</p>
            <p>Net Import-Export: ${mapPowerData.net_ie ?? 'N/A'} ${unit}</p>
            <p>- = import, + = export</p>`;
    } else if (country === 'Sweden') {
        content += `
            <p>Central Sweden: ${mapPowerData.central_sweden ?? 'N/A'} ${unit}</p>
            <p>Northern Sweden: ${mapPowerData.northern_sweden ?? 'N/A'} ${unit}</p><br>
            <p>+ = import, - = export</p>`;
    } else if (country === 'Norway') {
        content += `
            <p>Norway: ${mapPowerData.norway ?? 'N/A'} ${unit}</p><br>
            <p>+ = import, - = export</p>`;
    } else if (country === 'Estonia') {
        content += `
            <p>Estonia: ${mapPowerData.estonia ?? 'N/A'} ${unit}</p><br>
            <p>+ = import, - = export</p>`;
    }

    infoDisplay.innerHTML = content;
}

function resetMapDisplay() {
    const infoDisplay = document.getElementById('map-info-display');
    const isAvg = mapPowerData.label && mapPowerData.label !== 'Latest';
    const unit = isAvg ? 'MW (avg)' : 'MW';
    const periodLabel = mapPowerData.label || 'Latest';
    infoDisplay.innerHTML = `
        <h2>Power Transfer: ${periodLabel}</h2>
        <p>Hover over a country to see power transfer data with Finland.</p><br>
        <p>Net Import-Export: ${mapPowerData.net_ie ?? 'N/A'} ${unit}</p>
        <p>- = import, + = export</p>`;
}

// fetchMapDataForRange is called from net-import-export.js after chart data is loaded
// to ensure sequential API calls and avoid 429 rate limit errors.
