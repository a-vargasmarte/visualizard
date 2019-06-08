/*
 *    main.js
 *    Mastering Data Visualization with D3.js
 *    6.7 - Adding a jQuery UI slider
 */

var margin = { left: 80, right: 20, top: 50, bottom: 100 };
var height = 500 - margin.top - margin.bottom,
  width = 800 - margin.left - margin.right;

var parseTime = d3.timeParse("%Y-%m-%d");
var formatTime = d3.timeFormat("%Y-%m");

var g = d3
  .select("#chart-area")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

var time = Number(parseTime("2017-01-01"));
var interval;
var dataObject;
let viz;
let index;

// Tooltip
var tip = d3
  .tip()
  .attr("class", "d3-tip")
  .html(function(d) {
    var text =
      "<strong>Region:</strong> <span style='color:red'>" +
      d.region +
      "</span><br>";
    text +=
      "<strong>Subgroup:</strong> <span style='color:red;text-transform:capitalize'>" +
      d.subgroup +
      "</span><br>";
    text +=
      "<strong>Per Capita Expense:</strong> <span style='color:red'>" +
      d3.format("$,.2f")(d.expense) +
      "</span><br>";
    text +=
      "<strong>Frequency of Service:</strong> <span style='color:red'>" +
      d3.format(".0f")(d.services) +
      "</span><br>";
    text +=
      "<strong>Population:</strong> <span style='color:red'>" +
      d3.format(",.0f")(d.poblacion) +
      "</span><br>";
    return text;
  });
g.call(tip);

// Scales
var x = d3
  .scaleLinear()
  //   .base(10)
  .range([0, width])
  .domain([200, 2500]);
var y = d3
  .scaleLinear()
  .range([height, 0])
  .domain([0, 200000]);
var area = d3
  .scaleLinear()
  .range([25 * Math.PI, 1500 * Math.PI])
  .domain([2000, 14000000]);
var continentColor = d3.scaleOrdinal(d3.schemePastel1);

// Labels
var xLabel = g
  .append("text")
  .attr("y", height + 50)
  .attr("x", width / 2)
  .attr("font-size", "20px")
  .attr("text-anchor", "middle")
  .text("Gastos Per Capita ($RD)");
var yLabel = g
  .append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", -55)
  .attr("x", -170)
  .attr("font-size", "20px")
  .attr("text-anchor", "middle")
  .text("Cantidad de Servicios");
var timeLabel = g
  .append("text")
  .attr("y", height - 10)
  .attr("x", width - 200)
  .attr("font-size", "40px")
  .attr("opacity", "0.4")
  .attr("text-anchor", "middle")
  .text("2017-01-01");

// X Axis
var xAxisCall = d3.axisBottom(x);
//   .tickValues([400, 4000, 40000])
//   .tickFormat(d3.format("$"));
g.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + height + ")")
  .call(xAxisCall);

// Y Axis
var yAxisCall = d3.axisLeft(y).tickFormat(function(d) {
  return +d;
});
g.append("g")
  .attr("class", "y axis")
  .call(yAxisCall);

var continents = [
  "REGION 0",
  "REGION I",
  "REGION II",
  "REGION III",
  "REGION IV",
  "REGION V",
  "REGION VI",
  "REGION VII",
  "REGION VIII"
];

var legend = g
  .append("g")
  .attr("transform", "translate(" + (width - 10) + "," + (height - 125) + ")");

continents.forEach(function(continent, i) {
  var legendRow = legend
    .append("g")
    .attr("transform", "translate(0, " + i * 20 + ")");

  legendRow
    .append("rect")
    .attr("width", 10)
    .attr("height", 10)
    .attr("fill", continentColor(continent))
    .attr("y", -210);

  legendRow
    .append("text")
    .attr("x", -10)
    .attr("y", -200)
    .attr("text-anchor", "end")
    .style("text-transform", "capitalize")
    .text(continent);
});

