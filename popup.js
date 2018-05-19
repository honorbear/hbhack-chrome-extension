'use strict';
console.log('load popup js')
let btnRefresh = document.getElementById('btn-refresh');
btnRefresh.onclick = function(element) {
  console.log('refreshData')
  injectScript()
};

function injectScript() {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.executeScript(null, { file: "jquery-3.3.1.min.js" }, function() {
      chrome.tabs.executeScript(null, { file: "constant.js" }, function() {
        chrome.tabs.executeScript(null, { file: "content.js" }, () => {
        })
      })
    });
  });
}

