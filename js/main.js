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
var formattedData;

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
  console.log(data[0]);

  let dataObject = [];
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

  console.log(dataObject);

  //   console.log(cleanData);
  update(formattedData);
});

// d3.json("data/data.json").then(function(data) {
//   //   console.log(data);

//   // Clean data
//   formattedData = data.map(function(year) {
//     // console.log(year);
//     return year["countries"]
//       .filter(function(country) {
//         var dataExists = country.income && country.life_exp;
//         return dataExists;
//       })
//       .map(function(country) {
//         country.income = +country.income;
//         country.life_exp = +country.life_exp;
//         return country;
//       });
//   });

//   //   console.log(formattetimetimetimedData);

//   // First run of the visualization
//   //   update(formattedData[0]);
// });

$("#play-button").on("click", function() {
  var button = $(this);
  if (button.text() == "Play") {
    button.text("Pause");
    interval = setInterval(step, 100);
  } else {
    button.text("Play");
    clearInterval(interval);
  }
});

// console.log(Number(parseTime("2017-01-01")));

$("#reset-button").on("click", function() {
  time = 0;
  update(formattedData[0]);
});

$("#continent-select").on("change", function() {
  update(formattedData[time]);
});

$("#date-slider").slider({
  range: true,
  max: Number(parseTime("2019-05-01")),
  min: Number(parseTime("2017-01-01")),
  step: 1,
  values: [Number(parseTime("2017-01-01")), Number(parseTime("2019-05-01"))],
  slide: function(event, ui) {
    console.log(ui.value);
    time = ui.value;
    // console.log(formattedData.time);
    update(formattedData);
  }
});

function step() {
  console.log(formattedData);
  // At the end of our data, loop back
  time =
    Number(parseTime("2019-05-01")) < 214
      ? time + 1
      : Number(parseTime("2017-01-01"));
  update(formattedData[time]);
}

function update(data) {
  // console.log(data);
  // Standard transition time for the visualization
  var t = d3.transition().duration(100);

  var continent = $("#continent-select").val();

  sliderValues = $("#date-slider").slider("values");
  // console.log(sliderValues);

  var data = data
    .filter(function(d) {
      if (continent == "all") {
        return true;
      } else {
        return d.continent == continent;
      }
    })
    .filter(d => {
      let time = parseTime(d.time);
      // console.log(
      //   Number(time) >= sliderValues[0] && Number(time) <= sliderValues[1]
      // );
      return Number(time) >= sliderValues[0] && Number(time) <= sliderValues[1];
    });
  console.log(data);

  // JOIN new data with old elements.
  var circles = g.selectAll("circle").data(data, function(d) {
    // console.log(d.subgroup);
    return d.subgroup;
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
      return continentColor(d.region);
    })
    .on("mouseover", tip.show)
    .on("mouseout", tip.hide)
    .merge(circles)
    .transition(t)
    .attr("cy", function(d) {
      //   console.log(d);
      return y(d.services);
    })
    .attr("cx", function(d) {
      return x(d.expense);
    })
    .attr("r", function(d) {
      return Math.sqrt(area(d.poblacion) / Math.PI);
    });

  // Update the time label
  console.log(formatTime(time));
  timeLabel.text(formatTime(time));
  $("#datelabel1").innerHTML = formatTime(time);

  $("#date-slider").slider("value", formatTime(time));
}
