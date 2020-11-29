const dataURL = `https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json`;

const pullData = async (url) => {
  const res = await fetch(url);
  const data = await res.json();
  return data;
};

const formatData = async (dataObject) => {
    const data = await dataObject
    console.log(data);
}

const createHeat = async () => {
    const data = await formatData(pullData(dataURL))
    console.log('hello world');
    const tooltip = d3
      .select('body')
      .append('div')
      .attr('id', 'tooltip')
      .style('opacity', 0);
}

createHeat()