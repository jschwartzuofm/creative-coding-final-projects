import React from 'react';
import * as d3 from 'd3';
import './Viz2.css';

// Set up SVG dimensions and styling
const svg_width = 800;
const svg_height = 800;
var svg = d3.selectAll(".viz2")
  .append("svg")
  .attr("width", svg_width)
  .attr("height", svg_height)
  .style("background-color", "pink")
  .style("border", "1px solid black")
  .style("display", "block")
  .style("margin", "0 auto")
  .style("padding", "20px");

// Add tooltip div
const tooltip = d3.select(".viz2")
  .append("div")
  .attr("class", "viz2-tooltip");

// Legend data
const legendData = [
  { color: "orange", label: "Global Corridor" },
  { color: "yellow", label: "Major Corridor" },
  { color: "green", label: "Moderate Corridor" },
  { color: "blue", label: "Minor Corridor" },
  { color: "gray", label: "Low Demand Corridor" }
];

// Add legend
const legend = d3.select(".viz2")
  .append("div")
  .attr("id", "legend")
  .style("padding", "10px")
  .style("margin", "10px auto")
  .style("width", "300px")
  .style("background-color", "#fff")
  .style("border", "1px solid #ccc")
  .style("display", "flex")
  .style("flex-direction", "column")
  .style("align-items", "flex-start");

legend.selectAll("div")
  .data(legendData)
  .enter()
  .append("div")
  .style("display", "flex")
  .style("align-items", "center")
  .style("margin-bottom", "5px")
  .html(d => `<span style="display: inline-block; width: 20px; height: 20px; background-color: ${d.color}; margin-right: 10px;"></span>${d.label}`);

