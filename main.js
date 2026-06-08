const COLORS = [
    "gold", "steelblue", "tomato", "mediumaquamarine",
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

// State
let selectedCountries = [];
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

    xScale = d3.scaleLinear()
        .domain([0, d3.max(gdpData, d =>  +d["GDP per capita"])])
        .range([0, width])

    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale))

}

function renderScatterplot(country) {
    const data = joinData(country, gdpData, "GDP per capita");

    if (data.length < DATA_SIZE_THRESHOLD) {
        console.log("naurr")
        alert(`Not enough data available for ${country}`);
        return;
    }
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

document.getElementById("country-select").addEventListener("change", e => {
    country = e.target.value;
    if (country) renderScatterplot(country);
    e.target.value = "";
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
    renderScatterplot("Afghanistan")
});

