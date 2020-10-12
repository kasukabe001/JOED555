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
      <div class="export-progression" v-if="ProcessStep !== undefined">
        <el-steps :active="ProcessStep" process-status="warning" finish-status="success" direction="vertical" space="42px">
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

    <TheWrapper v-if="ShowPreview" alpha="60" @click="ShowPreview = false">
      <div id="preview">
        画面のクリックで戻ります.<br/>
        <pre>{{OutputString}}</pre>
      </div>
    </TheWrapper>
    <div>
      <el-button type="primary" :disabled="!ReadyForExport" @click="ShowPreview = true">出力先結果の確認</el-button>
      <el-button type="primary" :disabled="!ReadyForExport" @click="Download()" :loading="Processing">出力先を指定してファイルの出力</el-button>
    </div>

    <TheWrapper v-if="Processing"/>
  </div>
</template>

<script>
import InputSwitchField from '@/components/Molecules/InputSwitchField'
import SelectYear from '@/components/Molecules/SelectYear'
import TheWrapper from '@/components/Atoms/AtomTheWrapper'
import DbItems from '@/modules/DbItemHandler'
import Popups from '@/modules/serve/Popups'
import { ValidateCase } from '@/modules/CaseValidater'

export default {
  name: 'ViewExport',
  components: {
    SelectYear, InputSwitchField, TheWrapper
  },
  data () {
    return ({
      ExportYear: '',
      ExportDateOfProcedure: true,
      Selector: {},

      Processing: false,
      ProcessStep: undefined,
      ProgressStepThree: 0,
      ProgressStepFour: 0,
      ReadyForExport: false,

      ShowPreview: false,
      OutputString: ''
    })
  },
  methods: {
    StartProcessing () {
      this.Processing = true
      this.ProgressStepFour = 0
      this.ReadyForExport = false
      this.ShowPreview = false

      this.ProcessStep = 0

      // transitionの時間だけちょっと待つ（正直無駄）
      new Promise((resolve) => setTimeout(resolve, 500))
        .then(_ => {
          return this.CheckSystem()
        })
        .then(_ => {
          this.ProcessStep++
          return this.CheckImported()
        })
        .then(_ => {
          this.ProcessStep++
          return this.CheckConsistency()
        })
        .then(_ => {
          this.ProcessStep++
          return this.CreateExportData()
        })
        .then(exportItems => {
          this.ProcessStep++
          return this.CreateHeader(exportItems)
        })
        .then(count => {
          this.ProcessStep = 6
          if (count > 0) {
            this.ReadyForExport = true
          }
          this.Processing = false
        })
        .catch(error => {
          this.ReadyForExport = false
          this.Processing = false
          Popups.alert(error.message)
        })
    },

    Download () {
      // ブラウザの機能でダウンロードさせる. electronでは要検討かもしれない.
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
      const query = {
        DocumentId: { $gt: 0 },
        Imported: { $exists: true },
        Notification: { $exists: true }
      }
      if (this.ExportYear !== '') {
        const reg = new RegExp('^' + this.ExportYear + '-')
        query.DateOfProcedure = { $regex: reg }
      }

      return this.$store.dispatch('dbCount', { Query: query })
        .then(count => {
          if (count > 0) { return Promise.reject(new Error('未確認のデータがあります.')) }
        })
    },
    // Step 3 - データの妥当性検証
    //
    // 基本的に入力時に検証されているので大丈夫だと思うが：
    //  必須項目の有無
    //  項目の重複(ditto含む)
    CheckConsistency () {
      function CheckConsistencies (documentids) {
        const ErrorsOfDocument = []

        return this.$store
          .dispatch('dbFind', {
            Query: { DocumentId: { $in: [...documentids] } }
          }).then(documents =>
            documents.forEach(item => ValidateCase(item)
              .catch(error => {
                ErrorsOfDocument.push({
                  DocumentId: item.DocumentId,
                  Message: error
                })
                Promise.resolve()
              })
            )
          ).then(_ => Promise.resolve(ErrorsOfDocument))
      }

      function SetNotificationField (documents) {
        const details = documents.pop()
        if (details) {
          return this.$store.dispatch('dbUpdate', {
            Query: { DocumentId: details.DocumentId },
            Update: { $set: { Notification: details.Message } }
          })
            .then(_ => SetNotificationField(documents))
        } else {
          return Promise.resolve()
        }
      }

      // 選択クエリ
      const query = {
        DocumentId: { $gt: 0 }
      }
      if (this.ExportYear !== '') {
        const reg = new RegExp('^' + this.ExportYear + '-')
        query.DateOfProcedure = { $regex: reg }
      }

      // let ProgressStep = 1
      this.ProgressStepThree = 0

      return this.$store.dispatch('dbFind',
        {
          Query: query,
          Projection: { DocumentId: 1 }
        })
        .then(documents => {
          if (documents.length === 0) {
            Promise.reject(new Error('エクスポートの対象がありません.'))
          } else {
            Promise.resolve(documents.map(item => item.DocumentId))
          }
        })
        .then(documentids => {
          return CheckConsistencies(documentids)
        })
        .then(ErrorsOfDocument => {
          return new Promise((resolve, reject) => {
            const errorcount = ErrorsOfDocument.length
            if (errorcount > 0) {
              return SetNotificationField(ErrorsOfDocument)
                .then(_ => reject(
                  new Error(
                    'データ検証で' +
                    errorcount +
                    '件のエラーが確認されました.\n該当するデータの修正を御願いします.'
                  )
                ))
            } else {
              return resolve()
            }
          })
        })
    },
    // Step 4 - データの整形
    //
    CreateExportData () {
      this.ProgressStepFour = 0

      return new Promise((resolve) => { resolve() })
        .then(_ => {
          const query = {
            DocumentId: { $gt: 0 }
          }
          if (this.ExportYear !== '') {
            const reg = new RegExp('^' + this.ExportYear + '-')
            query.DateOfProcedure = { $regex: reg }
          }
          return this.$store.dispatch('dbFind', {
            Query: query,
            Sort: { DocumentId: 1 }
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

<style lang="sass">
div#preview
  position: relative
  height: 80vh
  overflow-y: scroll
  margin: 4rem
  padding: 1rem
  border: 2px solid var(--color-text-primary)
  background: var(--background-color-list)
</style>
