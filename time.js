import dayjs from 'dayjs';
import isbetween from 'dayjs/plugin/isBetween.js';
import fs from 'fs';
import tData from './data.json' assert { type: 'json' };
import timeRange from './timeRange.json' assert { type: 'json' };

const { data, date } = tData;
dayjs.extend(isbetween);

const sum = arr => {
  return arr.reduce((a, b) => a + b, 0);
};

/*
* type: array;
* item: {
  time: [start, end],
  count: number,
}
*/
const result = [];
const parseTime = () => {
  const prefixDate = dayjs().format('YYYY-MM-DD');
  for (let i = 0; i < timeRange.length; ++i) {
    const [s, e] = timeRange[i];
    let min = Number.MAX_SAFE_INTEGER;
    let max = Number.MIN_SAFE_INTEGER;
    let dataStore = [];
    let dateStore = [];
    for (let j = 0; j < date.length; ++j) {
      if (
        dayjs(date[j]).isBetween(
          `${prefixDate} ${s}`,
          `${prefixDate} ${e}`,
          'min',
          '[]',
        )
      ) {
        min = Math.min(min, j);
        max = Math.max(max, j);
        dataStore.push(data[j]);
        dateStore.push(date[j]);
      }
    }
    const count = Math.round(sum(dataStore) / (max - min + 1));
    let itemCostTotal = 0;
    const cost = dataStore.map((item, ind) => {
      // doc: https://cloud.tencent.com/document/product/583/12285#.E9.A2.84.E7.BD.AE.E5.B9.B6.E5.8F.91.E9.97.B2.E7.BD.AE.E8.B4.B9.E7.94.A8, each scf has 1.5G memory in our case
      const itemCost =
        item >= count ? 0 : ((count - item) * 60 * 1.5 * 0.00005471).toFixed(3);
      itemCostTotal += Number(itemCost);
      return {
        time: dateStore[ind],
        concurrency: item,
        itemCost,
      };
    });

    result.push({
      time: [s, e],
      count,
      cost,
      itemCostTotal: itemCostTotal.toFixed(3),
    });
  }

  const costTotal = sum(result.map(item => Number(item.itemCostTotal)));

  fs.writeFileSync(
    './result.json',
    JSON.stringify({ costTotal: costTotal.toFixed(3), plan: result }, null, 2),
  );
  console.log('result in result.json');
};

parseTime();
