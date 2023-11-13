import menuJs from '../../template/menu/menu.js';
const app = getApp();
const pageData = menuJs();
pageData.data.menuType=3;
pageData.dataStore.path = `/pages/takeAwayMenu/takeAwayMenu?beid=${app.globalData.beid}`
Page(pageData);
