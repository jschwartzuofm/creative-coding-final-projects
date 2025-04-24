import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './Viz3.css';
import { BackButton } from '../BackButton';

const Viz3 = () => {
  const containerRef = useRef(null);

  // d3.select('.viz3').selectAll('svg').remove();

  useEffect(() => {
    const container = d3.select(containerRef.current);
    container.selectAll('*').remove();

    //Setup: load the D3 library, sets the width and height to the brower's dimensions
    const w = '1000'; //window.innerWidth;
    const h = '800'; //window.innerHeight;

    // Create the SVG canvas
    const svg = container
      .append('svg')
        .attr('width', w)
        .attr('height', h);

    //Setup cont: Initial creation of the tooltip
    const tooltip = container
      .append('div')
        .attr('class', 'viz3-tooltip')
        .style('opacity', 0);
  
    // Load parks CSV, GeoJSON, and council stats CSV at the same time 
    Promise.all([
      //retrieves council disrict and acres from parks
      d3.csv('NYC_Parks.csv', d => ({
        district: d.COUNCILDISTRICT.trim(),
        acres: parseFloat(d.ACRES) || 0
      })),
      d3.json('council_districts.geojson'),
      d3.csv('council.csv', d => ({
        cd: d.cd,
        mhIncome: d.mhIncome === '' ? null : +d.mhIncome
      }))
    ]).then(([parks, districts, councilStats]) => {
      // Aggregate park acres by district so we have park acres and income per row 
      const acresByDistrict = d3.rollup(
        parks,
        v => d3.sum(v, d => d.acres),
        d => d.district
      );

      // Build a map so we can easily find an cd's income 
      const incomeMap = new Map(
        councilStats.map(d => [d.cd, d.mhIncome])
      );

      // Attach park acres & median income to each GeoJSON feature
      districts.features.forEach(f => {
        const cd = f.properties.coun_dist.toString().trim();
        f.properties.parkAcres = acresByDistrict.get(cd) || 0;
        f.properties.mhIncome  = incomeMap.get(cd)   ?? null;
      });

      // Compute tract area (in acres) so we can calculate park density (% of cd area that is parks)
      const R = 6371000;       // Earth's radius in meters
      const m2_per_acre = 4046.856; 
      districts.features.forEach(f => {
        const ster = d3.geoArea(f);             // This gives us the area in steridans
        const m2   = ster * R * R;              // here we convert it to meters
        const tractAcres = m2 / m2_per_acre;     // here we convert to acres
        f.properties.tractAreaAcres = tractAcres;
        f.properties.parkDensity = f.properties.parkAcres / tractAcres; //calculate % of land that is parks
      });

      // Projection & path generator (sets up how our data gets turned into screen coordinates and shapes)
      const projection = d3.geoMercator()
        .center([-74.00, 40.70])
        .scale(70000)
        .translate([w/2 - 150, h/2]);
      
      const path = d3.geoPath().projection(projection);

      // Create the color scale for park density
      const densities = districts.features.map(d => d.properties.parkDensity);
      const colorScale = d3.scaleSequential()
        .domain([d3.min(densities), d3.max(densities)])
        .interpolator(d3.interpolateYlGn);

      // Create the title
      svg.append('text')
        .attr('x', w / 2)
        .attr('y', 30)
        .attr('text-anchor', 'middle')
        .style('font-size', '20px')
        .style('font-weight', 'bold')
        .text('NYC Council Districts: Share of Land as Parkland');

      // Draw each district on the svg
      svg.append('g')
        .selectAll('path')
        .data(districts.features)
        .enter().append('path')
          .attr('d', path)
          .attr('fill', d => colorScale(d.properties.parkDensity))
          .style('stroke', '#444')
          .style('stroke-width', 0.5)
          .on('mouseover', (e, d) => {
            // highlight council districts where income is above the median of NYC
            const strokeColor = d.properties.mhIncome > 79713 ? 'red' : 'black';  //median income in NYC is 79,713
            d3.select(e.currentTarget)
              .style('stroke', strokeColor)
              .style('stroke-width', 2);

            tooltip.transition().duration(200).style('opacity', 1);
            tooltip.html(`
              <strong>District ${d.properties.coun_dist}</strong><br/>
              Park Density: ${(d.properties.parkDensity*100).toFixed(1)}%<br/>
              Median Income: ${
                d.properties.mhIncome != null
                  ? '$' + d.properties.mhIncome.toLocaleString()
                  : 'No data'
              }
            `)
            .style('left',  (e.pageX + 10) + 'px')
            .style('top',   (e.pageY - 28) + 'px');
          })
          .on('mousemove', e => {
            tooltip
              .style('left',  (e.pageX + 10) + 'px')
              .style('top',   (e.pageY - 28) + 'px');
          })
          .on('mouseout', (e) => {
            d3.select(e.currentTarget)
              .style('stroke', '#444')
              .style('stroke-width', 0.5);
            tooltip.transition().duration(200).style('opacity', 0);
          });

      // Create the legend 
      const defs = svg.append('defs');
      const gradient = defs.append('linearGradient')
        .attr('id', 'density-gradient')
        .attr('x1','0%').attr('y1','100%')
        .attr('x2','0%').attr('y2','0%');

      // Create gradient sections at equal intervals
      const stops = colorScale.ticks(6).map((t, i, arr) => ({
        offset: `${(i/(arr.length-1))*100}%`,
        color: colorScale(t)
      }));

      gradient.selectAll('stop')
        .data(stops)
        .enter().append('stop')
          .attr('offset', d => d.offset)
          .attr('stop-color', d => d.color);

      // Position the legend
      const legendWidth  = 20;
      const legendHeight = 200;
      const legendX = w - legendWidth - 200;
      const legendY = (h - legendHeight) / 2;

      const legendG = svg.append('g')
        .attr('transform', `translate(${legendX},${legendY})`);

      // Draw gradient rectangle
      legendG.append('rect')
        .attr('width', legendWidth)
        .attr('height', legendHeight)
        .style('fill', 'url(#density-gradient)')
        .attr('stroke', '#444');

      // Legend axis
      const legendScale = d3.scaleLinear()
        .domain(d3.extent(densities))
        .range([legendHeight, 0]);

      const legendAxis = d3.axisRight(legendScale)
        .tickFormat(d3.format('.0%'));
        // …after drawing legend axis
        legendG.append('g')
        .attr('transform', `translate(${legendWidth},0)`)
        .call(legendAxis)
        .select('.domain').remove();

      // ─Add income‐highlight note 
      const noteX = legendX - 400;               // move 150px left of legend
      const noteY = legendY + legendHeight + 200; 

      svg.append("text")
        .attr("x", noteX)
        .attr("y", noteY)
        .style("font-size", "16px")
        .style("fill", "#000")
        .text("*Red borders: districts with median income > $79,713 (NYC median)");
      });
  });

  return (
    <>
      <BackButton />
      <div ref={containerRef} className="viz3" />
    </>
  );
};

export default Viz3;
