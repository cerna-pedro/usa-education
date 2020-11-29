const dataURL = `https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json`;

const pullData = async (url) => {
  const res = await fetch(url);
  const data = await res.json();
  return data;
};

const formatData = async (dataObject) => {
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
  console.log(data);
  const margin = {
    top: 50,
    left: 50,
    right: 50,
    bottom: 50,
  };
  const content = document.querySelector('.content');
  const svgContainer = document.querySelector('.svg-container');
  const footer = document.querySelector('.footer');
  const height = footer.offsetTop - svgContainer.offsetTop - margin.bottom;
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
    .attr('preserveAspectRatio', 'xMinYMin meet')
    .classed('svg-content', true)
    .style('background', 'white');

  console.log(data.map((entry) => entry.newTemperature));

  const x = d3
    .scaleBand()
    .range([margin.left, width - margin.right])
    .domain(data.map((entry) => entry.year));
  const y = d3
    .scaleBand()
    .range([height - margin.bottom, margin.top])
    .domain(data.map((entry) => entry.monthName))
    .padding(0.05);

  svg
    .append('g')
    .attr('transform', `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(x).tickSizeOuter(0));
  svg
    .append('g')
    .attr('transform', `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).tickSizeOuter(0));
};

createHeat();
