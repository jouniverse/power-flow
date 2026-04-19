let optionValue = [];
let unitValue = [];
let importExportId = finGridData.id.at(finGridData.name.findIndex(n => n == "Net import/export of electricity - real time data (3min)"))
let consumption3minId = finGridData.id.at(finGridData.name.findIndex(n => n == "Electricity consumption in Finland - real time data (3min)"))
let production3minId = finGridData.id.at(finGridData.name.findIndex(n => n == "Electricity production in Finland - real time data (3min)"))

async function getData(apiURL) {
    // Throttle: ensure 6s between API calls
    const now = Date.now();
    const elapsed = now - (window._lastApiCallTime || 0);
    if (elapsed < 6000) {
        await new Promise(r => setTimeout(r, 6000 - elapsed));
    }
    window._lastApiCallTime = Date.now();

    for (let attempt = 0; attempt < 3; attempt++) {
        const res = await fetch(apiURL);
        if (res.status === 429) {
            console.warn(`getData: 429 received, waiting 6s (attempt ${attempt + 1}/3)`);
            await new Promise(r => setTimeout(r, 6000));
            window._lastApiCallTime = Date.now();
            continue;
        }
        return await res.json();
    }
    console.warn('getData: max retries reached for', apiURL);
    return { data: [] };
}

let importExportData = []
let consumptionData = []
let productionData = []
let seriesData = {importExport: [], difference: []};
let yAxis = [];
let yAxisDifference = [];
let plotLabel = ["Difference: Production - Consumption (3min) [MW]",""];

const gridPlot = new Chart("net-import-export", 
{
    type: 'line',
    data: {
    datasets: [{
        // electricity import/export
        label: plotLabel[0],
        data: seriesData.difference,
        borderWidth: 1,
        borderColor: 'white',
        radius: 0,
        hoverBackgroundColor: '#9fa5b5',
        pointHoverRadius: 5,
        yAxisID: 'y'
    },
    {
        // difference: consumption - production
        label: plotLabel[1],
        data: seriesData.importExport,
        borderWidth: 5,
        borderColor:  '#9fa5b5',
        radius: 0,
        hoverBackgroundColor: 'white',
        pointHoverRadius: 5,
        yAxisID: 'y1'
    }
],
    },
    options: {
        // hide chart data label
        responsive: true,
        maintainAspectRatio: true,
        resizeDelay: 100,
        aspectRatio: 3/1,
        scales: {
            x: {
                // type: 'linear',
                type: 'timeseries',
                position: 'bottom',
                grid: {
                    display: false
                },
                display: true,
                ticks: {
                    color: 'white',
                }
            },
            y: {
                type: 'linear',
                beginAtZero: true,
                grid: {
                    display: false
                },
                ticks: {
                    color: 'white',
                },
                // y-axis range
                max: Math.max(...yAxis)+(Math.max(...yAxis)-Math.min(...yAxis))*0.05,
                min: Math.min(...yAxis)-(Math.max(...yAxis)-Math.min(...yAxis))*0.05,
                display: true,
                position: 'left',
            },
            y1: {
                type: 'linear',
                beginAtZero: true,
                grid: {
                    display: false
                },
                // y1-axis range
                max: Math.max(...yAxis)+(Math.max(...yAxis)-Math.min(...yAxis))*0.05,
                min: Math.min(...yAxis)-(Math.max(...yAxis)-Math.min(...yAxis))*0.05,
                display: true,
                position: 'right',
                ticks: {
                    color: 'white',
                }
            }    
        },
        plugins: {
            tooltip: {
                enabled: true,
                //  two plots
                // position: 'nearest',
                // trigger external HTML tooltip
                // external: htmlTooltip
            },
            legend: {
                display: true,
                // remove the title legend label
                labels: {
                    boxWidth: 15,
                    boxHeight: 1,
                }
            },
            // zoom: {
            //     zoom: {
            //       wheel: {
            //         enabled: true,
            //       },
            //       pinch: {
            //         enabled: true
            //       },
            //       mode: 'xy',
            //     }
            //   }
            }
    }
});

Chart.defaults.color = 'white';

 function addStats(plotIdx, dataPlot, units, name) {
    let stats = document.getElementById(name + '-info');
    const selectedPeriod = document.getElementById('selected')?.innerHTML || '';
    let descriptionOne = finGridData.description.at(finGridData.id.findIndex(n => n == plotIdx[0]))
    let nameOne = finGridData.name.at(finGridData.id.findIndex(n => n == plotIdx[0]))
    let hyperlinkOne = finGridData.hyperlink.at(finGridData.id.findIndex(n => n == plotIdx[0]))
    let maxOne = Math.max(...dataPlot[0])
    let minOne = Math.min(...dataPlot[0])
    let rangeOne = roundTo(maxOne - minOne, 3)
    let avgOne = roundTo(mean(dataPlot[0]), 3)
    let medOne = roundTo(median(dataPlot[0]), 3)

    stats.innerHTML = `<div><a href='${hyperlinkOne}'>${nameOne}</a></div><div><b>${selectedPeriod}</b></div><div>${descriptionOne}</div><div>Max: <b>${maxOne}</b> [${units[1]}]</div><div>Min: <b> ${minOne}</b> [${units[1]}]<div> Range (Max - Min): <b>${rangeOne}</b> [${units[1]}]</div><div>Average: <b>${avgOne}</b> [${units[1]}]</div><div>Median: <b>${medOne}</b> [${units[1]}]</div>`;
}

