
function getDOMElements() {
  // This function gets DOM elements and returns them
  // to other functions for ease of use.

  const elements = {
    infected : d3.select('#total-infected-number'),
    deaths: d3.select('#total-deaths-number'),
    countries: d3.select('#total-countries-number'),
    lastUpdated: d3.select('#last-updated'),
    upperLeftChart: d3.select('#upper-left-chart')
  }

  return elements
};



function totalCounts(obj) {
  // This function will take in the api/date json object
  // and then display the total counters at the top of the page

  const latestDate = obj[obj.length - 1];

  // 1. Calculate total countries
  const totalInfected = latestDate.total_confirmed + latestDate.total_recovered + latestDate.total_deaths;

  //2. Calculate total deaths
  const totalDeaths = latestDate.total_deaths

  //3. Calculate total countries
  let countries = []
  let country;
  for (const property in latestDate.locations) {
    country = latestDate.locations[property].region;
    if (countries.includes(country)) {

    }else {
      countries.push(country)
    }
  }
  const totalCountries = countries.length

  //4. Update DOM
  let elements = getDOMElements()
  elements.infected.append('p').text(totalInfected);
  elements.deaths.append('p').text(totalDeaths);
  elements.countries.append('p').text(totalCountries)
  animateValue("total-infected-number", 25000, totalInfected, 0);
  animateValue("total-deaths-number", 0, totalDeaths, 3500);
  animateValue("total-countries-number", 0, totalCountries, 3500);

};

function animateValue(id, start, end, duration) {
    // This function animates the counters
    var range = end - start;
    var current = start;
    var increment = end > start? 1 : -1;
    var stepTime = Math.abs(Math.floor(duration / range));
    var obj = document.getElementById(id);
    var timer = setInterval(function() {
        current += increment;
        obj.innerHTML = current;
        if (current == end) {
            clearInterval(timer);
        }
    }, stepTime);
};

function lastUpdated(obj) {
  // This function takes in the api/date Object
  // and calculates the last time the corona virus data was Updated.
  // It then updates the 'last-updated' section of the DOM
  let date;
  const latest = obj[obj.length -1]
  for (let [key, value] of Object.entries(latest.date)) {
    date = value
  };
  const dateObj = new Date(date);
  const elements = getDOMElements();
  elements.lastUpdated.append('p').text(`Last Updated: ${dateObj.toLocaleDateString()}`);
};

function infectionRate(obj) {

  var parseTime = d3.timeParse("%d-%b");

  // Format the data


  // infectionRate = infections / Day
  console.log(obj);

  // get total days
  // let dates = obj.map(date => {
  //   var dateArr = [];
  //   for (let [key, value] of Object.entries(date.date)) {
  //     parseDate = d3.timeParse("%Y-%m-%d")
  //     let date = new Date(value);
  //     dateArr.push(parseDate(date));
  //   };
  //   return dateArr.join();
  // });
  // console.log(dates);

  // get infections
  let infections = obj.map(infections => {
      let totals = infections.total_confirmed + infections.total_recovered + infections.total_deaths;
      return totals;
  })
  console.log(infections);

  // get infection rate and days of infection
  let infectionRate = [];
  let days = [];
  let rate, day;
  for (var i=0; i < infections.length; i++) {
    rate = infections[i] / infections.length;
    day = i + 1
    infectionRate.push(rate);
    days.push(day);
  }
  console.log(infectionRate);
  console.log(days);
  // plot data

  let trace1 = {
    x: days,
    y: infectionRate,
    line: {
      color: 'limegreen',
      width: 2
    }

  }
  layout= {
    paper_bgcolor:'rgba(0,0,0,0)',
    plot_bgcolor:'rgba(0,0,0,0)',
    font: {
        family:"Courier New, monospace",
        size:18,
        color:"white"
    },
    xaxis: {
      autotick: false,
      showgrid: false},
    yaxis: {
      dtick: 300,
      showgrid: false},
    title: "Infection Rate"
}

  Plotly.newPlot('upper-left-chart', [trace1], layout )




};











// Load Data then call functions...

d3.json('http://127.0.0.1:5000/api/date').then(function(result,error) {

  // Update Total Counts
  totalCounts(result);
  // Update the Last Updated Value
  lastUpdated(result);
  // Create infection rate chart
  infectionRate(result);
})
