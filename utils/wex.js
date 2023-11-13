/**
 * Wex小程序状态管理
 */
export default class Wex {
  // 全局的状态关联
  static store = {};
  //关联的页面栈
  static pagesList = [];
  // 状态分发
  static dispatch(obj = {}) {
    for (let i = 0; i < this.pagesList.length; i++) {
      let pageData = {};
      for (var key in obj) {
        if (i == 0) {
          this.store[key] = obj[key];
        }
        if (this.pagesList[i]['_mapStore'][key]) {
          pageData[this.pagesList[i]['_mapStore'][key]] = this.store[key];
        }
      }
      this.pagesList[i].setData(pageData);
    }
  }
  static map(page, values = {}) {
    let pageIndex = this.inArray(page, this.pagesList);
    if (pageIndex == -1) {
      pageIndex = this.pagesList.length;
      if (pageIndex > 10) {
        console.err('页面数超10')
      }
      // 页面被注销清理逻辑
      let oldOnloadFunction = page.onUnload;
      page.onUnload = () => {
        oldOnloadFunction();
        let index = this.inArray(page, this.pagesList);
        if (index == -1) {
          console.error('页面注销错误')
        }
        this.pagesList.splice(index, 1)
        page['removeFromWex'] = 1;
      };
      //注入新页面
      page._mapStore = {}
      this.pagesList.push(page);
    }

    for (let mapName in values) {
      //页面数据和map对应关系
      this.pagesList[pageIndex]._mapStore[mapName] = values[mapName];
      //新注入map数据并初始化
      if (!this.store[mapName]) {
        this.store[mapName] = this.pagesList[pageIndex]['data'] ? this.pagesList[pageIndex]['data'][values[mapName]] : null
      }

    }
  }

  static getStore(key) {
    return this.store[key];
  }

  // 是否在数组里 在返回索引 不在返回-1
  static inArray(value, arr) {
    let index = -1;
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] === value) {
        index = i;
        break;
      }
    }
    return index;
  }
}