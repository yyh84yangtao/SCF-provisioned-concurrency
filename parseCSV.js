import fsp from 'fs/promises';
import path from 'path';
import dayjs from 'dayjs';

const parseCSV = async () => {
  try {
    const files = await fsp.readdir('./resources/');
    // we need to add a date-prefix for the chart
    const prefixDate = dayjs().format('YYYY-MM-DD');
    let currData = [];
    let timeData = [];
    for (const file of files) {
      const csvData = (await fsp.readFile(path.resolve(process.cwd(), 'resources', file)))
        .toString()
        .split('\n');
      for (let i = 0; i < csvData.length; ++i) {
        const lineData = csvData[i].split(',');
        currData[i] = (currData[i] === undefined ? 0 : currData[i]) + Number(lineData[1]);
        const hour = dayjs(lineData[0]).hour();
        const minute = dayjs(lineData[0]).minute();
        timeData[i] = `${prefixDate} ${hour}:${minute}`;
      }
    }
    currData = currData.map(item => parseInt(item / files.length));
    await fsp.writeFile(
      path.resolve(process.cwd(), 'data.json'),
      JSON.stringify(
        {
          date: timeData.slice(1),
          data: currData.slice(1),
        },
        null,
        2
      )
    );
    console.log('generate date and request data in data.json');
  } catch (e) {
    console.log('parse resources data error: ', e);
  }
};

parseCSV();
