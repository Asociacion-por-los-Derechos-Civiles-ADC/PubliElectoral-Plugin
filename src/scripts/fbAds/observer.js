import ext from "../utils/ext"
import storage from "../utils/storage"

const LANGUAGE = window.navigator.language;   
const REGEX = "a[href*='#'],a[href*='/business/help'],a[href*='/ads/']";
const REGEX2 = "[role] div:nth-child(13) div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(2) .buofh1pr [role='button']"
const REGEX3 = "[aria-labelledby*='jsc_c_'] .ihxqhq3m.sdhka5h4:nth-of-type(1)"
const REGEX4 = "a[href*='#'] > span > span[aria-labelledby*='jsc_'] > span[style*='order: 0']"

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

const isSponsored = (item) => {
  const word = item
  let includes = sponsoredWords.includes(word);
  let collab = collabWords.includes(word);
  if (!includes) {
    includes = sponsoredWords.map(sponsorW => word.includes(sponsorW) || false).map(r => r || false)[0]
  }
  if (!collab) {
    collab = collabWords.map(collabW => word.includes(collabW) || false).map(r => r || false)[0]
  }
  return includes || collab;
}

const analisarPalabra = (str, element) => {
  var str2 = "ffaPdsdu33bsdlicidad";
  console.log('analizando ', str)
  var c = 'Publicidad'
  const ad = []

  for(var j=0; j<str.length;j++) {
    for(var i=0; i<c.length;i++) {
      if (str[j] == c[i]) {
        console.log(`letra ${c[i]} str[j]: ${str[j]} j: ${j}`)
        ad.push(element)
      }
    }
  }
  return ad
}

const procesarChildren = (childrenNodes) => {
  console.log('procesando hijos...')
  let spanValues = []
  let c = childrenNodes.forEach(a => c.push(a))
  c.sort((a,b) => a.style.order - b.style.order)
  for (let index = 0; index < c.length; index++) {
    const element = c[index];
    spanValues.push(element.innerHTML)
  }
  console.log('spanValues: ', spanValues.join('').replaceAll(/\D+\W+/g,"").replaceAll(/[0-9]/g, "").replaceAll(/[^Publicidad]+/g,""))
  return spanValues.join('')
}


const elementHasChildNodes = (element) => element.hasChildNodes() && element.childNodes.length > 10

const sortNodes = (nodes) => nodes.sort((a,b) => a.style.order - b.style.order)

const getChildNodes = (element) => {
  const list = []
  const nodes = element.childNodes
  for (let index = 0; index < nodes.length; index++) {
    list.push(nodes[index])    
  }
  return sortNodes(list)
}

const getSpanValues = (nodes) => {
  let result = ''
  let match = 0
  for (let index = 0; index < nodes.length; index++) {
    let letter = nodes[index].innerHTML;
    if ('Publicidad'.includes(letter)) {
      result+=letter;
      match+=1
    } else if ('Sponsored'.includes(letter)) {
      result+=letter;
      match+=1
    } else if ('Patrocinado'.includes(letter)) {
      result+=letter;
      match+=1
    } else if ('Colaboración pagada'.includes(letter)) {
      result+=letter;
      match+=1
    } else if ('Paid Partnership'.includes(letter)) {
      result+=letter;
      match+=1
    } else if ('Parceria paga'.includes(letter)) {
      result+=letter;
      match+=1
    }
  }
  return { result, match }
}

const saveAddIfMatching = (text, match, ads, element) => {
  if (text[0] == "P" && match > 10) {
    ads.push(element.offsetParent)
  }
  if (text[0] == "S" && match > 9) {
    ads.push(element.offsetParent)
  }
  if (text[0] == "C" && match > 15) {
    ads.push(element.offsetParent)
  }
  return ads
}

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

const sendAds = (regex) => {
  storage.get(["pub_elec_location", "pub_elec_userid"], m => {
    if (m["pub_elec_location"] && m["pub_elec_userid"]) {
      let ads = [];
      let items1 = [...document.querySelectorAll(REGEX4)]
      let items2 = [...document.querySelectorAll(REGEX2)]
      const items = items1.concat(items2)

      for (let index = 0; index < items.length; index++) {
        const element = items[index];
        if(elementHasChildNodes(element)) {
          const childNodes = getChildNodes(element)
          let { result: text, match } = getSpanValues(childNodes)
          ads = saveAddIfMatching(text, match, ads, element)
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
  setInterval(() => sendAds(REGEX2), 4000);
  setTimeout(sendNotification, 60000);
}

module.exports = { run }
