// TODO:
//  Achsenbeschriftung
//  button für Sanitationstatistik: hover
//

const COLORS = [
    "orange", "steelblue", "tomato", "mediumaquamarine",
    "orchid", "sandybrown", "lightseagreen", "hotpink"
];

const countryColors = {};
let colorIndex = 0;


// assigns colors to country, assigns colors twice when max of eight colors reached
function getColor(country) {
    if (!countryColors[country]) {
        countryColors[country] = COLORS[colorIndex % COLORS.length];
        colorIndex++;
    }
    return countryColors[country];
}

// default countries
let selectedCountries = ["Afghanistan", "France", "Germany", "United States", "Bangladesh"];
let allData = [];
let gdpData = [];
let mortalityData = [];
let sanitationData = [];
let healthInsuranceData = [];
let countries = [];

let svg, width, height;
const margin = { top: 30, right: 30, bottom: 60, left: 70};

let xScale, yScale;

const SAMPLE_RATE = 1;
const DATA_SIZE_THRESHOLD = 50;
const MAX_COUNTRY_NUMBER = 8;
const START_YEAR = 1900;

let lineContainer;

// initializes the canvas for the scatterplot
function initScatterplot() {
    const container = document.getElementById("scatterplot-chart");
    const cWidth = container.clientWidth;
    const cHeight = container.clientHeight;
    width = cWidth - margin.left - margin.right;
    height = cHeight - margin.top - margin.bottom;

    // fill options for select button
    countries = [...new Set(mortalityData.map(d => d.Entity))].sort(); // extracts countries form mortalitydata, makes to set to eliminate doubles and back to arr
    countries.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c;
        opt.textContent = c;
        document.getElementById("country-select").appendChild(opt);
    });

    svg = d3.select("#scatterplot-chart")
        .append("svg")
        .attr("width", cWidth)
        .attr("height", cHeight)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    yScale = d3.scaleLinear()
        .domain([0, d3.max(mortalityData, d => +d["Under-five mortality rate (selected)"])]) // value at d[], + for number
        .range([height, 0])

    svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale))

    xScale = d3.scaleLog()
        .domain([d3.min(gdpData, d =>  +d["GDP per capita"]), d3.max(gdpData, d =>  +d["GDP per capita"])])
        .range([0, width])

    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale))

    lineContainer = svg.append("g")
        .attr("id", "line-container")

}

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
        .attr("x1", xScale(firstPoint.value))
        .attr("y1", yScale(firstPoint.mortality))
        .attr("x2", xScale(lastPoint.value))
        .attr("y2", yScale(lastPoint.mortality))
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
        tag.style.backgroundColor = getColor(country); // Dynamische Farbe zuweisen

        const removeBtn = document.createElement("span");
        removeBtn.className = "remove-btn";
        removeBtn.textContent = " ×";

        removeBtn.addEventListener("click", () => {
            removeCountry(country);
        });

        tag.appendChild(removeBtn);
        legendContainer.appendChild(tag);

        if (!selectedCountries.includes(country)) {
            selectedCountries.push(country);
        }
    }
}

function removeCountry(country) {
    const safeId = country.replace(/\s+/g, '');

    // 1. HTML-Tag entfernen
    const tag = document.getElementById(`tag-${safeId}`);
    if (tag) tag.remove();

    // 2. SVG-Linie entfernen
    d3.select(`#line-${safeId}`).remove();

    // 3. Aus dem globalen State-Array löschen
    selectedCountries = selectedCountries.filter(c => c !== country);
}

/**
 *
 * function to join mortality of a country to another attribute, eg mortality -> gdp
 *
 * @param {string} country -name of the country
 * @param {Array} otherData - dataset to join with
 * @param {string} otherColumn - name of the column to match to mortality
 *
 * @returns {Array} array like {year, mortality, value} objects
 *
 */
function joinData(country, otherData, otherColumn) {
    const result = [];

    mortalityData
        .filter(d => d.Entity === country)
        .forEach(d => {
            const match = otherData.find(o => o.Entity === country && o.Year === d.Year)
            if (match && match[otherColumn]) { // checks for existance
                result.push({
                    year: +d.Year,
                    mortality: +d["Under-five mortality rate (selected)"],
                    value: +match[otherColumn]
                });
            }
        });
    return result;
}


// check for max country number, when selecting country
document.getElementById("country-select").addEventListener("change", e => {
    country = e.target.value;
    if (country) {
        if (selectedCountries.length >= MAX_COUNTRY_NUMBER) {
            alert("Maximum of 8 countries permitted, remove a country")
            e.target.value = "";
            return;
        }
        renderScatterplot(country);
    }
    e.target.value = "";
});

// clear button
document.getElementById("clear-btn").addEventListener("click", ev => {
    [...selectedCountries].forEach(el => {
        removeCountry(el);
    })
})

// closes tooltip
document.addEventListener("click", () => {
    d3.select("#tooltip").classed("hidden", true);
});

// loads data from all datasets into globals
Promise.all([
    d3.csv("data/child-mortality.csv"),
    d3.csv("data/gdp-per-capita.csv"),
    d3.csv("data/share-of-the-population-with-access-to-sanitation-facilities.csv"),
    d3.csv("data/health-protection-coverage.csv")
]).then(([mortalityRaw, gdpRaw, sanitationRaw, insuranceRaw]) => {
    mortalityData = mortalityRaw;
    gdpData = gdpRaw;
    sanitationData = sanitationRaw;
    healthInsuranceData = insuranceRaw;

    initScatterplot();
    selectedCountries.forEach(el => {
        renderScatterplot(el);
    })
});

