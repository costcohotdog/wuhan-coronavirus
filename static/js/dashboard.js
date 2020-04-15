
let dataController = (function() {
  // REUSABLE FUNCTIONS THAT MODIFY DATA

  function onlyUnique(value, index, self) {
      return self.indexOf(value) === index;
  }

  return {

  casesTracker: function(data) {
      // CASES TRACKER.... SHOWS NUMBER CASES PER DAY... ABLE TO SWITCH BETWEEN US/GLOBAL DATA
      let datesArr = data.map(d => d.formatted_date);
      let dates = datesArr.filter(onlyUnique);
      console.log(dates);

      let confirmed = [];
      for (let x=0; x < dates.length; x++) {
            let date = dates[x];
            let dateTotals = 0;
            let total = data.map(function(d) {
              if (d.formatted_date === date) {
                dateTotals = dateTotals + d.confirmed;
              }
            })
          confirmed.push(dateTotals);
      }
    console.log(confirmed);
  },
  leaderboard: function(data) {
    // TOP COUNTRIES FOR INFECTIONS... ABLE TO SWITCH TO TOP US COUNTIES FOR INFECTIONS


  },
  totals: function(data) {
    // TOTALS ROW FOR CONFIRMED/DEATHS/Countries

  },

  recoveryRate: function(data) {
    // CHART TO SHOW RECOVERY RATE... ABLE TO SWITCH BETWEEN US AND GLOBAL

  },

  deathRate: function(data) {
    // CHART TO SHOW DEATH RATE... ABLE TO SWITCH BETWEEN US AND GLOBAL

  }



  }
})();


let controller = (function(dataCtrl) {

  return {
    init: function() {
      // RUNS WHEN DASHBOARD IS LOADED
      d3.json('http://127.0.0.1:5000/api/global').then(function(result,error) {
        dataCtrl.casesTracker(result);


      })

    }
  }
})(dataController);


controller.init();
