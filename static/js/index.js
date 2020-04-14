// Load Data then call functions
d3.json('http://127.0.0.1:5000/api/global ').then(function(result,error) {

  let coronaData = result
  totalCounts(coronaData);
  lastUpdated(coronaData);
  provincesChart(coronaData);
  chinaWorldInfectionsChart(coronaData);
  top10Infections(coronaData);
  deathsVSrecovered(coronaData);
  diseaseComparisonChart(coronaData);
  streamChart(coronaData);
  worldMap(coronaData);

  d3.json('http://127.0.0.1:5000/api/sars').then(function(result,error) {
    let sarsData = result
    highchartTotal(coronaData, sarsData);
    highchartTotalDeaths(coronaData, sarsData)
  })
})


//////////////////////////////////////////////////////////////////////////////////////////
// Totals and last updated
//////////////////////////////////////////////////////////////////////////////////////////

function getDOMElements() {
  // This function gets DOM elements and returns them
  // to other functions for ease of use.

  const elements = {
    infected : d3.select('#total-infected-number'),
    deaths: d3.select('#total-deaths-number'),
    active: d3.select('#total-active-number'),
    lastUpdated: d3.select('#last-updated'),
  }

  return elements
};

function totalCounts(obj) {
  // This function will take in the api/date json object
  // and then display the total counters at the top of the page

  // get most recent date
  const latest_date = obj[obj.length -1].date;

  // calculate totals
  let total_cases = 0;
  let total_deaths = 0;
  let total_recoveries = 0; 
  let active_cases = 0;

  for (const doc in obj) {
    if (obj[doc].date == latest_date) {
      total_cases += obj[doc].confirmed;
      total_deaths += obj[doc].deaths;
      total_recoveries += obj[doc].recovered;
    }
  }

  active_cases = total_cases - total_deaths - total_recoveries;

  // offset for counter animation
  let counterDifInfected = total_cases - 70000;
  let counterDifDeaths = total_deaths - 7000;

  // update DOM
  let elements = getDOMElements()
  elements.infected.append('p').text(total_cases);
  elements.active.append('p').text(active_cases)
  elements.deaths.append('p').text(total_deaths);

  animateValue("total-infected-number", counterDifInfected, total_cases, 10000);
  animateValue("total-active-number", total_cases, 3500);
  animateValue("total-deaths-number", counterDifDeaths, total_deaths, 3500);
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
      // obj.innerHTML = current;
      if (current == end) {
          clearInterval(timer);
      }
  }, stepTime);
};

function lastUpdated(obj) {
  // function to display most recent date of data

  // get most recent date
  const latest_date = obj[obj.length -1].date;

  // update DOM
  const elements = getDOMElements();
  elements.lastUpdated.append('p').text(`Last Updated: ${latest_date}`);
};


//////////////////////////////////////////////////////////////////////////////////////////
// Map
//////////////////////////////////////////////////////////////////////////////////////////

