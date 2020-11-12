import ext from "./utils/ext"
import storage from "./utils/storage"
import config from '../config/config.js'

function handleMessage(request, sender, sendResponse) {
  storage.get("pub_elec_location", m => {
    let json = {}
    let url = config.adUri
    if (request.download) {
      json = {
        hash: request.hash,
        location: request.location,
        source: request.source
      }
      url = url + "/download"
    } else {
      json = {
        ad: request.ad,
        hash: request.hash,
        location: request.location
      }
      url = url + "/adv?plugin=true"
    }
    fetch(url, {
      headers: { "Content-Type": "application/json; charset=utf-8" },
      method: 'post',
      body: JSON.stringify(json)
    }).then(function(response) {
      console.log("SENDING DATA SUCCESSFULLY")
    }).catch(function(response) {
      console.log("ERROR WHILE SENDING DATA")
    });
  })
}

ext.runtime.onMessage.addListener(handleMessage)
