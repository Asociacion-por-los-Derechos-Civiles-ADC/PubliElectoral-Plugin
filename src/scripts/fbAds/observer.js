import ext from "../utils/ext"
import config from '../../config/config.js'
const sha256 = require('crypto-js/sha256')
const hex = require('crypto-js/enc-hex')

var container = document.querySelector(config.fbAds.mainContainerQuerySelector)
var profile = document.querySelector(config.fbAds.profileIdContainerQuerySelector)
var userId = sha256(profile.href).toString(hex)

function searchForAds(mutationsList) {
  mutationsList.forEach(mutation => {
    checkNode(mutation)
  })
}

function checkNode(mutation) {
  if (isPost(mutation) && isAd(mutation)) {
    let account = getTargetAdAccount(mutation)
    if (account) {
      //add blue border to identify target ad
      mutation.target.style.border = "3px solid #0000FF"
      let adData = buildData(mutation, account)
      sendAd(adData)
    }
  }
}

function jqueryNode(node, regex) {
  var all_tags = node.getElementsByTagName("*");
  var results = [];
  for (var i = all_tags.length-1; i >= 0; -- i) {
    if (regex.test(all_tags[i].id)) {
      results.push(all_tags[i]);
    }
  }
  return results;
}

function getTargetAdAccount(node) {
  let subtitleNode = jqueryNode(node.target, config.fbAds.postSubtitleQuerySelector)
  let titleNode = subtitleNode[0].previousSibling.innerHTML
  let account = config.accounts.filter( (account) => {
    return titleNode.includes(account.page_id) && titleNode.includes(account.page_name)
  })
  return account.length === 1 ? account[0] : null
}

function buildData(node, account) {
  let pageId = account.page_id
  let postId = node.target.querySelector(config.fbAds.postIdQuerySelector).value
  return {
    postId: pageId + "_" + postId,
    accountId: pageId,
    userId: userId,
    visualizedDate: new Date()
  }
}

function isAd(node) {
  let subtitleNode = jqueryNode(node.target, config.fbAds.postSubtitleQuerySelector)
  let subtitle = subtitleNode[0].innerText.replace(/-/g, '')
  if (subtitle.includes(config.fbAds.targetAdWord)) {
    node.target.style.border = "3px solid #FF00FF"
  }
  return subtitle.includes(config.fbAds.targetAdWord)
}

function isPost(node) {
  return node.type === "childList" && node.target.id.startsWith(config.fbAds.postQuerySelector)
}

function sendAd(ad) {
  ext.runtime.sendMessage(ad)
}

function run() {
  const observer = new MutationObserver(searchForAds)
  observer.observe(container, {subtree: true, childList: true})
}

module.exports = { run }