function worldMap(result) {

    ///////////////////////////////
    // date/time parsing
    ///////////////////////////////

    // date format function for timeline slider
    var parseDate = d3.timeFormat("%m-%d-%Y");

    // create the timelinecontrol object with date format option
    var timelineControl = L.timelineSliderControl(
        {formatOutput: date => {
            date = new Date(date);
            date.setTime(
              date.getTime() - new Date().getTimezoneOffset() * 60 * -1000
            );
            return parseDate(date);
        }}
    );

    // create an array to hold time points for creating features object
    let featuresDates = result.map(data => {
        for (let [key, value] of Object.entries(data.date)) {
            return value
        }
    })


    ///////////////////////////////
    // create geojson object
    ///////////////////////////////

    // create feature collection object
    let featureCollection = {
        "type": "FeatureCollection",
        "features": []
    }

    // date counter for featuresDates array above
    let dateCount = -1;

    // time offset for start/end dates
    const timeDiff = 1e1;

    // loop through each day
    result.map(data => {
        dateCount += 1;

        // create post object
        let post;

        // loop through each location each day
            for (const city in data.locations) {

                // push new feature to post object
                // timeDiff is used as a time offset so circle markers do not overlap
                if (dateCount+1 == featuresDates.length) {
                    post = {
                        "type": "Feature",
                        "properties": {
                            "city": city,
                            "start": featuresDates[dateCount],
                            "end": featuresDates[dateCount]+timeDiff,
                            "confirmed": data.locations[city].confirmed
                        },
                        "geometry": {
                            "type": "Point",
                            "coordinates": [data.locations[city].lng, data.locations[city].lat]
                        }
                    }
                }
                else {
                    post = {
                        "type": "Feature",
                        "properties": {
                            "city": city,
                            "start": featuresDates[dateCount],
                            "end": featuresDates[dateCount+1]-timeDiff,
                            "confirmed": data.locations[city].confirmed
                        },
                        "geometry": {
                            "type": "Point",
                            "coordinates": [data.locations[city].lng, data.locations[city].lat]
                        }
                    }
                }

                // push post to feature collection array
                featureCollection.features.push(post);
            }
    })

    // push to layer function below
    overlayLayers(featureCollection);

    ///////////////////////////////
    // map layers
    ///////////////////////////////

    function overlayLayers(featureCollection) {
        
        // confirmed cases layer
        let casesLayer = L.timeline(featureCollection, {

            // add circle markers
            pointToLayer: function (feature, latlng) {

                // cases
                let cases = feature.properties.confirmed;

                if (cases > 0) {
                    // circle marker options
                    let geojsonMarkerOptions = {
                    radius: Math.sqrt(cases / 10) + 3,
                    fillColor: "#ff4242",
                    color: "#fac70b",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8
                    };

                    // popup
                    let tooltip = `<strong>${feature.properties.city}</strong><br>Confirmed Cases: ${cases}`;

                    return L.circleMarker(latlng, geojsonMarkerOptions).bindTooltip(tooltip).openTooltip();
                }

            }

        })

        // push to map creation function
        createMap(casesLayer);

    }

    ///////////////////////////////
    // create the map based on layers pushed to it
    ///////////////////////////////

    function createMap(casesLayer) {

        // dark basemap object
        let baseDark = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
            attribution: 'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: 10,
            id: 'mapbox/dark-v10',
            accessToken: 'pk.eyJ1IjoiY29zdGNvLWhvdGRvZyIsImEiOiJjazYxajkyNGUwNDljM2xvZnZjZmxmcjJqIn0.zW5wSAD1e2DKZIjtlAwNtQ'
        })

        // map object
        let mymap = L.map('mapid', { layers: [baseDark], zoomControl: false, scrollWheelZoom: false }).setView([25, 0], 2);
        mymap.on('focus', function() { mymap.scrollWheelZoom.enable(); });
        mymap.on('blur', function() { mymap.scrollWheelZoom.disable(); });

        // object holding basemaps
        let baseMaps = {
            "Dark": baseDark
        }

        // object holding overlay layers
        let overlayMaps = {
            "Confirmed Cases": casesLayer
        }

        // layer control
        L.control.layers(baseMaps, overlayMaps).addTo(mymap)
        mymap.addLayer(casesLayer)
        timelineControl.addTo(mymap);
        timelineControl.addTimelines(casesLayer);

    }
}

///////////////////////////////
// Charts
///////////////////////////////

