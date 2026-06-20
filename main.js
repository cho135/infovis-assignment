// TODO:
//  Sanitation statistic:
//      hover function
//      overflow
//      "no data" legend tag
//  Scatterplot:
//      pfeilköpfe
//      adaptable sample step size
//  allgemein:
//      kommentare, funktionenberschreibungen
//

function removeCountry(country) {
    const safeId = country.replace(/\s+/g, '');

    // remove tag in legend
    const tag = document.getElementById(`tag-${safeId}`);
    if (tag) tag.remove();

    // remove line in scatterplot
    d3.select(`#line-${safeId}`).remove();

    // delete from array
    scatterplotCountries = scatterplotCountries.filter(c => c !== country);
}

// clear button
document.getElementById("clear-btn").addEventListener("click", ev => {
    [...scatterplotCountries].forEach(el => {
        removeCountry(el);
    })
})

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
    initButterflyChart();
    renderDynamicLegend();
    scatterplotCountries.forEach(el => {
        renderScatterplot(el);
    })
});

