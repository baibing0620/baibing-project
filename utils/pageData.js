class pageData {
    constructor() {
        this.page = {}
    }

    setPage(_this, pageName) {
        this.page[pageName] = _this;
    }

    getPage(pageName) {
        return this.page[pageName];
    }

    removePage(pageName) {
        delete this.page[pageName];
    }

    clearPage() {
        this.page = {}
    }
}

export {
    pageData
}