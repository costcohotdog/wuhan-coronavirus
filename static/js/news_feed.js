


function updateNewsFeed(obj) {
  let dates = [];
  let headlines = [];
  for (const property in obj) {
    date = obj[property].date;
    dates.push(date);
    headline = obj[property].headline;
    headlines.push(headline);
  }
  let timeline = {
    dates: dates,
    headlines: headlines
  }

  div = d3.select(".timeline").append('ul')
  let article, story;
  for (i=0; i < dates.length; i++) {
    article = div.append("li").text(`${dates[i]} ${headlines[i]}`).append('hr');
  };

// <svg width="50" height="50">
// <line x1="5" y1="5" x2="40" y2="40" stroke="gray" stroke-width="5"  />
// </svg>

let svgContainer = d3.select('#timeline').append("svg")
    .attr('width', 2000)
    .attr('height', 200)
    .attr('style', 'display: block;')
    let svgData = {
      series: []
    }
    let post;
  for (let i=0; i < timeline.dates.length; i = i + 3) {
      post = {
        dates: [timeline.dates[i], timeline.dates[i + 1], timeline.dates[i+2]],
        headlines: [timeline.headlines[i], timeline.headlines[i + 1], timeline.headlines[i+2]]
      }

      svgData.series.push(post);
  }
  let lines = svgData.series.map((data, index) => {
    let line = svgContainer.append('line')
        .attr('x1', 0)
        .attr('y1', 20 * (index + 1))
        .attr('x2', 1000)
        .attr('y2', 20 * (index + 1))
        .attr('id', `line${index}`)
        .classed('line', true)
        .attr('stroke-width', 2)
        .attr('stroke', 'yellow')
  });

  let horizontalLines = svg.selectAll('line')

  console.log(horizontalLines.nodes().map( d => d.getAttribute('x1')) );


  console.log(svgData)


};


d3.json('http://127.0.0.1:5000/api/timeline').then(function(result,error) {

  updateNewsFeed(result);

});
