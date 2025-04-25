import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Flex, Heading } from '@chakra-ui/react';
import { BackButton } from '../BackButton';
import { AboutDrawer } from '../AboutDrawer';
import './Viz4.css';

const Viz4 = () => {
  const containerRef = useRef(null);
  
  useEffect(() => {
    const container = d3.select(containerRef.current);
    container.selectAll('*').remove();

    //Set canvas 
    const margin = { top: 300, right: 30, bottom: 40, left: 100 };
    const width = window.innerWidth - margin.left - margin.right;
    const height = 800 - margin.top - margin.bottom;
    
    let zipGeo = null;

    const svg = container
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom + 80)
        .style("background-color", "#DDE3F1");

    //base layer = new york map, line layer = subway lines, station layer = subway stations
    const baseLayer = svg.append("g").attr("id", "zip-layer");
    const lineLayer = svg.append("g").attr("id", "line-layer");
    const stationLayer = svg.append("g").attr("id", "station-layer");

    const projection = d3.geoMercator()
      .center([-74, 40.7])
      .scale(175000)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    //put data into categories (ignoring omny vs metro card specifications )
    function categorizeFare(fare) {
      const lower = fare.toLowerCase();
      if (lower.includes("student")) return "student";
      if (lower.includes("fair")) return "fair";
      if (lower.includes("unlimited")) return "unlimited";
      if (lower.includes("full")) return "full";
      if (lower.includes("seniors")) return "seniors_and_disability";
      return "other";
    }

    function loadData() {
      d3.json("nyc_zipcodes.geojson").then(data => {
        zipGeo = data;

        d3.json("subway_lines.geojson").then(subwayData => {
          const brooklynZips = zipGeo.features.filter(zip => zip.properties.borough === "Brooklyn");
          
          //turn non-brooklyn subway lines gray 
          lineLayer.selectAll("path.subway")
            .data(subwayData.features)
            .enter()
            .append("path")
            .attr("class", "subway")
            .attr("d", path)
            .attr("fill", "#000000")
            .attr("stroke",  d => {
              const lineBounds = d3.geoBounds(d);
              const touchesBrooklyn = brooklynZips.some(zip => {
                const zipBounds = d3.geoBounds(zip);
                return !(
                  lineBounds[1][0] < zipBounds[0][0] ||
                  lineBounds[0][0] > zipBounds[1][0] ||
                  lineBounds[1][1] < zipBounds[0][1] ||
                  lineBounds[0][1] > zipBounds[1][1]
                );
              });
              return touchesBrooklyn ? "#003da5" : "#aaaaaa";
            })
            .attr("stroke-width", 2);
          
          //working with subway station data
          d3.csv("brooklyn_oct_2024.csv").then(rawData => {
            const stationMap = new Map();

            rawData.forEach(d => {
              const match = d.Georeference.match(/POINT \(([-\d.]+) ([-\d.]+)\)/);
              const lon = match ? +match[1] : null;
              const lat = match ? +match[2] : null;

              //get station name, add running total of riders, and categorize fare
              const name = d.station_complex;
              const ridership = +d.ridership;
              const category = categorizeFare(d.fare_class_category);
              
              //create entry into map if non existent
              if (!stationMap.has(name)) {
                stationMap.set(name, {
                  station_complex: name,
                  latitude: lat,
                  longitude: lon,
                  total_ridership: 0,
                  fare_breakdown: {
                    unlimited: 0,
                    student: 0,
                    seniors_and_disability: 0,
                    fair: 0,
                    other: 0,
                    full: 0
                  }
                });
              }
              //update ridership at station
              const station = stationMap.get(name);
              station.total_ridership += ridership;
              station.fare_breakdown[category] += ridership;
            });
            //working with zipcode data (station data iterated as array)
            const stationData = Array.from(stationMap.values());
            const zipTotals = new Map();
            
            //arrange station by zip code
            stationData.forEach(station => {
              const coords = [station.longitude, station.latitude];
              let matchedZip = null;
              for (const feature of zipGeo.features) {
                if (d3.geoContains(feature, coords)) {
                  matchedZip = feature.properties.postalCode;
                  break;
                }
              }

              if (!matchedZip) return;

              //calculate number of riders using reduced fare
              const nonFull = Object.entries(station.fare_breakdown)
                .filter(([type]) => type !== "full")
                .reduce((sum, [_, count]) => sum + count, 0);

              if (!zipTotals.has(matchedZip)) {
                zipTotals.set(matchedZip, { total: 0, nonFull: 0 });
              }
              //entry in zipcode map according to full/reduced fare totals
              const z = zipTotals.get(matchedZip);
              z.total += station.total_ridership;
              z.nonFull += nonFull;
            });
            
            //calculate proportion
            zipGeo.features.forEach(f => {
              const zip = f.properties.postalCode;
              const stats = zipTotals.get(zip);
              f.properties.nonFullRate = stats && stats.total > 0
                ? stats.nonFull / stats.total
                : 0;
            });

            //create gradient for proportion of reduced fare to full fare 
            const colorScale = d3.scaleSequential()
              .domain([0, 1])
              .interpolator(d3.interpolateYlGnBu);

            baseLayer.selectAll("path.zip")
              .data(zipGeo.features)
              .enter()
              .append("path")
              .attr("class", "zip")
              .attr("d", path)
              .attr("fill", d => d.properties.borough === "Brooklyn" ? colorScale(d.properties.nonFullRate) : "#ffffff")
              .attr("stroke", "#ccc")
              .attr("stroke-width", 0.5)
              .style("transform-box", "fill-box")
              .style("transform-origin", "center")
              .on("mouseover", function(event, d) {
                //exclude non Brooklyn zip codes
                if (d.properties.borough !== "Brooklyn") return;
                d3.select(this)
                  .raise()
                  .transition()
                  .duration(200)
                  .style("stroke", "#000")
                  .style("stroke-width", 4)
                  .style("transform", "scale(1.1)");
                
                //retrieve percentage of discounted fare tix per zip code
                d3.select("#station-info").html(`
                  <h3>ZIP Code: ${d.properties.postalCode}</h3>
                  <div><strong>Discounted Fare:</strong> ${(d.properties.nonFullRate * 100).toFixed(1)}% (${zipTotals.get(d.properties.postalCode)?.nonFull ?? 0})</div>
                `);
              })
              .on("mouseout", function() {
                d3.select(this)
                  .transition()
                  .duration(200)
                  .style("stroke", "#ccc")
                  .style("stroke-width", 0.5)
                  .style("transform", "scale(1)");

                d3.select("#station-info").html("");
              });

            // Add ZIP color scale legend with gradient to match map
            const legendWidth = 200;
            const legendHeight = 10;
            const legendSvg = svg.append("g")
              .attr("class", "legend")
              .attr("transform", `translate(${40}, ${160})`);
          
            const defs = svg.append("defs");
            const linearGradient = defs.append("linearGradient")
              .attr("id", "zipLegendGradient");

            linearGradient.selectAll("stop")
              .data([
                { offset: "0%", color: colorScale(0) },
                { offset: "60%", color: colorScale(.6) }
              ])
              .enter()
              .append("stop")
              .attr("offset", d => d.offset)
              .attr("stop-color", d => d.color);

            legendSvg.append("rect")
              .attr("width", legendWidth)
              .attr("height", legendHeight)
              .style("fill", "url(#zipLegendGradient)");

            legendSvg.append("text")
              .attr("x", 0)
              .attr("y", -5)
              .style("font-size", "12px")
              .text("% of Discounted Fare Riders");

            legendSvg.append("text")
              .attr("x", 0)
              .attr("y", legendHeight + 15)
              .style("font-size", "10px")
              .text("0%");

            legendSvg.append("text")
              .attr("x", legendWidth - 20)
              .attr("y", legendHeight + 15)
              .style("font-size", "10px")
              .text("60%");
            
            //station data summary
            stationLayer.selectAll("circle.station")
              .data(stationData)
              .enter()
              .append("circle")
              .attr("class", "station")
              .attr("cx", d => projection([d.longitude, d.latitude])[0])
              .attr("cy", d => projection([d.longitude, d.latitude])[1])
              .attr("r", 4.5)
              .attr("fill", "#003da5")
              .attr("stroke", "white")
              .attr("stroke-width", 1)
              .on("mouseover", (event, d) => {
                const fareColors = {
                  student: "#4daf4a",
                  seniors_and_disability: "#ffc300",
                  other: "#ed40A9",
                  fair: "#984ea3",
                  unlimited: "#ff7f00",
                  full: "#999999"
                };

                const total = d.total_ridership;
                //fare breakdown percentages
                const fareLines = Object.entries(d.fare_breakdown)
                  .map(([fare, count]) => {
                    const label = fare === "seniors_and_disability" ? "Seniors and Disability" : fare.charAt(0).toUpperCase() + fare.slice(1);
                    const percent = ((count / total) * 100).toFixed(2);
                    return `
                      <div>
                        <span class="fare-dot" style="background-color: ${fareColors[fare]};"></span>
                        ${label}: ${percent}% (${count})
                      </div>
                    `;
                  })
                  .join("");
                
                //create bar based on fare breakdown per station
                const barSegments = Object.entries(d.fare_breakdown)
                  .filter(([_, count]) => count > 0)
                  .map(([cat, count]) => {
                    const percent = (count / total) * 100;
                    return `<div class="fare-bar-segment" 
                                style="width: ${percent}%; 
                                background-color: ${fareColors[cat]}" 
                                title="${cat}: ${count}"></div>`;
                  })
                  .join("");
                //display station information 
                d3.select("#station-info").html(`
                  <h3>${d.station_complex}</h3>
                  <div><strong>Total Ridership:</strong> ${total}</div>
                  <div class="fare-bar-container">${barSegments}</div>
                  ${fareLines}
                `);
              })
              .on("mouseout", () => {
                d3.select("#station-info").html("");
                // container.html("");
              });
            });
          });
        });
    };

    loadData();
  })

  return (
    <>
      <div ref={containerRef} className="viz4"/>
        <Flex alignItems="center" position="fixed" top="15px" left="95px" width="50%">
          <BackButton />
          <Flex flexDirection="column" marginLeft="1.5rem">
            <Heading className="viz4-title" size='2xl'>
              Brooklyn's Subway Ridership Data
            </Heading>
            <Flex className="viz4-subtitle-wrapper">
              <Heading className="viz4-subtitle" size='md'>(October 2024)</Heading>
              <AboutDrawer semester="Winter 2025" id="viz4" />
            </Flex>
          </Flex>
        </Flex>
      <div id="station-info" />
    </>
  );
}

export default Viz4;