// chinese provinces
function provincesChart(obj) {

  // preview data
  console.log(obj[0])

  // create array of dates (x-axis categories) and provinces (series names)
  let dates =[]
  let provinces =[]
  obj.map( data => {
    if (data.region == "China") {
      if (!(dates.includes(data.date))) {
        dates.push(data.date)
      }
      if (!(provinces.includes(data.location))) {
        provinces.push(data.location)
      }
    }
  })

  console.log(dates)

  // sort
  dates.sort( (a,b) => {
    return new Date(a) - new Date(b)
  })
  provinces.sort((a, b) => a.localeCompare(b))

  // create series object for chart
  let chart_series = {
    series: []
  };
  let post;

  // loop through provinces array and push to chart series object
  for (const i in provinces) {
    post = {
      name: provinces[i],
      data: []
    }
    if (provinces[i] === 'Hubei') {
        chart_series.series.unshift(post) // put Hubei first for visual purposes
    }
    else {
        chart_series.series.push(post)
    }
  }

  let province_name, sum;

  // loop through each province that was pushed to the series object
  for (const province in chart_series.series) {
    province_name = chart_series.series[province].name; // province name
    obj.map(data => {
      if (data.location === province_name) {
        console.log('cool')
        sum = data.confirmed;
        chart_series.series[province].data.push(sum)
      }
    });
  };

  console.log(chart_series)

  // create stacked area chart
  Highcharts.chart("stackedArea", {
    chart: {
      type: "areaspline",
      zoomType: "xy"
    },
    title: {
      text: "Chinese Provinces Confirmed Cases"
    },
    subtitle: {
      text: "Click and Drag to Zoom"
    },
    xAxis: {
      categories: dates,
      crosshair: true
    },
    yAxis: {
      min: 0,
      title: {
        text: "Confirmed Cases"
      }
    },
    legend: {
      enabled: false
    },
    plotOptions: {
      series: {
        borderWidth: 0.1,
        stacking: "normal",
        marker: {
          enabled: false
        }
      }
    },
    series: seriesObj.series
  });
};

// china vs world total cases
function chinaWorldInfectionsChart(obj) {

   // parse date into dates array
  let parseDate = d3.timeFormat("%m/%d/%Y")
  let dates;
  dates = obj.map(date => {
      for (let [key, value] of Object.entries(date.date)) {
      date = new Date(value);
      date.setTime( date.getTime() - new Date().getTimezoneOffset()*60*(-1000));

      return parseDate(date)
      };
  })

  // get infections for china and non-china
  let china = [];
  let notChina = [];
  let country, sum;
  obj.map(data => {
      let chinaSum = 0;
      let notChinaSum = 0;
      for (const property in data.locations) {
        country = data.locations[property].region;
        if (country === "Mainland China") {
            chinaSum += data.locations[property].confirmed;
        }
        else {
            notChinaSum += data.locations[property].confirmed;
        }
      }
      notChina.push(notChinaSum);
      china.push(chinaSum);
  })

  // create chart
  Highcharts.chart("china-vs-world-infections-chart", {
    chart: {
      type: "spline"
    },
    title: {
      text: "Confirmed Cases"
    },

    subtitle: {
      text: "China vs. World"
    },

    yAxis: {
      title: {
        text: "Confirmed Cases"
      }
    },

    xAxis: {
      categories: dates,
      title: {
        text: "Date"
      },
      labels: {
        enabled: false
      }
    },

    tooltip: {
      shared: true,
      useHTML: true,
      headerFormat: "{point.key}<table>",
      pointFormat:
        '<tr><td style="color: {series.color}">{series.name}: </td>' +
        '<td style="text-align: right"><b>{point.y}</b></td></tr>',
      footerFormat: "</table>"
    },

    legend: {
      enabled: false
    },

    plotOptions: {
      series: {
        label: {
          connectorAllowed: false
        }
      }
    },

    series: [
      {
        name: "China",
        data: china,
        color: "#ff4242"
      },
      {
        name: "World",
        data: notChina,
        color: "#fac70b"
      }
    ],

    responsive: {
      rules: [
        {
          condition: {
            maxWidth: 500
          },
          chartOptions: {
            legend: {
              enabled: false
            }
          }
        }
      ]
    }
  });

}

