function initMap(){
    let isSmallScreen = window.matchMedia("(max-width: 1024px)").matches;

     // initialize zoomed on Stockholm center
    // smaller map if on mobile
    let map = null;
    if (isSmallScreen)
        map = L.map('map', {dragging: false}).setView([59.33,18.00], 10);
    else
        map = L.map('map').setView([59.33,17.93], 12);

    // zoom buttons
    map.zoomControl.setPosition('bottomright');

    // scale info
    L.control.scale({"position": "bottomleft"}).addTo(map);

    // background polygon layers: water, boundaries of the kommuner, bounderies of Stockholm kommun
    L.geoJson(vatten, {className: "vatten"}).addTo(map);
    L.geoJson(kommuner, {className: "kommun"}).addTo(map);
    L.geoJson(stockholm, {className: "stockholm"}).addTo(map);

    // the main polygon layer: the parts of the city
    // return it so we can interact with it further
    return L.geoJson(stadsdelar, {className: "stadsdel"}).bindTooltip(getTooltip).addTo(map);
}

function updateMapColors(layer, currentCounts){
    // utility method: lookup in the currentCounts dictionary
    function getCurrentCount(name){
        name = name.toLowerCase();

        if (currentCounts[name] === undefined)
            return 0;
        else
            return currentCounts[name];
    }

    // utility method: update the fill colour of the polygon
    function updateColor(feature){
         return {
            fillColor: color(feature.properties.count),
        };
    }

    // here is where the action happens: update every feature (=polygon) in this layer
    layer.setStyle(function(feature){
         // need to update the feature (=polygon) itself, so that the tooltip shows the correct numbers
        feature.properties.count = getCurrentCount(feature.properties.name);
        // set the new fill colour
        return updateColor(feature);
    });
}

function getTooltip(event){
    function formatName(feature){
        let name = feature.properties.name.toLowerCase();
        let nameCapitalized = name.charAt(0).toUpperCase() + name.slice(1);

        if (nameCapitalized.startsWith("Ulvsunda industriomr"))
            nameCapitalized = "Ulvsunda industriområde";

        return nameCapitalized;
    }

    const count = event.feature.properties.count;
    const name = formatName(event.feature);

    const header = "<h1> " + name + "</h1> ";
    const text = texts["tooltipBefore"][LANGUAGE] + "<strong>"+count+"</strong>" + texts["tooltipAfter"][LANGUAGE];

    return "<div class='tooltip'>" + header + "<span>" + text + "</span>" + "</div>";
}
