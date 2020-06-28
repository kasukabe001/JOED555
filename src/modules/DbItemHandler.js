// eslint-disable-next-line no-unused-vars
export default class DbItems {
  // データベースの項目
  // Diagnoses - Array - String/Hash
  // Procedures - Array - Hash
  // [
  //   // 以下のhashがitem
  //  {
  //     Text: "登録される内容",
  //     Chain: [ {{カテゴリ}}, {{対象}}|undefined ]
  //     AdditionalProcedure: { Text: ..., Description: [] } => Chainを除くitem/出力データでは主アイテムの次に入る
  //     Description: []
  //     UserTyped: boolean
  //  }, ...
  // ]

  // 項目に登録された内容を取得する

  static getItemValue (hashObject = {}, $propertyName = 'Text', $depthcount = 3) {
    if (hashObject[$propertyName]) {
      return hashObject[$propertyName]
    } else {
      if (--$depthcount) {
        for (const key in hashObject) {
          const value = this.getItemValue(hashObject[key], $propertyName, $depthcount)
          if (value) {
            return value
          }
        }
      }
      return undefined
    }
  }

  // Chain[0], Chain[1], TEXT の配列を取得する

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

  // 症例データの検証

  static checkConsistency (caseItem, exportOnly = false) {
    // 必須入力項目
    const BasicInformations =
      caseItem.Age > 0 &&
      !!caseItem.InstitutionalPatientId &&
      !!caseItem.DateOfProcedure &&
      !!caseItem.ProcedureTime

    const Year = caseItem.substr(0, 4)
    console.log(Year)
    return BasicInformations
  }

  // 症例データからエクスポート用のデータを成形する
  //
  // UniqueID を付与する
  //
  // @Param Object
  // @Param String
  // @Param Object
  static exportCase (item = {}, InstituteId = '99999', params = { spliceDateOfProcedure: false, exportAllfields: false }) {
    const temporaryItem = {}
    const propsToExport = [
      'Age', 'JSOGId', 'NCDId',
      'DateOfProcedure', 'DateOfProcedure', 'ProcedureTime', 'PresentAE', 'TypeOfProcedure',
      'Imported'
    ]
    if (params.exportAllfields) {
      propsToExport.splice(3, 0, 'InstitutionalPatientId', 'Name')
      params.spliceDateOfProcedure = false
    }
    if (!params.spliceDateOfProcedure) {
      propsToExport.splice(3, 'DateOfProcedure')
    }

    temporaryItem.UniqueID = [InstituteId, item.DateOfProcedure.substring(0, 4), item.SequentialId].join('-')

    for (const prop of propsToExport) {
      if (item[prop] !== undefined) {
        temporaryItem[prop] = item[prop]
      }
    }

    temporaryItem.Diagnoses = this._flattenHashItem(item.Diagnoses)
    temporaryItem.Procedures = this._flattenHashItem(item.Procedures)
    if (item.AEs) {
      temporaryItem.AEs = Object.assign([], item.AEs)
    }
    return temporaryItem
  }
}
