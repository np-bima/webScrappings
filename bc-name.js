const axios = require('axios');
const qs = require('qs');
const cheerio = require('cheerio');
const states = require('./states2.json');
const districts = require('./district.json');


async function scrapeBCName(bcId) {
    const data = qs.stringify({
        bcDetailById: 'yes',
        bcid: bcId
    });
    const config = {
        method: 'post',
        url: 'https://www.bcregistry.org.in/iba/ajax/getuploadcentre.jsp',
        headers: {
            Accept: '*/*',
            'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
            Connection: 'keep-alive',
            'Content-type': 'application/x-www-form-urlencoded',
            Cookie: 'JSESSIONID=6DB8539474C4C9009101EE4C9E8D9C8E; _ga=GA1.3.1783483784.1655271362; _gid=GA1.3.22551784.1655271362; _gat_gtag_UA_145116965_1=1; JSESSIONID=4F2AD24A05C91A11A68DC5CA11826502',
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
    const response = await axios.request(config);
    const $ = cheerio.load(response.data);
    const tableData = $('.table.table-hover.table-light.thead_label td:not([class])').map((index, ele) => $(ele).text());
    const s = cheerio.text(tableData);
    let res = '';
    for (let i = 0; i < tableData.length; i++) {
        res += `${tableData[i].trim()},`;
    }
    console.log(res);
}

module.exports = scrapeBCName;
