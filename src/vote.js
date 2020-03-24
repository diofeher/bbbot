const puppeteer = require('puppeteer');
const { links, credentials, xpaths, config } = require("./config");
const { installMouseHelper } = require("./mouseHelper");
const fs = require("fs");
const { clickOnElement, scrollToTop, revote, removeSponsor } = require('./utils.js');
const childProcess = require('child_process');


const login = async (page) => {
  page.goto(links.globoLoginURL, {
    waitUntil: "networkidle2"
  });

  await page.waitForSelector('#login');

  await page.type('#login', credentials.username);
  await page.type('#password', credentials.password);

  await page.click('[class="button ng-scope"]');
  console.log('Logged in.');
}


const goToVotePage = async (page) => {
  await page.goto(links.voteURL, {
    waitUntil: "networkidle2"
  });
  await removeSponsor(page);
  voteParticipant(page);
}


const reloadCaptcha = async (page) => {
  console.log('Reload Captcha.');
  await page.click(xpaths.reloadCaptcha)
}


const voteParticipant = async (page) => {
  console.log('Vote participant.');
  scrollToTop(page);
  const participantes = await page.$$(xpaths.participants);

  await page.waitFor(config.waitClick);
  participantes[config.participantPosition].click();
}

let voteCounter = 0;

const handleCaptcha = (page) => async (response) => {
  const hookUrl = response.url();
  const statusCode = response.status();
  const request = response.request();

  if (hookUrl.startsWith(links.challengeAcceptedURL) &&
    parseInt(statusCode) === 200 &&
    request.method() === "POST"
  ) {
    voteCounter++;
    console.log("Votos computados: " + voteCounter);
    await revote(page);
  }

  if (hookUrl.startsWith(links.captchaURL)) {
    const res = await response.json();
    const { symbol: icon, image } = res.data;
    fs.writeFileSync(`images/${icon}.png`, image, "base64");
    const position = String(childProcess.execSync(`python3 compare_images.py "${icon}"`)).trim();
    const captchaElem = await page.$(xpaths.captcha);

    console.log(`Get captcha: ${icon} | Position: ${position}`);

    if(position === "None") {
      console.log('Doesn\'t recognize image, reloading the captcha.');
      reloadCaptcha(page);
      return;
    }

    const x = config.captchaIndividualSize * position + config.captchaCenter;

    await page.waitFor(config.waitClick);
    await clickOnElement(page, captchaElem, x, config.captchaCenter);
  }
}


(async () => {
    if(!credentials.username) {
      console.log('You need to export the env variables with your username and password.')
      process.exit()
    }

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
