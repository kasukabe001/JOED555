import DaignosisTree from '@/modules/DiagnosisItemList'
import ProcedureTree from '@/modules/ProcedureItemList'
// import { resolve, reject } from 'core-js/fn/promise'

// 2020年時点の日産腫瘍登録患者No.表記
const JSOGboardCaseNoFormat = /^(CC|EM|US|UAS|OV|VU|TS)20\d{2}-\d+$/ig
// NCDの症例識別コード
const NCDIdFormat = /\d{18}-\d{2}-\d{2}-\d{2}/g
// カテゴリチェックのための正規化テーブル
export const CategoryTranslation = {
  腹腔鏡: '腹腔鏡',
  腹腔鏡悪性: '腹腔鏡悪性',
  ロボット: '腹腔鏡',
  ロボット悪性: '腹腔鏡悪性',
  子宮鏡: '子宮鏡',
  卵管鏡: '卵管鏡'
}

// 症例データの検証
//
// @Param Object １症例分のドキュメントオブジェクト
export async function ValidateCase (item = {}) {
  return new Promise((resolve) => { resolve() })
    .then(_ => {
      return CheckBasicInformations(item)
    })
    .then(_ => {
      return ValidateAdditionalInformations(item)
    })
    .then(_ => {
      return CheckSections(item)
    })
    .then(_ => {
      return ValidateCategoryMatch(item)
    })
    .then(_ => {
      const Year = item.DateOfProcedure.substr(0, 4)

      return new Promise((resolve, reject) => {
        // ES2020が使えるようになったらPromise.allSettledへ置き換える
        Promise.all([
          new Promise(resolve => {
            CheckDupsInDiagnoses(item)
              .then(_ => resolve())
              .catch(e => resolve(e))
          }),
          new Promise(resolve => {
            ValidateDiagnoses(item, Year)
              .then(_ => resolve())
              .catch(e => resolve(e))
          }),
          new Promise(resolve => {
            CheckDupsInProcedures(item)
              .then(_ => resolve())
              .catch(e => resolve(e))
          }),
          new Promise(resolve => {
            ValidateProcedures(item, Year)
              .then(_ => resolve())
              .catch(e => resolve(e))
          }),
          new Promise(resolve => {
            ValidateAEs(item)
              .then(_ => resolve())
              .catch(e => resolve(e))
          })
        ])
          .then(results => {
            const warningMessage = results
              .filter(value => value)
              .map(item => item.message)
              .join('\n')

            if (warningMessage) {
              reject(warningMessage)
            } else {
              resolve()
            }
          })
      })
    })
}

// 必須基本情報の有無
//
export async function CheckBasicInformations (item) {
  return new Promise((resolve, reject) => {
    if (item.Age > 0 && item.Age < 130 &&
      item.InstitutionalPatientId &&
      item.DateOfProcedure.match(/^20[0-9]{2}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/) &&
      item.ProcedureTime
    ) {
      resolve()
    } else {
      reject(new Error('患者ID・手術日・手術時間・患者年齢の入力を確認してください.'))
    }
  })
}

// 補足登録情報の検証
//
export async function ValidateAdditionalInformations (item) {
  return new Promise((resolve, reject) => {
    const errorStrings = []
    if (item.JSOGId && item.JSOGId.match(JSOGboardCaseNoFormat) === null) {
      errorStrings.push('日産婦腫瘍登録の患者No.の様式が不正です.')
    }
    if (item.NCDId && item.NCDId.match(NCDIdFormat) === null) {
      errorStrings.push('NCD症例識別コードが不正です.')
    }
    if (errorStrings.length > 0) {
      reject(new Error(errorStrings.join('\n')))
    }
    resolve()
  })
}

// 登録情報の有無
//
export async function CheckSections (item) {
  return new Promise((resolve, reject) => {
    Promise
      .all([
        new Promise((resolve) => {
          resolve(item.Diagnoses.length === 0 ? '手術診断の入力がありません.' : undefined)
        }),
        new Promise((resolve) => {
          resolve(item.Procedures.length === 0 ? '実施手術の入力がありません.' : undefined)
        }),
        new Promise((resolve) => {
          resolve(item.PresentAE === true && (!item.AEs || item.AEs.length === 0) ? '合併症の入力がありません.' : undefined)
        })
      ])
      .then(
        (resolvevalues) => {
          const errors = resolvevalues.filter(item => item)
          const realerrors = errors.filter(item => item)
          if (realerrors.length > 0) {
            reject(new Error(errors.join('\n')))
          }
          resolve()
        }
      )
  })
}
// 主たる術後診断・実施術式のカテゴリの一致の検証
//
export async function ValidateCategoryMatch (item) {
  return new Promise((resolve, reject) => {
    if (CategoryTranslation[item.Diagnoses[0].Chain[0]] ===
      CategoryTranslation[item.Procedures[0].Chain[0]]) {
      resolve()
    } else {
      reject(new Error('主たる術後診断と主たる実施術式のカテゴリが一致していません.'))
    }
  })
}

