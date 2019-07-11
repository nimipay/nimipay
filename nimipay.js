// https://github.com/cferdinandi/reef


// // create a dom container for nimipay UNCOMMENT BEFORE MINIFYING
// const nimipayDiv = document.getElementById('nimipay');
// if (nimipayDiv === null) { 
//   let div = document.createElement('div');
//   div.setAttribute("id", "nimipay");
//   document.body.appendChild(div);
// }


// https://nimiq.github.io/hub/quick-start


// define backend url
const npBackendUrl = 'nimipay.php';


// Initialize the Nimiq Hub API
const hubApi = new HubApi('https://hub.nimiq.com');


let np = new Reef('#nimipay', {
  data: {
    txData: null,
    result: {
      address: '',
      label: ''
    },
    invoices: [],
    items: [],
    userBalanceNim: null,
    userBalanceUsd: null,
    invoicesString: '',
    itemsString: '',
    checkoutFeedback: '',
    invoicesCount: 0,
    itemsCount: 0
	},
	template: function (props) {
    return '<div class="np-modal-window" id="np-modal">'+
    '<div class="np-modal-content">'+
      '<div id="np-wallet" class="np-wallet">'+
        '<div onclick="npCloseModal()" class="np-modal-close">✕</div>'+
        '<b>My NIM Wallet</b><br><br>'+
        '<div id="identicon"><img src="https://icons.mopsus.com/icon/'+props.result.address.replace(/\s/g, '')+'.png"></svg></div>'+
        '<span id="output"><span style="font-size:14px;">'+props.result.address+'<br>'+props.result.label+'</span></span>'+
        '<div id="balance"><br>Balance: ' + props.userBalanceNim + ' NIM (' + props.userBalanceUsd + ' USD)</div>'+
        '<div id="balance-usd"></div>'+
        '<div style="height:5px;"></div>'+
        '<div class="np-wallet-func">'+
          '<a href="https://old.changelly.com/exchange/BTC/NIM/0.1?ref_id=1gapuvxsnq7myyhb" class="np-link" target="_blank">Top Up</a> | <a href="https://safe.nimiq.com/" target="_blank">Backup</a>'+
        '</div>'+
      '</div>'+
      '<div class="np-tabs">'+
        '<div class="np-btn" onclick="npShowInvoices()">Invoices ('+props.invoicesCount+')</div>'+
        '<div class="np-btn" onclick="npShowItems()">Items ('+props.itemsCount+')</div></div>'+
        '<div id="np-tab-invoices">'+props.invoicesString+'</div>'+
        '<div id="np-tab-items">'+props.itemsString+'</div>'+
      '</div>'+
    '</div>'
  }
});


function npInvoiceStringMaker(id_invoice, value, value_nim, status, tx) {
  let invoiceString = '<div class="np-wallet">'+
    '<div class="charge"><b>Invoice #'+id_invoice+'</b><br><br>'+
    'Payment sum: '+value+' USD ('+value_nim+' NIM)<br><br>'+
    '<div id="np-invoice-'+id_invoice+'">';

  if (status == '') {
    invoiceString += '<div class="np-btn np-btn-small" onclick="npCheckoutPrepare(\''+id_invoice+'\')">Pay '+value_nim+' NIM</div>';
  }
  else if (status == 'pending') {
    invoiceString += '<b>Pending confirmation...</b> <span class="np-loading np-line"></span><br><br>';
    
    setTimeout(function(){ npTxBackendValidate(tx, id_invoice); }, 5000 + Math.random() * (20 - 5) * 1000);
  }
  else if (stats = 'confirmed') {
    invoiceString += 'Payment received: <a href="https://nimiq.watch/#'+tx+'" target="_blank">Explore</a><br><br>';
  }

  invoiceString += '</div><div id="np-error-'+id_invoice+'"></div></div>';
    
  return invoiceString;
}


function npItemsStringMaker(id_invoice, type, content) {
  if (type == 'fortune_cookie') {
    return ('<div class="np-wallet">Fortune Cookie #'+id_invoice+'<br><div class="np-nimiqookie-content"><div style="line-height:22px;padding:20px;"><b>'+content+'</b></div></div></div>');
  }
}


function npCloseModal() {
  document.getElementById('np-modal').style.display = "none";
}

function npShowInvoices() {
  document.getElementById('np-tab-invoices').style.display = 'block';
  document.getElementById('np-tab-items').style.display = 'none';
}

function npShowItems() {
  document.getElementById('np-tab-invoices').style.display = 'none';
  document.getElementById('np-tab-items').style.display = 'block';
}


npWalletButton = document.getElementById('np-wallet');
npWalletButton.onclick = function() { npWallet(); }


