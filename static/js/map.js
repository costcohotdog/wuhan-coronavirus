// map object
var mymap = L.map('mapid').setView([20, 0], 2);

// basemap layer
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 10,
    id: 'mapbox/dark-v10',
    accessToken: 'pk.eyJ1IjoiY29zdGNvLWhvdGRvZyIsImEiOiJjazYxajkyNGUwNDljM2xvZnZjZmxmcjJqIn0.zW5wSAD1e2DKZIjtlAwNtQ'
}).addTo(mymap);

///////////////////////////////
// markers and popups
///////////////////////////////
function markers(result) {
    
    // retrieve latest date
    latestDate = result[result.length-1]

    // locations
    locations = latestDate.locations

    const locationsArray = Object.entries(locations)

    locationsArray.forEach(location => {
        
        // console.log(location)

        // total confirmed
        var confirmed = +location[1].confirmed;

        // latitude
        var lat = +location[1].lat;

        // longitude
        var lng = +location[1].lng;

        var circle = L.circle([lat, lng], {
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.5,
            radius: confirmed*100
        }).addTo(mymap);
    })
    

}



//  retrive data and run functions
d3.json('http://127.0.0.1:5000/api/date').then(function(result,error) {

  markers(result);
})