// top-10 non-china countries confirmed cases
function top10Infections(obj) {

  // retrieve latest date
  latestDate = obj[obj.length-1]

  // create list of countries
  let countries =[];
  //loop through latest date data
  for (const property in latestDate.locations) {
      // check if the country is in the list aleady
      if (countries.includes(latestDate.locations[property].region)) {
          continue
      }
      else if (latestDate.locations[property].region !== 'Mainland China') {
          countries.push(latestDate.locations[property].region)
      }
  }

  // create data series for each country
  let worldSeries = [];
  // loop through country list
  for (i in countries) {
      let countrySum = 0;
      // loop through latest date data, total confirmed cases for each country
      for (const property in latestDate.locations) {
          if (latestDate.locations[property].region === countries[i]) {
              countrySum += latestDate.locations[property].confirmed;
          }
      }

      // push country and confirmed cases data to series
      let post = {
          name: countries[i],
          data: countrySum
      }
      worldSeries.push(post);

  }

  // sort by descending
  let sortable = [];
  for (const obj in worldSeries) {
      sortable.push([worldSeries[obj].name, worldSeries[obj].data]);
  }
  sortable.sort(function(a, b) {
    return b[1] - a[1];
  });

  let worldTop10Series = [];

  // select the top 10
  let worldTop10 = sortable.slice(0,10)

  let colorsTop10 = [
    "#fac70b",
    "#facd35",
    "#fad34e",
    "#fad964",
    "#fbdf78",
    "#fbe58c",
    "#fceaa0",
    "#fdefb3",
    "#fef4c6",
    "#fff9d9"
  ];

  // create data series
  for (i in worldTop10) {

      if (worldTop10[i][0] == "Others") {
        let post = {
          name: "Diamond Princess Cruise Ship",
          y: worldTop10[i][1],
          color: colorsTop10[i]
        };
        worldTop10Series.push(post);
      } else {
        let post = {
          name: worldTop10[i][0],
          y: worldTop10[i][1],
          color: colorsTop10[i]
        };
        worldTop10Series.push(post);
      }
  }

  Highcharts.chart("world-countries-infections-chart", {
    chart: {
      type: "column"
    },
    title: {
      text: ""
    },
    subtitle: {
      text: "Top 10 Non-China Countries"
    },
    xAxis: {
      type: "category"
    },
    yAxis: {
        title: {
            text: 'Confirmed Cases'
        }
    },
    legend: {
      enabled: false
    },
    tooltip: {
      headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
      pointFormat:
        '<span style="color:{point.color}">{point.name}</span>: <b>{point.y}<br/>'
    },
    series: [
      {
        name: "Countries",
        colorByPoint: true,
        data: worldTop10Series
      }
    ]
  });
}

// non-china countries stream
function streamChart(coronaData) {

  // get date
  let parseDate = d3.timeFormat("%m-%d");
  let date;
  let dates;
  dates = coronaData.map(date => {
    for (let [key, value] of Object.entries(date.date)) {
      date = new Date(value);
      date.setTime(
        date.getTime() - new Date().getTimezoneOffset() * 60 * -1000
      );

      return parseDate(date);
    }
  });

  // retrieve latest date
  latestDate = coronaData[coronaData.length - 1];

  // get list of countries
  let countries =[];
  for (const property in latestDate.locations) {
      if (countries.includes(latestDate.locations[property].region)) {
          continue
      }
      else {
          countries.push(latestDate.locations[property].region)
      }
  }

  // create series object
  let seriesObj = {
    series: []
  };

  // push objects to series object
  let post;
  for (const i in countries) {

      post = {
          name: countries[i],
          data: []
      };

      // exclude china
      if (countries[i] !== 'Mainland China') {
          seriesObj.series.push(post);
      }
  }

  let country, sum;
  for (const location in seriesObj.series) {
      countryName = seriesObj.series[location].name;

      // loop through each day
      coronaData.map(data => {

          let dailySum = 0;

          // loop through each location each day
          for (const country in data.locations) {

              if (data.locations[country].region === countryName) {
                  dailySum +=
                  data.locations[country].confirmed +
                  data.locations[country].recovered +
                  data.locations[country].deaths;
              }

          }

          seriesObj.series[location].data.push(dailySum);

      });
  }

  // rename Others to the cruise ship
  for (name in seriesObj.series) {
    if (seriesObj.series[name].name === 'Others') {
      seriesObj.series[name].name = "Diamond Princess Cruise Ship";
    };
  }

  // create stream chart
  Highcharts.chart("streamChart", {
    chart: {
      type: "streamgraph",
      marginBottom: 40,
      zoomType: "x"
    },

    title: {
      floating: false,
      align: "left",
      text: "Confirmed Cases Outside of China",
      y: 70
    },

    subtitle: {
      floating: false,
      align: "left",
      text: "Click and drag along x-axis to zoom",
      y: 90
    },

    xAxis: {
      maxPadding: 0,
      type: "category",
      categories: dates,
      crosshair: true,
      labels: {
        enable: false
      },
      lineWidth: 0,
      margin: 30,
      tickWidth: 0
    },

    yAxis: {
      visible: false,
      startOnTick: false,
      endOnTick: false
    },

    legend: {
      enabled: false
    },

    plotOptions: {
      series: {
        label: {
          minFontSize: 5,
          maxFontSize: 15,
          style: {
            color: "rgba(255,255,255,1)"
          }
        }
      }
    },
    series: seriesObj.series
  });
}

