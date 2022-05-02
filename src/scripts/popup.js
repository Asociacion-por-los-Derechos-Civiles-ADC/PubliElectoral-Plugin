import ext from "./utils/ext";
import storage from "./utils/storage";
import config from "../config/config.js";
import * as ptmessages from '../_locales/pt/messages.json';
import * as esmessages from '../_locales/es/messages.json';
import * as enmessages from '../_locales/en/messages.json';

const locale = navigator.language
let locations = []
let tranlations = {}

if (locale.includes('pt')) {
  tranlations = ptmessages
  locations = config.locations.pt
}
if (locale.includes('es')) {
  tranlations = esmessages
  locations = config.locations.es
}
if (locale.includes('en')) {
  tranlations = enmessages
  locations = config.locations.en
}

document.addEventListener("DOMContentLoaded", function(event) {
  var locationSelect = document.getElementById("location")

  storage.get("pub_elec_location", m => {
    for (var i = 0; i < locations.length; i++) {
      var opt = document.createElement("option")
      opt.setAttribute('value', locations[i]);
      opt.appendChild(document.createTextNode(locations[i]));

      if (m["pub_elec_location"] === locations[i]) {
        opt.selected = "selected"
      }

      locationSelect.appendChild(opt)
    }
  })

  locationSelect.addEventListener("change", function(e) {
    storage.set({pub_elec_location: e.target.value})
  })

  let appDescription = document.getElementById('appDescription_message')
  appDescription.innerHTML = tranlations.appDescription.message

  let appAbout = document.getElementById('about')
  appAbout.innerHTML = tranlations.appDescription.about

  let appSelectCountry = document.getElementById('selectCountry')
  appSelectCountry.innerHTML = tranlations.selectCountry.message
})
