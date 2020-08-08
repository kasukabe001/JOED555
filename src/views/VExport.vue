<template>
  <div style="width: 900px;">
    <div class="title-section">データの出力</div>
    <div class="label"><span>出力する年次</span></div>
    <div class="field">
      <SelectYear v-model="ExportYear"></SelectYear>
    </div>

    <InputSwitchField
      v-model="ExportDateOfProcedure"
      title="手術実施日の出力"
      :options="{しない: false, する: true}" />
    <div>
      <el-button type="primary" @click="StartProcessing()">出力データの作成</el-button>
    </div>

    <el-collapse-transition>
      <div class="export-progression" v-if="ProcessingStep !== undefined">
        <el-steps :active="ProcessingStep" process-status="warning" finish-status="success" direction="vertical" space="42px">
          <el-step title="システム設定" />
          <el-step title="要修正データの修正を確認" />
          <el-step title="妥当性の検証">
            <template #description>
              <el-progress :percentage="ProgressStepThree"></el-progress>
            </template>
          </el-step>
          <el-step title="提出用データとして整形">
            <template #description>
              <el-progress :percentage="ProgressStepFour"></el-progress>
            </template>
          </el-step>
          <el-step title="チェックサムの計算" />
          <el-step title="最終処理" />
        </el-steps>
      </div>
    </el-collapse-transition>

    <div>
      <textarea :value="OutputString" v-show="ShowPreview" cols="80" rows="10" disabled></textarea>
    </div>
    <div>
      <el-button type="primary" :disabled="!ReadyForExport" @click="ShowPreview = true">出力先結果の確認</el-button>
      <el-button type="primary" :disabled="!ReadyForExport" @click="Download()">出力先を指定してファイルの出力</el-button>
    </div>
  </div>
</template>

<script>
import InputSwitchField from '@/components/Molecules/InputSwitchField'
import SelectYear from '@/components/Molecules/SelectYear'
import DbItems from '@/modules/DbItemHandler'
import Popups from '@/modules/Popups'
import { ValidateCase } from '@/modules/CaseValidater'