async function plotimportExport(startYear,startMonth,startDay,startHour,startMinute,startSeconds, endYear,endMonth, endDay, endHour, endMinute, endSeconds) {
    // timezone: (UTC+02:00) Helsinki, Kiev, Riga, Sofia, Tallinn, Vilnius
    let dataPlot = [];

    let importExportURL = `/api/datasets/${importExportId}/data?startTime=${startYear}-${startMonth}-${startDay}T${startHour}:${startMinute}:${startSeconds}Z&endTime=${endYear}-${endMonth}-${endDay}T${endHour}:${endMinute}:${endSeconds}Z&format=json&pageSize=20000&sortBy=startTime&sortOrder=asc`

    let consumptionURL = `/api/datasets/${consumption3minId}/data?startTime=${startYear}-${startMonth}-${startDay}T${startHour}:${startMinute}:${startSeconds}Z&endTime=${endYear}-${endMonth}-${endDay}T${endHour}:${endMinute}:${endSeconds}Z&format=json&pageSize=20000&sortBy=startTime&sortOrder=asc`

    let productionURL = `/api/datasets/${production3minId}/data?startTime=${startYear}-${startMonth}-${startDay}T${startHour}:${startMinute}:${startSeconds}Z&endTime=${endYear}-${endMonth}-${endDay}T${endHour}:${endMinute}:${endSeconds}Z&format=json&pageSize=20000&sortBy=startTime&sortOrder=asc`

    let importExportRes = await getData(importExportURL);
    importExportData = importExportRes.data;
    let consumptionRes = await getData(consumptionURL);
    consumptionData = consumptionRes.data;
    let productionRes = await getData(productionURL);
    productionData = productionRes.data;

    if (importExportData.length === 0) {
        console.warn('plotimportExport: no data returned');
        const loader = document.getElementById('net-import-export-loader');
        if (loader) loader.style.display = 'none';
        return;
    }

    seriesData = {importExport: [], difference: []};
    yAxis = [];
    let yAxisDifference = []; 
    for (let i = 0; i < importExportData.length; i++) {
        seriesData.importExport.push({x:importExportData[i].startTime,y:importExportData[i].value})
        yAxis.push(importExportData[i].value)
    }

    const minLen = Math.min(consumptionData.length, productionData.length);
    for (let i = 0; i < minLen; i++) {
        seriesData.difference.push({x:consumptionData[i].startTime,y:productionData[i].value-consumptionData[i].value})
        yAxisDifference.push(productionData[i].value-consumptionData[i].value)
    }

    dataPlot.push(yAxis,yAxisDifference)
    let yMax = Math.max(...yAxis)+(Math.max(...yAxis)-Math.min(...yAxis))*0.05;
    let yMin = Math.min(...yAxis)-(Math.max(...yAxis)-Math.min(...yAxis))*0.05;

    let y1Max = Math.max(...yAxisDifference)+(Math.max(...yAxisDifference)-Math.min(...yAxisDifference))*0.05;
    let y1Min = Math.min(...yAxisDifference)-(Math.max(...yAxisDifference)-Math.min(...yAxisDifference))*0.05;

    let yyMax = Math.max(yMax, y1Max);
    let yyMin = Math.min(yMin, y1Min);

    optionValue[1] = finGridData.name.at(finGridData.id.findIndex(n => n == importExportId))
    unitValue[1] = finGridData.unit.at(finGridData.id.findIndex(n => n == importExportId))

    plotLabel[1] = optionValue[1] + " [" + unitValue[1] + "]"
    gridPlot.data.datasets[1].data = seriesData.importExport;
    gridPlot.data.datasets[1].label = plotLabel[1];

    gridPlot.options.scales.y.max =  yyMax;
    gridPlot.options.scales.y.min = yyMin;

    gridPlot.data.datasets[0].data = seriesData.difference;

    gridPlot.options.scales.y1.max =  yyMax;
    gridPlot.options.scales.y1.min = yyMin;

    if (detectMobile()) {
        gridPlot.options.aspectRatio = 2;
        Chart.defaults.font.size = 8;
    } 

    // add description and stats
    addStats([importExportId], dataPlot, unitValue, 'net-import-export');
    // Update the plot
    gridPlot.update();

    // Hide spinner
    const loader = document.getElementById('net-import-export-loader');
    if (loader) loader.style.display = 'none';
}

let selectDateRange = document.getElementById("selected");
let selectMenu = document.getElementById('select');
selectDateRange.addEventListener('selectedChange', async () => {
    // Show spinner
    const loader = document.getElementById('net-import-export-loader');
    if (loader) loader.style.display = '';

    let date = {};
    switch (selectDateRange.innerHTML) {
        case "Current Week": date = getCurrentWeek(); break;
        case "Last Week": date = getLastWeek(); break;
        case "Last Month": date = getLastMonth(); break;
        case "Current Month": date = getCurrentMonth(); break;
        default: return;
    }
    const args = [date[0].year, date[0].month, date[0].day, date[0].hour, date[0].minute, date[0].seconds, date[1].year, date[1].month, date[1].day, date[1].hour, date[1].minute, date[1].seconds];
    // Sequential: first chart data, then map data to avoid 429
    await plotimportExport(...args);
    if (typeof fetchMapDataForRange === 'function') {
        await fetchMapDataForRange(...args);
    }
});
