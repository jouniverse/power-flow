const _chartPlotQueue = [];

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

function addPlot(plots, chartName, aspectRatio = 3/1, scaling = 1) {
    let optionValue = [];
    let unitValue = []; 
    let dataPlotOne = []
    let dataPlotTwo = []
    let seriesData = {plotOne: [], plotTwo: []}
    let yAxisPlotOne = [];
    let yAxisPlotTwo = [];
    let plotLabel = ["",""];

    // Plot placeholder map
    const gridPlot = new Chart(chartName, 
    {
        type: 'line',
        data: {
        datasets: [{
            // plot one
            label: plotLabel[0],
            data: seriesData.plotOne,
            borderWidth: 2,
            borderColor: 'rgb(255,255,255)',
            radius: 0,
            hoverBackgroundColor: '#9fa5b5',
            pointHoverRadius: 5,
            yAxisID: 'y'
        },
        {
            // plot two
            label: plotLabel[1],
            data: seriesData.plotTwo,
            borderWidth: 2,
            borderColor: '#23242a',
            backgroundColor: '#23242a',
            radius: 0,
            hoverBackgroundColor: 'white',
            pointHoverRadius: 5,
            yAxisID: 'y1'
        }
    ],
        },
        options: {
        responsive: true,
        maintainAspectRatio: true,
        resizeDelay: 100,
        aspectRatio: aspectRatio,
        scales: {
            x: {
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
                // y-axis range
                max: Math.max(...yAxisPlotOne)+(Math.max(...yAxisPlotOne)-Math.min(...yAxisPlotOne))*0.05,
                min: Math.min(...yAxisPlotOne)-(Math.max(...yAxisPlotOne)-Math.min(...yAxisPlotOne))*0.05,
                display: true,
                position: 'left',
                ticks: {
                    color: 'white',
                }
            },  
            y1: {   
                type: 'linear',
                beginAtZero: true,
                grid: {
                    display: false
                },
                // y1-axis range
                max: Math.max(...yAxisPlotTwo)+(Math.max(...yAxisPlotTwo)-Math.min(...yAxisPlotTwo))*0.05,
                min: Math.min(...yAxisPlotTwo)-(Math.max(...yAxisPlotTwo)-Math.min(...yAxisPlotTwo))*0.05,
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
                //  plotTwo plots
                // position: 'nearest',
                // trigger external HTML tooltip
                // external: htmlTooltip
            },
            legend: {
                display: true,
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
        if (plotIdx.length > 1) {
            let descriptionOne = finGridData.description.at(finGridData.id.findIndex(n => n == plotIdx[0]))
            let nameOne = finGridData.name.at(finGridData.id.findIndex(n => n == plotIdx[0]))
            let hyperlinkOne = finGridData.hyperlink.at(finGridData.id.findIndex(n => n == plotIdx[0]))
            let maxOne = Math.max(...dataPlot[0])
            let minOne = Math.min(...dataPlot[0])
            let rangeOne = roundTo(maxOne - minOne, 3)
            let avgOne = roundTo(mean(dataPlot[0]), 3)
            let medOne = roundTo(median(dataPlot[0]), 3)
            let descriptionTwo = finGridData.description.at(finGridData.id.findIndex(n => n == plotIdx[1]))
            let nameTwo = finGridData.name.at(finGridData.id.findIndex(n => n == plotIdx[1]))
            let hyperlinkTwo = finGridData.hyperlink.at(finGridData.id.findIndex(n => n == plotIdx[1]))
            let maxTwo = Math.max(...dataPlot[1])
            let minTwo = Math.min(...dataPlot[1])
            let rangeTwo = roundTo(maxTwo - minTwo, 3)
            let avgTwo = roundTo(mean(dataPlot[1]), 3)
            let medTwo = roundTo(median(dataPlot[1]), 3)

            stats.innerHTML = `<div><a href='${hyperlinkOne}'>${nameOne}</a></div><div><b>${selectedPeriod}</b></div><div>${descriptionOne}</div><div>Max: <b>${maxOne}</b> [${units[0]}]</div><div>Min: <b>${minOne}</b> [${units[0]}]<div>Range (Max - Min): <b>${rangeOne}</b> [${units[0]}]</div><div>Average: <b>${avgOne}</b> [${units[0]}]</div><div>Median: <b>${medOne}</b> [${units[0]}]</div><br><div><a href='${hyperlinkTwo}'>${nameTwo}</a></div><div>${descriptionTwo}</div><div>Max: <b>${maxTwo}</b> [${units[1]}]</div><div>Min: <b>${minTwo}</b> [${units[1]}]<div>Range (Max - Min): <b>${rangeTwo}</b> [${units[1]}]</dvi><div>Average: <b>${avgTwo}</b> [${units[1]}]</div><div>Median: <b>${medTwo}</b> [${units[1]}]</div>`;

        } else {

            let descriptionOne = finGridData.description.at(finGridData.id.findIndex(n => n == plotIdx[0]))
            let nameOne = finGridData.name.at(finGridData.id.findIndex(n => n == plotIdx[0]))
            let hyperlinkOne = finGridData.hyperlink.at(finGridData.id.findIndex(n => n == plotIdx[0]))
            let maxOne = Math.max(...dataPlot[0])
            let minOne = Math.min(...dataPlot[0])
            let rangeOne = roundTo(maxOne - minOne, 3)
            let avgOne = roundTo(mean(dataPlot[0]), 3)
            let medOne = roundTo(median(dataPlot[0]), 3)
            if (units[0] != "" ) {
                stats.innerHTML = `<div><a href='${hyperlinkOne}'>${nameOne}</a></div><div><b>${selectedPeriod}</b></div><div>${descriptionOne}</div><div>Max: <b>${maxOne}</b> [${units[0]}]</div><div>Min: <b> ${minOne}</b> [${units[0]}]<div> Range (Max - Min): <b>${rangeOne}</b> [${units[0]}]</div><div>Average: <b>${avgOne}</b> [${units[0]}]</div><div>Median: <b>${medOne}</b> [${units[0]}]</div>`;
            } else {
                stats.innerHTML = `<div><a href='${hyperlinkOne}'>${nameOne}</a></div><div><b>${selectedPeriod}</b></div><div>${descriptionOne}</div><div>Max: <b>${maxOne}</b></div><div>Min: <b> ${minOne}</b><div> Range (Max - Min): <b>${rangeOne}</b></div><div>Average: <b>${avgOne}</b> </div><div>Median: <b>${medOne}</b></div>`;
            }

        }
    }

    async function plotChart(startYear,startMonth,startDay,startHour,startMinute,startSeconds, endYear,endMonth, endDay, endHour, endMinute, endSeconds) {
        // timezone: (UTC+02:00) Helsinki, Kiev, Riga, Sofia, Tallinn, Vilnius

        let powerSystemState = [];
        let powerSystemStateId = finGridData.id.at(finGridData.name.findIndex(n => n == "Power system state - real time data (3min)"))
        let powerSystemDiv = document.getElementById("power-system-state")
        if (powerSystemDiv.innerHTML != ""){
            powerSystemDiv.style.padding = '0 0 0 0'
            powerSystemDiv.innerHTML = ""
        }

        let powerSystemStateURL =  `/api/datasets/${powerSystemStateId}/data?startTime=${startYear}-${startMonth}-${startDay}T${startHour}:${startMinute}:${startSeconds}Z&endTime=${endYear}-${endMonth}-${endDay}T${endHour}:${endMinute}:${endSeconds}Z&format=json&pageSize=20000&sortBy=startTime&sortOrder=asc`

        let powerSystemStateRes = await getData(powerSystemStateURL);
        powerSystemState = powerSystemStateRes.data;
        
        powerSystemData = []
        for (let i = 0; i < powerSystemState.length; i++) {
            powerSystemData.push(powerSystemState[i].value)
        }

        if (powerSystemDiv.innerHTML == "") {
            let powerSystemCurrentState = powerSystemData.at(-1)
            switch (powerSystemCurrentState) {
                case 1:
                    powerSystemDiv.innerHTML = `<p>Current power system state:<p class="power-system-state-lbl"><b>Normal</b></p>`
                    powerSystemDiv.style.padding = '10px 20px 10px 20px'
                    break;
                case 2:
                    powerSystemDiv.innerHTML = `<p>Current power system state:<p class="power-system-state-lbl"><b>Endangered</b></p>`
                    powerSystemDiv.style.padding = '10px 20px 10px 20px'
                    break;
                case 3:
                    powerSystemDiv.innerHTML = `<p>Current power system state:<p class="power-system-state-lbl"><b>Disturbed</b></p>`
                    powerSystemDiv.style.padding = '10px 20px 10px 20px'
                    break;
                case 4:
                    powerSystemDiv.innerHTML = `<p>Current power system state:<p class="power-system-state-lbl"><b>Disturbance</b></p>`
                    powerSystemDiv.style.padding = '10px 20px 10px 20px'
                    break;
                case 5:
                    powerSystemDiv.innerHTML = `<p>Current power system state:<p class="power-system-state-lbl"><b>Blackout</b></p>`
                    powerSystemDiv.style.padding = '10px 20px 10px 20px'
                    break;
                default:
                    powerSystemDiv.innerHTML = `<p>Current power system state:<p class="power-system-state-lbl"></p><p><b>Unknown</b></p>`
                    powerSystemDiv.style.padding = '10px 20px 10px 20px'
                    break;
            }
        }

        let dataPlot = [];

        let plotOneURL = `/api/datasets/${plots[0]}/data?startTime=${startYear}-${startMonth}-${startDay}T${startHour}:${startMinute}:${startSeconds}Z&endTime=${endYear}-${endMonth}-${endDay}T${endHour}:${endMinute}:${endSeconds}Z&format=json&pageSize=20000&sortBy=startTime&sortOrder=asc`

        let plotOneRes = await getData(plotOneURL);
        dataPlotOne = plotOneRes.data;

        if (plots.length > 1) {
            let plotTwoURL = `/api/datasets/${plots[1]}/data?startTime=${startYear}-${startMonth}-${startDay}T${startHour}:${startMinute}:${startSeconds}Z&endTime=${endYear}-${endMonth}-${endDay}T${endHour}:${endMinute}:${endSeconds}Z&format=json&pageSize=20000&sortBy=startTime&sortOrder=asc`

        let plotTwoRes = await getData(plotTwoURL);
        dataPlotTwo = plotTwoRes.data;
        }

        if (dataPlotOne.length === 0) {
            console.warn('plotChart: no data returned for', chartName);
            const loader = document.getElementById(chartName + '-loader');
            if (loader) loader.style.display = 'none';
            return;
        }
        
        seriesData = {plotOne: [], plotTwo: []}
        yAxisPlotOne = [];
        yAxisPlotTwo = [];  
        for (let i = 0; i < dataPlotOne.length; i++) {
            seriesData.plotOne.push({x:dataPlotOne[i].startTime,y:dataPlotOne[i].value})
            yAxisPlotOne.push(dataPlotOne[i].value)
        }
        if (plots.length > 1) {
            for (let i = 0; i < dataPlotTwo.length; i++) {
                seriesData.plotTwo.push({x:dataPlotTwo[i].startTime,y:dataPlotTwo[i].value})
                yAxisPlotTwo.push(dataPlotTwo[i].value)
            }
        }

        dataPlot.push(yAxisPlotOne,yAxisPlotTwo)
        // get the y-axis max and min
        let yMax = Math.max(...yAxisPlotOne)+(Math.max(...yAxisPlotOne)-Math.min(...yAxisPlotOne))*0.05;
        let yMin = Math.min(...yAxisPlotOne)-(Math.max(...yAxisPlotOne)-Math.min(...yAxisPlotOne))*0.05;

        let yyMax;
        let yyMin
        if (plots.length> 1) {
            let y1Max = Math.max(...yAxisPlotTwo)+(Math.max(...yAxisPlotTwo)-Math.min(...yAxisPlotTwo))*0.05;
            let y1Min = Math.min(...yAxisPlotTwo)-(Math.max(...yAxisPlotTwo)-Math.min(...yAxisPlotTwo))*0.05;
    
            yyMax = Math.max(yMax, y1Max);
            yyMin = Math.min(yMin, y1Min);
        } else {
            yyMax = yMax
            yyMin = yMin
        }

        optionValue[0] = finGridData.name.at(finGridData.id.findIndex(n => n == plots[0]))
        unitValue[0] = finGridData.unit.at(finGridData.id.findIndex(n => n == plots[0]))

        plotLabel[0] = unitValue[0] != "" ? optionValue[0]  + " [" + unitValue[0] + "]" : optionValue[0]
        gridPlot.data.datasets[0].data = seriesData.plotOne;
        gridPlot.data.datasets[0].label = plotLabel[0];

        gridPlot.data.datasets[1].borderColor = '#23242a'

        gridPlot.options.scales.y.max =  yyMax*scaling;
        gridPlot.options.scales.y.min = yyMin;

        if (plots.length > 1) {
            optionValue[1] = finGridData.name.at(finGridData.id.findIndex(n => n == plots[1]))
            unitValue[1] = finGridData.unit.at(finGridData.id.findIndex(n => n == plots[1]))

            gridPlot.data.datasets[1].borderColor = '#9fa5b5'
    
            plotLabel[1] = unitValue[1] !== "" ? optionValue[1] + " [" + unitValue[1] + "]" : optionValue[1]
            gridPlot.data.datasets[1].data = seriesData.plotTwo;
            gridPlot.data.datasets[1].label = plotLabel[1];
    
            gridPlot.options.scales.y1.max =  yyMax;
            gridPlot.options.scales.y1.min = yyMin;
        }

        if (detectMobile()) {
            Chart.defaults.font.size = 8;
        } 

        //  add description and stats
        addStats(plots, dataPlot, unitValue, chartName);
        // update the plot
        gridPlot.update();

        // Hide spinner
        const loader = document.getElementById(chartName + '-loader');
        if (loader) loader.style.display = 'none';
    }

    // Register plotChart in global queue for sequential processing
    _chartPlotQueue.push(plotChart);
}
