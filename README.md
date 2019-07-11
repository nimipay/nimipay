**Nimipay v0.1**

<br>

Nimipay creates an overlayed UI for the interaction with the user's NIM wallet, shopping cart, and items.

It also creates a new record in the database, using the user's wallet address as the unique identifier for the user's database record.

With the help of the new Nimiq Hub API, the UI allows the user to pay for invoices. Then the transaction hash is returned for the backend validation. After the transaction is confirmed, the user receives a new item. It can then be seen under the Items tab.

Being a modal window, it is shown on top of any website, and without the need to re-design the website in order to integrate a webshop.

Nimipay is all-in-one, but lightweight (~30 kb). To make it possible, some rough simplifications were made. The code is vanilla JavaScript/PHP, you can extend and customize it.

The app is experimental. Use it at your own risk.
<br>
<br>
Front-end:

- [Reef.js](https://github.com/cferdinandi/reef) (4kb) anti-framework for reactive UI components
- [Nimiq Hub API](https://nimiq.github.io/hub/quick-start) for simple payments processing

The total Nimipay javascript bundle is ~30 kb and a few kb of CSS.
<br>
<br>
Back-end:

- [MeekroDB](https://meekro.com/) PHP library for simple and secure MySQL queries

For the database structure, use `nimipay.sql`
<br>
<br>
Quickstart: 
https://nimipay.com
<br>
<br>
Examples: 
https://nimipay.com
