
const axios = require('axios');
const qs = require('qs');
const fs = require('fs');
const cheerio = require('cheerio');
const states = require('./states2.json');


const p = Object.keys(states).map(i => scrapeData(i));

const stateMap = {};
async function scrapeData(state) {
    const data = qs.stringify({
        districtList: 'yes',
        stateId: state
    });

    const config = {
        method: 'post',
        url: 'https://www.bcregistry.org.in/iba/ajax/getuploadcentre.jsp',
        headers: {
            Accept: '*/*',
            'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
            Connection: 'keep-alive',
            'Content-type': 'application/x-www-form-urlencoded',
            Cookie: 'JSESSIONID=92DEFB3681397C3EFAF18AB8B134046E; _ga=GA1.3.1783483784.1655271362; _gid=GA1.3.22551784.1655271362; _gat_gtag_UA_145116965_1=1; JSESSIONID=E85AF2584926BEAB365D05691DF4F1EB',
            Origin: 'https://www.bcregistry.org.in',
            Referer: 'https://www.bcregistry.org.in/iba/home/HomeAction.do?doBCPortal=yes',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36',
            'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="102", "Google Chrome";v="102"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"'
        },
        data
    };
    const resultStr = '';
    const response = await axios.request(config);
    const $ = cheerio.load(response.data);
    const values = $('option');
    const distArr = [];
    for (let i = 0; i < values.length; i++) {
        const val = values[i].attribs.value;
        val != -1 ? distArr.push(val) : '';
    }
    stateMap[state] = distArr;
    console.log(stateMap);
}

Promise.all(p).then((e) => {
    const str = JSON.stringify(stateMap);
    fs.writeFileSync('district-map', str);
});