function npWallet() {
  try {

    const walletData = hubApi.chooseAddress({ appName: nimAddressLabel });
    
    walletData.then(data => {

      // reset if a previous user is different
      if (typeof(np.data.result.address) != 'undefined') {
        if (np.data.result.address != data.address) {
          np.setData({ 
          txData: null,
          result: {
            address: '',
            label: ''
          },
          invoices: [],
          items: [],
          userBalanceNim: null,
          userBalanceUsd: null,
          invoicesString: '',
          itemsString: '',
          checkoutFeedback: '',
          invoicesCount: 0,
          itemsCount: 0 });
        }
      }

      np.render();
      np.setData({ result: data });

      document.getElementById('np-modal').style.display = "block";
      npGetBalance();
      npSendUserAddress();
    })
    
  } catch (error) {
    console.log(error.message);
  }
}


function npGetInvoiceIndex(id_invoice) {
  for(let i = 0; i < np.data.invoices.length; i += 1) {
    if (np.data.invoices[i].id_invoice == id_invoice) { return i; }
  }
}


function npCheckout(id_invoice, oneNimUsdValue) {

  let index = npGetInvoiceIndex(id_invoice);

  let priceNim = (np.data.invoices[index].value / oneNimUsdValue).toFixed(2);
  let value = Number((priceNim * 1e5).toFixed(2));

  if (Number(priceNim) > Number(np.data.userBalanceNim)) {
    document.getElementById('np-error-'+id_invoice).innerHTML = '<div style="margin-top:5px;margin-bottom:10px;color:red;">You do not have enough NIM to pay the invoice.</div>';
    return;
  }

  const options = {
    appName: nimAddressLabel,
    recipient: nimAddress,
    value: value,
    extraData: 'Invoice #'+id_invoice,
    sender: np.data.result.address,
    forceSender: true
  }

  // All client requests are async and return a promise
  const signedTransaction = hubApi.checkout(options);

  signedTransaction
  .then((response) => {
    document.getElementById('np-invoice-'+id_invoice).innerHTML = '<b>Confirming transaction...</b> <span class="np-loading np-line"></span><div style="height:10px;"></div><div style="font-size:13px;padding-left:6px;padding-right:6px;margin-bottom:10px;">After the transaction is confirmed, your order will be activated. Please wait, or open your wallet later to see the new item.</div></div>';
    npSendTxHash(id_invoice, response.hash);
    npTxBackendValidate(response.hash, id_invoice);
  })
  .catch((e) => {
    console.log('Error: ', e)
  });

}


// checkout prepare
function npCheckoutPrepare(id_invoice) {

  let xhr = new XMLHttpRequest();

  xhr.onload = function () {

    if (xhr.status >= 200 && xhr.status < 300) {
      npCheckout(id_invoice, JSON.parse(xhr.response).nim_qc);

    } else {
      console.log('The request failed!');
    }

  }

  xhr.open('GET', 'https://nimiq.mopsus.com/api/price?currency=usd');
  xhr.send();

}


npAddItemButton = document.getElementById('np-add-item');
npAddItemButton.onclick = function(e) { npAddItem(e); };

npAddItemButton = document.getElementById('np-add-item-instant');
npAddItemButton.onclick = function(e) { npAddItemInstant(e); };


function npAddItemInstant(e) {
  // for both logged in and logged out users

  // custom data
  let valueFiat = e.target.getAttribute('data-value');

  let xhr = new XMLHttpRequest();

  xhr.onload = function () {
    if (xhr.status >= 200 && xhr.status < 300) {
      oneNimUsdValue = JSON.parse(xhr.response).nim_qc;

      // checkout
      let priceNim = (valueFiat / oneNimUsdValue).toFixed(2);
      let value = Number((priceNim * 1e5).toFixed(2));

      const options = {
        appName: nimAddressLabel,
        recipient: nimAddress,
        value: value
      }

      const signedTransaction = hubApi.checkout(options);

      signedTransaction
      .then((response) => {

        // console.log(response.raw.sender, response.hash);

        let xhr = new XMLHttpRequest();

        xhr.onload = function () {

          if (xhr.status >= 200 && xhr.status < 300) {
      
            if(xhr.response) {
              np.render();

              let data = { address: response.raw.sender, label: '' }
              np.setData({ result: data });

              document.getElementById('np-modal').style.display = "block";
              npGetBalance();
              npSendUserAddress();
            }
          
          } else {
            console.log('The request failed!');
          }
      
        };

        let data = JSON.stringify({'address':response.raw.sender,'value':valueFiat,'tx':response.hash});

        xhr.open('GET', npBackendUrl+'?action=npAddItemCustom&data='+data);
        xhr.send();
        
      })
      .catch((e) => {
        console.log('Error: ', e)
      });
    } 
    else { console.log('error 241'); }
  }

  xhr.open('GET', 'https://nimiq.mopsus.com/api/price?currency=usd');
  xhr.send();

  return;
}


