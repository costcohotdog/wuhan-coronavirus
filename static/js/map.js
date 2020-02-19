// map object
var mymap = L.map('mapid', { zoomControl: false, scrollWheelZoom: false }).setView([25, 0], 2);
mymap.on('focus', function() { mymap.scrollWheelZoom.enable(); });
mymap.on('blur', function() { mymap.scrollWheelZoom.disable(); });
//  retrive data and run functions
d3.json('https://covid2019-tracker.appspot.com/api/date').then(function(result,error) {

    // basemap layer
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 10,
        id: 'mapbox/dark-v10',
        accessToken: 'pk.eyJ1IjoiY29zdGNvLWhvdGRvZyIsImEiOiJjazYxajkyNGUwNDljM2xvZnZjZmxmcjJqIn0.zW5wSAD1e2DKZIjtlAwNtQ'
    }).addTo(mymap);

    ///////////////////////////////
    // markers and popups
    ///////////////////////////////

    // retrieve latest date
    latestDate = result[result.length-1]

    // location data
    locations = latestDate.locations

    // create array of location data
    const locationsArray = Object.entries(locations)

    var a = [
        ["tag_17", 0, 4],
        ["tag_18", 13, 18],
        ["tag_435", 6, 11]
    ];

    // sort the locations in descending confirmed cases
    // helps selecting overlaying markers for popups
    locationsArray.sort(sortFunction);

    function sortFunction(a, b) {
        if (a[1].confirmed === b[1].confirmed) {
        return 0;
        }
        return (a[1].confirmed < b[1].confirmed) ? 1 : -1;
    }

    // loop through each location data entry
    locationsArray.forEach(location => {

        // total confirmed, recovered, and deaths
        var confirmed = +location[1].confirmed;
        var recovered = +location[1].recovered;
        var deaths = +location[1].deaths;

        // latitude
        var lat = +location[1].lat;

        // longitude
        var lng = +location[1].lng;

        // add circle markers
        var circle = L.circle([lat, lng], {
          color: "red",
          fillColor: "#ff4242",
          fillOpacity: 0.5,
          radius: (confirmed) * 30
        }).addTo(mymap);

        // popup
        var toolTip = `<strong>${location[0]}</strong><br>Confirmed: ${confirmed}<br>Recovered: ${recovered}<br>Deaths: ${deaths}`;

        // bind popup
        circle.bindTooltip(toolTip);
    })


})
