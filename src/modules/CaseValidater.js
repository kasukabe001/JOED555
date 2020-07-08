import DaignosisTree from '@/modules/DiagnosisItemList'
import ProcedureTree from '@/modules/ProcedureItemList'

export async function ValidateCase (item = {}) {
  // eslint-disable-next-line no-unused-vars
  let Year = ''

  return new Promise((resolve) => { resolve() })
    .then(_ => {
      return ValidateBasicInformations(item)
    })
    .then(YearToValidate => {
      Year = YearToValidate

      return ValidateAdditionalInformations(item)
    })
    .then(_ => {
      return ValidateCategory(item)
    })
    .then(_ => {
      return CheckDupsInDiagnoses(item)
    })
    .then(_ => {
      return new Promise((resolve, reject) => {
        for (const procedure of item.Procedures) {
          if (!procedure.UserTyped) {
            // ユーザ入力時の際はテーブルとの照合をしない
            resolve()
          }
        }
      })
    })
}

// 必須基本情報
//
// resolveで対象となる年次(20xx)を文字列で返す
export async function ValidateBasicInformations (item) {
  return new Promise((resolve, reject) => {
    if (item.Age > 0 && item.Age < 130 &&
      item.InstitutionalPatientId &&
      item.DateOfProcedure &&
      item.ProcedureTime
    ) {
      resolve(item.DateOfProcedure.substr(0, 4))
    } else {
      reject(new Error('基本情報を確認してください.'))
    }
  })
}

// 補足登録情報
//
export async function ValidateAdditionalInformations (item) {
  return new Promise((resolve, reject) => {
    if (item.JSOGId) {
      if (item.JSOGId.match(/^(CC|EM|OV)\d{4}-\d+$/ig) === null) {
        reject(new Error('症例の腫瘍登録フォーマットが不正です.'))
      }
    }
    if (item.NCDId) {
      if (item.NCDId.match(/\d{18}-\d{2}-\d{2}-\d{2}/g) === null) {
        reject(new Error('症例のNCD症例識別コードが不正です.'))
      }
    }
    resolve()
  })
}

// 情報の有無
//
export async function ValidateArrays (item) {
  return new Promise((resolve, reject) => {
    Promise
      .all([
        new Promise((resolve) => {
          if (item.Diagnoses.length === 0) {
            resolve(new Error('手術診断の入力がありません.'))
          }
          resolve()
        }),
        new Promise((resolve) => {
          if (item.Procedures.length === 0) {
            resolve(new Error('実施手術の入力がありません.'))
          }
          resolve()
        }),
        new Promise((resolve) => {
          if (item.PresentAE === true && item.AEs.length === 0) {
            resolve(new Error('合併症の入力がありません.'))
          }
          resolve()
        })
      ])
      .then(
        (resolvevalues) => {
          const errors = resolvevalues.filter(item => toString.caller(item) === '[object Error]')
          if (errors.length > 0) {
            reject(new Error(errors.join('\n')))
          }
          resolve()
        }
      )
  })
}
// 主たる術後診断・実施術式のカテゴリの一致
//
export const CategoryTranslation = {
  腹腔鏡: '腹腔鏡',
  ロボット: '腹腔鏡',
  腹腔鏡悪性: '腹腔鏡悪性',
  ロボット悪性: '腹腔鏡悪性',
  子宮鏡: '子宮鏡',
  卵管鏡: '卵管鏡'
}

export async function ValidateCategory (item) {
  return new Promise((resolve, reject) => {
    if (CategoryTranslation[item.Diagnoses[0].Chain[0]] ===
      CategoryTranslation[item.Procedures[0].Chain[0]]) {
      resolve(CategoryTranslation[item.Procedures[0].Chain[0]])
    } else {
      reject(new Error('主たる術後診断と主たる実施術式のカテゴリが一致していません.'))
    }
  })
}

// 術後診断の重複の有無
//
export async function CheckDupsInDiagnoses (item) {
  return new Promise((resolve, reject) => {
    if (item.Procedures.map(item => item.Text)
      .flat()
      .filter((item, index, self) => self.indexOf(item) !== self.laseIndexOf(item))
      .length <= 0) {
      resolve()
    } else {
      reject(new Error('術後診断に重複があります.'))
    }
  })
}

// 術後診断の年次ツリーとの整合性
//
export async function ValidateDiagnoses (item, category, year) {
  const checkYear = year !== undefined ? year : item.DateOfProcedure.substr(0, 4)
  const checkCategory = category !== undefined ? category : item.TypeOfProcedure

  const tree = new DaignosisTree()
  const treeList = tree.flatten(checkCategory, checkYear)

  return new Promise((resolve, reject) => {
    for (const diagnosis of item.Diagnoses) {
      if (diagnosis.UserTyped !== true) {
        if (treeList.indexOf(diagnosis.Text) >= 0) {
          resolve()
        }
      }
    }
    reject(new Error('診断マスタとの整合がとれません.診断の再入力をお願いします.'))
  })
}

// 実施手術の重複の有無
//
export async function CheckDupsInProcedures (item) {
  return new Promise((resolve, reject) => {
    if (item.Procedures.map(item => item.AdditionalProcedure ? [item.Text, item.AdditionalProcedure.Text] : item.Text)
      .flat()
      .filter((item, index, self) => self.indexOf(item) !== self.laseIndexOf(item))
      .length <= 0) {
      resolve()
    } else {
      reject(new Error('実施手術に重複があります.'))
    }
  })
}

// 実施手術名の年次ツリーとの整合性
//
export async function ValidateProcedures (item, category, year) {
  const checkYear = year !== undefined ? year : item.DateOfProcedure.substr(0, 4)
  const checkCategory = category !== undefined ? category : item.TypeOfProcedure

  const tree = new ProcedureTree()
  const treeList = tree.flatten(checkCategory, checkYear)

  return new Promise((resolve, reject) => {
    for (const procedure of item.Procedures) {
      if (procedure.UserTyped !== true) {
        if (treeList.indexOf(procedure.Text) >= 0) {
          resolve()
        }
      }
    }
    reject(new Error('実施手術マスタとの整合性がとれません.実施術式の再入力をお願いします.'))
  })
}

// 合併症の重複の有無
//
export async function CheckDupsInAEs (item) {
  return new Promise((resolve, reject) => {
    const AEs = item.AEs.map(AE => [AE.Category, ...(AE.Title || []), ...(AE.Cause || [])].join(':'))
    if (AEs.filter((value, index, self) => self.indexOf(value) !== self.lastIndexOf(value)).length <= 0) {
      resolve()
    }
    reject(new Error('合併症の登録内容に重複があります.'))
  })
}

// 合併症登録の整合性確認
//
export async function ValidateAEs (item) {
  return new Promise((resolve, reject) => {
    if ((item.PresentAE === true && item.AEs.length > 0) ||
      (item.PresentAE === false && item.AEs.length === 0)) {
      resolve()
    } else {
      reject(new Error('合併症の有無と合併症登録の整合がとれません.'))
    }
  })
}
