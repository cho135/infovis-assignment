let butterflySvg, butterflyWidth, butterflyHeight;
const centerOffset = 90
const butterflyMargin = { top: 50, right: 30, bottom: 30, left: 30};
let butterFlyDefaultCountries = ["Aruba", "Niger", "Saint Lucia", "Yemen", "Bangladesh"];
let butterFlyData = []


function updateButterflyChart(xLeft, xRight, updatedData) {
  const y = d3.scaleBand()
  .domain(updatedData.map(d => d["Entity"]))
  .range([butterflyMargin.top, butterflyHeight - butterflyMargin.bottom])
  .padding(0.2);

  // 3. Draw Left Bars
  butterflySvg.selectAll(".bar-left")
  .data(updatedData, d => d["Entity"])
  .join("rect")
  .attr("class", "bar-left")
  .attr("fill", "steelblue")
  .attr("x", d => xLeft(d["Insurance"]))
  .attr("y", d => y(d["Entity"]))
  .attr("width", d => xLeft(0) - xLeft(d["Insurance"]))
  .attr("height", y.bandwidth());

  // 4. Draw Right Bars
  butterflySvg.selectAll(".bar-right")
  .data(updatedData, d => d["Entity"])
  .join("rect")
  .attr("class", "bar-right")
  .attr("fill", "crimson")
  .attr("x", xRight(0))
  .attr("y", d => y(d["Entity"]))
  .attr("width", d => xRight(d["Mortality"]) - xRight(0))
  .attr("height", y.bandwidth());

  // 5. Draw Central Labels
  butterflySvg.selectAll(".label")
  .data(updatedData, d => d["Entity"])
  .join("text")
  .attr("class", "label")
  .attr("text-anchor", "middle")
  .attr("alignment-baseline", "middle")
  .attr("x", butterflyWidth / 2)
  .attr("y", d => y(d["Entity"]) + y.bandwidth() / 2)
  .text(d => d["Entity"])
  .on("mouseover", function(event, d) {
    d3.select(this).style("font-weight", "bold");
    butterflySvg.append("text")
      .attr("class", "butterfly-bars-text-overlay")
      .attr("x", butterflyWidth / 2 - centerOffset - 2)
      .attr("y", y(d["Entity"]) + y.bandwidth() / 2 + 6)
      .attr("text-anchor", "end")
      .text(`${d["Insurance"]}%`);

    butterflySvg.append("text")
        .attr("class", "butterfly-bars-text-overlay")
        .attr("x", butterflyWidth / 2 + centerOffset + 2)
        .attr("y", y(d["Entity"]) + y.bandwidth() / 2 + 6)
        .attr("text-anchor", "start")
        .text(`${d["Mortality"]}%`);
  })
  .on("mouseleave", function() {
    if (d3.select(this).classed("pinned")) return;

    d3.select(this).style("font-weight", "normal");
    butterflySvg.selectAll(".butterfly-bars-text-overlay:not(.pinned)").remove();
  })
  .on("click", function(event, d) {
    const label = d3.select(this);
    const isPinned = label.classed("pinned");

    butterflySvg.selectAll(".label")
      .classed("pinned", false)
      .style("font-weight", "normal");
    butterflySvg.selectAll(".butterfly-bars-text-overlay").remove();
    butterflySvg.selectAll(".butterfly-bars-text-overlay.pinned").remove();

    if (isPinned) {

    } else {
      label.classed("pinned", true);
      label.style("font-weight", "bold");

      butterflySvg.append("text")
          .attr("class", "butterfly-bars-text-overlay pinned")
          .attr("x", butterflyWidth / 2 - centerOffset - 2)
          .attr("y", y(d["Entity"]) + y.bandwidth() / 2 + 6)
          .attr("text-anchor", "end")
          .text(`${d["Insurance"]}%`);

      butterflySvg.append("text")
          .attr("class", "butterfly-bars-text-overlay pinned")
          .attr("x", butterflyWidth / 2 + centerOffset + 2)
          .attr("y", y(d["Entity"]) + y.bandwidth() / 2 + 6)
          .attr("text-anchor", "start")
          .text(`${d["Mortality"]}%`);
    }
  });
  return y;
}

function initButterflyChart() {
  //data setup
  for (const country of healthInsuranceData.map(d => d["Entity"])) {
    const dataForCountry = joinData(country, healthInsuranceData, "Share of population covered by health insurance (ILO (2014))")
    for (const dataPoint of dataForCountry) {
      butterFlyData.push({
        Entity: country,
        Year: dataPoint.year,
        Insurance: dataPoint.value,
        Mortality: dataPoint.mortality
      })
    }
  }

  const renderedData = butterFlyData.filter(d => d.Year === 2009).sort((a, b) => a.Mortality - b.Mortality)

  const container = document.getElementById("butterfly-chart-svg");
  //ToDo: Fix container size loading
  butterflyWidth = container.clientWidth;
  butterflyWidth = 1000;
  butterflyHeight = container.clientHeight;
  butterflyHeight = 800;

  butterflySvg = d3.select("#butterfly-chart-svg")
  .append("svg")
  .attr("width", butterflyWidth)
  .attr("height", butterflyHeight);


  //butterfly chart itself
  const xLeft = d3.scaleLinear()
  .domain([0, 100])
  .range([butterflyWidth / 2 - centerOffset, butterflyMargin.left]);

  const xRight = d3.scaleLinear()
  .domain([0, 40])
  .range([butterflyWidth / 2 + centerOffset, butterflyWidth - butterflyMargin.right]);

  const y = updateButterflyChart(xLeft, xRight, renderedData);

  //axis above the chart
  const axisYPosition = y(renderedData[0]["Entity"]) - 5;
  const xAxisLeft = d3.axisTop(xLeft)
  .ticks(5);

  butterflySvg.append("g")
  .attr("class", "x-axis-left")
  .attr("transform", `translate(0, ${axisYPosition})`)
  .call(xAxisLeft);

  // Right Axis (Mortality)
  const xAxisRight = d3.axisTop(xRight)
  .ticks(5);

  butterflySvg.append("g")
  .attr("class", "x-axis-right")
  .attr("transform", `translate(0, ${axisYPosition})`)
  .call(xAxisRight);


  // title
  butterflySvg.append("text")
  .attr("class", "chart-title")
  .attr("x", butterflyWidth / 2)
  .attr("y", 20)
  .attr("text-anchor", "middle")
  .text("");



  //slider
  var slider = document.getElementById("yearSlider");
  var output = document.getElementById("selectedYear");
  output.innerHTML = slider.value;
  slider.oninput = function() {
    output.innerHTML = this.value;
    const renderedData = butterFlyData.filter(d => d.Year == this.value).sort((a, b) => a.Mortality - b.Mortality)
    if (renderedData.length === 0) {
      output.innerHTML = this.value + " - no data available";
    }
    updateButterflyChart(xLeft, xRight, renderedData)

  }
}

