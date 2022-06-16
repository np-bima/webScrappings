const fs = require('fs');
const scrapeBCIds = require('./bc-id-scrape');
const states = require('./states2.json');
const districts = require('./district.json');
const scrapeBCName = require('./bc-name');

const cont = fs.readFileSync('./district-map');
const j = JSON.parse(cont.toString());

if (!fs.existsSync('./csvs')) {
    fs.mkdirSync('./csvs');
}

let time = 1000;
const r = Object.keys(states).map(async (state) => {
    const districtKeys = j[state];
    const stateName = states[state];
    const result = districtKeys.map((dis) => {
        console.log('calling for ', stateName);
        setTimeout(async () => {
            const distName = districts[dis];
            const result = await scrapeBCIds(state, dis);
            const resultDistBcs = result.bcIdArr;
            // Promise.all(resultDistBcs).then(async (res) => {
            //     const r = res[0];
            const bcDataPromise = resultDistBcs.map(r => new Promise((res, rej) => {
                time += 200;
                setTimeout(() => res(scrapeBCName(r)), time);
            }));
            const bcData = await Promise.all(bcDataPromise);
            const resultStr = bcData.join('\n');
            fs.appendFileSync(`./csvs/${stateName}-${distName}.csv`, resultStr);
            // });
        });
    });
});
