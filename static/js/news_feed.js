


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


};


d3.json('http://127.0.0.1:5000/api/timeline').then(function(result,error) {

  updateNewsFeed(result);

});
