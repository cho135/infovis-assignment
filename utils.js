const COLORS = [
    "orange", "steelblue", "tomato", "mediumaquamarine",
    "orchid", "sandybrown", "lightseagreen", "hotpink"
];

const countryColors = {};
let colorIndex = 0;


// data arrays
let gdpData = [];
let mortalityData = [];
let sanitationData = [];
let healthInsuranceData = [];
let countries = [];

// global parameters
const SAMPLE_RATE = 1;
const DATA_SIZE_THRESHOLD = 50;
const MAX_COUNTRY_NUMBER_SCATTER= 8;
const START_YEAR = 1900;
const END_YEAR = 2020;
const SANITATION_STAT_START = 2000; // data only available for year >= 2000
const DATA_PRESETS = {
    PRESET_1: {
        countries: ["Germany", "United States", "China"],
        sanitationCountries: ["Germany", "United States", "China"],
        butterflyChartYear: 2010,
    },
    PRESET_2: {
        countries: ["Austria", "Hungary", "Italy"],
        sanitationCountries: ["Austria", "Hungary", "Italy"],
        butterflyChartYear: 2010,
    },
    PRESET_3: {
        countries: ["Brazil", "Philippines", "Burundi"],
        sanitationCountries: ["Brazil", "Philippines", "Burundi"],
        butterflyChartYear: 2009,
    }
}


const SANITATION_COLORS = [
    "#2c7bb6",
    "#abd9e9",
    "#ffffbf",
    "#fdae61",
    "#d7191c",

];
const MAX_VIEWS = 3;

// assigns colors to country, assigns colors twice when max of eight colors reached
function getColor(country) {
    if (!countryColors[country]) {
        countryColors[country] = COLORS[colorIndex % COLORS.length];
        colorIndex++;
    }
    return countryColors[country];
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

function mergeMortalitySanitation(country) {
    const rawMortality = mortalityData.filter(d =>
        d["Entity"] === country &&
        +d["Year"] >= SANITATION_STAT_START && +d["Year"] <= END_YEAR
    );

    const rawSanitation = sanitationData.filter(d =>
        d["Entity"] === country &&
        +d["Year"] >= SANITATION_STAT_START && +d["Year"] <= END_YEAR
    );

    let mergedCountryData = [];

    for (let i = SANITATION_STAT_START; i <= END_YEAR; i++) {

        const mortEntry = rawMortality.find(d => +d["Year"] === i);
        const sanEntry = rawSanitation.find(d => +d["Year"] === i);

        if (mortEntry || sanEntry) {
            mergedCountryData.push({
                year: i,
                mortality: mortEntry ? +mortEntry["Under-five mortality rate (selected)"]: 0,
                safelyManaged: sanEntry ? +sanEntry["Safely managed"] : 0,
                basic:         sanEntry ? +sanEntry["Basic"] : 0,
                limited:       sanEntry ? +sanEntry["Limited"] : 0,
                unimproved:    sanEntry ? +sanEntry["Unimproved"] : 0,
                openDefecation: sanEntry ? +sanEntry["No access (open defecation)"] : 0,
            });
        }
    }
    console.log(mergedCountryData)
    return mergedCountryData;
}


function renderDynamicLegend() {
    const keys = ["safelyManaged", "basic", "limited", "unimproved", "openDefecation"];
    const labels = [
        "Safely managed",
        "Basic",
        "Limited",
        "Unimproved",
        "Open defecation",
    ];

    const legendContainer = d3.select("#sanitation-legend");


    keys.forEach((key, index) => {
        const item = legendContainer.append("div")
            .attr("class", "legend-item");

        item.append("span")
            .attr("class", "color-box")
            .style("background-color", SANITATION_COLORS[index])
            .style("border", index === 2 ? "1px solid #d4d4d8" : "none"); // border for unimproved

        item.append("text")
            .text(labels[index]);
    });

    const lineLegend = legendContainer.append("div")
        .attr("class", "legend-item")

    const lineBox = lineLegend.append("span")
        .attr("class", "color-box")
        .style("background-color", "#fff")

        .style("display", "inline-flex")
        .style("align-items", "center")
        .style("padding", "0 1px");

    lineBox.append("span")
        .style("display", "block")
        .style("width", "100%")
        .style("height", "2px")
        .style("background-color", "black");

    lineLegend.append("text")
        .text("Mortality rate");
}

function loadDataPreset(presetID) {
    const settings = DATA_PRESETS[presetID];
    if (!settings) return;

    // Clear old data
    [...scatterplotCountries].forEach(country => {
        removeCountry(country);
    });
    scatterplotCountries = [];
    sanitationCountries = [];
    d3.select("#sanitation-views").selectAll("div").remove();
    d3.select("#sanitation-views").append("div")
        .attr("id", "sanitation-placeholder")
        .text("Select a country's trend line in the scatterplot to view its sanitation statistics here.");

    // Load new data
    settings.countries.forEach(country => {
        renderScatterplot(country);
    });
    settings.sanitationCountries.forEach(country => {
        renderSanitationStatistic(country);
    });
    let sliderElement = document.getElementById("yearSlider");
    let outputElement = document.getElementById("selectedYear");
    sliderElement.value = settings.butterflyChartYear;
    outputElement.innerHTML = settings.butterflyChartYear;
    const renderedData = butterFlyData.filter(d => d.Year == settings.butterflyChartYear).sort((a, b) => a.Mortality - b.Mortality);
    updateButterflyChart(_xLeft, _xRight, renderedData);

    window.scrollTo({top: 0, behavior: "smooth"});
}

