'use strict';

chrome.runtime.onInstalled.addListener(function() {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: {hostEquals: 'online.carrefour.com.tw'},
        })
      ],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});

chrome.runtime.onMessage.addListener(function(request, sender){
  console.log('receive event')
  if(request.action == ACTION_GET_PRODUCTS){
    sendProducts(request.products)
  }
});

function sendProducts(products){
  console.log('sendProducts')
  $.ajax({
    url: "http://honorbear.ynilu.com/products/report",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify({ products: products }),
  }).done(function(res){
    console.log('response:', res)

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
      chrome.tabs.sendMessage(tabs[0].id, {
        action: ACTION_SERVER_RESPONSE,
        products: res.products
      }, function(response) {});
    });
  })
}
