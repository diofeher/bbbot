const { xpaths, config } = require("./config");
const childProcess = require('child_process');


const scrollToTop = async (page) => {
  await page.evaluate(_ => {
    window.scrollBy(0, -10000);
  });
};


const clickXPath = async (page, xpath) => {
  let handler = await page.$x(xpath);
  setTimeout(() => {
    handler[0].click();
  }, config.waitClick);
};


const clickOnElement = async (page, elem, x = null, y = null) => {
  const rect = await page.evaluate(el => {
      const { top, left, width, height } = el.getBoundingClientRect();
      return { top, left, width, height };
  }, elem);

  // // Use given position or default to center
  const _x = x ? x : rect.width / 2;
  const _y = y ? y : rect.height / 2;

  await page.mouse.click(rect.left + _x, rect.top + _y);
};

const revote = (page) => async (callback) => {
  console.log('Revoting!');
  await page.waitFor(3000);
  await page.waitForXPath(xpaths.finishText).then(async () => {
    const retryBtn = await page.$x(xpaths.finishButton);
    retryBtn[0].click();
    setTimeout(async () => {
      retryBtn[0].click();
    }, 500);
    setTimeout(async () => {
      await scrollToTop(page);
      setTimeout(async () => {
        await clickXPath(page, xpaths.user);
      }, 1000);
      setTimeout(async () => {
        await clickXPath(page, xpaths.user);
        const refreshBtn = await page.waitForXPath(
          xpaths.buttonCaptcha
        );
        refreshBtn.click();
        setTimeout(() => {
          refreshBtn.click();
          scrollToTop(page);
          callback(page);
        }, 200);
      }, 1000);
    }, 750);
  });
};


const removeSponsor = async (page) => {
  await page.evaluate((_) => {
    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML =
      '.tag-manager-publicidade-container { display: none; !important}';
    document.getElementsByTagName('head')[0].appendChild(style);
  });
};


const handleIconName = (text) => text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")


const getTextFromSelector = (page) => async (selector) => {
  const element = await page.waitFor(selector);
  return await page.evaluate((element) => element.innerText, element);
}


const getPythonInstallation = () => {
  try {
    childProcess.execSync(`python3 -c "print(1)"`);
    return 'python3';
  } catch {
    return 'python';
  }
}


module.exports = {
  clickXPath,
  clickOnElement,
  getPythonInstallation,
  getTextFromSelector,
  scrollToTop,
  revote,
  handleIconName,
  removeSponsor,
}
