var map;

function load() {



    //Map
    var BaseMapGroup = new ol.layer.Group({
        title: 'Base maps',
        layers: [
            new ol.layer.Group({
                title: 'Water color with labels',
                type: 'base',
                combine: true,
                visible: false,
                layers: [
                    new ol.layer.Tile({
                        source: new ol.source.Stamen({
                            layer: 'watercolor'
                        })
                    }),
                    new ol.layer.Tile({
                        source: new ol.source.Stamen({
                            layer: 'terrain-labels'
                        })
                    })
                ]
            }),
            new ol.layer.Tile({
                title: 'Water color',
                type: 'base',
                visible: false,
                source: new ol.source.Stamen({
                    layer: 'watercolor'
                })
            }),
            new ol.layer.Tile({
                title: 'OSM',
                type: 'base',
                visible: true,
                source: new ol.source.OSM()
            })
        ]
    });

    var OverLayGroup = new ol.layer.Group({
        title: 'Overlay',
        layers: [
            new ol.layer.Tile({
                title: 'WMS',
                type: 'overlay',
                visible: true,
                source: new ol.source.TileWMS({
                    url: 'https://data.stadt-salzburg.at/geodaten/wms',
                    params: { 'LAYERS': 'forschung', 'TILED': true, },
                    serverType: 'geoserver',
                    transition: 0
                })
            })
        ]
    })


    map = new ol.Map({
        layers: [BaseMapGroup, OverLayGroup],
        target: 'map',
        controls: ol.control.defaults({
            attributionOptions: {
                collapsible: false
            }
        }),
        view: new ol.View({
            center: [13.06072, 47.78869],
            zoom: 16,
            projection: 'EPSG:4326'
        }),
    });


    //Point
    drawMarker(13.06072, 47.78869, 'Defualt');
    drawMarker(13.06072, 47.78879, 'Defualt2');








    // Map Control
    map.addControl(new ol.control.OverviewMap({
        collapsed: false,
        view: new ol.View({
            projection: 'EPSG:4326'
        })
    }));

    map.addControl(new ol.control.ScaleLine({ units: 'degrees' }));

    var layerSwitcher = new ol.control.LayerSwitcher({
        tipLabel: 'Test' // Optional label for button
    });
    map.addControl(layerSwitcher);


    //Popup
    var element = document.getElementById('popup');

    var popup = new ol.Overlay({
        element: element,
        positioning: 'bottom-center',
        stopEvent: false,
        offset: [0, -50]
    });
    map.addOverlay(popup);

    // display popup on click
    map.on('click', function(evt) {
        var feature = map.forEachFeatureAtPixel(evt.pixel,
            function(feature) {
                return feature;
            });
        if (feature) {
            var coordinates = feature.getGeometry().getCoordinates();
            popup.setPosition(coordinates);
            $(element).popover({
                'placement': 'top',
                'html': true,
                'content': feature.get('name')
            });
            $(element).popover('show');
        } else {
            $(element).popover('destroy');
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


    //Botton
    document.getElementById('zoom-out').onclick =
        function() {
            var view = map.getView();
            var zoom = view.getZoom();
            view.setZoom(zoom - 1);
        };

    document.getElementById('zoom-in').onclick =
        function() {
            var view = map.getView();
            var zoom = view.getZoom();
            view.setZoom(zoom + 1);
        };

}


function drawMarker(a, b, pointName) {
    //Icon

    var iconFeature = new ol.Feature({
        geometry: new ol.geom.Point([a, b]),
        name: pointName
    });

    var iconStyle = new ol.style.Style({
        image: new ol.style.Icon( /** @type {olx.style.IconOptions} */ ({
            anchor: [0.5, 46],
            anchorXUnits: 'fraction',
            anchorYUnits: 'pixels',
            src: 'https://openlayers.org/en/v4.6.5/examples/data/icon.png',
            scale: 1
        }))
    });

    iconFeature.setStyle(iconStyle);

    var markerSource = new ol.source.Vector({
        features: [iconFeature]
    });

    var markerLayer = new ol.layer.Vector({
        source: markerSource
    });

    markerLayer.setZIndex(1);

    map.addLayer(markerLayer);

}
