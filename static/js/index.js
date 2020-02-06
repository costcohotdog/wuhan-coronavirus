
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
  let dates = obj.map(date => {
    var dateArr = [];
    for (let [key, value] of Object.entries(date.date)) {
      let date = new Date(value);
      dateArr.push(date.toLocaleDateString());
    };
    return dateArr.join();
  });
  console.log(dates);

  // get infections
  let infections = obj.map(infections => {
      let totals = infections.total_confirmed + infections.total_recovered + infections.total_deaths;
      return totals;
  })
  console.log(infections);

  // get infection rate
  let infectionRate = [];
  let rate;
  for (var i=0; i < infections.length; i++) {
    rate = infections[i] / infections.length;
    infectionRate.push(rate);
  }
  console.log(infectionRate);




  // plot data

  let svgWidth = 503;
  let svgHeight = 400;

  let margin = {

    top: 20,
    right: 40,
    bottom: 60,
    left: 50
  };

  let width = svgWidth - margin.left - margin.right;
  let height = svgHeight - margin.top - margin.bottom;

  var svg = d3
    .select('#upper-left-chart')
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

  let chartGroup = svg.append('g')
    .attr('tranform', `translate(${margin.left}, ${margin.top})`);
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