// deaths and recoveries totals, and rates
function deathsVSrecovered(coronaData) {

  //get days
  let parseDate = d3.timeFormat("%m/%d/%Y");
  let dates;
  dates = coronaData.map(date => {
      for (let [key,value] of Object.entries(date.date)) {
          date = new Date(value);
          date.setTime(
          date.getTime() -
              new Date().getTimezoneOffset() *
              60 *
              -1000
          );

          return parseDate(date);
      }
  });

  let infected = [];
  let recovered = [];
  let deaths = [];
  let infectionRate = [];
  let recoveryRate = [];
  let mortalityRate = [];

  // push data to lists
  coronaData.map(data => {
      infected.push(data.total_confirmed);
      recovered.push(data.total_recovered);
      deaths.push(data.total_deaths);

      // rate calculations
      recoveryRate.push((data.total_recovered / data.total_confirmed) * 100);
      mortalityRate.push((data.total_deaths/data.total_confirmed)*100)
  })

  // correct for first rate days
  for (let i in infected) {

    if (i < 2 ) {
      infectionRate.push(0)
    }
    else {
      let difference = infected[i] - infected[i-1]
      infectionRate.push((difference/infected[i-1])*100)
    }

  }

  // create chart deaths vs recoveries chart
  Highcharts.chart("deaths-vs-recovered-chart", {
    title: {
      text: "Totals and Rates"
    },
    subtitle: {
      text: "Use legends to enable/disable series"
    },
    xAxis: {
      categories: dates,
      title: {
        text: "Date"
      },
      labels: {
        enabled: false
      }
    },
    yAxis: {
      title: {
        text: ""
      }
    },
    tooltip: {
      shared: true,
      useHTML: true,
      headerFormat: "{point.key}<table>",
      pointFormat:
        '<tr><td style="color: {series.color}">{series.name}: </td>' +
        '<td style="text-align: right"><b>{point.y}</b></td></tr>',
      footerFormat: "</table>"
    },

    legend: {
      enabled: true,
      align: "left",
      verticalAlign: "top",
      floating: true,
      y: 60,
      x: 25
    },

    plotOptions: {
      series: {
        label: {
          connectorAllowed: false
        }
      }
    },

    series: [
      {
        name: "Confirmed Cases",
        data: infected,
        color: "#e13a9d",
        visible: false
      },
      {
        name: "Recovered",
        data: recovered,
        color: "#fac70b"
      },
      {
        name: "Deaths",
        data: deaths,
        color: "#ff4242"
      }
    ],

    responsive: {
      rules: [
        {
          condition: {
            maxWidth: 500
          },
          chartOptions: {
            legend: {
              enabled: false
            }
          }
        }
      ]
    }
  });

  // create mortality rate chart
  Highcharts.chart("mortality-rate-chart", {
    title: {
      text: ""
    },
    subtitle: {
      text: "Rates (%)"
    },
    xAxis: {
      categories: dates,
      title: {
        text: "Date"
      },
      labels: {
        enabled: false
      }
    },
    yAxis: {
      title: {
        text: ""
      }
    },
    tooltip: {
      shared: true,
      useHTML: true,
      valueDecimals: 2,
      headerFormat: "{point.key}<table>",
      pointFormat:
        '<tr><td style="color: {series.color}">{series.name}: </td>' +
        '<td style="text-align: right"><b>{point.y}%</b></td></tr>',
      footerFormat: "</table>"
    },

    legend: {
      enabled: true,
      x: -110
    },

    plotOptions: {
      series: {
        label: {
          connectorAllowed: false
        }
      }
    },

    series: [
      {
        name: "Infection Rate",
        data: infectionRate,
        color: "#e13a9d",
        visible: false
      },
      {
        name: "Recovery Rate",
        data: recoveryRate,
        color: "#fac70b"
      },
      {
        name: "Mortality Rate",
        data: mortalityRate,
        color: "#ff4242"
      }
    ],

    responsive: {
      rules: [
        {
          condition: {
            maxWidth: 500
          },
          chartOptions: {
            legend: {
              enabled: false
            }
          }
        }
      ]
    }
  });
}