d3.csv("data/regionData.csv").then(data => {
  // console.log(data[0]);
  var t = d3.transition().duration(100);

  var continent = $("#continent-select").val();
  // console.log(continent);

  sliderValues = $("#date-slider").slider("values");

  dataObject = [];
  let timeArray = data.map(d => {
    return d.time;
  });

  data.map(row => {
    // console.log(row);
    let rowObject = {
      regions: [],
      time: ""
    };

    let data = {};
    data["expense"] = +row.gastoPerCapita;
    data["services"] = +row["Cantidad servicios"];
    data["region"] = row.region;
    data["poblacion"] = +row.poblacion;
    data["time"] = row.time;

    rowObject.regions.push(data);
    // return dataObject;
    dataObject.push(rowObject);
  });

  let vizData = [],
    monthArray = [];

  data = dataObject.map(d => {
    d.time = Number(parseTime(d.regions[0].time));

    // console.log(formatTime(d.time));
    monthArray.push(formatTime(d.time));

    // console.log(monthArray);

    return d;
  });

  monthSet = new Set(monthArray);
  // console.log(monthSet.entries());

  let uniqueMonths = Array.from(monthSet);

  // console.log(uniqueMonths);

  data.map((d, i) => {
    // console.log(formatTime(d.regions[0].time));

    uniqueMonths.map(month => {
      // console.log(month);
      // console.log(d.regions[0].time.slice(0, -3));

      // console.log(month === d.regions[0].time.slice(0, -3));
      let vizObject = {
        regions: [],
        time: ""
      };

      if (month === d.regions[0].time.slice(0, -3)) {
        vizObject.time = month;
        // console.log(month);
        vizData.push(vizObject);
      }
    });
  });

  // console.log(vizData);

  data.map((d, i) => {
    let j = 0;

    while (j < data.length) {
      if (
        Number(parseTime(`${vizData[i].time}-01`)) ===
        Number(parseTime(data[j].regions[0].time))
      ) {
        // console.log(data[j].regions[0]);
        vizData[j].regions.push(data[i].regions[0]);
      }
      j = j + 1;
    }
  });

  let sorted = vizData.sort((a, b) => {
    // console.log(Number(parseTime(`${a.time}-01`)), b.time);
    // console.log(parseTime(a.time), parseTime(b.time));
    return (
      Number(parseTime(`${a.time}-01`)) - Number(parseTime(`${b.time}-01`))
    );
  });

  const every_nth = (arr, nth) => arr.filter((e, i) => i % nth === nth - 1);

  sorted = every_nth(sorted, 9);

  // console.log(sorted);

  // console.log(sliderValues);
  // console.log(Number(parseTime(`${sorted[1].time}-01`)) >= sliderValues[0]);

  data = sorted.filter(d => {
    return sliderValues[0] <= Number(parseTime(`${d.time}-01`));
  });

  viz = data;
  // console.log(viz);

  index = time - Number(parseTime("2017-01-01"));
  // console.log(viz[index]);

  //   console.log(cleanData);
  update(viz[index]);
});

$("#play-button").on("click", function() {
  // console.log(time);
  var button = $(this);
  if (button.text() == "Play") {
    button.text("Pause");
    interval = setInterval(step, 500);
  } else {
    button.text("Play");
    clearInterval(interval);
  }
});

// console.log(Number(parseTime("2017-01-01")));
// console.log(viz);
$("#reset-button").on("click", function() {
  update(viz[0]);
});

$("#continent-select").on("change", function() {
  // console.log(viz);
  update(viz);
});

$("#date-slider").slider({
  range: true,
  max: Number(parseTime("2019-05-01")),
  min: Number(parseTime("2017-01-01")),
  step: 2592000000,
  values: [Number(parseTime("2017-01-01")), time],
  slide: function(event, ui) {
    // console.log(viz[index]);
    // console.log(d3.timeFormat("%m")(Number(parseTime("2017-01-01"))));
    time = ui.value;
    // console.log(index);
    index = d3.timeFormat("%m")(time - Number(parseTime("2017-01-01")));

    update(viz[Number(index)]);
  }
});

function step() {
  let slider = $("#date-slider").slider("values");
  // console.log(slider);
  // console.log(time - Number(parseTime("2017-01-01")));
  // console.log(
  //   (Number(parseTime("2019-05-01")) - Number(parseTime("2017-01-01"))) /
  //     2592000000
  // );
  // At the end of our data, loop back
  // console.log(time);
  time =
    time < Number(parseTime("2019-05-01"))
      ? time + 2592000000
      : Number(parseTime("2017-01-01"));
  // console.log(d3.timeFormat("%m")(time - Number(parseTime("2017-01-01"))));
  index = d3.timeFormat("%m")(time - Number(parseTime("2017-01-01")));
  update(viz[Number(index)]);
}

function update(data) {
  // console.log(data);
  // Standard transition time for the visualization
  var t = d3.transition().duration(500);

  var continent = $("#continent-select").val();
  // console.log(continent);

  sliderValues = $("#date-slider").slider("values");
  // console.log(continent);

  var data = data.regions.filter(function(d) {
    if (continent == "all") {
      return true;
    } else {
      // console.log(d);
      return d.region == continent;
    }
  });

  // console.log(data);

  // JOIN new data with old elements.

  var circles = g.selectAll("circle").data(data, function(d) {
    // console.log(d);
    return d.region;
  });

  // EXIT old elements not present in new data.
  circles
    .exit()
    .attr("class", "exit")
    .remove();

  // ENTER new elements present in new data.
  circles
    .enter()
    .append("circle")
    .attr("class", "enter")
    .attr("fill", function(d) {
      // console.log(d.regions);
      return continentColor(d.region);
    })
    .on("mouseover", tip.show)
    .on("mouseout", tip.hide)
    .merge(circles)
    .transition(t)
    .attr("cy", function(d) {
      // console.log(d);
      return y(d.services);
    })
    .attr("cx", function(d) {
      return x(d.expense);
    })
    .attr("r", function(d) {
      return Math.sqrt(area(d.poblacion) / Math.PI);
    });

  // Update the time label
  // console.log(formatTime(time));
  timeLabel.text(formatTime(time));
  $("#datelabel1").innerHTML = formatTime(time);

  $("#date-slider").slider("value", formatTime(time));
}