// 術後診断の重複の有無
//
export async function CheckDupsInDiagnoses (item) {
  return new Promise((resolve, reject) => {
    if (item.Diagnoses.map(item => item.Text)
      .filter((item, index, self) => self.indexOf(item) !== self.lastIndexOf(item))
      .length <= 0) {
      resolve()
    } else {
      reject(new Error('手術診断に重複があります.'))
    }
  })
}

// 術後診断の重複確認と年次ツリーとの整合性検証
//
export async function ValidateDiagnoses (item, year) {
  const tree = new DaignosisTree()
  return new Promise((resolve, reject) => {
    const promiseArray = [new Promise(resolve => {
      CheckDupsInDiagnoses(item)
        .then(_ => resolve())
        .catch(error => resolve(error.message))
    })]
    for (const diagnosis of item.Diagnoses) {
      promiseArray.push(new Promise(resolve => {
        if (diagnosis.UserTyped === true) {
          resolve()
        }
        const treeList = tree.flatten(diagnosis.Chain[0], year)
        if (treeList.indexOf(diagnosis.Text) >= 0) {
          resolve()
        }
        resolve(diagnosis.Text + ' が診断マスタにありません.再入力をお願いします.')
      }))
      Promise
        .all(promiseArray)
        .then(errors => {
          const realerrors = errors.filter(item => item)
          if (realerrors.length > 0) {
            reject(new Error(realerrors.join('\n')))
          }
          resolve()
        })
    }
  })
}

// 実施手術の重複の有無
//
export async function CheckDupsInProcedures (item) {
  return new Promise((resolve, reject) => {
    if (item.Procedures.map(
      item => [
        (item.AdditionalProcedure ? [item.Text, item.AdditionalProcedure.Text] : [item.Text]),
        ...(item.Ditto ? item.Ditto : [])
      ]
    )
      .flat()
      .filter((item, index, self) => item && (self.indexOf(item) !== self.lastIndexOf(item)))
      .length <= 0) {
      resolve()
    } else {
      reject(new Error('実施手術の内容に重複があります.'))
    }
  })
}

// 実施手術名の重複確認と年次ツリーとの整合性検証
//
export async function ValidateProcedures (item, year) {
  const tree = new ProcedureTree()

  return new Promise((resolve, reject) => {
    const promiseArray = [new Promise(resolve => {
      CheckDupsInProcedures(item)
        .then(_ => resolve())
        .catch(error => resolve(error.message))
    })]
    for (const procedure of item.Procedures) {
      promiseArray.push(new Promise(resolve => {
        if (procedure.UserTyped === true) {
          resolve()
        }
        const treeList = tree.flatten(procedure.Chain[0], year)
        if (treeList.indexOf(procedure.Text) >= 0) {
          resolve()
        }
        resolve(procedure.Text + ' が術式マスタにありません.再入力をお願いします.')
      }))
    }
    Promise
      .all(promiseArray)
      .then(errors => {
        const realerrors = errors.filter(item => item)
        if (realerrors.length > 0) {
          reject(new Error(realerrors.join('\n')))
        }
        resolve()
      })
  })
}

// 合併症の重複と整合性確認
//
export async function ValidateAEs (item) {
  return new Promise((resolve, reject) => {
    Promise.all([
      new Promise((resolve) => {
        const AEs = item.AEs ? item.AEs.map(AE => [AE.Category, ...(AE.Title || []), ...(AE.Cause || [])].join(':')) : []
        if (AEs.filter((value, index, self) => self.indexOf(value) !== self.lastIndexOf(value)).length <= 0) {
          resolve()
        }
        resolve('合併症の登録内容に重複があります.')
      }),
      new Promise((resolve) => {
        /* CheckSectionsで同一の整合性確認がなされているのでここでは省略する
        if (item.PresentAE === true && (!item.AEs || item.AEs.length === 0)) {
          resolve('合併症の項目が入力されていません.')
        }
        */
        if (item.PresentAE === false && (item.AEs && item.AEs.length > 0)) {
          resolve('合併症の有無と合併症の入力との整合がとれません.')
        }
        resolve()
      })
    ]).then(errors => {
      const realerrors = errors.filter(item => item)
      if (realerrors.length > 0) {
        reject(new Error(realerrors.join('\n')))
      }
      resolve()
    })
  })
}
