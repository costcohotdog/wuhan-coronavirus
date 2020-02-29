


function updateNewsFeed(obj) {
  let dates = [];
  let headlines = [];
  for (const property in obj) {
    date = obj[property].date;
    dates.push(date);
    headline = obj[property].headline;
    headlines.push(headline);
  }


  for (let i=0; i < dates.length; i++) {
    let carousel = d3.select('.carousel-inner');
    let random = Math.floor(Math.random() * Math.floor(9));
    let div;
    if (i === 0) {
      div = carousel.append('div').classed('carousel-item active slide img-fluid', true);
    } else {
      div = carousel.append('div').classed('carousel-item slide img-fluid', true);
    }


    div.html(`
      <img class="d-block w-100" src="../static/images/img${random}.jpg" alt="..." style=" opacity: .5;">
      <div class="carousel-caption d-none d-md-block">
      <h3>${dates[i]}</h3>
      <h5>${headlines[i]}</h5>
      </div>`)

  }





};


d3.json('https://covid2019tracker.appspot.com/api/timeline').then(function(result,error) {

  updateNewsFeed(result);

});