function npAddItem(e) {

  // uncomment to get custom data (e)
  // let valueFiat = e.target.getAttribute('data-value');

  // for logged in user
  if (np.data.result.address != '') {
    let xhr = new XMLHttpRequest();

    xhr.onload = function () {

      if (xhr.status >= 200 && xhr.status < 300) {
  
        if(xhr.response) {

            document.getElementById('np-modal').style.display = "block";
            npSendUserAddress();

        }
      
      } else {
        console.log('The request failed!');
      }
  
    };  

    xhr.open('GET', npBackendUrl+'?action=npAddItem&data='+np.data.result.address);
    xhr.send();

  }

  // for logged out user
  else {

    // first open user's wallet and get its address
    try {

      const walletData = hubApi.chooseAddress({ appName: nimAddressLabel });
      
      walletData.then(data => {

        // then using user's address, create a new item on the backend
        let xhr = new XMLHttpRequest();

        xhr.onload = function () {

          if (xhr.status >= 200 && xhr.status < 300) {
      
            if (xhr.response) {

              np.render();
              np.setData({ result: data });
        
              document.getElementById('np-modal').style.display = "block";
              npGetBalance();
              npSendUserAddress();

            }
          
          } 
          else {
            console.log('The request failed!');
          }

        };

        xhr.open('GET', npBackendUrl+'?action=npAddItem&data='+data.address);
        xhr.send();

      });
      
    } catch (error) {
      console.log(error.message);
    }

  }

};


npDonateButton = document.getElementById('np-donate');
npDonateButton.onclick = function() { npDonate(); }

function npDonate() {

  let npDonationString = '<div class="np-modal-window" id="np-donate-modal">'+
    '<div class="np-donate">'+
      '<div class="np-donate-inner">'+
        '<div onclick="document.getElementById(\'np-donate-modal\').remove()" class="np-modal-close" style="font-size: 18px;color:#a8a8a8;margin-top: -32px;margin-left:-5px;">✕</div>'+
        '<div id="np-donate-content">'+
          'Donation to <span id="np-donation-to">'+nimAddressLabel+'</span>'+
          '<br><br><br><br>'+
          '<span style="font-size:14px;">Donation amount in NIM</span>'+
          '<br>'+
          '<input id="np-donation-value" class="np-donate-input" type="number" min="1" autofocus></input>'+
          '<br><br>'+
          '<span id="np-donate-checkout" title="Donate NIM" style="cursor:pointer">Donate <svg class="np-donate-logo" viewBox="0 0 16 16"><defs><style>.np-donate-logo{fill:url(#radial-gradient);}</style><radialGradient id="radial-gradient" cx="12.02" cy="14.85" r="15.87" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ec991c"/><stop offset="1" stop-color="#e9b213"/></radialGradient></defs><path class="np-donate-logo" d="M15.82,7.34,12.49,1.66A1.34,1.34,0,0,0,11.33,1H4.67a1.34,1.34,0,0,0-1.16.66L.18,7.34a1.3,1.3,0,0,0,0,1.32l3.33,5.68A1.34,1.34,0,0,0,4.67,15h6.66a1.34,1.34,0,0,0,1.16-.66l3.33-5.68A1.3,1.3,0,0,0,15.82,7.34Z"/></svg></span>'+
        '</div>'+
      '</div>'+
    '</div>'+
  '</div>';

  let div = document.createElement('div');
  div.setAttribute("id", "np-donation");
  document.body.appendChild(div);

  document.getElementById('np-donation').innerHTML = npDonationString;

  npDonateCheckoutButton = document.getElementById('np-donate-checkout');
  npDonateCheckoutButton.onclick = function() { npDonateCheckout(); }

  npDonateCheckoutButton = document.getElementById('np-donation-value');
  npDonateCheckoutButton.addEventListener('keypress', function (e) {
    let key = e.which || e.keyCode;
    if (key === 13) { // 13 is enter
      npDonateCheckout();
    }
  });


  function npDonateCheckout() {
    
    // validate input
    let value = document.getElementById('np-donation-value').value;
    if (value < 1) { alert('Please enter a value that is above 1 NIM.'); return; }

    value = Number((value * 1e5).toFixed(2));

    const options = {
      appName: nimAddressLabel,
      recipient: nimAddress,
      extraData: 'Donation to '+nimAddressLabel,
      value: value
    }

    const signedTransaction = hubApi.checkout(options);

    signedTransaction
    .then((response) => {
      document.getElementById('np-donate-content').innerHTML = 'Your payment was sent.<br><br>Thank you for donating.';
      document.getElementById('np-donate-modal').onclick = function () { document.getElementById('np-donate-modal').remove() }
    })
    .catch((e) => {
      console.log('Error: ', e)
    });

  }

}


