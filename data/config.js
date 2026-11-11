/* TownShelf site config.
   channelApp: base URL of the TownShelf Shopify sales channel app (townshelf-channel repo), e.g. "https://channel.townshelf.com".
     - "Connect Shopify" on list-your-shop.html sends owners to <channelApp>/install?shop=<their>.myshopify.com
     - store / browse / item pages load live shops + items from <channelApp>/api/... and fall back to data/data.js
   Leave empty until the channel app is deployed: pages use data/data.js only and the Connect button shows "coming soon".
   For local testing you can add ?ts_api=http://localhost:3000 to any page URL (remembered for the browser tab). */
window.TOWNSHELF_CONFIG = {
  channelApp: ""
};
