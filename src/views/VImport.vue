<template>
  <div style="width: 900px;">
    <div class="title-section">merge/CSVファイルからのデータ読み込み</div>
    <div>
      過去の症例登録システムで生成されたmergeファイルから症例データを読み込むことが出来ます.<br/>
      システムの大幅な変更に伴い,データの修正は必ず必要になります.併せて以下の制限がありますがご了承ください.<br/>
      <ul>
        <li>この処理で読み込まれたデータについては, 全て編集と確認が必要になります.</li>
        <li>合併症については「合併症なし」以外は自動での読み込みが出来ません. ご面倒ですが個々に入力を御願いします.</li>
      </ul>
    </div>
    <div>
      <InputFile @change="LoadFile"></InputFile>
      <el-button type="primary" :disabled="InFile.length <= 0" @click="ProcessFile()">読み込みを開始</el-button>
    </div>

    <el-collapse-transition>
      <div class="export-progression" v-if="ProcessingStep">
        <el-steps :active="ProcessingStep" process-status="warning" finish-status="success" direction="vertical" space="42px">
          <el-step title="入力ファイルのフォーマット検証とフィールドの割り当て">
            <template #description>
              <span>{{InFile.length}}件のデータが対象です.<br/></span>
              <span v-if="FileIsLabeled">入力ファイルは提出用データです.必要に応じて患者IDは自動生成されます.</span>
            </template>
          </el-step>
          <el-step title="レコードの検証">
            <template #description>
              <span v-if="QueryDocuments.length > 0">{{QueryDocuments.length}}件のデータが処理されました.</span>
            </template>
          </el-step>
        </el-steps>
      </div>
    </el-collapse-transition>

    <div>
      <el-button type="primary" :disabled="!ReadyToRegister" @click="CommitImported">読み込まれたデータの登録</el-button>
    </div>

  </div>
</template>

<script>
import InputFile from '@/components/Molecules/InputFile'
// import ValidateCase from '@/modules/CaseValidater'
import { phraseTitledCSV, CreateDocument } from '@/modules/CSVimporter'
import Popups from '@/modules/Popups'

export default {
  name: 'ViewImport',
  components: { InputFile },
  data () {
    return ({
      ProcessingStep: 0,
      InFile: [],
      FileIsLabeled: false,
      ReadyToRegister: false,
      QueryDocuments: []
    })
  },
  methods: {
    LoadFile (eventvalue) {
      const records = phraseTitledCSV(eventvalue)
      this.InFile.splice(0)
      if ((Array.isArray(records) && records.length > 0) &&
        (records[0]['内部ID'] && records[0]['手術時間'])) {
        // 一応適正なドキュメントとして扱う
        this.FileIsLabeled = !records[0].ID
        Object.assign(this.InFile, records)
      } else {
        Popups.alert('指定されたファイルは適切なJOED mergeファイルではありません.')
        this.ReadyToRegister = false
      }
      this.ProcessingStep = 0
    },
    ProcessFile () {
      this.QueryDocuments.splice(0)
      try {
        this.ProcessingStep = 1
        for (const record of this.InFile) {
          console.log(record)
          const createddocument = CreateDocument(record)
          if (createddocument) {
            this.QueryDocuments.push(createddocument)
          } else {
            Popups.alert('指定されたファイル中に不適切なレコードがあります.')
          }
        }

        this.ProcessingStep = 2
        this.ReadyToRegister = true
      } catch (error) {
        console.log(error)
      }
    },
    async CommitImported () {
      for (const newdocument of this.QueryDocuments) {
        try {
          await this.$store.dispatch('UpsertItem', newdocument)
        } catch (error) {
          Popups.alert(error)
        }
      }
    }
  }
}
</script>