// get address balance in nim
function npGetBalance() {

  let xhr = new XMLHttpRequest();

  xhr.onload = function () {

    if (xhr.status >= 200 && xhr.status < 300) {
      let userBalanceNim = JSON.parse(xhr.response).balance / 1e5;
      npGetBalanceUsd(userBalanceNim);
    }

  };

  xhr.open('GET', 'https://nimiq.mopsus.com/api/balance/'+np.data.result.address);
  xhr.send();

}


// get address balance in usd, then update local data for both NIM and USD balances
function npGetBalanceUsd(userBalanceNim) {
  let xhr = new XMLHttpRequest();

  xhr.onload = function () {
    if (xhr.status >= 200 && xhr.status < 300) {
      let userBalanceUsd = (JSON.parse(xhr.response).nim_qc * userBalanceNim).toFixed(2);
      np.setData({ userBalanceUsd: userBalanceUsd, userBalanceNim: userBalanceNim.toFixed(2) });
    } 
  };

  xhr.open('GET', 'https://nimiq.mopsus.com/api/price?currency=usd');
  xhr.send();
}


function npTxBackendValidate(tx, id_invoice) {

  let xhr = new XMLHttpRequest();

  xhr.onload = function () {

    if (xhr.status >= 200 && xhr.status < 300) {

      if (xhr.response == 'pending') {

        if (document.getElementById('np-modal').style.display != 'none') {
          console.log("Validating Tx: Trying again...");
          document.getElementById('np-invoice-'+id_invoice).innerHTML = '<b>Confirming transaction...</b> <span class="np-loading np-line"></span><div style="height:10px;"></div><div style="font-size:13px;padding-left:6px;padding-right:6px;margin-bottom:10px;">After the transaction is confirmed, your order will be activated. Please wait, or open your wallet later to see the new item.</div></div>';  
          setTimeout(function(){ npTxBackendValidate(tx, id_invoice); }, 5000 + Math.random() * (20 - 5) * 1000);
        }

      }

      // else if (xhr.response == 'confirmed') {
      //   console.log('Validating Tx: Confirmed');
      //   npSendUserAddress();
      // }

      else {
        npSendUserAddress();
      }

    } else {
      console.log('The request failed!');
    }

  };

  xhr.open('GET', npBackendUrl+'?action=validateTx&data='+JSON.stringify({ tx:tx, id_invoice: id_invoice }));
  xhr.send();
}


function npInvoicesPriceInNim() {
  let xhr = new XMLHttpRequest();

  xhr.onload = function () {

    if (xhr.status >= 200 && xhr.status < 300) {

      let invoicesString = '';

      let invoices = np.data.invoices;
      invoices.forEach(invoice => {
        let priceNim = (invoice.value / (JSON.parse(xhr.response).nim_qc));
        
        invoicesString += npInvoiceStringMaker(invoice.id_invoice, Number(invoice.value).toFixed(2), priceNim.toFixed(2), invoice.status, invoice.tx);
  
        invoicesString += '</div>';
      });

      np.setData({ invoicesString: invoicesString });

    } else {
      console.log('The request failed!');
    }

  };

  xhr.open('GET', 'https://nimiq.mopsus.com/api/price?currency=usd');
  xhr.send();
}


function npCreateItems() {

    np.setData({ itemsCount: np.data.items.length });

    let itemsString = '';

    let items = np.data.items;
    items.forEach(item => {

      itemsString += npItemsStringMaker(item.id_invoice, item.type, item.content);

    });

    np.setData({ itemsString: itemsString });

}


function npSendUserAddress() {

  let xhr = new XMLHttpRequest();

  xhr.onload = function () {

    if (xhr.status >= 200 && xhr.status < 300) {
      
      let data = JSON.parse(xhr.response);

      if (data[1] == 'initial') {
        npSendUserAddress();
      }
      else {
        np.setData({ invoicesCount: data[0].length });
        np.setData({ invoices: data[0] });
        np.setData({ items: data[1] });

        // create invoice(-s)
        npInvoicesPriceInNim();
        
        // create items
        npCreateItems();
      }

    } else {
      console.log('The request failed!');
    }

  };

  xhr.open('GET', npBackendUrl+'?action=sendUserAddress&data='+JSON.stringify(np.data.result));
  xhr.send();

}


function npSendTxHash(invoiceId, txHash) {
  let xhr = new XMLHttpRequest();

  xhr.onload = function () {

    if (xhr.status >= 200 && xhr.status < 300) {
      // console.log(xhr.response);
    } 
    else {
      console.log('The request failed!');
    }

  };

  xhr.open('GET', npBackendUrl+'?action=sendTxHash&data='+JSON.stringify({address:np.data.result.address, invoice: invoiceId, tx:txHash}));
  xhr.send();
}