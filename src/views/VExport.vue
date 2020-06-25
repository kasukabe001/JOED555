<template>
  <div>
    <div class="title-section">データの出力</div>
    <div class="label"><span>出力する年次</span></div>
    <div class="field">
      <SelectYear v-model="ExportYear"></SelectYear>
    </div>

    <InputSwitchField
      v-model="ExportDateOfProcedure"
      title="手術実施日の出力"
      :options="{しない: false, する: true}" />
    <InputSwitchField
      v-model="ExportDataForQuery"
      title="学会提出用データを作成する"
      :options="{しない: false, する: true}" />
    <div>
      <el-button type="primary" @click="StartProcessing()">出力データの作成</el-button>
    </div>

    <el-collapse-transition>
      <div class="export-progression" v-if="ProcessingStep !== undefined">
        <el-steps :active="ProcessingStep" process-status="warning" finish-status="success" direction="vertical" space="42px">
          <el-step title="システム設定" />
          <el-step title="要修正データ" />
          <el-step title="妥当性の検証" />
          <el-step title="提出用データとして整形" />
          <el-step title="チェックサムの計算" />
          <el-step title="最終処理" />
        </el-steps>
      </div>
    </el-collapse-transition>

    <div>
      <textarea :value="tempout" v-show="tempout != ''" cols="80" rows="10"></textarea>
    </div>
    <div>
      <el-button type="primary" :disabled="!ReadyForExport">出力先を指定してファイルの出力</el-button>
    </div>
  </div>
</template>

<script>
import InputSwitchField from '@/components/Molecules/InputSwitchField'
import SelectYear from '@/components/Molecules/SelectYear'
import DbItems from '@/modules/DbItemHandler'
import Popups from '@/modules/Popups'

export default {
  name: 'ViewExport',
  components: {
    SelectYear, InputSwitchField
  },
  data () {
    return ({
      ExportYear: '',
      ExportDateOfProcedure: true,
      ExportDataForQuery: true,
      Selector: {},

      ProcessingStep: undefined,
      ProcessingProgress: 0,
      ProcessingAbort: false,
      ReadyForExport: false,

      tempout: ''
    })
  },
  methods: {
    StartProcessing () {
      this.ProcessingPreparation = true
      this.ProcessingProgress = 0
      this.ProcessingAbort = false

      const InstitutionSetting = {}

      this.ProcessingStep = 0
      this.CheckSystem()
        .then((loadedSetting) => {
          Object.assign(InstitutionSetting, loadedSetting)

          this.ProcessingStep++
          return this.CheckImported()
        })
        .then(_ => {
          this.ProcessingStep = 3 // ++
          return this.CreateExportData(InstitutionSetting.InstitutionID, !this.ExportDateOfProcedure)
        })
        .then(_ => {
          this.ProcessingStep = 6
        })
        .catch((error) => {
          Popups.alert(error)
          console.log(error)
        })
    },

    // 施設名とIDが設定されているかを確認
    //
    CheckSystem () {
      return new Promise((resolve) => { resolve() })
        .then(_ => {
          return new Promise((resolve, reject) => {
            const InstitutionSetting = this.$store.getters['system/GetInstitutionInformation']
            resolve(InstitutionSetting)
          })
        })
        .then((InstitutionSetting) => {
          return new Promise((resolve, reject) => {
            if (InstitutionSetting.InstitutionID === '') { reject(new Error('施設情報が未設定です.')) }
            resolve(InstitutionSetting)
          })
        })
    },

    // インポートデータがすべて確認されているかを確認
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
    // データの妥当性検証
    //
    // 基本的に入力時に検証されているので大丈夫だと思うが：
    //  必須項目の有無
    //  項目の重複(ditto含む)
    /* CheckConsistency () {
      const DatabaseInstance = this.$store.state.DatabaseInstance
      this.ProcessingProgress = 0

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

            DatabaseInstance.find(selector, (error, documents) => {
              if (error) reject(error)
              resolve(document)
            })
          })
        })
        .then(documents => {
          const length = documents.length
          const IdOfErrorDocuments = []

          return new Promise((resolve, reject) => {
            for (const index in document) {
              this.ProcessingProgress = parseInt(index * 100.0 / length)

              const document = documents[index]
              const Year = document.DateOfProcedure.substring(0, 4)

              // 必須項目の確認
              const validateBasicInformations =
                document.Age > 0 &&
                !!document.DateOfProcedure &&
                !!document.ProcedureTime
              if (!validateBasicInformations) IdOfErrorDocuments.push(document.SequentialId)

              // 診断の確認
              for (const item of document.Diagnoses) {
                if (item.DateOfProcedure === Year) {
                  // nop now
                }
              }
            }
          })
        })
    }, */
    CreateExportData (InstituteId = '99999', spliceDateOfProcedure = false) {
      const DatabaseInstance = this.$store.state.DatabaseInstance
      this.ProcessingProgress = 0

      return new Promise((resolve) => { resolve() })
        .then(_ => {
          return new Promise((resolve, reject) => {
            const selector = {
              SequentialId: { $gt: 0 }
            }
            if (this.ExportYear !== '') {
              const reg = new RegExp('^' + this.ExportYear + '-')
              console.log(reg)
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
          const length = documents.length
          const temporaryExportItems = []

          return new Promise((resolve, reject) => {
            for (const index in documents) {
              const item = documents[index]
              this.ProcessingProgress = parseInt(index * 100.0 / length)

              temporaryExportItems.push(
                DbItems.exportCase(item, InstituteId, { spliceDateOfProcedure: spliceDateOfProcedure })
              )
            }

            this.tempout = JSON.stringify(temporaryExportItems, ' ', 2)
            resolve(length)
          })
        })
    }
  }
}
</script>
