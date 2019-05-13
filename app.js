var width = 1200,
  height = 600,
  centered;

// Define color scale
let colorDomain = [50000, 200000];
var color = d3.scale
  .log()
  .domain(colorDomain)
  // .clamp(true)
  // .range([d3.rgb("#45a7a6"), d3.rgb("#0c1c1c")]);
  .range(["green", "red"]);

var projection = d3.geo
  .mercator()
  .scale(10000)
  // Center the Map in DR
  .center([-70.75, 17.35])
  .translate([width / 2.5, height]);

var path = d3.geo.path().projection(projection);

// Set svg width & height
var svg = d3
  .select("#map")
  .attr("width", width)
  .attr("height", height);

// Add background
svg
  .append("rect")
  .attr("class", "background")
  .attr("width", width)
  .attr("height", height)
  .on("click", clicked);

var g = svg.append("g");

var effectLayer = g.append("g").classed("effect-layer", true);

var mapLayer = g.append("g").classed("map-layer", true);

var dummyText = g
  .append("text")
  .classed("dummy-text", true)
  .attr("x", 10)
  .attr("y", 30)
  .style("opacity", 0);

var bigText = g
  .append("text")
  .classed("big-text", true)
  .attr("x", 20)
  .attr("y", 45);

d3.json("./data/dr-map.json", function(error, mapData) {
  d3.csv("./cleanCoverage.csv", function(error, drData) {
    // console.log(drData);

    var features = mapData.features;
    let interval = 1000;
    let i = 0;
    let filteredData;

    let janData = drData.filter(data => data.mes === "Enero");

    // console.log(janData);
    // console.log(features);
    let cantidadServicios = [],
      poblacionUsuaria = [],
      valorAutorizado = [];
    filteredData = features.map((province, i) => {
      // console.log(janData[i].cantidadServicios);
      province.properties["cantidadServicios"] = janData[i].cantidadServicios;
      province.properties["poblacionUsuaria"] = janData[i].poblacionUsuaria;
      province.properties["valorAutorizado"] = janData[i].valorAutorizado;
      cantidadServicios.push(Number(janData[i].cantidadServicios));
      poblacionUsuaria.push(Number(janData[i].poblacionUsuaria));
      valorAutorizado.push(Number(janData[i].valorAutorizado));

      return province;
      // if (province)
      // console.log(province.properties.cantidadServicios);
    });

    // console.log(filteredData);
    // console.log(cantidadServicios);

    // console.log(cantidadServicios);

    // Update color scale domain based on data
    //   color.domain([0, d3.max(features, nameLength)]);
    color.domain(colorDomain);

    // Draw each province as a path
    mapLayer
      .selectAll("path")
      .data(filteredData)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("vector-effect", "non-scaling-stroke")
      .on("mouseover", mouseover)
      .on("mouseout", mouseout)
      .on("click", clicked)
      .style("fill", fillFn);

    d3.select("#title")
      .attr("width", width)
      .append("text")
      .text("Cobertura de Servicios de Salud Régimen Subsidiado")
      .style("fill", "black")
      .style("font-size", "40px")
      .attr("x", 50)
      .attr("y", 105);

    // console.log(drData);
    function colorMap(month) {
      // console.log(month);

      $("#month").empty();
      $("#month").remove();
      d3.select("#map")
        .append("svg")
        .attr("id", "month")
        .append("text")
        .text(`${month} 2018`)
        .style("fill", "black")
        .style("opacity", 0.4)
        .style("font-size", "40px")
        .attr("x", 20)
        .attr("y", 150);

      let janData = drData.filter(data => data.mes === month);

      // console.log(janData);
      // console.log(features);
      let cantidadServicios = [],
        poblacionUsuaria = [],
        valorAutorizado = [];
      filteredData = features.map((province, i) => {
        // console.log(janData[i].cantidadServicios);
        province.properties["cantidadServicios"] = janData[i].cantidadServicios;
        province.properties["poblacionUsuaria"] = janData[i].poblacionUsuaria;
        province.properties["valorAutorizado"] = janData[i].valorAutorizado;
        cantidadServicios.push(Number(janData[i].cantidadServicios));
        poblacionUsuaria.push(Number(janData[i].poblacionUsuaria));
        valorAutorizado.push(Number(janData[i].valorAutorizado));

        return province;
        // if (province)
        // console.log(province.properties.cantidadServicios);
      });

      mapLayer
        .selectAll("path")
        .transition()
        .duration(400)
        .style("fill", function(d) {
          // console.log(color(Number(d.properties.cantidadServicios)));
          return color(Number(d.properties.cantidadServicios));
        });
      // mapLayer
      //   .selectAll("path")
      //   .data(filteredData)
      //   .enter()
      //   .attr("d",d=> {
      //     console.log(d);
      //   });
    }

    setInterval(function() {
      // console.log(i);
      let months = ["Enero", "Febrero", "Marzo", "Abril"];
      // console.log(data[0]);
      colorMap(months[i]);
      i = i + 1;

      if (i === 4) {
        i = 0;
      }
    }, 2000);
  });
});

