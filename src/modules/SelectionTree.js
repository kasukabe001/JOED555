// eslint-disable-next-line no-unused-vars
export default class SelectionTree {
  constructor (initialTree = {}) {
    Object.assign(this, initialTree)
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
  Categories () {
    return Object.getOwnPropertyNames(this)
  }

  Targets (category = '') {
    return category !== '' ? Object.keys(this[category]) : []
  }

  Candidates (category = '', target = '') {
    return (category !== '' && target !== '')
      ? this[category][target].map(item => SelectionTree.handleTreeItem(item))
      : []
  }

  getItemByIndex (category = '', target = '', index = -1) {
    return (category !== '' && target !== '' && index >= 0)
      ? this[category][target][index]
      : undefined
  }

  getItemByName (category = '', target = '', name = '') {
    return this.getItemByIndex(category, target,
      this[category][target].findIndex(item => SelectionTree.handleTreeItem(item) === name))
  }

  static handleTreeItem (item, attribute = 'Text') {
    if (typeof item === 'object') {
      if (attribute === 'key') {
        return Object.keys(item)[0]
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

  flatten (selectedCategory = '') {
    const temporaryArray = []
    for (const category of Object.getOwnPropertyNames(this)) {
      if (selectedCategory === '' || category === selectedCategory) {
        for (const target of Object.keys(this[category])) {
          for (const item of this[category][target]) {
            temporaryArray.push(SelectionTree.handleTreeItem(item))
          }
        }
      }
    }
    return temporaryArray
  }

  findItemByName (name) {
    for (const category of Object.getOwnPropertyNames(this)) {
      for (const target of Object.keys(this[category])) {
        for (const item of this[category][target]) {
          if (SelectionTree.handleTreeItem(item) === name) {
            return { Text: name, Chain: [category, target] }
          }
        }
      }
    }
    return undefined
  }
}
