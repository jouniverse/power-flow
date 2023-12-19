let optionValue = [];
let unitValue = [];
let importExportId = finGridData.id.at(finGridData.name.findIndex(n => n == "Net import/export of electricity - real time data (3min)"))
let consumption3minId = finGridData.id.at(finGridData.name.findIndex(n => n == "Electricity consumption in Finland - real time data (3min)"))
let production3minId = finGridData.id.at(finGridData.name.findIndex(n => n == "Electricity production in Finland - real time data (3min)"))

async function getData(apiURL) {
    const res = await fetch(apiURL);
    const body = await res.json();
    return body;
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
        yAxisId: 'y'
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
        yAxisId: 'y1'
    }
],
    },
    options: {
        // hide chart data label
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 3/1,
        scales: {
            x: {
                // type: 'linear',
                type: 'timeseries',
                position: 'bottom',
                grid: {
                    display: false
                },
                display: true
            },
            y: {
                type: 'linear',
                beginAtZero: true,
                grid: {
                    display: false
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

 function addStats(plotIdx, dataPlot, units, name) {
    let stats = document.getElementById(name + '-info');
    let descriptionOne = finGridData.description.at(finGridData.id.findIndex(n => n == plotIdx[0]))
    let nameOne = finGridData.name.at(finGridData.id.findIndex(n => n == plotIdx[0]))
    let hyperlinkOne = finGridData.hyperlink.at(finGridData.id.findIndex(n => n == plotIdx[0]))
    let maxOne = Math.max(...dataPlot[0])
    let minOne = Math.min(...dataPlot[0])
    let rangeOne = roundTo(maxOne - minOne, 3)
    let avgOne = roundTo(mean(dataPlot[0]), 3)
    let medOne = roundTo(median(dataPlot[0]), 3)

    stats.innerHTML = `<div><a href='${hyperlinkOne}'>${nameOne}</a></div><div>${descriptionOne}</div><div>Max: <b>${maxOne}</b> [${units[1]}]</div><div>Min: <b> ${minOne}</b> [${units[1]}]<div> Range (Max - Min): <b>${rangeOne}</b> [${units[1]}]</div><div>Average: <b>${avgOne}</b> [${units[1]}]</div><div>Median: <b>${medOne}</b> [${units[1]}]</div>`;
}

async function plotimportExport(startYear,startMonth,startDay,startHour,startMinute,startSeconds, endYear,endMonth, endDay, endHour, endMinute, endSeconds) {
    // timezone: (UTC+02:00) Helsinki, Kiev, Riga, Sofia, Tallinn, Vilnius
    let dataPlot = [];

    let importExportURL = `https://api.fingrid.fi/v1/variable/${importExportId}/events/json?start_time=${startYear}-${startMonth}-${startDay}T${startHour}%3A${startMinute}%3A${startSeconds}Z&end_time=${endYear}-${endMonth}-${endDay}T${endHour}%3A${endMinute}%3A${endSeconds}Z`

    let consumptionURL = `https://api.fingrid.fi/v1/variable/${consumption3minId}/events/json?start_time=${startYear}-${startMonth}-${startDay}T${startHour}%3A${startMinute}%3A${startSeconds}Z&end_time=${endYear}-${endMonth}-${endDay}T${endHour}%3A${endMinute}%3A${endSeconds}Z`

    let productionURL = `https://api.fingrid.fi/v1/variable/${production3minId}/events/json?start_time=${startYear}-${startMonth}-${startDay}T${startHour}%3A${startMinute}%3A${startSeconds}Z&end_time=${endYear}-${endMonth}-${endDay}T${endHour}%3A${endMinute}%3A${endSeconds}Z`

    importExportData = await getData(importExportURL);
    consumptionData = await getData(consumptionURL);
    productionData = await getData(productionURL);

    seriesData = {importExport: [], difference: []};
    yAxis = [];
    let yAxisDifference = []; 
    for (let i = 0; i < importExportData.length; i++) {
        seriesData.importExport.push({x:importExportData[i].start_time,y:importExportData[i].value})
        yAxis.push(importExportData[i].value)
    }

    for (let i = 0; i < consumptionData.length; i++) {
        seriesData.difference.push({x:consumptionData[i].start_time,y:productionData[i].value-consumptionData[i].value})
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
        gridPlot.resize();
    } 

    // add description and stats
    addStats([importExportId], dataPlot, unitValue, 'net-import-export');
    // Update the plot
    gridPlot.update();
    
    let chartBox = document.getElementById('chartBox')
    chartBox.style.visibility = "visible"
}

let selectDateRange = document.getElementById("selected");
let selectMenu = document.getElementById('select');
selectDateRange.addEventListener('selectedChange', () => {
    let date = {};
    switch (selectDateRange.innerHTML) {
        case "Current Week":
            date = getCurrentWeek();
            plotimportExport(date[0].year, date[0].month, date[0].day, date[0].hour, date[0].minute, date[0].seconds, date[1].year, date[1].month, date[1].day, date[1].hour, date[1].minute, date[1].seconds)
            break;
        case "Last Week":
            date = getLastWeek();
            plotimportExport(date[0].year, date[0].month, date[0].day, date[0].hour, date[0].minute, date[0].seconds, date[1].year, date[1].month, date[1].day, date[1].hour, date[1].minute, date[1].seconds)
            break;
        case "Last Month":
            date = getLastMonth();
            plotimportExport(date[0].year, date[0].month, date[0].day, date[0].hour, date[0].minute, date[0].seconds, date[1].year, date[1].month, date[1].day, date[1].hour, date[1].minute, date[1].seconds)
            break;
        case "Current Month":
            date = getCurrentMonth();
            plotimportExport(date[0].year, date[0].month, date[0].day, date[0].hour, date[0].minute, date[0].seconds, date[1].year, date[1].month, date[1].day, date[1].hour, date[1].minute, date[1].seconds)
            break;
        default:
            break;
    }
});
