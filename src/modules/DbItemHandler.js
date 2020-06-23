// eslint-disable-next-line no-unused-vars
export default class DbItems {
  /*
  データベースの項目
  Diagnoses - Array - String
  Procedures - Array - Hash
  [
    // 以下のhashがitem
    {
       Text: "登録される内容",
       Chain: [ {{カテゴリ}}, {{対象}} ]
       AdditionalProcedure: { Text: ..., Description: [] } => Chainを除くitem/出力データでは主アイテムの次に入る
       Description: []
    }
  ]
  */
  static getItemValue (hashObject = {}, $propertyName = 'Text', $depthcount = 0) {
    if (hashObject[$propertyName]) {
      return hashObject[$propertyName]
    } else {
      if (++$depthcount <= 3) {
        // eslint-disable-next-line prefer-const
        for (let key in hashObject) {
          const value = this.getItemValue(hashObject[key], $propertyName, $depthcount)
          if (value) {
            return value
          }
        }
      }
      return undefined
    }
  }

  static getItemChain (hashObject = {}, $propertyName = 'Text') {
    if (hashObject.Chain && hashObject[$propertyName]) {
      return [...hashObject.Chain, this.getItemValue(hashObject, $propertyName)]
    }
    return undefined
  }

  static flattenItemList (itemList = [], FlattenToString = false) {
    const temporaryArray = []
    for (const item in itemList) {
      if (item.Description) {
        temporaryArray.push({
          Text: item.Text,
          Description: item.Desccription
        })
      } else {
        if (FlattenToString) {
          temporaryArray.push(item.Text)
        } else {
          temporaryArray.push({
            Text: item.Text
          })
        }
      }
    }
    return temporaryArray
  }

  static _flattenHashItem (HashItemArray = []) {
    const _extract = (hash) => {
      if (hash.Description) {
        return {
          Text: hash.Text,
          Description: hash.Description
        }
      } else {
        return {
          Text: hash.Text
        }
      }
    }
    const temporaryArray = []

    for (const item of HashItemArray) {
      temporaryArray.push(_extract(item))
      if (item.AdditionalProcedure) {
        temporaryArray.push(_extract(item.AdditionalProcedure))
      }
    }

    return temporaryArray
  }

  static exportCase (item = {}, InstituteId = '99999', params = { spliceDateOfProcedure: false, exportAllfields: false }) {
    const temporaryItem = {}
    const propsToExport = [
      'Age', 'JSOGId', 'NCDId',
      'DateOfProcedure', 'DateOfProcedure', 'ProcedureTime', 'PresentAE',
      'Imported'
    ]
    if (params.exportAllfields) {
      propsToExport.push('Name', 'InstitutionalPatientId')
      params.spliceDateOfProcedure = false
    }

    for (const prop of propsToExport) {
      if (item[prop] !== undefined) {
        temporaryItem[prop] = item[prop]
      }
    }
    if (params.spliceDateOfProcedure) delete temporaryItem.DateOfProcedure

    temporaryItem.UniqueID = [InstituteId, item.DateOfProcedure.substring(0, 4), item.SequentialId].join('-')

    temporaryItem.Diagnoses = this._flattenHashItem(item.Diagnoses)
    temporaryItem.Procedures = this._flattenHashItem(item.Procedures)
    if (item.AEs) {
      temporaryItem.AEs = Object.assign([], item.AEs)
    }
    return temporaryItem
  }
}
