// global variable
var jsonData;
var map;

// inital function when the body is load
function initload() {
    map = initmap();
    loadJsonData(map);
    addPopup(map);
    $(document).ready(function() {
        $("#accordion").affix({
            offset: {
                top: 125
            }
        });
    });
    $('#place1').collapse({
        toggle: false
    })
}

function addPopup(map) {
    var element = document.getElementById('popup');
    var popup = new ol.Overlay({
        element: element,
        positioning: 'bottom-center',
        stopEvent: false,
        offset: [0, -20]
    });
    map.addOverlay(popup);
    // display popup on click
    map.on('click', function(evt) {
        var feature = map.forEachFeatureAtPixel(evt.pixel, function(feature) {
            return feature;
        });
        if (feature) {
            var coordinates = feature.getGeometry().getCoordinates();
            popup.setPosition(coordinates);
            $(element).popover({
                'placement': 'top',
                'html': true,
                'content': feature.get('pid')
            });
            pid = feature.get('pid');
            var btn1 = document.getElementById('#' + pid);
            btn1.click();
            var btn2 = document.getElementById('#link' + pid);
            btn2.click();
            //$(element).popover('show');
        } else {
            //$(element).popover('destroy');
        }
    });
    // change mouse cursor when over marker
    map.on('pointermove', function(e) {
        if (e.dragging) {
            $(element).popover('destroy');
            return;
        }
        var pixel = map.getEventPixel(e.originalEvent);
        var hit = map.hasFeatureAtPixel(pixel);
        map.getTarget().style.cursor = hit ? 'pointer' : '';
    });
}
// init map
function initmap() {
    var map = new ol.Map({
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            })
        ],
        view: new ol.View({
            center: [13.06072, 47.78869],
            zoom: 14,
            projection: 'EPSG:4326'
        }),
        target: 'map'
    });
    return map;
}
// create a marker layer and add to map
function createPlaceLayer(map, placeList) {
    var vectorSource = new ol.source.Vector({
        features: _drawMarker_(placeList)
    });
    var vectorLayer = new ol.layer.Vector({
        source: vectorSource
    });
    vectorLayer.set('name', 'place')
    vectorLayer.setZIndex(1);
    map.addLayer(vectorLayer);
}
// used in function createPlaceLayer
// create markers by point position and style src
function _drawMarker_(placeList) {
    console.log('length' + placeList.length);
    var markerFeature = new Array();
    for (i = 0; i < placeList.length; i++) {
        var marker = new ol.Feature({
            geometry: new ol.geom.Point([parseFloat(placeList[i][1]), parseFloat(placeList[i][2])]),
            pid: placeList[i][6],
        });
        var markerStyle = new ol.style.Style({
            image: new ol.style.Icon(({
                scale: 0.2,
                src: "place.png"
            }))
        });
        marker.setStyle(markerStyle);
        markerFeature[i] = marker;
    }
    return markerFeature;
}
// pares the json data
function loadJsonData(map) {
    _readJsonFile_("place.json", function(text) {
        var placeList = new Array();
        jsonData = JSON.parse(text);
        var data = eval(JSON.parse(text).place);
        for (var i = 0; i < data.length; i++) {
            var placePoint = new Array();
            placePoint[0] = data[i].name;
            placePoint[1] = data[i].lon;
            placePoint[2] = data[i].lat;
            placePoint[3] = data[i].img;
            placePoint[4] = data[i].star;
            placePoint[5] = data[i].comment;
            placePoint[6] = data[i].pid;
            placeList[i] = placePoint;
        }
        console.log(placeList.length);
        createPlaceLayer(map, placeList);
        createSideInfo(placeList);
        jsonData = placeList;
    });
}
// load data from json file by callback function
function _readJsonFile_(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    }
    rawFile.send(null);
}

// create the side information div with the place data
function createSideInfo(placeList) {
    var sideDiv = document.getElementById("info");
    var innerStr = "<div class=\"panel-group\" id=\"accordion\" >";
    for (var i = 0; i < placeList.length; i++) {
        innerStr += "<div class=\"panel panel-default\">";
        innerStr += "<a href=\"#link" + placeList[i][6] + "\" id=\"#link" + placeList[i][6] + "\"></a>";
        innerStr += "<a id=\"link" + placeList[i][6] + "\"></a>";
        innerStr += "<div class=\"panel-heading\">";
        innerStr += "<h4 class=\"panel-title\">";
        innerStr += "<img src=\"" + placeList[i][3] + "\" style=\"width: 30px; float:left\"/>";
        innerStr += "<a data-parent=\"#accordion\" data-toggle=\"collapse\" href=\"#" + placeList[i][6] + "\" id=\"#" + placeList[i][6] + "\">&nbsp" + placeList[i][0] + "</a>";
        innerStr += "</h4></div>";
        innerStr += "<div class=\"panel-collapse collapse\" id=\"" + placeList[i][6] + "\">";
        innerStr += "<div class=\"panel-body\"><img style=\"width: 100%\" src=\"" + placeList[i][3] + "\"/>";
        innerStr += "<div style=\"width: 60px;height: 16px;background: url('src/star_gray.png');\">";
        innerStr += "<div style=\"height:16px;width:" + _calStar_(placeList[i][4]) + "px;background:url('src/star_org.png') no-repeat;\"></div></div>";
        innerStr += "<p>" + placeList[i][5] + "</p>"
        innerStr += "</div></div></div>";
    }
    innerStr += "</div>";
    var oldSide = document.getElementById('accordion');
    if (oldSide) {
        oldSide.remove(0)
    };
    document.getElementById('info').insertAdjacentHTML("afterBegin", innerStr);
}

// the function used to calculate the star style
function _calStar_(star) {
    var intStar = parseInt(star);
    var width = 12 * intStar;
    return width;
}

// create a new place record by user input
function createNewPlace(location) {
    var placePoint = new Array();
    placePoint[0] = document.getElementById('placename').value
    placePoint[1] = location[0];
    placePoint[2] = location[1];
    var tmpName = document.getElementById('inputfile').value.split("\\");
    placePoint[3] = "img\\" + tmpName[tmpName.length - 1];
    placePoint[4] = document.querySelector('input[name="optionsRadiosinline"]:checked').value;
    placePoint[5] = document.getElementById('commentform').value;
    placePoint[6] = "place" + (jsonData.length + 1).toString();
    var index = jsonData.length;
    jsonData[index] = placePoint;
}

// Refresh side information div and place layer
function refreshPlace() {
    var layersToRemove = [];
    map.getLayers().forEach(function(layer) {
        if (layer.get('name') != undefined && layer.get('name') === 'place') {
            layersToRemove.push(layer);
        }
    });
    map.removeLayer(layersToRemove[0]);
    createPlaceLayer(map, jsonData);
    createSideInfo(jsonData);
}

// Geocoding and add a new place marker
function addNewPlace() {
    var geocoder = new google.maps.Geocoder();
    var address = document.getElementById('placename').value;
    geocoder.geocode({
        'address': address
    }, function(results, status) {
        if (status == 'OK') {
            var location = (results[0].geometry.location);
            createNewPlace([location.lng(), location.lat()]);
            refreshPlace();
        } else {
            alert('It is hard to find the place!');
        }
    });

}