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
  clickXPath,
  getTextFromSelector,
  scrollToTop,
  revote,
  handleIconName,
  getPythonInstallation,
  removeSponsor
} = require('./utils.js');
const childProcess = require('child_process');

const PYTHON_CMD = getPythonInstallation();


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

const runOpenCV = (iconText) => String(childProcess.execSync(`${PYTHON_CMD} compare_images.py "${iconText}"`)).trim();


const goToVotePage = async (page) => {
  await page.goto(links.voteURL, {
    waitUntil: "networkidle2"
  });
  await removeSponsor(page);
  voteParticipant(page);
}


const reloadCaptcha = async (page) => {
  console.log('Reload Captcha.', xpaths.reloadCaptcha);
  clickXPath(page, xpaths.reloadCaptcha);
}


const voteParticipant = async (page) => {
  scrollToTop(page);
  clickXPath(page, xpaths.user);

  let iconText = await getTextFromSelector(page)(xpaths.captchaTextClassName);
  let position = runOpenCV(iconText)
  console.log('First Captcha:', iconText, position);

  if(position === "None") {
    while (position === "None") {
      reloadCaptcha(page);
      iconText = await getTextFromSelector(page)(xpaths.captchaTextClassName);
      position = runOpenCV(iconText)
      console.log(`Get captcha: ${iconText} | Position: ${position}`);
    }
  }

  console.log('Pegando captcha.')
  const captchaElem = await page.$(xpaths.captcha);
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
    fs.writeFile(`images/${handleIconName(icon)}.png`, image, "base64", (err) => {});
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
