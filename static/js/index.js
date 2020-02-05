

function totalCounts(obj) {
  // This function will take in the api/cases json object
  // and then display the total counters at the top of the page
  console.log(obj)


};





// Load Data then call functions...

d3.json('http://127.0.0.1:5000/api/date').then(function(result,error) {

  // Update Total Counts
  totalCounts(result);
})
