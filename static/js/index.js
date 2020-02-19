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

  // 1. Calculate total infected
  const totalInfected = latestDate.total_confirmed;

  //2. Calculate total deaths
  const totalDeaths = latestDate.total_deaths;

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

  let counterDif = totalInfected - 700;

  //4. Update DOM
  let elements = getDOMElements()
  elements.infected.append('p').text(totalInfected);
  elements.deaths.append('p').text(totalDeaths);
  elements.countries.append('p').text(totalCountries)
  animateValue("total-infected-number", counterDif, totalInfected, 0);
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
  dateObj.setTime( dateObj.getTime() - new Date().getTimezoneOffset()*60*(-1000) );
  const elements = getDOMElements();
  elements.lastUpdated.append('p').text(`Last Updated: ${dateObj.toLocaleDateString()}`);
};

// function highchartTotal(coronaData, sarsData) {

//   // get total coronavirus infections
//   let coronaInfections = coronaData.map(infections => {
//     let totals = infections.total_confirmed + infections.total_recovered + infections.total_deaths;
//     return totals;
//   })

//   // get total sars infections
//   let sarsInfections = sarsData.map(infections => {
//     let totals = infections.infected + infections.deaths;
//     return totals;
//   })

//   // get days
//   let days = [];
//   for (var i=0; i < sarsInfections.length; i++) {
//     days.push(i)
//   }

//   Highcharts.chart('upper-left-chart', {

//     title: {
//         text: 'Total Infections'
//     },

//     subtitle: {
//         text: '2019-nCoV vs. SARS'
//     },

//     yAxis: {
//         title: {
//             text: 'Infected'
//         }
//     },

//     xAxis: {
//       title: {
//           text: 'Days Since Outbreak'
//       }
//     },

//     tooltip: {
//       shared: true,
//       useHTML: true,
//       headerFormat: '<small>Day {point.key}</small><table>',
//       pointFormat: '<tr><td style="color: {series.color}">{series.name}: </td>' +
//       '<td style="text-align: right"><b>{point.y}</b></td></tr>',
//       footerFormat: '</table>',
//     },

//     legend: {
//         enabled: false
//     },

//     plotOptions: {
//         series: {
//             label: {
//                 connectorAllowed: false
//             },
//             pointStart: 1
//         }
//     },

//     series: [{
//         name: '2019-nCoV',
//         data: coronaInfections
//     }, {
//         name: 'SARS',
//         data: sarsInfections
//     }],

//     responsive: {
//         rules: [{
//             condition: {
//                 maxWidth: 500
//             },
//             chartOptions: {
//                 legend: {
//                     enabled: false
//                 }
//             }
//         }]
//     }

//   });

// }

// function highchartTotalDeaths(coronaData, sarsData) {

//   // get total coronavirus infections
//   let coronaDeaths = coronaData.map(infections => infections.total_deaths);

//   // get total sars infections
//   let sarsDeaths = sarsData.map(infections => infections.deaths);

//   // get days
//   let days = [];
//   for (var i=0; i < sarsDeaths.length; i++) {
//     days.push(i)
//   }

//   Highcharts.chart('upper-right-chart', {

//     title: {
//         text: 'Total Deaths'
//     },

//     subtitle: {
//         text: '2019-nCoV vs. SARS'
//     },

//     yAxis: {
//         title: {
//             text: 'Deaths'
//         }
//     },

//     xAxis: {
//       title: {
//           text: 'Days Since Outbreak'
//       }
//     },

//     tooltip: {
//       shared: true,
//       useHTML: true,
//       headerFormat: '<small>Day {point.key}</small><table>',
//       pointFormat: '<tr><td style="color: {series.color}">{series.name}: </td>' +
//       '<td style="text-align: right"><b>{point.y}</b></td></tr>',
//       footerFormat: '</table>',
//     },

//     legend: {
//         enabled: false
//     },

//     plotOptions: {
//         series: {
//             label: {
//                 connectorAllowed: false
//             },
//             pointStart: 1
//         }
//     },

//     series: [{
//         name: '2019-nCoV',
//         data: coronaDeaths
//     }, {
//         name: 'SARS',
//         data: sarsDeaths
//     }],

//     responsive: {
//         rules: [{
//             condition: {
//                 maxWidth: 500
//             },
//             chartOptions: {
//                 legend: {
//                     enabled: false
//                 }
//             }
//         }]
//     }

//   });
// }

