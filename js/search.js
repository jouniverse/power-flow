
const currentDate = new Date(); 
let optionValue = "";
let optionId;

let startYear;
let startMonth;
let startDay;
let startHour;
let startMinute = "00";
let startSeconds = "00"
let endYear;
let endMonth;
let endDay;
let endHour;
let endMinute = currentDate.getMinutes();
let endSeconds = currentDate.getSeconds();

let startDateInput = document.getElementById('startDate');
let endDateInput = document.getElementById('endDate');
let startTimeInput = document.getElementById('startTime')
let endTimeInput = document.getElementById('endTime')
startDateInput.value = "";
endDateInput.value = "";
startTimeInput.value = "";
endTimeInput.value = "";

const wrapper = document.querySelector(".wrapper"),
selectBtn = wrapper.querySelector(".select-btn"),
searchInp = wrapper.querySelector("input"),
options = wrapper.querySelector(".options");

let selection;
let items = finGridData.name

function addItem(selectedItem) {
    options.innerHTML = "";
    items.forEach(item => {
        let isSelected = item == selectedItem ? "selected" : "";
        let li = `<li onclick="updateName(this)" class="${isSelected}">${item}</li>`;
        options.insertAdjacentHTML("beforeend", li);
    });
}

addItem();

function updateName(selectedLi) {
    searchInp.value = "";
    addItem(selectedLi.innerText);
    wrapper.classList.remove("active");
    selectBtn.firstElementChild.innerText = selectedLi.innerText;
    optionValue = selectedLi.innerText;
    optionId = finGridData.id.at(finGridData.name.findIndex(n => n == optionValue));
    triggerChangeEvent(); 
    document.querySelector(".caret").classList.toggle("caret-rotate");
}

searchInp.addEventListener("keyup", () => {
    let arr = []; 
    let searchWord = searchInp.value.toLowerCase();
    arr = items.filter(data => {
        return data.toLowerCase().includes(searchWord);
    }).map(data => { 
        let isSelected = data == selectBtn.firstElementChild.innerText ? "selected" : "";
        return `<li onclick="updateName(this)" class="${isSelected}">${data}</li>`;
    }).join("");
    options.innerHTML = arr ? arr : `<p style="margin-top: 10px;">Item not found</p>`;
});

function triggerChangeEvent() {

    const event = new Event('selectedChange');
    selectBtn.dispatchEvent(event);

}

selectBtn.addEventListener("click", () => {

    wrapper.classList.toggle("active")
    document.querySelector(".caret").classList.toggle("caret-rotate");

});

document.addEventListener('DOMContentLoaded', function() {

    startDateInput.addEventListener('change', function() {

        if (startDateInput.value === "") {
            startDateInput.removeAttribute('min');
            startDateInput.removeAttribute('max');
            endDateInput.removeAttribute('min');
            endDateInput.removeAttribute('max');
            startTimeInput.value = ""
            endDateInput.value = ""
            endTimeInput.value = ""
            let searchBtn = document.getElementById('search-btn')
             searchBtn.style.visibility = "hidden"
        } else {
            var startDate = new Date(startDateInput.value);
            var maxDate = new Date(startDate);
            maxDate.setMonth(maxDate.getMonth() + 3);

            var minDate = new Date(startDate);
            minDate.setMonth(minDate.getMonth());
            minDate.setDate(minDate.getDate()+1);

            startYear = startDate.getFullYear()
            startMonth = startDate.getMonth()+1
            startDay = startDate.getDate()
            endDateInput.setAttribute('max', formatDate(maxDate));
            endDateInput.setAttribute('min', formatDate(minDate));
        }

    });

    startTimeInput.addEventListener('input', function() { 

        startHour = startTimeInput.value.split(":")[0]
        startMinute = startTimeInput.value.split(":")[1]

    })

    endDateInput.addEventListener('change', function() {

        let endDate = new Date(endDateInput.value)
        endYear = endDate.getFullYear()
        endMonth = endDate.getMonth()+1
        endDay = endDate.getDate()
        var maxDate = new Date(endDate);
        maxDate.setMonth(maxDate.getMonth());
        var minDate = new Date(endDate);
        minDate.setMonth(minDate.getMonth() - 3);
        minDate.setDate(minDate.getDate()-1);
        startDateInput.setAttribute('max', formatDate(maxDate));
        startDateInput.setAttribute('min', formatDate(minDate));

    })

    endTimeInput.addEventListener('input', () => { 
        endHour = endTimeInput.value.split(":")[0]
        endMinute = endTimeInput.value.split(":")[1]
        let searchBtn = document.getElementById('search-btn')
        searchBtn.style.visibility = "visible"
    })

    // Helper function to format date as YYYY-MM-DD
    function formatDate(date) {
        var year = date.getFullYear();
        var month = (date.getMonth() + 1).toString().padStart(2, '0');
        var day = date.getDate().toString().padStart(2, '0');
        return year + '-' + month + '-' + day;
    }
    
});

async function getData(apiURL) {
    const res = await fetch(apiURL);
    const body = await res.json();
    return body;
}

let data = []

