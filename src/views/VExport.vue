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

    <div class="export-progression" v-if="ProcessingPreparation === true">
      <el-timeline>
        <el-timeline-item :hide-timestump="true" size="large" :type="ExportStatus[0]">システム設定のチェック</el-timeline-item>
        <el-timeline-item :hide-timestump="true" size="large" :type="ExportStatus[1]">未修正データ有無をチェック</el-timeline-item>
        <el-timeline-item :hide-timestump="true" size="large" :type="ExportStatus[2]">データの妥当性の検証</el-timeline-item>
        <el-timeline-item :hide-timestump="true" size="large" :type="ExportStatus[3]">提出用データとして整形</el-timeline-item>
        <el-timeline-item :hide-timestump="true" size="large" :type="ExportStatus[4]">チェックサムの計算</el-timeline-item>
        <el-timeline-item :hide-timestump="true" size="large" :type="ExportStatus[5]">最終処理を実行中</el-timeline-item>
      </el-timeline>
    </div>

    <div>
      <el-button type="primary" :disabled="!ReadyForExport">出力先を指定してファイルの出力</el-button>
    </div>
  </div>
</template>

<script>
import InputSwitchField from '@/components/Molecules/InputSwitchField'
import SelectYear from '@/components/Molecules/SelectYear'
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

      ExportStatus: ['Primary', 'Warning', 'Primary', 'Primary', 'Primary', 'Primary'],
      InstituteID: '',

      ProcessingPreparation: false,
      ReadyForExport: false
    })
  },
  methods: {
    StartProcessing () {
      this.ProcessingPreparation = true
    },
    IncrementSteps (step, success = true) {
      const StepList = ['Primary', 'Warning', 'Success']
      if (!success) {
        return 'Danger'
      } else {
        if (step === undefined) {
          return 'Primary'
        } else {
          return StepList[StepList.indexOf(step) + 1]
        }
      }
    },
    CheckSystem () {
      const StatusIndex = 0

      return new Promise().resolve(
      ).then(_ => {
        return new Promise((resolve, reject) => {
          this.ExportStatus.splice(StatusIndex, 1, this.IncrementSteps(this.ExportStatus[StatusIndex]))
          const InstitutionSetting = this.$store.getters['system/GetInstitutionInformation']

          resolve(InstitutionSetting)
        })
      }).then((InstitutionSetting) => {
        return new Promise((resolve, reject) => {
          if (InstitutionSetting.InstitutionID === '') { reject(new Error('施設IDが設定されていません.')) }
          resolve()
        })
      }).then(_ => {
        this.ExportStatus.splice(StatusIndex, 1, this.IncrementSteps(this.ExportStatus[StatusIndex]))
      }).catch((error) => {
        this.ExportStatus.splice(StatusIndex, 1, this.IncrementSteps(null, false))
        Popups.alert(error)
      })
    },
    CheckImported () {
      const StatusIndex = 1
      const DatabaseInstance = this.$store.DatabaseInstance

      return new Promise().resolve(
      ).then(_ => {
        this.ExportStatus.splice(StatusIndex, 1, this.IncrementSteps(this.ExportStatus[StatusIndex]))

        return new Promise((resolve, reject) => {
          const selector = {
            SequentialId: { $gt: 0 },
            Imported: { $exists: true }
          }

          if (this.ExportYear !== '') {
            selector.DateOfProcedure = { $regex: '/^' + this.ExportYear + '-/' }
          }

          DatabaseInstance.count(selector, (error, count) => {
            if (error) { reject(error) }
            if (count > 0) { reject(new Error('未確認の読み込みデータがあります.')) }
            resolve()
          })
        }).then(_ => {
          this.ExportStatus.splice(StatusIndex, 1, this.IncrementSteps(this.ExportStatus[StatusIndex]))
        }).catch((error) => {
          this.ExportStatus.splice(StatusIndex, 1, this.IncrementSteps(null, false))
          Popups.alert(error)
        })
      })
    },
    CheckConsistency () {
    }
  }
}
</script>
