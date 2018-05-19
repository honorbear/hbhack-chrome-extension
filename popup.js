'use strict';

let changeColor = document.getElementById('btn-refresh');
changeColor.onclick = function(element) {
  injectScript()
};

chrome.runtime.onMessage.addListener(function(request, sender){
  if(request.action == ACTION_GET_PRODUCTS){
    sendProducts(request.products)
  }
});

window.onload = function() {
  console.log('window onload')
  injectScript()
}

function injectScript() {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.executeScript(null, { file: "jquery-3.3.1.min.js" }, function() {
      chrome.tabs.executeScript(null, { file: "constant.js" }, function() {
        chrome.tabs.executeScript(null, { file: "getProducts.js" }, () => {
        })
      })
    });
  });
}

function sendProducts(products){
  $.ajax({
    url: "http://localhost:3000",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify({ products: products }),
  }).done(function(res){
    console.log('response:', res)

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: ACTION_SERVER_RESPONSE,
        products: res.products
      }, function(response) {
        // callback of message
      });
    });
  })
}
