const puppeteer = require('puppeteer');
const { links, credentials, xpaths, config } = require("./config");
const { installMouseHelper } = require("./mouseHelper");
const fs = require("fs");
const childProcess = require('child_process');

(async () => {
    const browser = await puppeteer.launch({
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        headless: false,
    });

    const page = await browser.newPage();
    await installMouseHelper(page);

    await page.goto(links.globoLoginURL);

    await page.waitForSelector('#login');

    await page.type('#login', credentials.username);
    await page.type('#password', credentials.password);

    await page.click('[class="button ng-scope"]');
    console.log('Logged in.')

    await page.goto(links.voteURL, {
        waitUntil: "networkidle2"
    });

    console.log('All resources loaded.')

    const participantes = await page.$$(xpaths.classNameParticipants);

    setTimeout(() => {
        participantes[config.participantPosition].click();
    }, config.timeoutClick);

    // await page.waitForSelector('[class="gc__1JSqe"]').then(async () => {
    //     let handler = await page.$$('[class="gc__1JSqe"]');
    //     setTimeout(() => {
    //         handler[0].click();
    //     }, config.timeoutClick);
    // });

    // await page.waitForSelector('[class="gc__3_EfD"]').then(async () => {
    //     let handler = await page.$$('[class="gc__3_EfD"]');
    //     setTimeout(() => {
    //         handler[0].focus();
    //     }, config.timeoutClick);
    // });

    page.on("response", async (response) => {
        let hookUrl = response.url();
        if (hookUrl.startsWith(links.captchaURL)) {
            let res = await response.json();
            let { symbol: icon, image } = res.data;
            console.log('Got captcha!', icon)
            fs.writeFileSync(`images/${icon}.png`, image, "base64");
            const position = childProcess.execSync(`python3 compare_images.py ${icon}`)
            console.log(position)
            console.log('Finished script.')
            // if (1==1) {
            //     await page.waitForSelector('[class="_3cp810UG2oJrLjwD0iAIT4 LFUON-QRwxEzPLM53nwdy"]');
            //     await page.evaluate(_ => {
            //         window.scrollBy(0, -500);
            //     });
            //     await page.waitFor(1000)
            //     await browser.close();

            // } else {
            //     let handler = await page.$$('[class="gc__1JSqe"]');
            //     setTimeout(() => {
            //         handler[0].click();
            //     }, 10);
            // }
        }
    });
})();
