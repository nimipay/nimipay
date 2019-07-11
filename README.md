**Nimipay v0.1**

<br>

Nimipay creates an overlayed UI for the interaction with the user's NIM wallet, shopping cart and the items.

With the help of the new (https://nimiq.com)[Nimiq] Hub API, the UI allows the user to pay for invoices. Then the transaction hash is returned for the backend validation. After the transaction is confirmed, the user receives a new item. It can then be seen under Items tab.

Being a modal window, it is shown on top of any website, and without the need to re-design the website in order to integrate a webshop.

The app is experimental. Use it at your own risk.


Front-end:

- (https://github.com/cferdinandi/reef)[Reef.js] (4kb) anti-framework for reactive UI components
- (https://nimiq.github.io/hub/quick-start)[Nimiq Hub API]

The total Nimipay javascript bundle is ~30 kb and a few kb of CSS.


Back-end:

- (https://meekro.com/)[MeekroDB] PHP library for simple and secure MySQL queries

For the database structure, use `nimipay.sql`


Quickstart:

See https://nimipay.com


Examples:

See https://nimipay.com