export default {
  name: 'ViewExport',
  components: {
    SelectYear, InputSwitchField
  },
  data () {
    return ({
      ExportYear: '',
      ExportDateOfProcedure: true,
      Selector: {},

      ProcessingStep: undefined,
      ProgressStepThree: 0,
      ProgressStepFour: 0,
      ProcessingAbort: false,
      ReadyForExport: false,

      ShowPreview: false,
      OutputString: ''
    })
  },
  methods: {
    StartProcessing () {
      this.ProcessingPreparation = true
      this.ProgressStepFour = 0
      this.ProcessingAbort = false
      this.ReadyForExport = false
      this.ShowPreview = false

      this.ProcessingStep = 0

      // transitionの時間だけちょっと待つ（正直無駄）
      new Promise((resolve) => setTimeout(resolve, 500))
        .then(_ => {
          return this.CheckSystem()
        })
        .then(_ => {
          this.ProcessingStep++
          return this.CheckImported()
        })
        .then(_ => {
          this.ProcessingStep++
          return this.CheckConsistency()
        })
        .then(_ => {
          this.ProcessingStep++
          return this.CreateExportData()
        })
        .then(exportItems => {
          this.ProcessingStep++
          return this.CreateHeader(exportItems)
        })
        .then(count => {
          this.ProcessingStep = 6
          if (count > 0) {
            this.ReadyForExport = true
          }
        })
        .catch(error => {
          this.ReadyForExport = false
          Popups.alert(error.message)
        })
    },

    Download () {
      // ブラウザでの動作にあわせて実装 electron では !要rewrite!
      const temporaryElementA = document.createElement('A')
      temporaryElementA.href = URL.createObjectURL(new Blob([this.OutputString]), { type: 'application/json' })
      temporaryElementA.download = 'joed-data.json'
      temporaryElementA.style.display = 'none'
      document.body.appendChild(temporaryElementA)
      temporaryElementA.click()
      document.body.removeChild(temporaryElementA)
    },

    // Step 1 - 施設名とIDが設定されているかを確認
    //
    CheckSystem () {
      return new Promise((resolve) => { resolve() })
        .then(_ => {
          return new Promise((resolve, reject) => {
            const InstitutionID = this.$store.getters['system/InstitutionID']
            resolve(InstitutionID)
          })
        })
        .then(InstitutionID => {
          return new Promise((resolve, reject) => {
            if (InstitutionID === '') { reject(new Error('施設情報が未設定です.')) }
            resolve(InstitutionID)
          })
        })
    },

    // Step 2 - インポートデータがすべて確認されているかを確認
    //
    // インポートデータ( Imported )で特になんの問題も無くインポートできたもの以外には Notification がある
    CheckImported () {
      const DatabaseInstance = this.$store.state.DatabaseInstance

      return new Promise((resolve) => { resolve() })
        .then(_ => {
          return new Promise((resolve, reject) => {
            const selector = {
              SequentialId: { $gt: 0 },
              Imported: { $exists: true },
              Notification: { $exists: true }
            }
            if (this.ExportYear !== '') {
              const reg = new RegExp('^' + this.ExportYear + '-')
              selector.DateOfProcedure = { $regex: reg }
            }

            DatabaseInstance.count(selector, (error, count) => {
              if (error) { reject(error) }
              if (count > 0) { reject(new Error('未確認の読み込みデータがあります.')) }
              resolve()
            })
          })
        })
    },
    // Step 3 - データの妥当性検証
    //
    // 基本的に入力時に検証されているので大丈夫だと思うが：
    //  必須項目の有無
    //  項目の重複(ditto含む)
    CheckConsistency () {
      // マーキングを含む作業にはSequentialIdではなく、indexされている_idを使用する.
      function CheckConsistencies (documentids, numberOfpool = 10) {
        const idPool = Object.assign([], documentids)
        const sources = idPool.splice(0, numberOfpool)

        const ErrorsOfDocument = []

        const query = { _id: { $in: [...sources] } }
        console.log('Query is ' + JSON.stringify(query))

        return new Promise((resolve, reject) => {
          DatabaseInstance
            .find(query)
            .exec((error, querydoc) => {
              if (error) reject(new Error('データベースエラーです.'))
              resolve(querydoc)
            })
        }).then(documents => {
          return Promise.all(
            documents.map(
              item => new Promise(resolve => {
                ValidateCase(item)
                  .catch(error =>
                    ErrorsOfDocument.push({
                      _id: item._id,
                      message: error
                    })
                  )
                  .then(_ =>
                    resolve()
                  )
              })
            )
          )
        }).then(_ => {
          if (idPool.length > 0) {
            return CheckConsistencies(idPool, numberOfpool)
              .then(SecondDocuments => {
                return new Promise(resolve => resolve([...ErrorsOfDocument, ...SecondDocuments]))
              })
          }
          return new Promise(resolve => resolve(ErrorsOfDocument))
        }).then(DocumentList => {
          return new Promise(resolve => resolve(DocumentList))
        })
      }

      function SetNotificationField (documents) {
        const details = documents.pop()
        if (details) {
          DatabaseInstance.update(
            { _id: details._id },
            { $set: { Notification: details.message } },
            {},
            _ => SetNotificationField(documents)
          )
        }
      }

      const DatabaseInstance = this.$store.state.DatabaseInstance
      const selector = {
        SequentialId: { $gt: 0 }
      }
      // let ProgressStep = 1
      this.ProgressStepThree = 0

      return new Promise((resolve, reject) => resolve())
        .then(_ => {
          return new Promise((resolve, reject) => {
            if (this.ExportYear !== '') {
              const reg = new RegExp('^' + this.ExportYear + '-')
              selector.DateOfProcedure = { $regex: reg }
            }

            DatabaseInstance
              .find(selector)
              .projection({ _id: 1 })
              .exec((error, documents) => {
                if (error) reject(error)
                if (documents.length > 0) resolve(documents.map(item => item._id))
                reject(new Error('エクスポートの対象がありません.'))
              })
          })
        })
        .then(documentids => {
          return CheckConsistencies(documentids)
        })
        .then(ErrorsOfDocument => {
          return new Promise((resolve, reject) => {
            const errorcount = ErrorsOfDocument.length
            if (errorcount > 0) {
              SetNotificationField(ErrorsOfDocument)
              reject(
                new Error(
                  'データ検証で' +
                  errorcount +
                  '件のエラーが確認されました.\n該当するデータの修正を御願いします.'
                )
              )
            } else {
              resolve()
            }
          })
        })
    },
    // Step 4 - データの整形
    //
    CreateExportData () {
      const DatabaseInstance = this.$store.state.DatabaseInstance

      this.ProgressStepFour = 0

      return new Promise((resolve) => { resolve() })
        .then(_ => {
          return new Promise((resolve, reject) => {
            const selector = {
              SequentialId: { $gt: 0 }
            }
            if (this.ExportYear !== '') {
              const reg = new RegExp('^' + this.ExportYear + '-')
              selector.DateOfProcedure = { $regex: reg }
            }

            DatabaseInstance.find(selector)
              .sort({ SequentialId: 1 })
              .exec((error, documents) => {
                if (error) reject(error)
                resolve(documents)
              })
          })
        })
        .then(documents => {
          const temporaryExportItems = []
          const InstituteId = this.$store.getters['system/InstitutionID']

          return new Promise((resolve, reject) => {
            for (const index in documents) {
              const item = documents[index]
              this.ProgressStepFour = parseInt(index * 100.0 / documents.length)

              temporaryExportItems.push(
                DbItems.exportCase(item, InstituteId,
                  {
                    spliceDateOfProcedure: !this.ExportDateOfProcedure
                  }
                )
              )
            }
            this.ProgressStepFour = 100
            resolve(temporaryExportItems)
          })
        })
    },
    // Step 5 - データヘッダの作成
    //
    CreateHeader (exportItem) {
      return new Promise((resolve) => {
        const length = exportItem.length

        if (length > 0) {
          const HHX = require('xxhashjs')
          const TimeStamp = Date.now()

          const OutputString = JSON.stringify(exportItem, ' ', 2)
          const Checksum = HHX.h64(OutputString, TimeStamp).toString(16)

          exportItem.splice(0, 0, {
            InstitutionName: this.$store.getters['system/InstitutionName'],
            InstitutionID: this.$store.getters['system/InstitutionID'],
            JSOGoncologyboardID: this.$store.getters['system/JSOGInstitutionID'],
            TimeStamp: TimeStamp,
            Year: this.ExportYear || 'ALL',
            NumberOfCases: exportItem.length,
            MD5: Checksum
          })
        }
        this.OutputString = JSON.stringify(exportItem, ' ', 2)
        resolve(length)
      })
    }
  }
}
</script>
