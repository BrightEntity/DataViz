
const width= 1024;
const height = 860;
const path = d3.geoPath();

const projection = d3.geoConicConformal()
    .center([2.454071, 46.279229])
    .scale(4800)
    .translate([width /2, height / 2]);

path.projection(projection);

const svg = d3.select("#map").append("svg")
    .attr("id", "svg")
    .attr("width", width)
    .attr("height", height);

const deps = svg.append("g");

var csv;

// On charge le csv
d3.csv("sites_fouilles_fr.csv").then(function(csvData) {

    csv = csvData.reduce((acc, n) => {
        // On va regrouper les communes de fouilles en département
        let itemExists = false;
        for(let key in acc) {
            if(acc[key]["Département"] == n["Département"]) {
                acc[key]["nbCommunes"]++;
                itemExists = true;
            }
        }

        if(!itemExists) {
            acc.push({
                "Département": n["Département"],
                "nbCommunes": 1
            });
        }

        return acc;
    }, [])
});

d3.json("departments.json").then(function(geojson) {
    let features = geojson.features.map(feature => {
        feature.properties.nbCommunes = csv.reduce((acc, n) => {
            if(n["Département"].toUpperCase() == feature.properties["NOM_DEPT"].toUpperCase())
                return n.nbCommunes;
            else
                return acc;
        }, 0);
        let redLevel = feature.properties.nbCommunes > 20 ? "255" : (feature.properties.nbCommunes / 20)*255 ;
         feature.geometry.style = {fill:   "rgb("+ redLevel+",0,0)"};

         return feature;
    });


    deps.selectAll("path")
        .data(features)
        .enter()
        .append("path")
        .attr("d", path)
        .style("fill", function(d) {
            return d.geometry.style.fill;
        })
        .on("mouseover", function(d) {
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div.html("Département : " + d.properties.NOM_DEPT + "<br/>"
                +  "Région : " + d.properties.NOM_REGION + "<br />"
                +  "Nombre de sites de fouilles : " + d.properties.nbCommunes)
                .style("left", (d3.event.pageX + 30) + "px")
                .style("top", (d3.event.pageY - 30) + "px")
        })
        .on("mouseout", function(d) {
            div.style("opacity", 0);
            div.html("")
                .style("left", "-500px")
                .style("top", "-500px");
        });
});

var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);


