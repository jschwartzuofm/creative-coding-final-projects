import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Flex, Heading } from '@chakra-ui/react';
import './Viz1.css';
import { BackButton } from '../BackButton';
import { AboutDrawer } from '../AboutDrawer';

const normalizeName = (n) => n?.trim().toLowerCase();
const recaseName = (n) =>
  n
    .toLowerCase()
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

const Viz1 = () => {
  const svgRef = useRef();
  const tooltipRef = useRef();
  const legendRef = useRef();
  const [migrationData, setMigrationData] = useState({});
  const [selectedState, setSelectedState] = useState(null);
  const [topDestinations, setTopDestinations] = useState([]);
  const [migrationMode, setMigrationMode] = useState('outbound');
  const [showAllStates, setShowAllStates] = useState(false);
  const [allStatesData, setAllStatesData] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: 'netChange',
    direction: 'desc'
  });


  const selectedRef = useRef(selectedState);
  useEffect(() => {
    selectedRef.current = selectedState;
  }, [selectedState]);


  const calculateInboundMigration = (targetState) => {
    const inboundData = {};
    Object.entries(migrationData).forEach(([origin, destinations]) => {
      if (destinations[targetState]) {
        inboundData[origin] = destinations[targetState];
      }
    });
    return inboundData;
  };


  const updateTopLocations = (state) => {
    if (!state || !migrationData[state]) return;
    
    if (migrationMode === 'outbound') {
      const data = migrationData[state] || {};
      setTopDestinations(
        Object.entries(data)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
      );
    } else {
      const inboundData = calculateInboundMigration(state);
      setTopDestinations(
        Object.entries(inboundData)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
      );
    }
  };


  useEffect(() => {
    if (selectedState) {
      updateTopLocations(selectedState);
    }
  }, [selectedState, migrationMode, migrationData]);


  useEffect(() => {
    const w = window.innerWidth * 0.6;
    const h = window.innerHeight * 0.8;
    const projection = d3.geoAlbersUsa().scale(w * 1.1).translate([w/2, h/2]);
    const path = d3.geoPath().projection(projection);
    const svg = d3.select(svgRef.current).attr('width', w).attr('height', h);
    const tooltip = d3.select(tooltipRef.current);

    Promise.all([
      d3.json('/usMapData.json'),
      d3.json('/state_migration_data_2023.json')
    ]).then(([usMap, migration]) => {
      const raw = migration['2023'];
      const normData = {};
      Object.entries(raw).forEach(([o, dests]) => {
        const no = normalizeName(o);
        normData[no] = {};
        Object.entries(dests).forEach(([d, v]) => {
          normData[no][normalizeName(d)] = v;
        });
      });
      setMigrationData(normData);

      svg.selectAll('path')
        .data(usMap.features)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('fill', '#333')
        .attr('stroke', '#1e1e1e')
        .attr('stroke-width', 0.7)
        .on('click', (e, d) => {
          const ns = normalizeName(d.properties.NAME);
          setSelectedState(ns);
        })
        .on('mouseover', (e, d) => {
          const hn = normalizeName(d.properties.NAME);
          if (hn === selectedRef.current) {
            tooltip.style('visibility','hidden')
                   .classed('visible', false);
            return;
          }
          const display = recaseName(d.properties.NAME);
          
          tooltip
            .style('visibility','visible')
            .classed('visible', true)
            .html(display);
        })
        .on('mousemove', (e) => {
          tooltip
            .style('top', `${e.pageY - 40}px`)
            .style('left', `${e.pageX + 15}px`);
        })
        .on('mouseout', () => {
          tooltip.style('visibility','hidden')
                 .classed('visible', false);
        });
    });
  }, []);


  useEffect(() => {
    if (!selectedState || !migrationData[selectedState]) return;
    const svg = d3.select(svgRef.current);
    
    let values;
    if (migrationMode === 'outbound') {
      values = Object.values(migrationData[selectedState]);
    } else {
      const inboundData = calculateInboundMigration(selectedState);
      values = Object.values(inboundData);
    }
    
    const max = d3.max(values) || 1;
    const colorScale = d3.scaleLinear()
      .domain([0, max])
      .range(['#2c7fb8','#081d58']);

    svg.selectAll('path')
      .transition()
      .duration(500)
      .ease(d3.easeCubicOut)
      .attr('fill', d => {
        const nn = normalizeName(d.properties.NAME);
        let v;
        if (migrationMode === 'outbound') {
          v = migrationData[selectedState][nn] || 0;
        } else {
          v = migrationData[nn]?.[selectedState] || 0;
        }
        return nn === selectedState ? '#ff4c4c' : colorScale(v);
      })
      .attr('stroke-width', d => {
        const nn = normalizeName(d.properties.NAME);
        return nn === selectedState ? 1.5 : 0.7;
      });


    const legendSvg = d3.select(legendRef.current).selectAll('*').remove() && d3.select(legendRef.current);
    const defs = legendSvg.append('defs');
    const grad = defs.append('linearGradient')
      .attr('id','mig-grad')
      .attr('gradientUnits', 'userSpaceOnUse');

    grad.selectAll('stop')
      .data(['#2c7fb8', '#081d58'])
      .enter()
      .append('stop')
      .attr('offset', (d, i) => i * 100 + '%')
      .attr('stop-color', d => d)
      .style('transition', 'stop-color 0.5s ease-out');

    legendSvg.append('rect')
      .attr('width', 200)
      .attr('height', 10)
      .attr('fill', 'url(#mig-grad)')
      .style('opacity', 0)
      .transition()
      .duration(500)
      .style('opacity', 1);

    const scale = d3.scaleLinear()
      .domain([0, max])
      .range([0, 200]);

    legendSvg.append('g')
      .attr('transform', 'translate(0,10)')
      .style('opacity', 0)
      .transition()
      .duration(500)
      .delay(200)
      .style('opacity', 1)
      .call(d3.axisBottom(scale).ticks(4).tickFormat(d3.format('.2s')))
      .selectAll('text')
      .style('fill', '#fff');

  }, [selectedState, migrationData, migrationMode]);


  const calculateAllStatesData = () => {
    const data = Object.keys(migrationData).map(state => {
      let outbound = 0;
      let inbound = 0;


      outbound = Object.values(migrationData[state] || {})
        .reduce((sum, val) => sum + val, 0);


      Object.entries(migrationData).forEach(([origin, destinations]) => {
        if (destinations[state]) {
          inbound += destinations[state];
        }
      });

      return {
        state,
        outbound,
        inbound,
        netChange: inbound - outbound
      };
    });


    return data.sort((a, b) => Math.abs(b.netChange) - Math.abs(a.netChange));
  };


  useEffect(() => {
    if (Object.keys(migrationData).length > 0) {
      setAllStatesData(calculateAllStatesData());
    }
  }, [migrationData]);


  const sortData = (data, config) => {
    const sortedData = [...data];
    sortedData.sort((a, b) => {
      if (config.key === 'state') {
        return config.direction === 'asc' 
          ? a.state.localeCompare(b.state)
          : b.state.localeCompare(a.state);
      }
      return config.direction === 'asc'
        ? a[config.key] - b[config.key]
        : b[config.key] - a[config.key];
    });
    return sortedData;
  };


  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: 
        prevConfig.key === key && prevConfig.direction === 'desc' 
          ? 'asc' 
          : 'desc'
    }));
  };


  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'desc' ? ' ↓' : ' ↑';
    }
    return '';
  };

  return (
    <>
    <BackButton />
    <div className="viz1">
      <Flex className="viz1-header">
        <Heading size="2xl" marginRight="1rem" color="black">
          U.S. Population Migration Map (2023)
        </Heading>
        <AboutDrawer semester="Winter 2025" id="viz1" />
      </Flex>
      <div className="map-sidebar-container">
        <div className="map-container">
          <svg ref={svgRef}></svg>
          <div ref={tooltipRef} className="viz1-tooltip"></div>
        </div>
        <div className="sidebar-card">
          {selectedState ? (
            <>
              <h3>{recaseName(selectedState)}</h3>
              <div className="mode-toggle">
                <button 
                  className={migrationMode === 'outbound' ? 'active' : ''}
                  onClick={() => setMigrationMode('outbound')}
                >
                  Outbound
                </button>
                <button 
                  className={migrationMode === 'inbound' ? 'active' : ''}
                  onClick={() => setMigrationMode('inbound')}
                >
                  Inbound
                </button>
              </div>
              <h4>Top 5 {migrationMode === 'outbound' ? 'Destinations' : 'Origins'}</h4>
              <ul>
                {topDestinations.map(([st,c],i) => (
                  <li key={i}>
                    {i+1}. {recaseName(st)} — <strong>{c.toLocaleString()}</strong>
                  </li>
                ))}
              </ul>
              <h4 style={{marginTop:'20px'}}>Migration Scale</h4>
              <svg ref={legendRef} width={200} height={30}></svg>
              <div className="button-group">
                <button 
                  className="view-all-button"
                  onClick={() => setShowAllStates(true)}
                >
                  View All States
                </button>
                <button 
                  className="reset-button"
                  onClick={() => {
                    setSelectedState(null);
                    setTopDestinations([]);
                    d3.select(svgRef.current)
                      .selectAll('path')
                      .transition()
                      .duration(500)
                      .attr('fill', '#333')
                      .attr('stroke-width', 0.7);
                  }}
                >
                  Reset Map
                </button>
              </div>
            </>
          ) : (
            <div className="initial-state">
              <h3>Select a State</h3>
              <p>Click on any state to view its migration data</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal for All States View */}
      {showAllStates && (
        <div className="modal-overlay" onClick={() => setShowAllStates(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>State Migration Summary (2023)</h2>
              <button className="close-button" onClick={() => setShowAllStates(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="table-header">
                <div 
                  className="rank-col header-cell"
                  onClick={() => handleSort('rank')}
                >
                  Rank{getSortIndicator('rank')}
                </div>
                <div 
                  className="state-col header-cell"
                  onClick={() => handleSort('state')}
                >
                  State{getSortIndicator('state')}
                </div>
                <div 
                  className="number-col header-cell"
                  onClick={() => handleSort('outbound')}
                >
                  Outbound{getSortIndicator('outbound')}
                </div>
                <div 
                  className="number-col header-cell"
                  onClick={() => handleSort('inbound')}
                >
                  Inbound{getSortIndicator('inbound')}
                </div>
                <div 
                  className="number-col header-cell"
                  onClick={() => handleSort('netChange')}
                >
                  Net Change{getSortIndicator('netChange')}
                </div>
              </div>
              <div className="states-list">
                {sortData(allStatesData, sortConfig).map(({state, outbound, inbound, netChange}, index) => (
                  <div key={state} className="state-row">
                    <div className="rank-col">{index + 1}</div>
                    <div className="state-col">{recaseName(state)}</div>
                    <div className="number-col">{outbound.toLocaleString()}</div>
                    <div className="number-col">{inbound.toLocaleString()}</div>
                    <div className={`number-col ${netChange > 0 ? 'positive' : netChange < 0 ? 'negative' : ''}`}>
                      {netChange > 0 ? '+' : ''}{netChange.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </>
  );
}

export default Viz1;
