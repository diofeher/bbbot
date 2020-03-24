const puppeteer = require('puppeteer');
const {
  config,
  links,
  credentials,
  xpaths,
  messages,
} = require("./config");
const { installMouseHelper } = require("./mouseHelper");
const fs = require("fs");
const {
  clickOnElement,
  getTextFromSelector,
  scrollToTop,
  revote,
  removeSponsor
} = require('./utils.js');
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
  scrollToTop(page);
  const participantes = await page.$$(xpaths.participants);

  await page.waitFor(config.waitClick);
  participantes[config.participantPosition - 1].click();

  const iconText = await getTextFromSelector(page)(xpaths.captchaTextClassName);
  const position = String(childProcess.execSync(`python3 compare_images.py "${iconText}"`)).trim();
  if(position === "None") {
    return
  }
  const captchaElem = await page.$(xpaths.captcha);

  console.log(`Get captcha: ${iconText} | Position: ${position}`);
  const x = config.captchaIndividualSize * position + config.captchaCenter;
  await page.waitFor(config.waitClick);
  await clickOnElement(page, captchaElem, x, config.captchaCenter);
  await page.waitFor(config.waitClick);

  try {
    const captchaError = document.getElementsByClassName(xpaths.captchaErrorMsg)[0].innerHTML;
    console.log('Captcha Response:', captchaError)
  } catch {
    // Vote computed!
  }

  await revote(page)(voteParticipant);
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
  }

  if (hookUrl.startsWith(links.captchaURL)) {
    const res = await response.json();
    const { symbol: icon, image } = res.data;
    console.log('Download captcha from URL:', icon);
    fs.writeFile(`images/${icon}.png`, image, "base64", (err) => {});
  }
}


(async () => {
    if(!credentials.username || !credentials.password) {
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
