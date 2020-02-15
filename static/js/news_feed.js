


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

  div = d3.select(".timeline").append('div')
  let article, story;
  for (i=0; i < dates.length; i++) {
    article = div.append("h3").text(`${dates[i]}`).classed('story-date', true).classed('text-center', true).attr('id', `story-date${i}`)
              .on('mouseover', function() {
                d3.select(this).style('color', 'darkOrange')
              })
              .on('mouseout', function() {
                d3.select(this).style('color', 'white')
              });
    story = article.append('h4').text(`${headlines[i]}`).classed('headline', true).classed('text-center', true).attr('id', `headline${i}`);
  };




  for (let i=0; i < dates.length; i++) {
    if (i >= 9) {
      document.getElementById(`headline${i}`).style.display = 'none';
      document.getElementById(`story-date${i}`).style.display = 'none';
    } else {
      document.getElementById(`headline${i}`).style.display = 'block';
      document.getElementById(`story-date${i}`).style.display = 'block';
    }
  }

  let button = d3.select('#show-more')
  let buttonText;
  button.on('click', function() {
    buttonText = button.text()
    if (buttonText === 'Show More') {
      for (let i=0; i < dates.length; i++) {
        document.getElementById(`headline${i}`).style.display = 'block';
        document.getElementById(`story-date${i}`).style.display = 'block';
        button.text('Show Less');
      }
    } else {
      for (let i=0; i < dates.length; i++) {
        if (i >= 9) {
          document.getElementById(`headline${i}`).style.display = 'none';
          document.getElementById(`story-date${i}`).style.display = 'none';
          button.text('Show More');
        }
      }
    }
    document.getElementById('timeline').scrollIntoView();


  })



};


d3.json('http://127.0.0.1:5000/api/timeline').then(function(result,error) {

  updateNewsFeed(result);

});