// Get province name
function nameFn(d) {
  console.log(color(Number(d.properties.cantidadServicios)));
  return d && d.properties
    ? `${d.properties.NAME_1}, ${d.properties.cantidadServicios}`
    : null;
}

// Get quantitative variables per province
function nameLength(d) {
  //   console.log(d);
  var n = nameFn(d);

  return n ? n.length : 0;
}

// Get province color
function fillFn(d) {
  // console.log(d.properties.cantidadServicios);
  // console.log(color(Number(d.properties.cantidadServicios)));
  return color(Number(d.properties.cantidadServicios));
}

// When clicked, zoom in
function clicked(d) {
  var x, y, k;

  // Compute centroid of the selected path
  if (d && centered !== d) {
    var centroid = path.centroid(d);
    // console.log(centroid);
    x = centroid[0];
    y = centroid[1];
    k = 4;
    centered = d;
  } else {
    x = width / 2;
    y = height / 2;
    k = 1;
    centered = null;
  }

  // Highlight the clicked province
  mapLayer.selectAll("path").style("fill", function(d) {
    return centered && d === centered ? "#D5708B" : fillFn(d);
  });

  // Zoom
  g.transition()
    .duration(750)
    .attr(
      "transform",
      "translate(" +
        width / 2 +
        "," +
        height / 2 +
        ")scale(" +
        k +
        ")translate(" +
        -x +
        "," +
        -y +
        ")"
    );
}

function mouseover(d) {
  // Highlight hovered province
  d3.select(this).style("fill", "orange");

  // Draw effects
  textArt(nameFn(d));
}

function mouseout(d) {
  // Reset province color
  mapLayer.selectAll("path").style("fill", function(d) {
    return centered && d === centered ? "#D5708B" : fillFn(d);
  });

  // Remove effect text
  effectLayer
    .selectAll("text")
    .transition()
    .style("opacity", 0)
    .remove();

  // Clear province name
  bigText.text("");
}

// Gimmick
// Just me playing around.
// You won't need this for a regular map.

var BASE_FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";

var FONTS = [
  "Open Sans",
  "Josefin Slab",
  "Arvo",
  "Lato",
  "Vollkorn",
  "Abril Fatface",
  "Old StandardTT",
  "Droid+Sans",
  "Lobster",
  "Inconsolata",
  "Montserrat",
  "Playfair Display",
  "Karla",
  "Alegreya",
  "Libre Baskerville",
  "Merriweather",
  "Lora",
  "Archivo Narrow",
  "Neuton",
  "Signika",
  "Questrial",
  "Fjalla One",
  "Bitter",
  "Varela Round"
];

function textArt(text) {
  // Use random font
  var fontIndex = Math.round(Math.random() * FONTS.length);
  var fontFamily = FONTS[fontIndex] + ", " + BASE_FONT;

  bigText.style("font-family", fontFamily).text(text);

  // Use dummy text to compute actual width of the text
  // getBBox() will return bounding box
  dummyText.style("font-family", fontFamily).text(text);
  var bbox = dummyText.node().getBBox();

  var textWidth = bbox.width;
  var textHeight = bbox.height;
  var xGap = 3;
  var yGap = 1;

  // Generate the positions of the text in the background
  var xPtr = 0;
  var yPtr = 0;
  var positions = [];
  var rowCount = 0;
  while (yPtr < height) {
    while (xPtr < width) {
      var point = {
        text: text,
        index: positions.length,
        x: xPtr,
        y: yPtr
      };
      var dx = point.x - width / 2 + textWidth / 2;
      var dy = point.y - height / 2;
      point.distance = dx * dx + dy * dy;

      positions.push(point);
      xPtr += textWidth + xGap;
    }
    rowCount++;
    xPtr = rowCount % 2 === 0 ? 0 : -textWidth / 2;
    xPtr += Math.random() * 10;
    yPtr += textHeight + yGap;
  }

  var selection = effectLayer.selectAll("text").data(positions, function(d) {
    return d.text + "/" + d.index;
  });

  // Clear old ones
  selection
    .exit()
    .transition()
    .style("opacity", 0)
    .remove();

  // Create text but set opacity to 0
  selection
    .enter()
    .append("text")
    .text(function(d) {
      return d.text;
    })
    .attr("x", function(d) {
      return d.x;
    })
    .attr("y", function(d) {
      return d.y;
    })
    .style("font-family", fontFamily)
    .style("fill", "#777")
    .style("opacity", 0);

  selection
    .style("font-family", fontFamily)
    .attr("x", function(d) {
      return d.x;
    })
    .attr("y", function(d) {
      return d.y;
    });

  // Create transtion to increase opacity from 0 to 0.1-0.5
  // Add delay based on distance from the center of the <svg> and a bit more randomness.
  selection
    .transition()
    .delay(function(d) {
      return d.distance * 0.01 + Math.random() * 1000;
    })
    .style("opacity", function(d) {
      return 0.1 + Math.random() * 0.4;
    });
}
