const links = {
  voteURL: 'https://gshow.globo.com/realities/bbb/bbb20/votacao/paredao-bbb20-quem-voce-quer-eliminar-daniel-flayslane-ou-ivy-91375481-6250-4583-b026-0e8b21c67a20.ghtml',
  globoLoginURL: "https://minhaconta.globo.com",
  captchaURL: "https://captcha.globo.com/api/challenge/generate"
};

const xpaths = {
  classNameParticipants: '[class="HkYyhPWbPFN45MEcUG6p8"]',
};

const credentials = {
  username: process.env.GLOBO_USERNAME,
  password: process.env.GLOBO_PASSWORD,
};

const config = {
  participantPosition: 0,  // [0,1,2] are the possible options.
  timeoutClick: 1 * 1000,  // in MS
};

module.exports = { config, credentials, links, xpaths };
