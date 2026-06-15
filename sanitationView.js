const SANITATION_CATEGORIES = [
    "Safely managed",
    "Basic",
    "Limited",
    "Unimproved",
    "Open defecation"
];

let sanitationCountries = [];
function renderSanitationStatistic(country) {
    if (sanitationCountries.length >= MAX_VIEWS) {
        alert("Too many views open, close one");
        return;
    }
    const safeId = country.replace(/\s+/g, '');
    sanitationCountries.push(safeId);
    d3.select("#sanitation-views").append("div")
        .attr("id", "view-" + safeId)


    const viewContainer = document.getElementById("view-" + safeId).getBoundingClientRect(); // force exact calculation
    const width = viewContainer.width;
    const height = width;

    const svg = d3.select("#view-" + safeId).append("svg")
        .attr("width", width)
        .attr("height", height)


    const margin = { top: 15, right: 15, bottom: 30, left: 35 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    const nullpoint = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScaleSanitation = d3.scaleLinear()
        .domain([SANITATION_STAT_START, END_YEAR])
        .range([0, plotWidth]);

    const yScaleSanitation = d3.scaleLinear()
        .domain([0, 100])
        .range([plotHeight, 0]);

    nullpoint.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${plotHeight})`)
        .call(d3.axisBottom(xScaleSanitation)
            .ticks(5)
            .tickFormat(d3.format("d"))
        );

    nullpoint.append("g")
        .call(d3.axisLeft(yScaleSanitation).ticks(5));


    // join mortality on sanitation data
    const mortalitySanitationData = mergeMortalitySanitation(country)

    // stacked area chart
    const keys = ["openDefecation", "unimproved", "limited", "basic", "safelyManaged"];

    const stack = d3.stack()
        .keys(keys);

    const stackedData = stack(mortalitySanitationData);

    const colorScale = d3.scaleOrdinal()
        .domain(keys)
        .range(SANITATION_COLORS)

    const areaGenerator = d3.area()
        .x(d => xScaleSanitation(d.data.year))
        .y0(d => yScaleSanitation(d[0]))
        .y1(d => yScaleSanitation(d[1]));

    nullpoint.selectAll(".layer")
        .data(stackedData)
        .enter()
        .append("path")
        .attr("class", "layer")
        .attr("d", areaGenerator)
        .style("fill", d => colorScale(d.key))
        .style("opacity", 0.8);


    // mortality line
    const mortalityLine = d3.line()
        .x(d => xScaleSanitation(d.year))
        .y(d => yScaleSanitation(d.mortality));

    nullpoint.append("path")
        .datum(mortalitySanitationData)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", 1.5)
        .attr("d", mortalityLine);
}