// disease comparison
function diseaseComparisonChart(coronaData) {

  // get latest day data
  let latestDay = coronaData[coronaData.length-1]

  // totals and rate
  let totalDeaths = latestDay.total_deaths;
  let totalConfirmed = latestDay.total_confirmed;
  let mortalityRate = ((latestDay.total_deaths * 100) / latestDay.total_confirmed);

  // create comparison chart
  Highcharts.chart("rates-comparison", {
    chart: {
      type: "bubble",
      plotBorderWidth: 1,
      zoomType: "xy"
    },

    legend: {
      enabled: false
    },

    title: {
      text: "COVID-19 compared to other infectious diseases"
    },
    subtitle: {
      text: "Bubble Size = Mortality Rate (%)"
    },

    xAxis: {
      type: "logarithmic",
      gridLineWidth: 1,
      title: {
        text: "Confirmed Cases (Log Scale)"
      }
    },

    yAxis: {
      startOnTick: false,
      endOnTick: false,
      title: {
        text: "Deaths"
      }
    },

    tooltip: {
      useHTML: true,
      headerFormat: "<table>",
      valueDecimals: 0,
      pointFormat:
        '<tr><th colspan="2"><h4>{point.country}</h4></th></tr>' +
        "<tr><th>Confirmed Cases:  {point.x:,.0f}</th></tr>" +
        "<tr><th>Deaths:  {point.y}</th></tr>" +
        "<tr><th>Mortality Rate:  {point.z:.2f}%</th></tr>",
      footerFormat: "</table>",
      followPointer: false
    },

    plotOptions: {
      series: {
        dataLabels: {
          enabled: true,
          format: "{point.name}"
        }
      },
      bubble: {
        minSize: 20
      }
    },
    series: [
      {
        data: [
          {
            x: totalConfirmed,
            y: totalDeaths,
            z: mortalityRate,
            name: "COVID-19",
            country: "Wuhan Coronavirus",
            color: "#ff4242"
          },
          {
            x: 8098,
            y: 810,
            z: 9.6,
            name: "SARS",
            country: "2002-2003 Severe Acute Respiratory Syndrome",
            color: "#fac70b"
          },
          {
            x: 2494,
            y: 848,
            z: 36,
            name: "MERS",
            country: "2012-Middle East Acute Respiratory Syndrome",
            color: "#aaeeee"
          },
          {
            x: 28616,
            y: 11446,
            z: 40,
            name: "Ebola",
            country: "2014-2016 Ebola Outbreak in West Africa",
            color: "#e13a9d"
          },
          {
            x: 35000000,
            y: 34200,
            z: 0.1,
            name: "Flu",
            country: "2018-2019 USA Flu",
            color: "#f7a35c"
          }
        ]
      }
    ]
  });
}

