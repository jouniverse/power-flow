let gridOptions = ['consumption-production','net-import-export','hydro-nuclear','wind','solar','cogeneration','kinetic-energy','frequency','time-deviation']

let btnLabels = ['Consumption and production', 'Net import/export', 'Hydro and nuclear power', 'Wind power', 'Solar power', 'Cogeneration', 'Kinetic energy', 'Frequency', 'Time deviation']

let chartContainer = document.getElementById('chartBox')

gridOptions.forEach((g, index) => {
    chartContainer.innerHTML += `
        <canvas id="${g}" class="${g}"></canvas>
        <a href="#${g}-block" class="info-link info-container glow-on-hover">${btnLabels[index]}</a>
        <div id="${g}-block" class="container-block">
            <div class="content-block">
                <p id="${g}-info" class="info-text"></p>
            </div>
        </div>`;
});

// consumption-production
let consumptionId = finGridData.id.at(finGridData.name.findIndex(n => n == "Electricity consumption in Finland (60min)"))
let productionId = finGridData.id.at(finGridData.name.findIndex(n => n == "Electricity production in Finland (60min)"))
// hydro-nuclear
let hydroId = finGridData.id.at(finGridData.name.findIndex(n => n == "Hydro power production - real time data (3min)"))
let nuclearId = finGridData.id.at(finGridData.name.findIndex(n => n == "Nuclear power production - real time data (3min)"))
// wind
let windId = finGridData.id.at(finGridData.name.findIndex(n => n == "Wind power generation forecast - updated hourly (60min)"))
// solar
let solarId = finGridData.id.at(finGridData.name.findIndex(n => n == "Solar power generation forecast - updated hourly (60min)"))
// cogeneration
let heatingId = finGridData.id.at(finGridData.name.findIndex(n => n == "Cogeneration of district heating - real time data (3min)"))
let industrialId = finGridData.id.at(finGridData.name.findIndex(n => n == "Industrial cogeneration - real time data (3min)"))
// kinetic-energy
let kineticEnergyId = finGridData.id.at(finGridData.name.findIndex(n => n == "Kinetic energy of the Nordic power system - real time data (1min)"))
// frequency
let frequencyId = finGridData.id.at(finGridData.name.findIndex(n => n == "Frequency - real time data (3min)"))
//  time-deviation
let timeDeviationId = finGridData.id.at(finGridData.name.findIndex(n => n == "Time deviation - real time data (3min)"))

if (!detectMobile()) {
    addPlot([consumptionId, productionId], 'consumption-production')
    addPlot([hydroId, nuclearId], 'hydro-nuclear', 3/1, 1.05)
    addPlot([windId], 'wind')
    addPlot([solarId], 'solar', 5/1)
    addPlot([heatingId, industrialId], 'cogeneration')
    addPlot([kineticEnergyId], 'kinetic-energy')
    addPlot([frequencyId], 'frequency', 5/1)
    addPlot([timeDeviationId], 'time-deviation', 5/1)
} else {
    addPlot([consumptionId, productionId], 'consumption-production', 2/1)
    addPlot([hydroId, nuclearId], 'hydro-nuclear', 2/1, 1.05)
    addPlot([windId], 'wind',2/1)
    addPlot([solarId], 'solar', 2/1)
    addPlot([heatingId, industrialId], 'cogeneration', 2/1)
    addPlot([kineticEnergyId], 'kinetic-energy', 2/1)
    addPlot([frequencyId], 'frequency', 2/1)
    addPlot([timeDeviationId], 'time-deviation', 2/1)
}

