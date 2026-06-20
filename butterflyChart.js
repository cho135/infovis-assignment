let butterflySvg, butterflyWidth, butterflyHeight;
const centerOffset = 40
const butterflyMargin = { top: 50, right: 30, bottom: 30, left: 30};
let butterFlyDefaultCountries = ["Aruba", "Niger", "Saint Lucia", "Yemen", "Bangladesh"];
let butterFlyData = []


function initButterflyChart() {
  setupDefaultData(2003);

  const container = document.getElementById("butterfly-chart-svg");
  //ToDo: Fix container size loading
  butterflyWidth = container.clientWidth;
  butterflyWidth = 600;
  butterflyHeight = container.clientHeight;
  butterflyHeight = 400;

  butterflySvg = d3.select("#butterfly-chart-svg")
  .append("svg")
  .attr("width", butterflyWidth)
  .attr("height", butterflyHeight);


  //butterfly chart itself
  const xLeft = d3.scaleLinear()
  .domain([0, 100])
  .range([butterflyWidth / 2 - centerOffset, butterflyMargin.left]);

  const xRight = d3.scaleLinear()
  .domain([0, 100])
  .range([butterflyWidth / 2 + centerOffset, butterflyWidth - butterflyMargin.right]);

  const y = d3.scaleBand()
  .domain(butterFlyData.map(d => d["Entity"]))
  .range([butterflyMargin.top, butterflyHeight - butterflyMargin.bottom])
  .padding(0.2);

  // 3. Draw Left Bars
  butterflySvg.selectAll(".bar-left")
  .data(butterFlyData)
  .enter().append("rect")
  .attr("class", "bar-left")
  .attr("x", d => xLeft(d["Insurance"]))
  .attr("y", d => y(d["Entity"]))
  .attr("width", d => xLeft(0) - xLeft(d["Insurance"]))
  .attr("height", y.bandwidth())
  .attr("fill", "steelblue");

  // 4. Draw Right Bars
  butterflySvg.selectAll(".bar-right")
  .data(butterFlyData)
  .enter().append("rect")
  .attr("class", "bar-right")
  .attr("x", xRight(0))
  .attr("y", d => y(d["Entity"]))
  .attr("width", d => xRight(100 - d["Mortality"]) - xRight(0))
  .attr("height", y.bandwidth())
  .attr("fill", "crimson");

  // 5. Draw Central Labels
  butterflySvg.selectAll(".label")
  .data(butterFlyData)
  .enter().append("text")
  .attr("x", butterflyWidth / 2)
  .attr("y", d => y(d["Entity"]) + y.bandwidth() / 2)
  .attr("text-anchor", "middle")
  .attr("alignment-baseline", "middle")
  .text(d => d["Entity"]);



  //axis above the chart
  const axisYPosition = y(butterFlyData[0]["Entity"]) - 5;
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
  .text("Percentage of population covered by health insurance vs child mortality rate");
}

function setupDefaultData(year) {
  for (const country of butterFlyDefaultCountries) {
    let mortalityDataEntry = mortalityData.find(item => item && item.Entity === country && item.Year == year)
    console.log(mortalityDataEntry)
    let insuranceDataEntry = healthInsuranceData.find(item => item && item.Entity === country && item.Year == year)
    console.log(insuranceDataEntry)
    butterFlyData.push(
        {
          Entity: country,
          Insurance: insuranceDataEntry?.["Share of population covered by health insurance (ILO (2014))"] ?? 0,
          Mortality: mortalityDataEntry?.["Under-five mortality rate (selected)"] ?? 0
        })
  }
}
