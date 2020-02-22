//  retrive data and run functions
d3.json('https://covid2019-tracker.appspot.com/api/date').then(function(result,error) {

    ///////////////////////////////
    // date/time parsing
    ///////////////////////////////

    // date format function for timeline slider
    var parseDate = d3.timeFormat("%m-%d-%Y");

    // create the timelinecontrol object with date format option
    var timelineControl = L.timelineSliderControl(
        {formatOutput: date => {
            date = new Date(date);
            date.setTime(
              date.getTime() - new Date().getTimezoneOffset() * 60 * -1000
            );
            return parseDate(date);
        }}
    );

    // create an array to hold time points for creating features object
    let featuresDates = result.map(data => {
        for (let [key, value] of Object.entries(data.date)) {
            return value
        }
    })

    console.log(featuresDates)

    ///////////////////////////////
    // create geojson object
    ///////////////////////////////

    // create feature collection object
    let featureCollection = {
        "type": "FeatureCollection",
        "features": []
    }

    // date counter for featuresDates array above
    let dateCount = -1;

    // time offset for start/end dates
    const timeDiff = 1e1;

    // loop through each day
    result.map(data => {
        dateCount += 1;
  
        // create post object
        let post;

        // loop through each location each day
            for (const city in data.locations) {

                // push new feature to post object
                // timeDiff is used as a time offset so circle markers do not overlap
                if (dateCount+1 == featuresDates.length) {
                    post = {
                        "type": "Feature",
                        "properties": {
                            "city": city,
                            "start": featuresDates[dateCount],
                            "end": featuresDates[dateCount]+timeDiff,
                            "confirmed": data.locations[city].confirmed 
                        },
                        "geometry": {
                            "type": "Point",
                            "coordinates": [data.locations[city].lng, data.locations[city].lat]
                        }
                    }
                }
                else {
                    post = {
                        "type": "Feature",
                        "properties": {
                            "city": city,
                            "start": featuresDates[dateCount],
                            "end": featuresDates[dateCount+1]-timeDiff,
                            "confirmed": data.locations[city].confirmed 
                        },
                        "geometry": {
                            "type": "Point",
                            "coordinates": [data.locations[city].lng, data.locations[city].lat]
                        }
                    }
                }
            
                // push post to feature collection array
                featureCollection.features.push(post);
            }
    })

    // push to layer function below
    overlayLayers(featureCollection);

    ///////////////////////////////
    // map layers
    ///////////////////////////////

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
        
        // push to map creation function
        createMap(casesLayer);

    }

    ///////////////////////////////
    // create the map based on layers pushed to it
    ///////////////////////////////

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