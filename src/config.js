const links = {
  voteURL: 'https://gshow.globo.com/realities/bbb/bbb20/votacao/paredao-bbb20-quem-voce-quer-eliminar-daniel-flayslane-ou-ivy-91375481-6250-4583-b026-0e8b21c67a20.ghtml',
  globoLoginURL: "https://minhaconta.globo.com",
  captchaURL: "https://captcha.globo.com/api/challenge/generate",
  challengeAcceptedURL:
  "https://royale.globo.com/polls/",
};

const config = {
  participantPosition: process.env.PARTICIPANTE || 1,  // [1,2, 3] are the possible options.
  timeoutClick: 5 * 1000,  // in MS
  waitClick: 2 * 1000, // in milisseconds
  captchaCenter: 30,
  captchaIndividualSize: 53,
};

BASE_XPATH = "/html/body/div[2]/div[4]/div";
USER_XPATH = `${BASE_XPATH}/div[1]/div[4]/div[${config.participantPosition}]`;

const xpaths = {
  participants: '[class="HkYyhPWbPFN45MEcUG6p8"]',
  captcha: 'img[class="gc__3_EfD"]',
  voteAgain: '[class="_3viry_vXUhTU4nSnvn2iB_"]',
  reloadCaptcha: 'button[class="gc__1JSqe"]',
  captchaTextClassName: '.gc__2e8f-',
  captchaErrorMsg: '.gc__2b3Aq',
  user: USER_XPATH,
  buttonCaptcha:
  `${USER_XPATH}/div[2]/div/div/div[3]/button`,
  imgCaptcha:
  `${USER_XPATH}/div[1]/div[4]/div[2]/div[2]/div/div/div[2]/div/div[2]/img`,
  finishButton:
  `${BASE_XPATH}/div[3]/div/div/div[1]/div[2]/button`,
  finishText:
  `${BASE_XPATH}/div[3]/div/div/div[1]/div[1]/div[1]/span[1]`,
};

const messages = {
  wrongCaptcha: 'Símbolo errado, tente de novo',
  expiredCaptcha: 'O captcha anterior expirou.',
}

const credentials = {
  username: process.env.GLOBO_USERNAME,
  password: process.env.GLOBO_PASSWORD,
};

module.exports = {
  config,
  credentials,
  links,
  messages,
  xpaths
};