let seriesData = [];
let yAxis = [];
for (let i = 0; i < data.length; i++) {
    seriesData.push({x:data[i].start_time,y:data[i].value})
    yAxis.push(data[i].value)
}
let plotLabel = optionValue + " (" + startYear + ")"

const gridPlot = new Chart("grid-plot", 
    {
        type: 'line',
        data: {
        datasets: [{
            label: plotLabel,
            data: seriesData,
            borderWidth: 1,
            borderColor: 'white',
            radius: 0,
            hoverBackgroundColor: '#9fa5b5',
            pointHoverRadius: 5,
            yAxisId: 'y'
        }],
        },
        options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 3/1,
        scales: {
            x: {
                type: 'timeseries',
                position: 'bottom',
                grid: {
                    display: false
                },
                display: true
            },
            y: {
                beginAtZero: true,
                grid: {
                    display: false
                },
                max: Math.max(...yAxis)+(Math.max(...yAxis)-Math.min(...yAxis))*0.05,
                min: Math.min(...yAxis)-(Math.max(...yAxis)-Math.min(...yAxis))*0.05,
                display: true
            },        
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
                // remove the title legend label -> boxWidth = 0
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

function addStats(plotIdx, dataPlot, units, name, dateRange) {
    let stats = document.getElementById(name);
    let descriptionOne = finGridData.description.at(finGridData.id.findIndex(n => n == plotIdx[0]))
    let nameOne = finGridData.name.at(finGridData.id.findIndex(n => n == plotIdx[0]))
    let hyperlinkOne = finGridData.hyperlink.at(finGridData.id.findIndex(n => n == plotIdx[0]))
    let maxOne = Math.max(...dataPlot[0])
    let minOne = Math.min(...dataPlot[0])
    let rangeOne = roundTo(maxOne - minOne, 3)
    let avgOne = roundTo(mean(dataPlot[0]), 3)
    let medOne = roundTo(median(dataPlot[0]), 3)

    if (units != "") {
        stats.innerHTML = `<div><a href='${hyperlinkOne}'>${nameOne}</a></div><div><b>${dateRange[0]} to ${dateRange[1]} </b></div><div>${descriptionOne}</div><div>Max: <b>${maxOne}</b> [${units}]</div><div>Min: <b> ${minOne}</b> [${units}]<div> Range (Max - Min): <b>${rangeOne}</b> [${units}]</div><div>Average: <b>${avgOne}</b> [${units}]</div><div>Median: <b>${medOne}</b> [${units}]</div>`;
    } else {
        stats.innerHTML = `<div><a href='${hyperlinkOne}'>${nameOne}</a></div><div><b>${dateRange[0]} to ${dateRange[1]} </b></div><div>${descriptionOne}</div><div>Max: <b>${maxOne}</b></div><div>Min: <b> ${minOne}</b><div> Range (Max - Min): <b>${rangeOne}</b></div><div>Average: <b>${avgOne}</b></div><div>Median: <b>${medOne}</b></div>`;
    }
   
}

async function submitForm() {

    // timezone: (UTC+02:00) Helsinki, Kiev, Riga, Sofia, Tallinn, Vilnius

    let apiURL = `https://api.fingrid.fi/v1/variable/${optionId}/events/json?start_time=${startYear}-${startMonth}-${startDay}T${startHour}%3A${startMinute}%3A${startSeconds}Z&end_time=${endYear}-${endMonth}-${endDay}T${endHour}%3A${endMinute}%3A${endSeconds}Z`

    data = await getData(apiURL);

    let unitValue;
    seriesData = [];
    yAxis = [];
    for (let i = 0; i < data.length; i++) {
        seriesData.push({x:data[i].start_time,y:data[i].value})
        yAxis.push(data[i].value)
    }

    unitValue = finGridData.unit.at(finGridData.id.findIndex(n => n == optionId))

    plotLabel = unitValue != "" ? optionValue + " (" + startYear + ") " + "[" + unitValue + "]" : optionValue + " (" + startYear + ")"
    gridPlot.data.datasets[0].data = seriesData;
    gridPlot.data.datasets[0].label = plotLabel;
    gridPlot.options.scales.y.max =  Math.max(...yAxis)+(Math.max(...yAxis)-Math.min(...yAxis))*0.05;
    gridPlot.options.scales.y.min = Math.min(...yAxis)-(Math.max(...yAxis)-Math.min(...yAxis))*0.05;

    if (detectMobile()) {
        gridPlot.options.aspectRatio = 2;
        if (window.outerWidth < 768) {
            gridPlot.options.aspectRatio = 1;
        }
        Chart.defaults.font.size = 8;
        // resize the chart
        gridPlot.resize();
    } 

    // add stats
    addStats([optionId], [yAxis], unitValue, 'info-text', [startDateInput.value, endDateInput.value]);

    // update the plot
    gridPlot.update();

    let chartBox = document.getElementById('chartBox')
    chartBox.style.visibility = "visible"

}

let submit = document.getElementById('search-btn')
submit.addEventListener('click', () => {

    if (Date.parse(startDateInput.value) && Date.parse(endDateInput.value) && startTimeInput.value.length != 0 && endTimeInput.value.length != 0 && optionValue != "") {
        submitForm();
    }
    else {
        console.log("invalid")
    }

}) 