function deathsVSrecovered(coronaData) {
    //get days

    console.log(coronaData)
    let parseDate = d3.timeFormat(
        "%m/%d/%Y"
        );
    let date;

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

    coronaData.map(data => {
        infected.push(data.total_confirmed);
        recovered.push(data.total_recovered);
        deaths.push(data.total_deaths);
        
        recoveryRate.push((data.total_recovered / data.total_confirmed) * 100);
        mortalityRate.push((data.total_deaths/data.total_confirmed)*100)
    })

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
          text: "%"
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
          color: "#e366b0",
          visible: false
        },
        {
          name: "Recovery Rate",
          data: recoveryRate,
          color: "#ffde66"
        },
        {
          name: "Mortality Rate",
          data: mortalityRate,
          color: "#ff6e6e"
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

function comparisonChart(coronaData) {

    // get latest day data
    let latestDay = coronaData[coronaData.length-1]

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
          text: "Confirmed Cases"
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


function chinaWorldInfections(obj) {
    //get days
    let parseDate = d3.timeFormat("%m/%d/%Y")
    let date;

    dates = obj.map(date => {
        for (let [key, value] of Object.entries(date.date)) {
        date = new Date(value);
        date.setTime( date.getTime() - new Date().getTimezoneOffset()*60*(-1000));

        return parseDate(date)
        };
    })

    // get infections by region
    let china = [];
    let notChina = [];
    let country, sum;
    obj.map(data => {
        let chinaSum = 0;
        let notChinaSum = 0;
        for (const property in data.locations) {
        country = data.locations[property].region;
        if (country === "Mainland China") {
            sum = data.locations[property].confirmed + data.locations[property].deaths + data.locations[property].recovered;
            chinaSum += sum;
        }else {
            sum = data.locations[property].confirmed + data.locations[property].deaths + data.locations[property].recovered;
            notChinaSum += sum;

        }

        }
        notChina.push(notChinaSum);
        china.push(chinaSum);
    })

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

function worldcountriesInfections(obj) {

    // retrieve latest date
    latestDate = obj[obj.length-1]


    let countries =[];

    for (const property in latestDate.locations) {
        if (countries.includes(latestDate.locations[property].region)) {
            continue
        }
        else {
            countries.push(latestDate.locations[property].region)
        }
    }


    let chinaSeries = [];
    let worldSeries = [];

    for (i in countries) {

        let countrySum = 0;

        for (const property in latestDate.locations) {

            if (latestDate.locations[property].region === countries[i]) {

                countrySum += latestDate.locations[property].confirmed + latestDate.locations[property].deaths + latestDate.locations[property].recovered

            }
        }

        let post = {
            name: countries[i],
            data: countrySum
        }

        if (countries[i] === 'Mainland China') {
            chinaSeries.push(post);
        }
        else {
            worldSeries.push(post);
        }

    }

    let sortable = [];

    for (const obj in worldSeries) {
        sortable.push([worldSeries[obj].name, worldSeries[obj].data]);
    }

    sortable.sort(function(a, b) {
      return b[1] - a[1];
    });

    let worldTop10Series = [];

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

// function comparisonInfectionChart(coronaData, sarsData) {

//   let coronaInfections = coronaData.map(infections => {
//       let totals = infections.total_confirmed + infections.total_recovered + infections.total_deaths;
//       return totals;
//   })

//   let sarsInfections = sarsData.map(infections => {
//       let totals = infections.infected + infections.deaths;
//       return totals;
//   })


//   let days = [];
//   for (var i=0; i < sarsInfections.length; i++) {
//     days.push(i)
//   }


//   let trace1 = {
//     x: days,
//     y: coronaInfections,
//     name: "Coronavirus",
//     line: {
//       color: 'orange',
//       width: 2
//     }
//   }
//   let trace2 = {
//     x: days,
//     y: sarsInfections,
//     name: "SARS",
//     line: {
//       color: '#ff00cc',
//       width: 2
//     }
//   }

//   let layout = {
//     paper_bgcolor:'rgba(0,0,0,0)',
//     plot_bgcolor:'rgba(0,0,0,0)',
//     font: {
//         family:"Courier New, monospace",
//         size:18,
//         color:"white"
//     },
//     xaxis: {
//       autotick: true,
//       showgrid: true,
//       tickmode: 'linear',
//       tick0: 0,
//       dtick: 10,
//       gridwidth: 1,
//       gridcolor: '#7A7A7A'},
//     yaxis: {
//       showgrid: false},
//     title: "Total Infections",
//     showlegend:true,
//     legend: {
//       x: 0.1,
//       y: 1,
//       traceorder: 'normal',
//     },
//     autosize: true,
//     margin: {
//       l: 50,
//       r: 50,
//       b: 50,
//       t: 50,
//       pad: 4
//     }
// }



//   Plotly.newPlot('lower-left-chart', [trace1, trace2], layout, {responsive: true, displayModeBar: false})
// }

// function comparisonDeathChart(coronaData, sarsData) {

//   let coronaInfections = coronaData.map(infections => infections.total_deaths);

//   let sarsInfections = sarsData.map(infections => infections.deaths);

//   let days = [];
//   for (var i=0; i < sarsInfections.length; i++) {
//     days.push(i)

//   }


//   let trace1 = {
//     x: days,
//     y: coronaInfections,
//     name: "Coronavirus",
//     line: {
//       color: 'orange',
//       width: 2
//     }
//   }
//   let trace2 = {
//     x: days,
//     y: sarsInfections,
//     name: "SARS",
//     line: {
//       color: '#ff00cc',
//       width: 2
//     }
//   }

//   let layout = {
//     paper_bgcolor:'rgba(0,0,0,0)',
//     plot_bgcolor:'rgba(0,0,0,0)',
//     font: {
//         family:"Courier New, monospace",
//         size:18,
//         color:"white"
//     },
//     xaxis: {
//       autotick: true,
//       showgrid: true,
//       tickmode: 'linear',
//       tick0: 0,
//       dtick: 10,
//       gridwidth: 1,
//       gridcolor: '#7A7A7A'},
//     yaxis: {
//       showgrid: false},
//     title: "Total Deaths",
//     showlegend:true,
//     legend: {
//       x: 0.1,
//       y: 1,
//       traceorder: 'normal',
//     },
//     autosize: true,
//     margin: {
//       l: 50,
//       r: 50,
//       b: 50,
//       t: 50,
//       pad: 4
//     }
// }



//   Plotly.newPlot('lower-right-chart', [trace1, trace2], layout, {responsive: true, displayModeBar: false})
// }

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

    for (name in seriesObj.series) {
      if (seriesObj.series[name].name === 'Others') {
        seriesObj.series[name].name = "Diamond Princess Cruise Ship";
      };
    }

    console.log(seriesObj)


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
          align: "center",
          reserveSpace: false,
          rotation: 0,
          y: -20
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

function stackedBarChart(obj) {

  let parseDate = d3.timeFormat("%m-%d")
  let date;
  let dates;
  dates = obj.map(date => {
    for (let [key, value] of Object.entries(date.date)) {
      date = new Date(value)
      date.setTime( date.getTime() - new Date().getTimezoneOffset()*60*(-1000));

      return parseDate(date)
    };

  })

  let lastDateObj = obj[obj.length - 1]


  let states = [];
  for (const property in lastDateObj.locations) {
    if (lastDateObj.locations[property].region === "Mainland China") {
      states.push(property);
    }
  }

  let seriesObj = {
    series: []
  };
  let post;
  for (const i in states) {
    post = {
      name: states[i],
      data: []
    }
    if (states[i] === 'Hubei') {
        seriesObj.series.unshift(post)
    }
    else {
        seriesObj.series.push(post)
    }
  }

  let state, dataSeries, sum;
  for (const location in seriesObj.series) {
    state = seriesObj.series[location].name;

    dataSeries = obj.map(data => {

      for (const x in data.locations) {
        if (x === state) {
          sum = data.locations[x].confirmed;
          seriesObj.series[location].data.push(sum)
        }
      }
    });


  };

  Highcharts.chart("stackedBar", {
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




// Load Data then call functions...

d3.json('https://covid2019-tracker.appspot.com/api/date').then(function(result,error) {

  let coronaData = result
  // Update Total Counts
  totalCounts(coronaData);
  // Update the Last Updated Value
  lastUpdated(coronaData);
  // Create infection rate chart
  // infectionRate(coronaData);
  // Create infection by region chart
  // infectionByRegion(coronaData);
  // china vs world infections
  chinaWorldInfections(coronaData);
  worldcountriesInfections(coronaData);
  // Create Doesn't Matter
  stackedBarChart(coronaData);
  deathsVSrecovered(coronaData);
  comparisonChart(coronaData);
  streamChart(coronaData);

  d3.json('https://covid2019-tracker.appspot.com/api/sars').then(function(result,error) {
    let sarsData = result

    // comparisonInfectionChart(coronaData, sarsData);
    // comparisonDeathChart(coronaData, sarsData);
    // highchartTotal(coronaData, sarsData);
    // highchartTotalDeaths(coronaData, sarsData)
  })
})

// highcharts theme
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