// COVID-19 vs sars
function highchartTotal(coronaData, sarsData) {

  // get total coronavirus infections
  let coronaInfections = coronaData.map(infections => {
    let totals = infections.total_confirmed;
    return totals;
  })

  // get total sars infections
  let sarsInfections = sarsData.map(infections => {
    let totals = infections.infected;
    return totals;
  })

  // get days
  let days = [];
  for (var i=0; i < sarsInfections.length; i++) {
    days.push(i)
  }

  Highcharts.chart("sarscoronaConfirmed", {
    title: {
      text: "Confirmed Cases"
    },

    subtitle: {
      text: "COVID-19 vs. SARS"
    },

    yAxis: {
      title: {
        text: "Confirmed Cases"
      }
    },

    xAxis: {
      title: {
        text: "Days Since Outbreak"
      }
    },

    tooltip: {
      shared: true,
      useHTML: true,
      headerFormat: "<small>Day {point.key}</small><table>",
      pointFormat:
        '<tr><td style="color: {series.color}">{series.name}: </td>' +
        '<td style="text-align: right"><b>{point.y}</b></td></tr>',
      footerFormat: "</table>"
    },

    legend: {
      enabled: false
    },

    plotOptions: {
      series: {
        label: {
          connectorAllowed: false
        },
        pointStart: 1
      }
    },

    series: [
      {
        name: "COVID-19",
        data: coronaInfections,
        color: "#ff4242"
      },
      {
        name: "SARS",
        data: sarsInfections,
        color: "#fac70b"
      }
    ],

    responsive: {
      rules: [
        {
          condition: {
            maxWidth: 500
          },
          chartOptions: {
            legend: {
              enabled: false
            }
          }
        }
      ]
    }
  });

}
function highchartTotalDeaths(coronaData, sarsData) {

  // get total coronavirus infections
  let coronaDeaths = coronaData.map(infections => infections.total_deaths);

  // get total sars infections
  let sarsDeaths = sarsData.map(infections => infections.deaths);

  // get days
  let days = [];
  for (var i=0; i < sarsDeaths.length; i++) {
    days.push(i)
  }

  Highcharts.chart("sarscoronaDeaths", {
    title: {
      text: "Deaths"
    },

    subtitle: {
      text: "COVID-19 vs. SARS"
    },

    yAxis: {
      title: {
        text: "Deaths"
      }
    },

    xAxis: {
      title: {
        text: "Days Since Outbreak"
      }
    },

    tooltip: {
      shared: true,
      useHTML: true,
      headerFormat: "<small>Day {point.key}</small><table>",
      pointFormat:
        '<tr><td style="color: {series.color}">{series.name}: </td>' +
        '<td style="text-align: right"><b>{point.y}</b></td></tr>',
      footerFormat: "</table>"
    },

    legend: {
      enabled: false
    },

    plotOptions: {
      series: {
        label: {
          connectorAllowed: false
        },
        pointStart: 1
      }
    },

    series: [
      {
        name: "COVID-19",
        data: coronaDeaths,
        color: "#ff4242"
      },
      {
        name: "SARS",
        data: sarsDeaths,
        color: "#fac70b"
      }
    ],

    responsive: {
      rules: [
        {
          condition: {
            maxWidth: 500
          },
          chartOptions: {
            legend: {
              enabled: false
            }
          }
        }
      ]
    }
  });
}


///////////////////////////////
// Highcharts theme
///////////////////////////////

