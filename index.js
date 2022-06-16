const fs = require('fs');
const scrapeBCIds = require('./bc-id-scrape');
const states = require('./states2.json');
const districts = require('./district.json');
const scrapeBCName = require('./bc-name');

const cont = fs.readFileSync('./district-map');
const j = JSON.parse(cont.toString());
let time = 1000;
const r = Object.keys(states).map(async (state) => {
    const myDist = j[state];
    const result = myDist.map((dis) => {
        console.log('calling for ', states[state], districts[dis]);
        time += 1000;
        return new Promise((res, rej) => {
            setTimeout(() => res(scrapeBCIds(state, dis)), time);
        });
    });
    const districtResult = await Promise.all(result);
    return districtResult.map(o => o.bcIdArr).flat();
});

Promise.all(r).then((res) => {
    const r = res[0];
    r.map(r => scrapeBCName(r));
});
