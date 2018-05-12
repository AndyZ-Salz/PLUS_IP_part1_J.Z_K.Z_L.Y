function load() {

    redraw();

}


function redraw() {
    readTextFile("test.json", function(text) {
        var data = JSON.parse(text);
        //orignal
        // document.getElementById('map').innerHTML = data.name;
        //jQuery
        $("#map").html(data.name);
    });
}


function readTextFile(file, callback) {
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