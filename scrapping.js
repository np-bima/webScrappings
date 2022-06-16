const axios = require('axios');
const qs = require('qs');
const fs = require('fs');
const cheerio = require('cheerio');
//

const districts = require('./district.json');
const states = require('./states2.json');

async function scrapeData(state, district) {
    const data = qs.stringify({
        doBCPortal: 'yes',
        searchType: '1',
        currentPincode: '',
        bcRequestId: '',
        pincode: '',
        subDistrict: '',
        stateId: `${state}`,
        districtId: `${district}`,
        bankId: '-1',
        userName: '',
        userEmail: '',
        userMobile: '',
        remarks: '',
        cap_reg: ''
    });
    const config = {
        method: 'post',
        url: 'https://www.bcregistry.org.in/iba/home/HomeAction.do?doBCPortal=yes',
        headers: {
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
            'Cache-Control': 'max-age=0',
            Connection: 'keep-alive',
            'Content-Type': 'application/x-www-form-urlencoded',
            Cookie: 'JSESSIONID=7CA785901268B405591A49CE16534B48; _ga=GA1.3.1783483784.1655271362; _gid=GA1.3.22551784.1655271362; _gat_gtag_UA_145116965_1=1; JSESSIONID=81ADE51C899A995112A042A99098B4DA',
            Origin: 'https://www.bcregistry.org.in',
            Referer: 'https://www.bcregistry.org.in/iba/home/HomeAction.do?doBCPortal=yes',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Fetch-User': '?1',
            'Upgrade-Insecure-Requests': '1',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36',
            'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="102", "Google Chrome";v="102"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"'
        },
        data
    };
    let resultStr = '';
    const response = await axios.request(config);
    const $ = cheerio.load(response.data);
    const row = cheerio.text($('tr'));
    const result = row.split('\n').filter(r => r !== '' && r.trim().length !== 0);
    result.forEach((r, i) => {
        result[i] = r.split('+').map(r => r.trim()).join();
    });
    let count = 0;
    for (let i = 6; i < result.length; i += 5) {
        const str = result.slice(i, i + 5);
        resultStr += `\n${str.join(',')},<state${state}><district${district}>`;
        count++;
    }
    Object.keys(states).forEach((key) => {
        for (let i = 0; i < count; ++i) resultStr = resultStr.replace(`<state${key}>`, `, ${states[key]} `);
    });
    Object.keys(districts).forEach((key) => {
        for (let i = 0; i < count; ++i)resultStr = resultStr.replace(`<district${key}>`, `, ${districts[key]} `);
    });
    return resultStr;
}

function scrapeStart() {
    let time = 1000;
    const cont = fs.readFileSync('./district-map');
    const j = JSON.parse(cont.toString());

    const r = Object.keys(states).map(async (state) => {
        const myDist = j[state];
        const result = myDist.map((dis) => {
            console.log('calling for ', j[state], dis);
            time += 1000;
            return new Promise((res, rej) => {
                setTimeout(() => res(scrapeData(state, dis)), time);
            });
        });
        const districtResult = await Promise.all(result);
        return districtResult.join('\n');
    });

    Promise.all(r).then((res) => {
        const result = res.join('\n');
        fs.writeFileSync('my-final.csv', result);
    });
}

scrapeData(5, 6);
