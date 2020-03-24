const puppeteer = require('puppeteer');
const { links, credentials, xpaths, config } = require("./config");
const { installMouseHelper } = require("./mouseHelper");
const fs = require("fs");
const childProcess = require('child_process');


// Clicks on an element at position x,y
const clickOnElement = async (page, elem, x = null, y = null) => {
  const rect = await page.evaluate(el => {
      const { top, left, width, height } = el.getBoundingClientRect();
      return { top, left, width, height };
  }, elem);

  // // Use given position or default to center
  const _x = x !== null ? x : rect.width / 2;
  const _y = y !== null ? y : rect.height / 2;
  console.log('x', x, 'y', y);

  await page.mouse.click(rect.left + _x, rect.top + _y);
}

const login = async (page) => {
  page.goto(links.globoLoginURL);

  await page.waitForSelector('#login');

  await page.type('#login', credentials.username);
  await page.type('#password', credentials.password);

  await page.click('[class="button ng-scope"]');
  console.log('Logged in.');
}

const goToVotePage = async (page) => {
  await page.goto(links.voteURL, {
    // waitUntil: "networkidle2"
  });

  console.log('All resources loaded.');
  voteParticipant(page);
}

const reloadCaptcha = async (page) => {
  console.log('Reload Captcha.')
  await page.click(xpaths.reloadCaptcha)
}

const voteAgain = async (page) => {
  // TODO: Fix this function
  console.log('Vote Again.')
  await page.waitForSelector(xpaths.voteAgain, {visible: true});
  // setTimeout(async () => {
  // await page.click(xpaths.voteAgain);
  // await page.waitFor(2000);
  voteParticipant(page);
  // }, config.waitClick)
}

const voteParticipant = async (page) => {
  console.log('Vote participant.')
  const participantes = await page.$$(xpaths.participants);

  setTimeout(() => {
    participantes[config.participantPosition].click();
  }, config.waitClick);

  console.log('Clicked on participant box.');
}

const handleCaptcha = (page) => async (response) => {
  const hookUrl = response.url();
  if (hookUrl.startsWith(links.captchaURL)) {
    let res = await response.json();
    let { symbol: icon, image } = res.data;
    console.log('Got captcha!', icon);
    fs.writeFileSync(`images/${icon}.png`, image, "base64");
    const position = String(childProcess.execSync(`python3 compare_images.py "${icon}"`)).trim();
    const captchaElem = await page.$(xpaths.captcha);

    console.log('Get captcha position:', position)
    if(position === "None") {
        reloadCaptcha(page);
        return;
    }

    const x = config.captchaIndividualSize * position + 20;
    setTimeout(async () => {
      await clickOnElement(page, captchaElem, x, config.captchaY);
      await voteAgain(page);
    }, config.waitClick)

  }
}


(async () => {
    const browser = await puppeteer.launch({
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        headless: false,
    });

    const page = await browser.newPage();
    await installMouseHelper(page);

    await login(page);
    await goToVotePage(page);

    page.on("response", handleCaptcha(page));
})();