Highcharts.theme = {
  lang: {
    thousandsSep: ","
  },
  colors: [
    "#ff4242",
    "#7cb5ec",
    "#f7a35c",
    "#7798BF",
    "#fac70b",
    "#aaeeee",
    "#eeaaee",
    "#55BF3B",
    "#DF5353",
    "#7798BF",
    "#aaeeee"
  ],
  chart: {
    backgroundColor: "rgba(26, 26, 26)",
    style: {
      fontFamily: "'Unica One', sans-serif"
    },
    plotBorderColor: "#606063"
  },
  title: {
    style: {
      color: "#E0E0E3",
      textTransform: "uppercase",
      fontSize: "20px"
    }
  },
  subtitle: {
    style: {
      color: "#E0E0E3",
      textTransform: "uppercase"
    }
  },
  xAxis: {
    gridLineColor: "#707073",
    labels: {
      style: {
        color: "#E0E0E3"
      }
    },
    lineColor: "#707073",
    minorGridLineColor: "#505053",
    tickColor: "#707073",
    title: {
      style: {
        color: "#cfcfd1"
      }
    }
  },
  yAxis: {
    gridLineColor: "#707073",
    labels: {
      style: {
        color: "#E0E0E3"
      }
    },
    lineColor: "#707073",
    minorGridLineColor: "#505053",
    tickColor: "#707073",
    tickWidth: 1,
    title: {
      style: {
        color: "#cfcfd1"
      }
    }
  },
  tooltip: {
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    style: {
      color: "#F0F0F0"
    }
  },
  plotOptions: {
    series: {
      dataLabels: {
        color: "#F0F0F3",
        style: {
          fontSize: "13px"
        }
      },
      marker: {
        lineColor: "#333"
      }
    },
    boxplot: {
      fillColor: "#505053"
    },
    candlestick: {
      lineColor: "white"
    },
    errorbar: {
      color: "white"
    }
  },
  legend: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    itemStyle: {
      color: "#E0E0E3"
    },
    itemHoverStyle: {
      color: "#FFF"
    },
    itemHiddenStyle: {
      color: "#606063"
    },
    title: {
      style: {
        color: "#C0C0C0"
      }
    }
  },
  credits: {
    style: {
      color: "#666"
    }
  },
  labels: {
    style: {
      color: "#707073"
    }
  },
  drilldown: {
    activeAxisLabelStyle: {
      color: "#F0F0F3"
    },
    activeDataLabelStyle: {
      color: "#F0F0F3"
    }
  },
  navigation: {
    buttonOptions: {
      symbolStroke: "#DDDDDD",
      theme: {
        fill: "#505053"
      }
    }
  },
  // scroll charts
  rangeSelector: {
    buttonTheme: {
      fill: "#505053",
      stroke: "#000000",
      style: {
        color: "#CCC"
      },
      states: {
        hover: {
          fill: "#707073",
          stroke: "#000000",
          style: {
            color: "white"
          }
        },
        select: {
          fill: "#000003",
          stroke: "#000000",
          style: {
            color: "white"
          }
        }
      }
    },
    inputBoxBorderColor: "#505053",
    inputStyle: {
      backgroundColor: "#333",
      color: "silver"
    },
    labelStyle: {
      color: "silver"
    }
  },
  navigator: {
    handles: {
      backgroundColor: "#666",
      borderColor: "#AAA"
    },
    outlineColor: "#CCC",
    maskFill: "rgba(255,255,255,0.1)",
    series: {
      color: "#7798BF",
      lineColor: "#A6C7ED"
    },
    xAxis: {
      gridLineColor: "#505053"
    }
  },
  scrollbar: {
    barBackgroundColor: "#808083",
    barBorderColor: "#808083",
    buttonArrowColor: "#CCC",
    buttonBackgroundColor: "#606063",
    buttonBorderColor: "#606063",
    rifleColor: "#FFF",
    trackBackgroundColor: "#404043",
    trackBorderColor: "#404043"
  }
};

// apply the theme
Highcharts.setOptions(Highcharts.theme);
