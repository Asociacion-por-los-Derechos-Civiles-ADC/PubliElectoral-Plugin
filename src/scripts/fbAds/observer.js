import ext from "../utils/ext"
import storage from "../utils/storage"

let sentAds = [];

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
  let accountName = ''
  if (ad && ad.outerText) {
    accountName = ad.outerText.split('\n')[0].trim()
  } else if (ad && ad.textContent) {
    accountName = ad.textContent.split('\n')[0].trim()
  }
  return accountName
}

const sendAds = () => {
  storage.get(["pub_elec_location", "pub_elec_userid"], m => {
    if (m["pub_elec_location"] && m["pub_elec_userid"]) {
      const ads = [];
      const userid = m["pub_elec_userid"]
      document.querySelectorAll("a[aria-label*=Publicidad], a[aria-label*=Sponsor]").forEach(ad => ads.push(ad.offsetParent));
      const adsToSend = ads.filter(x => sentAds.indexOf(x) === -1);
      sentAds = ads;

      if (ads.length === 0) {
        sendAd({
          ad: [],
          hash: hashCode(userid),
          location: m["pub_elec_location"],
          notify: true
        })
      } else {
        adsToSend.forEach(ad => {
          const accountName = getAccountNAme(ad)
          
          if (ad && ad.hasOwnProperty('outerHTML')) {
            sendAd({
              ad: ad.outerHTML || "",
              hash: hashCode(userid),
              location: m["pub_elec_location"],
              ad_account_name: accountName,
              notify: false
            })
          } else {
            sendAd({
              ad: "",
              hash: hashCode(userid),
              location: m["pub_elec_location"],
              ad_account_name: accountName,
              notify: false
            })
          }
        });
      }

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


function sendAd(payload) {
  ext.runtime.sendMessage(payload)
}

function sendDownload(payload) {
  ext.runtime.sendMessage(payload)
}

function run() {
  setTimeout(sendUserDownload, 4000);
  setInterval(sendAds, 4000);
}

module.exports = { run }
