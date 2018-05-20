// Settings
var beeImage = "http://honorbear.ynilu.com/bee.png"

console.log('load contents');

/**
 * Abstract method need to implement and added to below
 *
 * parseProducts(): parse products information and send to server
 *  product data format:
 *  {
 *    vendor: string, vendor name
 *    id: integer, product id
 *    name: string, product name
 *    quantity: integer
 *    price: integer
 *    img: string, image link to product
 *  }
 *
 * updateProductsInfo(products): callback to update products info in page
 *
 */

if(location.href.match(/carrefour/)){
  var parseProducts = parseCarrefourProducts;
  var updateProductsInfo = updateCarrefourProductsInfo
} else {
  throw Error('Not Implement')
}

chrome.runtime.sendMessage({
  action: ACTION_GET_PRODUCTS,
  products: parseProducts(document),
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log(request)
  if(request.action == ACTION_SERVER_RESPONSE){
    updateProductsInfo(request.products)
  }
})


/**
 *  Carrefour related functions
 */
function parseCarrefourProducts(document) {
  var $names = $('.item-product .item-name');
  var $prices = $('.item-product .discount-price');
  var $imgs = $('.item-product .label-wrap a img');
  var $productIds = $('.item-product .item-love')
  var products = [];

  var diff = $names.length - $productIds.length
  for(var i = 0; i < $productIds.length; i++){
    // skip if data is unexpected format
    var currentName = $names[i + diff]
    var currentPrice = $prices[i + diff]
    var currentImage = $imgs[i + diff]
    if(
      !$productIds[i] || !$productIds[i].dataset || !$productIds[i].dataset.productid ||
      !currentName || !currentName.textContent || currentName.textContent.split('\n').length != 3 ||
      !currentPrice || !currentPrice.textContent
    ) {
      continue
    }
    var nameParts = currentName.textContent.split('\n')
    var product = {
      vendor: 'carrefour',
      id: $productIds[i].dataset.productid,
      name: nameParts[1].trim(),
      quantity: nameParts[2].match(/\d+/g)[0] || 1,
      price: currentPrice.textContent.match(/\d+/g)[0] || 0,
      img: currentImage.src
    }
    products.push(product);
  }
  return products;
}

function updateCarrefourProductsInfo(products) {
  products.forEach(product => {
    if(product.proposed_products.length > 0){
      console.log(`product ${product.name} has proposed products`)
      let popup = carrefourPopup(product.proposed_products)
      $(`.item-product [data-productid=${product.id}]`).after($(popup))
    }
  })
}

/**
 * Popup showed in carrefour
 * @proposed_products proposed products from server
 * format:
 *  [{
 *    link: link to product,
 *    info: product info
 *  },...]
 */
function carrefourPopup(proposed_products){
  return `
    <ul class="dropdown-style-wrap item-cart inline-block clearfix">
      <li>
        <img src=${beeImage} height="22" width="26"></img>
        <ul class="dropdown-list mobile-style-2 dropdown-style-1 dropdown-up">
          ${proposed_products.map(product => proposed_product(product)).join()}
        </ul>
      </li>
    </ul>
  `
}

function proposed_product(product){
  return(`
    <li>
      <a href=${product.link} target="_blank" style="text-decoration: underline; color: blue;">
        Honestbee 上價格近似的商品, ${product.info}
      </a>
    </li>
  `)
}
