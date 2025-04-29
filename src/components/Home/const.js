export const VisualizationMap = {
  "Winter 2025": [
    {
      id: 'viz1',
      to: '/viz1',
      title: 'U.S. Population Migration: Where are people moving? 🏡 🏢 🌇',
      description: "For this project, we created an interactive U.S. migration map visualizing 2023 state-to-state migration flows. At first, when we saw the raw data, it didn’t really make much sense to us as we had to manually figure out state to state inflows/outflows. Our motivation was to make large-scale migration trends easy to explore at both a national and individual state level. We used D3.js with React to build the visualization, adding features like clickable states, animated tooltips, a color-coded migration scale, and a sortable table of state migration stats. We normalized and processed the migration dataset to ensure consistency across state names. A key design decision was making the map responsive and visually engaging while keeping interactions intuitive. In the future, we’d like to expand it by allowing users to select multiple states at once and view migration arcs between them over time, as well as including all years provided from census data, not just 2023. Additionally, even include a feature to help users understand why people are making the moves between states and using AI to answer specific questions (e.g. Why do Michigan residents move the most to Florida of all states?)",
      authors: [
        {
          name: "Aditya Nimbalkar (B.S. Urban Tech '26)",
          link: "https://umich.edu"
        },
        {
          name: "Owen Sims (B.S. Urban Tech '25)",
          link: "https://umich.edu"
        }
      ]
    },
    {
      id: 'viz2',
      to: '/viz2',
      title: 'Identifying Pedestrian Corridors based on Subway Ridership in NYC 🚇 🚉 🚂',
      description: "Map of NYC with overlays for pedestrian traffic (represented by colored line data) and subway stations (the top 20 stations by ridership are larger, darker dots)",
      authors: [
        {
          name: "Breandan Cullen (B.S. Urban Tech '26)",
          link: "https://umich.edu"
        },
        {
          name: "Yichen Hu (B.S. Urban Tech '25)",
          link: "https://umich.edu"
        },
        {
          name: "Matthew Kish (B.S. Urban Tech '25)",
          link: "https://umich.edu"
        },
      ]
    },
    {
      id: 'viz3',
      to: '/viz3',
      title: 'Green space access in NYC vs. Median Household Income 🌳 🌲 🌞',
      description: "Our project centered on visualizing green space access in New York City across council districts with median income. We built an interactive choropleth of NYC council districts, visualizing the percentage of each district that was dedicated to parks (park acres ÷ district area/acres) with a green color scale. We used three datasets, one on parks, and one on council districts' median income plus GeoJSON boundaries. We aggregated and joined the data, computed each tract’s total land area and % park coverage, to then create an SVG map with tooltips showing median household income and park coverage. To aid with readability we added a red highlight around council districts when you hover on a district if the median income is above NYC's overall median household income of $79,713.",
      authors: [
        {
          name: "Emma Moore (B.S. Urban Tech '25)",
          link: "https://umich.edu"
        },
        {
          name: "Isabella Kressaty (B.S. Urban Tech '25)",
          link: "https://umich.edu"
        }
      ]
    },
    {
      id: 'viz4',
      to: '/viz4',
      title: 'Analyzing Subway Ticket Fare Equity of Across Brooklyn 🚇 👵 👨‍🦳',
      description: 'Motivated by the ongoing conversation about the price of public transit, and the growing hostility towards fare evasion, our project explored fare equity in NYC’s subway system. We narrrowed our focus to Brooklyn in October 2024 -- a month that had relatively high ridership and few public holidays -- due to technical and time constraints. Using MTA ticket scan data and geoJSONs of subway lines and zip codes, we visualized ticket types per station and the share of reduced vs. full-fare riders by zip code. Designed for quick insight, the map highlights fare distribution patterns at a glance. Future versions could incorporate income data, extend the timeframe, include other boroughs, and feature filters to reduce the risk of information overload.',
      authors: [
        {
          name: "Odiso Obiora (B.S. Urban Tech '25)",
          link: "https://umich.edu"
        },
        {
          name: "Jenna Li (B.S. Urban Tech '25)",
          link: "https://umich.edu"
        }
      ]
    }
  ],
  "Fall 2023": [],
}

