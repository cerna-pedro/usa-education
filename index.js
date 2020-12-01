'use strict';

const educationURL = `https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json`;
const countyURL = `https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json`;

const pullData = async (url) => {
  const res = await fetch(url);
  const data = await res.json();
  return data;
};

const createMap = async () => {
  const educationData = await pullData(educationURL);
  let countyData = await pullData(countyURL);
  const counties = topojson.feature(countyData, countyData.objects.counties);
  const states = topojson.mesh(countyData, countyData.objects.states);
  countyData = counties.features.map((county) => {
    const educationForThisCounty = educationData.find(
      (x) => x.fips === county.id
    );
    return { ...county, education: educationForThisCounty };
  });
  const extentOfEducation = d3.extent(
    countyData.map((entry) => entry.education.bachelorsOrHigher)
  );
  const margin = {
    top: 50,
    left: 50,
    right: 50,
    bottom: 50,
  };
  const content = document.querySelector('.content');
  const svgContainer = document.querySelector('.svg-container');
  const footer = document.querySelector('.footer');
  const height = footer.offsetTop - svgContainer.offsetTop - 25;
  const width = content.clientWidth;
  const tooltip = d3
    .select('body')
    .append('div')
    .attr('id', 'tooltip')
    .style('opacity', 0);
  const svg = d3
    .select('.svg-container')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'none');
  const g = svg.append('g');
  svg.call(
    d3.zoom().on('zoom', (e) => {
      g.attr('transform', e.transform);
    })
  );
  const projection = d3.geoIdentity().fitExtent(
    [
      [margin.left, 0],
      [width - margin.right, height],
    ],
    counties
  );
  const pathGenerator = d3.geoPath().projection(projection);
  const minEducation = d3.min(extentOfEducation);
  const maxEducation = d3.max(extentOfEducation);
  let colorDomain = d3.range(
    minEducation,
    maxEducation,
    (maxEducation - minEducation) / 8
  );
  colorDomain = colorDomain.map((num) => Math.floor(num));
  const colorScale = d3
    .scaleThreshold()
    .domain(colorDomain)
    .range(d3.schemeBlues[9]);
  g.append('g')
    .selectAll('path')
    .data(countyData)
    .enter()
    .append('path')
    .attr('class', 'county')
    .attr('d', pathGenerator)
    .attr('data-fips', (d) => d.education.fips)
    .attr('data-education', (d) => d.education.bachelorsOrHigher)
    .attr('data-areaName', (d) => d.education.area_name)
    .attr('data-state', (d) => d.education.state)
    .attr('fill', (d) => colorScale(d.education.bachelorsOrHigher))
    .on(
      'mouseover pointerover pointerenter pointerdown pointermove gotpointercapture touchstart touchmove',
      (e) => {
        tooltip.transition().duration(300).style('opacity', 0.9);
        tooltip.attr('data-education', `${e.target.dataset.education}`);
        tooltip
          .html(
            `
      <p>${e.target.dataset.areaName}, ${e.target.dataset.state}: ${e.target.dataset.education}%</p>
          `
          )
          .style('position', 'absolute')
          .style('left', `${e.clientX - 100}px`)
          .style('top', `${e.clientY - 60}px`);
      }
    )
    .on(
      'mouseout pointerout pointerup pointercancel pointerleave lostpointercapture touchend',
      () => {
        tooltip.transition().duration(500).style('opacity', 0);
      }
    );
  g.append('path').attr('class', 'state').attr('d', pathGenerator(states));
  const sqSize =
    (width - margin.left - margin.right) / colorScale.domain().length > 40
      ? 40
      : (width - margin.left - margin.right) / colorScale.domain().length;
  const offset = 5;
  const legend = svg
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)
    .attr('id', 'legend');
  legend
    .append('rect')
    .attr('id', 'legend-background')
    .attr('x', -sqSize / 2)
    .attr('y', -sqSize)
    .attr('width', colorScale.domain().length * sqSize + sqSize)
    .attr('height', 3 * sqSize)
    .attr('rx', sqSize / 4)
    .attr('fill', 'white');
  legend.append('text').text('LEGEND');
  legend
    .selectAll(null)
    .data(colorScale.domain())
    .enter()
    .append('rect')
    .attr('id', 'legend-symbol')
    .attr('x', (d, i) => i * sqSize)
    .attr('y', offset)
    .attr('width', sqSize)
    .attr('height', sqSize)
    .attr('fill', (d) => colorScale(d));
  legend
    .selectAll(null)
    .data(colorScale.domain())
    .enter()
    .append('text')
    .text((d) => `${d}%`)
    .attr('id', 'legend-text')
    .attr('x', (d, i) => i * sqSize)
    .attr('y', (d, i) => 2 * offset + sqSize)
    .attr('alignment-baseline', 'hanging');
  legend
    .selectAll(null)
    .data(colorScale.domain())
    .enter()
    .append('path')
    .attr(
      'd',
      (d, i) =>
        `M ${i * sqSize} ${offset} L ${i * sqSize} ${sqSize + offset * 1.5}`
    )
    .attr('stroke', 'black')
    .attr('id', 'legend-strokes')
    .attr('x', (d, i) => i * sqSize)
    .attr('y', (d, i) => 2 * offset + sqSize);
};

createMap();
