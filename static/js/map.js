// // map object
// var mymap = L.map('mapid', { zoomControl: false, scrollWheelZoom: false }).setView([25, 0], 2);
// mymap.on('focus', function() { mymap.scrollWheelZoom.enable(); });
// mymap.on('blur', function() { mymap.scrollWheelZoom.disable(); });

//  retrive data and run functions
d3.json('https://covid2019-tracker.appspot.com/api/date').then(function(result,error) {

    // Create the timeline and controls
    var timelineControl = L.timelineSliderControl(
        {formatOutput: date => {
            date = new Date(date);
            date.setTime(
              date.getTime() - new Date().getTimezoneOffset() * 60 * -1000
            );
            return parseDate(date);
        }}
    );


    // parse dates
    var parseDate = d3.timeFormat("%m-%d-%Y");
    let date;
    let dates;
    dates = result.map(date => {
      for (let [key, value] of Object.entries(date.date)) {
        date = new Date(value);
        date.setTime(
          date.getTime() - new Date().getTimezoneOffset() * 60 * -1000
        );

        return parseDate(date);
      }
    });

    ///////////////////////////////
    // create geojson object
    ///////////////////////////////

    let featureCollection = {
        "type": "FeatureCollection",
        "features": []
    }

    let dateCount = -1;

    // loop through each day
    result.map(data => {

        // current date
        // console.log(dates[dateCount])

        dateCount += 1;

        let post;
        // loop through each location each day
            for (const city in data.locations) {

                if (dateCount === dates.length-1) {
                    post = {
                        "type": "Feature",
                        "properties": {
                            "city": city,
                            "start": dates[dateCount],
                            "confirmed": data.locations[city].confirmed 
                        },
                        "geometry": {
                            "type": "Point",
                            "coordinates": [data.locations[city].lat, data.locations[city].lng]
                        }
                    }
                    
                }
                else {
                    post = {
                        "type": "Feature",
                        "properties": {
                            "city": city,
                            "start": dates[dateCount],
                            "end": dates[dateCount+1],
                            "confirmed": data.locations[city].confirmed 
                        },
                        "geometry": {
                            "type": "Point",
                            "coordinates": [data.locations[city].lng, data.locations[city].lat]
                        }
                    }
                }
                featureCollection.features.push(post);
            }
    })

    // push to layer function below
    overlayLayers(featureCollection);

    // create layers function
    function overlayLayers(featureCollection) {
        console.log(featureCollection);
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
        
        createMap(casesLayer);

    }

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
})

//     // basemap layer
//     L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
//         attribution: 'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
//         maxZoom: 10,
//         id: 'mapbox/dark-v10',
//         accessToken: 'pk.eyJ1IjoiY29zdGNvLWhvdGRvZyIsImEiOiJjazYxajkyNGUwNDljM2xvZnZjZmxmcjJqIn0.zW5wSAD1e2DKZIjtlAwNtQ'
//     }).addTo(mymap);
    
//     ///////////////////////////////
//     // markers and popups
//     ///////////////////////////////

//     // retrieve latest date
//     latestDate = result[result.length-1]

//     // location data
//     locations = latestDate.locations

//     // create array of location data
//     const locationsArray = Object.entries(locations)
    
//     // sort the locations in descending confirmed cases
//     // helps selecting overlaying markers for popups
//     locationsArray.sort(sortFunction);

//     function sortFunction(a, b) {
//         if (a[1].confirmed === b[1].confirmed) {
//         return 0;
//         }
//         return (a[1].confirmed < b[1].confirmed) ? 1 : -1;
//     }

//     // loop through each location data entry
//     locationsArray.forEach(location => {

//         // total confirmed, recovered, and deaths
//         var confirmed = +location[1].confirmed;
//         var recovered = +location[1].recovered;
//         var deaths = +location[1].deaths;

//         // latitude
//         var lat = +location[1].lat;

//         // longitude
//         var lng = +location[1].lng;

//         // add circle markers
//         var circle = L.circle([lat, lng], {
//           color: "red",
//           fillColor: "#ff4242",
//           fillOpacity: 0.5,
//           radius: (confirmed) * 30
//         }).addTo(mymap);

//         // popup
//         var toolTip = `<strong>${location[0]}</strong><br>Confirmed: ${confirmed}<br>Recovered: ${recovered}<br>Deaths: ${deaths}`;

//         // bind popup
//         circle.bindTooltip(toolTip);
//     })


// })