// Opening datasets
d3.csv("/MTA_Subway_Stations_20250331.csv").then((csvData) => {
  d3.json("/new-york-city-boroughs.json").then((jsonData) => {

    // Set up the map projection
    const projection = d3
      .geoAlbers()
      .scale(1)
      .translate([svg_width / 2, svg_height / 2])
      .fitExtent([[0, 0], [svg_width, svg_height]], jsonData);

    const path = d3.geoPath(projection);

    // Draw the borders of the map
    svg.selectAll("path")
      .data(jsonData.features)
      .enter()
      .append("path")
      .attr("d", path)
      .style("fill", "white")
      .style("stroke", "black")
      .style("opacity", 0.5);

    // Map subway ridership -- Attempt 1
    d3.csv("/Merged_Clean_Data.csv").then((merged_csv) => {
      csvData.forEach((d) => {
        d.latitude = +d["GTFS Latitude"];
        d.longitude = +d["GTFS Longitude"];
        
        const match = merged_csv.find(m => m["Stop Name"] === d["Stop Name"]);
        d.ridership = match ? match["2023_Ridership"] : "NONE";

        svg.append("circle")
          .attr("cx", projection([d.longitude, d.latitude])[0])
          .attr("cy", projection([d.longitude, d.latitude])[1])
          .attr("r", 3)
          .style("fill", "black")
          .style("opacity", 0.4)
          .on("mouseover", function (event) {
            tooltip
              .style("opacity", 1)
              .html(
                `<strong>${d["Stop Name"]}</strong><br/>Lat: ${d.latitude.toFixed(4)}<br/>Lon: ${d.longitude.toFixed(4)}`
              );
          })
          .on("mousemove", function (event) {
            tooltip
              .style("left", `${event.pageX + 10}px`)
              .style("top", `${event.pageY + 10}px`);
          })
          .on("mouseout", function () {
            tooltip.style("opacity", 0);
          });
      });

      // Draw pedestrian lines
      d3.csv("/Pedestrian_Demand.csv").then((lineData) => {
        const lineGenerator = d3.line()
          .x(d => projection(d)[0])
          .y(d => projection(d)[1]);

        lineData.forEach((d) => {
          let multilineStr = d.the_geom.replace("MULTILINESTRING ((", "").replace("))", "");
          const coordinatePairs = multilineStr.split(", ");
          const coords = coordinatePairs.map((pair) => {
            const [lon, lat] = pair.split(" ");
            return [+lon, +lat];
          });

          let color;
          if (d.Rank === "1") color = "orange";
          else if (d.Rank === "2") color = "yellow";
          else if (d.Rank === "3") color = "green";
          else if (d.Rank === "4") color = "blue";
          else if (d.Rank === "5") color = "gray";

          svg.append("path")
            .datum(coords)
            .attr("d", lineGenerator)
            .attr("fill", "none")
            .attr("stroke", color)
            .attr("stroke-width", 0.5)
            .attr("opacity", 0.5)
            .attr("class", `rank-line rank-${d.Rank}`)
            .on("mouseover", function (event) {
              d3.select(this)
                .attr("stroke-width", 3)
                .attr("opacity", 0.9);
              tooltip
                .style("opacity", 1)
                .style("background-color", color)
                .html(
                  `<strong>${d.street}</strong><br/>` +
                  (d.Rank === "1" ? "<br/><em>Global Corridor</em>" : "") 
                  + (d.Rank === "2" ? "<br/><em>Regional Corridor</em>" : "")
                  + (d.Rank === "3" ? "<br/><em>Neighborhood Corridor</em>" : "") 
                  + (d.Rank === "4" ? "<br/><em>Community Connector</em>" : "") 
                  + (d.Rank === "5" ? "<br/><em>Baseline Street</em>" : "") 
                );
            })
            .on("mousemove", function (event) {
              tooltip
                .style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY + 10}px`);
            })
            .on("mouseout", function () {
              tooltip.style("opacity", 0);
            });
        });
      });
    });

    // Plot top 20 stations -- Second attempt
    d3.csv("/Merged_Clean_Data.csv").then((top20) => {
      top20.forEach((e) => {
        e.latitude = +e["Latitude"];
        e.longitude = +e["Longitude"];

        svg.append("circle")
          .attr("cx", projection([e.longitude, e.latitude])[0])
          .attr("cy", projection([e.longitude, e.latitude])[1])
          .attr("r", 6)
          .style("fill", "black")
          .style("opacity", 0.8)
          .on("mouseover", function (event) {
            tooltip
              .style("opacity", 1)
              .html(
                `<strong>${e["Stop Name"]}</strong><br/>Lat: ${e.latitude.toFixed(4)}<br/>Lon: ${e.longitude.toFixed(4)}`
              );
          })
          .on("mousemove", function (event) {
            tooltip
              .style("left", `${event.pageX + 10}px`)
              .style("top", `${event.pageY + 10}px`);
          })
          .on("mouseout", function () {
            tooltip.style("opacity", 0);
          });
      });
    });
  });
});

// Function to toggle line visibility
function toggleLineVisibility(event, rank) {
  d3.selectAll(`.rank-line.rank-${rank}`)
    .style("display", event.target.checked ? "inline" : "none");
}

// Clickboxes to toggle the visibility of line ranks
const Viz2 = () => {
  return (
    <div className="viz2">
      <div id="filter-controls" style={{ textAlign: "center", marginBottom: "10px" }}>
        {[
          { rank: "1", label: "Global Corridor", color: "orange" },
          { rank: "2", label: "Major Corridor", color: "yellow" },
          { rank: "3", label: "Moderate Corridor", color: "green" },
          { rank: "4", label: "Minor Corridor", color: "blue" },
          { rank: "5", label: "Low Demand Corridor", color: "gray" }
        ].map(({ rank, label, color }) => (
          <label key={rank} style={{ marginRight: "15px", color: color }}>
            <input
              type="checkbox"
              defaultChecked
              value={rank}
              style={{ marginRight: "4px"}}
              onChange={(e) => toggleLineVisibility(e, rank)}
            />
            {label}
          </label>
        ))}
      </div>
    </div>
  );
}

export default Viz2;
