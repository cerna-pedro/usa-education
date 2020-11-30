const educationURL = `https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json`;

const countyURL = `https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json`;

const pullData = async (url) => {
  const res = await fetch(url);
  const data = await res.json();
  return data;
};

const createMap = async () => {
  const educationData = await pullData(educationURL)
  const countyData = await pullData(countyURL)
  console.log(educationData);
  console.log(countyData);
  const margin = {
    top: 50,
    left: 50,
    right: 50,
    bottom: 50,
  };
  const content = document.querySelector('.content');
  const svgContainer = document.querySelector('.svg-container');
  const footer = document.querySelector('.footer');
  const height = footer.offsetTop - svgContainer.offsetTop-25;
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

};

createMap();
