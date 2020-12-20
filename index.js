const puppeteer = require('puppeteer');
const fs = require('fs');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
    const mainjs = fs.readFileSync("./main.js", { encoding: 'utf8', flag: 'r' });

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: {
            width: 1024,
            height: 768,
        }
    });

    const page = await browser.newPage();

    await page.setRequestInterception(true);
    page.on('request', interceptedRequest => {
        if (interceptedRequest.url().endsWith('main.js')) {
            interceptedRequest.respond({
                content: 'text/javascript',
                body: mainjs
            })
        } else {
            interceptedRequest.continue();
        }
    });

    let url = 'https://test.visit.at.wa-test.rc3.cccv.de/_/global/raw.githubusercontent.com/deepestcyber/rC3-world/master/maps/map.json';
    await page.goto(
        url,
        { waitUntil: "networkidle0" }
    );

    await page.mouse.move(100, 100);
    await page.mouse.down();

    await page.keyboard.type('X Ae A-Xii', { delay: 100 });

    await page.keyboard.type(String.fromCharCode(13));

    await sleep(500);
    await page.keyboard.type(String.fromCharCode(13));

    await sleep(500);
    await page.keyboard.type(String.fromCharCode(13));

    // await browser.close();
})();