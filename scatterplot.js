// default countries
let scatterplotCountries = ["Afghanistan", "France", "Germany", "United States", "Bangladesh"];

let scatterSvg, scatterWidth, scatterHeight;
const scatterMargin = { top: 30, right: 30, bottom: 60, left: 70};

let xScaleScatter, yScaleScatter;

let lineContainer;

// initializes the canvas for the scatterplot
function initScatterplot() {
    const container = document.getElementById("scatterplot-chart");
    const cWidth = container.clientWidth;
    const cHeight = container.clientHeight;
    scatterWidth = cWidth - scatterMargin.left - scatterMargin.right;
    scatterHeight = cHeight - scatterMargin.top - scatterMargin.bottom;

    // fill options for select button
    countries = [...new Set(mortalityData.map(d => d.Entity))].sort(); // extracts countries form mortalitydata, makes to set to eliminate doubles and back to arr
    countries.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c;
        opt.textContent = c;
        document.getElementById("country-select").appendChild(opt);
    });

    scatterSvg = d3.select("#scatterplot-chart")
        .append("svg")
        .attr("width", cWidth)
        .attr("height", cHeight)
        .append("g")
        .attr("transform", `translate(${scatterMargin.left}, ${scatterMargin.top})`);

    yScaleScatter = d3.scaleLinear()
        .domain([0, d3.max(mortalityData, d => +d["Under-five mortality rate (selected)"])]) // value at d[], + for number
        .range([scatterHeight, 0])

    scatterSvg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScaleScatter))

    xScaleScatter = d3.scaleLog()
        .domain([d3.min(gdpData, d =>  +d["GDP per capita"]), d3.max(gdpData, d =>  +d["GDP per capita"])])
        .range([0, scatterWidth])

    scatterSvg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${scatterHeight})`)
        .call(d3.axisBottom(xScaleScatter))

    lineContainer = scatterSvg.append("g")
        .attr("id", "line-container")

    // x-axis text
    scatterSvg.append("text")
        .attr("class", "axis-label")
        .attr("x", scatterWidth / 2)
        .attr("y", scatterHeight + scatterMargin.bottom - 15)
        .attr("text-anchor", "middle")
        .text("GDP per capita in international $")
        .style("fill", "#2b2b2b");

    // y-axis text
    scatterSvg.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -scatterHeight / 2)
        .attr("y", -scatterMargin.left + 25)
        .attr("text-anchor", "middle")
        .text("Mortality rate in %")
        .style("fill", "#2b2b2b");;


    // title
    scatterSvg.append("text")
        .attr("class", "chart-title")
        .attr("x", scatterWidth / 2)
        .attr("y", -scatterMargin.top + 20)
        .attr("text-anchor", "middle")
        .text("Under-five mortality rate (per 1,000 live births) vs. GDP per capita");
}

// renders line of a country
function renderScatterplot(country) {
    const data = joinData(country, gdpData, "GDP per capita");
    const firstPoint = data.find(d => d.year >= START_YEAR);
    const lastPoint = data[data.length - 1];
    const tooltip = d3.select("#tooltip");

    if (data.length < DATA_SIZE_THRESHOLD) {
        alert(`Not enough data available for ${country.replace(/\s+/g, '')}`);
        return;
    }

    lineContainer.append("line")
        .attr("x1", xScaleScatter(firstPoint.value))
        .attr("y1", yScaleScatter(firstPoint.mortality))
        .attr("x2", xScaleScatter(lastPoint.value))
        .attr("y2", yScaleScatter(lastPoint.mortality))
        .attr("id", `line-${country.replace(/\s+/g, '')}`)
        .attr("class", "trend-line")
        .attr("stroke", getColor(country))
        .on("click", function(event) { // add tooltip on click
            event.stopPropagation();

            const isHidden = tooltip.classed("hidden");

            if (isHidden) {
                tooltip.classed("hidden", false);
                tooltip.html(`
                    <strong style="color: ${getColor(country)}">${country}</strong><br/>
                    <strong>Start (${firstPoint.year}):</strong> GDP $${Math.round(firstPoint.value)} | Mortality: ${firstPoint.mortality}%<br/>
                    <strong>Finish (${lastPoint.year}):</strong> GDP $${Math.round(lastPoint.value)} | Mortality: ${lastPoint.mortality}%
                    <hr class="tooltip-divider" />
                    <button id="view-sanitation-btn" data-country="${country}">
                        Sanitation Stats ➔
                    </button>
                `);
            }
            else {
                tooltip.classed("hidden", true);
            }
        })



    const legendContainer = document.getElementById("legend-container");

    // add tags for overview and easy removal of individual countries
    if (!document.getElementById(`tag-${country.replace(/\s+/g, '')}`)) {
        const tag = document.createElement("div");
        tag.id = `tag-${country.replace(/\s+/g, '')}`;
        tag.className = "country-tag";
        tag.textContent = country;
        tag.style.backgroundColor = getColor(country);

        const removeBtn = document.createElement("span");
        removeBtn.className = "remove-btn";
        removeBtn.textContent = " ×";

        removeBtn.addEventListener("click", () => {
            removeCountry(country);
        });

        tag.appendChild(removeBtn);
        legendContainer.appendChild(tag);

        if (!scatterplotCountries.includes(country)) {
            scatterplotCountries.push(country);
        }
    }
}

// check for max country number, when selecting country to visualize in scatterplot
document.getElementById("country-select").addEventListener("change", e => {
    country = e.target.value;
    if (country) {
        if (scatterplotCountries.length >= MAX_COUNTRY_NUMBER_SCATTER) {
            alert("Maximum of 8 countries permitted, remove a country")
            e.target.value = "";
            return;
        }
        renderScatterplot(country);
    }
    e.target.value = "";
});

// closes tooltip
document.addEventListener("click", () => {
    d3.select("#tooltip").classed("hidden", true);
});

// look out for tooltip button (prevents tooltip closing when clicking on button)
d3.select("#tooltip").on("click", function(event) {
    event.stopPropagation();
    if (event.target.id === "view-sanitation-btn") {
        renderSanitationStatistic(event.target.getAttribute("data-country"))
    }
});
