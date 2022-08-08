import ext from "../utils/ext"
import storage from "../utils/storage"

const LANGUAGE = window.navigator.language;   
const REGEX = "a[href*='#'],a[href*='/business/help'],a[href*='/ads/']";
const REGEX2 = "[role] div:nth-child(3) div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(2) .knvmm38d:nth-of-type(2) [dir]"
const REGEX3 = "[aria-labelledby*='jsc_c_'] .ihxqhq3m.sdhka5h4:nth-of-type(1)"
const REGEX4 = "a[href*='#'] > span > span[aria-labelledby*='jsc_'], a[href*='/business/help']"
const REGEX5 = "[role] .a8c37x1j:nth-child(3) .knvmm38d:nth-of-type(2) [role]"

let sentAds = [];
let countOfNoAds = 0;

const hashCode = (string) => {
  var h = 0, l = string.length, i = 0;
  if ( l > 0 )
    while (i < l)
    h = (h << 5) - h + string.charCodeAt(i++) | 0;
  return h;
}

const uuidv4 = () => {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

const getAccountNAme = (ad) => {
  let outerText = ad && ad.outerText ? ad.outerText : null;
  let accountName = outerText && outerText.startsWith('Activo') ? outerText.split('\n')[1].trim() : outerText.split('\n')[0].trim();
  return accountName
}

const PUBLICIDAD = 'Publicidad'
const SPONSORED = 'Sponsored'
const PATROCINADO = 'Patrocinado'

const sponsoredWords = [
  'Publicidad',
  'Sponsored',
  'Patrocinado'
]

const collabWords = [
  'Colaboración pagada',
  'Paid Partnership',
  'Parceria paga'
]

const executeAds = (ads, m) => {
  const userid = m["pub_elec_userid"];
  for (let index = 0; index < ads.length; index++) {
    const ad = ads[index];
    if (ad) {
      sendAd({
        ad: ad.outerHTML || ad,
        hash: hashCode(userid),
        location: m["pub_elec_location"],
        ad_account_name: getAccountNAme(ad),
        notify: false
      })
    }
  }
  ads = []
}

const annan = (ls_text, regex) => {
  let result = []
  for (let index = 0; index < ls_text.length; index++) {
    const letter = ls_text[index];
    if (regex.indexOf(letter) !== -1) {
      result.push(letter)
    }
  }
  return new Set(result)
}

const sendAds = (regex) => {
  storage.get(["pub_elec_location", "pub_elec_userid"], m => {
    if (m["pub_elec_location"] && m["pub_elec_userid"]) {
      let ads = [];
      let items1 = [...document.querySelectorAll(REGEX4)]
      let items2 = [...document.querySelectorAll(REGEX2)]
      const items = items1.concat(items2)
      
      for (let index = 0; index < items.length; index++) {
        const element = items[index];
        let ls_text = element.innerText.split('\n')
        let text = ls_text.join('')
        let isSponsored = text.includes(PUBLICIDAD) || text.includes(SPONSORED) || text.includes(PATROCINADO)
        
        if (!isSponsored) {
          let res = annan(ls_text, PUBLICIDAD) //     es: 8, en: 6, pt: 7
          let res2 = annan(ls_text, SPONSORED) //     es: 8, en: 8, pt: 8
          let res3 = annan(ls_text, PATROCINADO) //   es: 9, en: 8, pt: 9

          if (res.size >= 6 && res2.size === 8 && res3.size >= 8) {
            ads.push(element.offsetParent)
          }            
        } else {
          ads.push(element.offsetParent)
        }
      }
      let adsToSend = ads.filter(x => sentAds.indexOf(x) === -1);
      sentAds = ads;
      executeAds(adsToSend, m)
    }
  })
}

const sendUserDownload = () => {
  storage.get(["pub_elec_location", "pub_elec_userid"], m => {
    if (m["pub_elec_location"] && !m["pub_elec_userid"]) {
      const prof = document.getElementsByClassName("profpic")[0]
      const userid = prof ? prof.parentElement.href.split("/")[3].split("?")[0] : uuidv4()
      storage.set({pub_elec_userid: userid})
      if (userid !== "") {
          sendDownload({
            hash: hashCode(userid),
            location: m["pub_elec_location"],
            source: 'plugin',
            download: true
          })
      }
    } else {
      setTimeout(sendUserDownload, 4000);
    }
  })
}

const sendNotification = () => {
  if (sentAds.length == 0) {
    countOfNoAds = countOfNoAds + 1;
    if (countOfNoAds > 10) {
      sendAd({
        ad: [],
        hash: hashCode(userid),
        location: m["pub_elec_location"],
        notify: true
      });
      countOfNoAds = 0;
    }
  } else {
    setTimeout(sendNotification, 60000);
  }
}

function sendAd(payload) {
  ext.runtime.sendMessage(payload)
}

function sendDownload(payload) {
  ext.runtime.sendMessage(payload)
}

function run() {
  setTimeout(sendUserDownload, 4000);
  setInterval(sendAds, 4000);
  setTimeout(sendNotification, 60000);
}

module.exports = { run }
