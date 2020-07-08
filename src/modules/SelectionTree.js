// eslint-disable-next-line no-unused-vars
export default class SelectionTree {
  #YearOfThisTree

  constructor (initialTree = {}, YearOfMasterDataset = '0000') {
    Object.assign(this, initialTree)
    this.#YearOfThisTree = YearOfMasterDataset
  }

  /*
  アイテムリストオブジェクトの構成 - アイテムリストは年次更新される
  Category: {
    Target: [...項目]

    項目 - '項目名' もしくは
    {
      {
        Text: '項目名'

        Notification: 'お知らせメッセージ'

        *** ProcedureItem ***
        Ditto: [同時入力できない同一手技]
        AdditionalProcedure: '同時展開される手技' // 原則的に同一カテゴリ・対象
        Description: { 補助情報のタイトル: [...候補] } //候補に $Multi があるときは複数選択 $で終わる候補は選択しても登録されない（主たる術式の場合は選択不可）

        *** DiagnosisItem ***
        Procedure: '強制展開される手技' // 同一カテゴリ・対象であることが必須
      }
    }
  }
  */
  getMasterYear () {
    return this.#YearOfThisTree
  }

  Categories (year = this.#YearOfThisTree) {
    return Object.keys(this) // getOwnPropertyNames
  }

  Targets (category = '', year = this.#YearOfThisTree) {
    return category !== '' ? Object.keys(this[category]) : []
  }

  Candidates (category = '', target = '', year = '') {
    const searchYear = year !== '' ? year : this.#YearOfThisTree
    return (category !== '' && target !== '')
      ? this[category][target].map(item => SelectionTree.handleTreeItem(item, 'Text', searchYear)).filter(item => item !== undefined)
      : []
  }

  getItemByIndex (category = '', target = '', index = -1) {
    return (category !== '' && target !== '' && index >= 0)
      ? this[category][target][index]
      : undefined
  }

  getItemByName (category = '', target = '', name = '', year = this.#YearOfThisTree) {
    return this.getItemByIndex(category, target,
      this[category][target].findIndex(item => SelectionTree.handleTreeItem(item, 'Text', year) === name))
  }

  // 指定カテゴリで平坦化したリスト項目を取得する
  //
  // @param {string} カテゴリ
  // @param {string} データセットの参照年指定(デフォルトは最新)
  flatten (selectedCategory = '', year = this.#YearOfThisTree) {
    const temporaryArray = []
    for (const category of Object.keys(this)) { // getOwnPropertyNames
      if (selectedCategory === '' || category === selectedCategory) {
        for (const target of Object.keys(this[category])) {
          for (const item of this[category][target]) {
            temporaryArray.push(SelectionTree.handleTreeItem(item), 'Text', year)
          }
        }
      }
    }
    return temporaryArray
  }

  // カテゴリ・対象臓器ツリーを検索して列挙する
  //
  // @param {string} 対象
  // @param {string} データセットの参照年指定(デフォルトは最新)
  findItemByName (name, year = this.#YearOfThisTree) {
    for (const category of Object.keys(this)) { // getOwnPropertyNames
      for (const target of Object.keys(this[category])) {
        for (const item of this[category][target]) {
          if (SelectionTree.handleTreeItem(item, 'Text', year) === name) {
            return { Text: name, Chain: [category, target] }
          }
        }
      }
    }
    return undefined
  }

  // 選択ツリーの３層目の値を取得する
  //
  // @param {object, sting} ３層目の値
  // @param {string}  Text, Ditto, など
  // @param {string}  データセットの参照年指定
  static handleTreeItem (item, attribute = 'Text', year = '') {
    if (typeof item === 'object') {
      if (year !== '') {
        console.log('Year is given:', year)
        if (item.VaildTo && year > item.VaildTo) {
          return undefined
        }
        if (item.VaildFrom && year < item.VaildFrom) {
          return undefined
        }
      }
      return item[attribute]
    } else {
      if (attribute === 'Text') {
        return item
      } else {
        return undefined
      }
    }
  }
}
