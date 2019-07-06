// https://github.com/cferdinandi/reef


// https://nimiq.github.io/hub/quick-start




// Initialize the Nimiq Hub API
const hubApi = new HubApi('https://hub.nimiq.com');


let np = new Reef('#nimipay', {
  data: {
		txData: null,
    priceFiat: 0.01, // USD
    priceNim: 0.00,
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
          '<a href="https://old.changelly.com/?ref_id=1gapuvxsnq7myyhb" class="np-link" target="_blank">Top Up</a> | <a href="https://safe.nimiq.com/" target="_blank">Backup</a>'+
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


function npCloseModal() {
  document.getElementById('np-modal').style.display = "none";
  // @@todo: clean wallet data(?)
  // do this on wallet UI load, if address != '' and != old address
}

function npShowInvoices() {
  document.getElementById('np-tab-invoices').style.display = 'block';
  document.getElementById('np-tab-items').style.display = 'none';
}

function npShowItems() {
  document.getElementById('np-tab-invoices').style.display = 'none';
  document.getElementById('np-tab-items').style.display = 'block';
}


function npWallet() {
  
  try {

    const walletData = hubApi.chooseAddress({ appName: 'Nimipay' });
    
    walletData.then(data => {
      np.render();
      np.setData({ result: data });

      document.getElementById('np-modal').style.display = "block";
      npGetBalance();
      npSendUserAddress();
    })
    
  } catch (error) {
    console.log(error.message);
  }
};


function npCheckout(invoiceId, oneNimUsd) {

  // @@todo: get a PARTICULAR INVOICE VALUE

  let priceNim = (np.data.priceFiat / oneNimUsd).toFixed(2);
  let value = Number((priceNim * 1e5).toFixed(2));

  if (Number(priceNim) > Number(np.data.userBalanceNim)) {
    document.getElementById('np-error-'+invoiceId).innerHTML = '<div style="margin-top:5px;margin-bottom:10px;color:red;">You do not have enough NIM to pay the invoice.</div>';
    return;
  }

  const options = {
    appName: nimAddressLabel,
    recipient: nimAddress,
    value: value,
    extraData: 'Invoice #'+invoiceId,
    sender: np.data.result.address,
    forceSender: true
  };

  // All client requests are async and return a promise
  const signedTransaction = hubApi.checkout(options);

  signedTransaction
  .then((response) => {
    document.getElementById('np-invoice-'+invoiceId).innerHTML = '<b>Confirming transaction...</b> <span class="np-loading np-line"></span><div style="height:10px;"></div><div style="font-size:13px;padding-left:6px;padding-right:6px;margin-bottom:10px;">After the transaction is confirmed, your order will be activated. Please wait, or open your wallet later to see the new item.</div></div>';
    npSendTxHash(invoiceId, response.hash);
    npTxBackendValidate(response.hash, invoiceId);
  })
  .catch((e) => {
    console.log('Error: ', e)
  });

}


function npAddItem() {
  let xhr = new XMLHttpRequest();

  if (np.data.result.address != '') {
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
  
    xhr.open('GET', 'nimipay.php?action=npAddItem&data='+np.data.result.address);
    xhr.send();
  }

  else {
    alert('First open your NIM wallet');
  }

}


function npDonate() {

  // @@todo: need to do an UI where user can enter a donation sum, then prefill it for the checkout
  alert('Not working yet, as it requires a custom UI where the user can enter a donation sum. Coming soon.');
  return;

  const options = {
    appName: nimAddressLabel,
    recipient: nimAddress,
    extraData: 'Donation to Nimipay'
  };

  const signedTransaction = hubApi.checkout(options);

  signedTransaction
  .then((response) => {
    console.log('success');
    console.log(response);
  })
  .catch((e) => {
    console.log('Error: ', e)
  });

}


function npAddItemCheckout() {

  alert('Soon...');
  return;

  let xhr = new XMLHttpRequest();

  xhr.onload = function () {

    if (xhr.status >= 200 && xhr.status < 300) {

      if(xhr.response) {
        let invoiceId = xhr.response;
        let priceNim = (np.data.priceFiat / oneNimUsd).toFixed(2);
        let value = Number((priceNim * 1e5).toFixed(2));

        const options = {
          appName: nimAddressLabel,
          recipient: nimAddress,
          value: value,
          extraData: 'Invoice #'+invoiceId,
        };

        // All client requests are async and return a promise
        const signedTransaction = hubApi.checkout(options);

        signedTransaction
        .then((response) => {
          npSendTxHash(invoiceId, response.hash);
        })
        .catch((e) => {
          console.log('Error: ', e)
        });
      }
    
    } else {
      console.log('The request failed!');
    }

  };

  xhr.open('GET', 'nimipay.php?action=npAddItem&data='+np.data.result.address);
  xhr.send();

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


function npOneNimToUsd(invoiceId) {

  let xhr = new XMLHttpRequest();

  xhr.onload = function () {

    if (xhr.status >= 200 && xhr.status < 300) {
      npCheckout(invoiceId, JSON.parse(xhr.response).nim_qc);

    } else {
      console.log('The request failed!');
    }

  };

  xhr.open('GET', 'https://nimiq.mopsus.com/api/price?currency=usd');
  xhr.send();

}


function npInvoiceStringMaker(id_invoice, value, value_nim, status, tx) {
  let invoiceString = '<div class="np-wallet">'+
    '<div class="charge"><b>Invoice #'+id_invoice+'</b><br><br>'+
    'Payment sum: '+value+' USD ('+value_nim+' NIM)<br><br>'+
    '<div id="np-invoice-'+id_invoice+'">';

  if (status == '') {
    invoiceString += '<div class="np-btn np-btn-small" onclick="npOneNimToUsd(\''+id_invoice+'\')">Pay '+value_nim+' NIM</div>';
  }
  else if (status == 'pending') {
    invoiceString += '<b>Pending confirmation...</b> <span class="np-loading np-line"></span><br><br>';
    
    setTimeout(function(){ npTxBackendValidate(tx, id_invoice); }, 5000);
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


function npTxBackendValidate(tx, id_invoice) {

  let xhr = new XMLHttpRequest();

  xhr.onload = function () {

    if (xhr.status >= 200 && xhr.status < 300) {
      // console.log(xhr.response);

      if (xhr.response == 'pending') {
        console.log("Tx data: trying again");
        document.getElementById('np-invoice-'+id_invoice).innerHTML = '<b>Confirming transaction...</b> <span class="np-loading np-line"></span><div style="height:10px;"></div><div style="font-size:13px;padding-left:6px;padding-right:6px;margin-bottom:10px;">After the transaction is confirmed, your order will be activated. Please wait, or open your wallet later to see the new item.</div></div>';
        setTimeout(function(){ npTxBackendValidate(tx, id_invoice); }, 10000);
      }

      // else if (xhr.response == 'confirmed') {
      //   console.log('Tx data: received');
      //   npSendUserAddress();
      // }

      else {
        npSendUserAddress();
      }

    } else {
      console.log('The request failed!');
    }

  };

  xhr.open('GET', 'nimipay.php?action=validateTx&data='+JSON.stringify({ tx:tx, id_invoice: id_invoice }));
  xhr.send();
}


function npInvoicePriceInNim() {

  let xhr = new XMLHttpRequest();

  xhr.onload = function () {

    if (xhr.status >= 200 && xhr.status < 300) {

      np.data.invoices.value = Number(np.data.invoices.value);

      let priceNim = (np.data.invoices.value / (JSON.parse(xhr.response).nim_qc));
      np.setData({ priceNim: priceNim });
      
      let invoicesString = npInvoiceStringMaker(np.data.invoices.id_invoice, np.data.invoices.value.toFixed(2), priceNim.toFixed(2), np.data.invoices.status, np.data.invoices.tx);

      invoicesString += '</div>';

      let finalinvoicesString = np.data.invoicesString + invoicesString;

      np.setData({ invoicesString: finalinvoicesString });

    } else {
      console.log('The request failed!');
    }

  };

  xhr.open('GET', 'https://nimiq.mopsus.com/api/price?currency=usd');
  xhr.send();

}


function npInvoicesPriceInNim() {
  let xhr = new XMLHttpRequest();

  xhr.onload = function () {

    if (xhr.status >= 200 && xhr.status < 300) {

      np.data.invoices.length;

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
        np.setData({ invoicesCount: 1 });
        np.setData({ invoices: data[0] });

        npInvoicePriceInNim();
      }
      else {
        np.setData({ invoicesCount: data[0].length });
        np.setData({ invoices: data[0] });
        np.setData({ items: data[1] });

        // create invoiceS     
        npInvoicesPriceInNim();
        
        // create items
        npCreateItems();
      }

    } else {
      console.log('The request failed!');
    }

  };

  xhr.open('GET', 'nimipay.php?action=sendUserAddress&data='+JSON.stringify(np.data.result));
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

  xhr.open('GET', 'nimipay.php?action=sendTxHash&data='+JSON.stringify({address:np.data.result.address, invoice: invoiceId, tx:txHash}));
  xhr.send();
}