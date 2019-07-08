Nimipay v0.0.9

<br>

Nimipay creates an overlayed UI for the interaction with the user's NIM wallet, shopping cart and the items.

With the help of the new Nimiq Hub API, the UI allows the user to pay for invoices. Then the tx hash is returned for the backend validation. After the tx is confirmed, the user receives a new item, it can then be seen under Items tab.

Being a modal window, it is shown on top of any website, and without the need to re-design the website in order to integrate a webshop.

The code is not production ready!


Front-end:

- Reef.js (4kb) anti-framework for reactive UI components
- Nimiq Hub API

The total Nimipay javascript bundle is  ~30 kb and a few kb of CSS.


Back-end:

- MeekroDB PHP class for simple and secure MySQL queries

For the database structure, use `nimipay.sql`


Quickstart:

See https://nimipay.com


Examples:

See https://nimipay.com


@todo:
- ~~Individual product prices~~
- ~~Add to cart when not logged in~~
- ~~Instant buy~~
- ~~ Donation ~~
- Shortcodes
- Optimized final bundle
