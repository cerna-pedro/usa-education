'use strict';

const dataURL = `https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json`;
const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const pullData = async (url) => {
  const res = await fetch(url);
  const data = await res.json();
  return data;
};

const formatData = async (dataObject) => {
  const data = await dataObject;
  const { baseTemperature } = data;
  return data.monthlyVariance.map((entry) => {
    return {
      baseTemperature,
      monthName: monthNames[entry.month - 1],
      ...entry,
      newTemperature: +(baseTemperature + entry.variance).toFixed(2),
    };
  });
};

const createHeat = async () => {
  const data = await formatData(pullData(dataURL));
  const margin = {
    top: 30,
    left: 100,
    right: 50,
    bottom: 140,
  };
  const content = document.querySelector('.content');
  const svgContainer = document.querySelector('.svg-container');
  const footer = document.querySelector('.footer');
  const height = footer.offsetTop - svgContainer.offsetTop - 60;
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
    .attr('preserveAspectRatio', 'none')
    .style('background', 'white');
  const xDomain = Array.from(new Set(data.map((entry) => entry.year)));
  const yRange = data.map((entry) => entry.month);
  const x = d3
    .scaleBand()
    .range([margin.left, width - margin.right])
    .domain(xDomain)
    .padding(0.05);
  const y = d3
    .scaleBand()
    .range([height - margin.bottom, margin.top])
    .domain(yRange)
    .padding(0.01);
  svg
    .append('g')
    .attr('id', 'x-axis')
    .attr('transform', `translate(0, ${height - margin.bottom})`)
    .call(
      d3
        .axisBottom(x)
        .tickValues(x.domain().filter((d) => d % 25 === 0))
        .tickSizeOuter(0)
    )
    .append('text')
    .attr('id', 'axis-label')
    .text('Year')
    .attr('x', (width + margin.left / 2) / 2)
    .attr('y', 40)
    .attr('alignment-baseline', 'middle');
  svg
    .append('g')
    .attr('id', 'y-axis')
    .attr('transform', `translate(${margin.left},0)`)
    .call(
      d3
        .axisLeft(y)
        .tickFormat((d) => monthNames[d - 1])
        .tickSizeOuter(0)
    )
    .append('text')
    .attr('id', 'axis-label')
    .text('Months')
    .attr('x', -height / 2 + 50)
    .attr('y', -margin.left / 2)
    .attr('transform', 'rotate(-90)');
  const temps = data.map((entry) => entry.newTemperature);
  const colorScale = d3
    .scaleSequential()
    .interpolator(d3.interpolateWarm)
    .domain(d3.extent(temps));
  svg
    .selectAll('rect')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'cell')
    .attr('x', (d) => x(d.year))
    .attr('y', (d) => y(d.month))
    .attr('width', x.bandwidth())
    .attr('height', y.bandwidth())
    .attr('data-year', (d) => d.year)
    .attr('data-month', (d) => d.month - 1)
    .attr('data-monthName', (d) => d.monthName)
    .attr('data-temp', (d) => d.newTemperature)
    .style('fill', (d) => colorScale(d.newTemperature))
    .on(
      'mouseover pointerover pointerenter pointerdown pointermove gotpointercapture',
      (e) => {
        tooltip.transition().duration(300).style('opacity', 0.9);
        tooltip.attr('data-year', `${e.target.dataset.year}`);
        tooltip
          .html(
            `
      <p>Year: ${e.target.dataset.year}</p>
      <p>Month: ${e.target.dataset.monthName}</p>
      <p>Temp: ${e.target.dataset.temp}°C</p>
          `
          )
          .style('position', 'absolute')
          .style('left', `${e.clientX - 80}px`)
          .style('top', `${e.clientY - 100}px`);
      }
    )
    .on(
      'mouseout pointerout pointerup pointercancel pointerleave lostpointercapture',
      () => {
        tooltip.transition().duration(500).style('opacity', 0);
      }
    );
  const legend = svg
    .append('g')
    .attr('id', 'legend')
    .attr(
      'transform',
      `translate(${margin.left},${margin.top + height - margin.bottom / 1.5})`
    );
  legend.append('text').attr('id', 'legend-title').text('Legend');
  const floor = Math.floor(d3.min(temps));
  const ceiling = Math.ceil(d3.max(temps) + 1);
  const legendArray = [...Array(ceiling).keys()].filter((x) => x >= floor);
  let sqSize = (width - margin.left - margin.right) / 14;
  sqSize = sqSize > 40 ? 40 : sqSize;
  const offset = 5;
  legend
    .selectAll(null)
    .data(legendArray)
    .enter()
    .append('rect')
    .attr('x', (d, i) => i * sqSize)
    .attr('y', offset)
    .attr('width', sqSize)
    .attr('height', sqSize)
    .style('fill', (d) => colorScale(d));
  legend
    .selectAll(null)
    .data(legendArray)
    .enter()
    .append('text')
    .attr('x', (d, i) => i * sqSize + sqSize / 2)
    .attr('y', sqSize + offset)
    .attr('alignment-baseline', 'hanging')
    .text((d, i) => `${d}°C`);
};

createHeat();
