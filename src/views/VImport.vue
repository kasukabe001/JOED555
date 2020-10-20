<template>
  <div style="width: 900px;">
    <div class="title-section">mergeファイルからのデータ読み込み</div>
    <div>
      症例登録システムver.4で生成されたmergeファイルから症例データを読み込むことが出来ます.<br/>
      システムの大幅な変更に伴い,データの修正は必ず必要になります.併せて以下の制限がありますがご了承ください.<br/>
      <ul>
        <li>この処理で読み込まれたデータについては, 全て編集と確認が必要になります.</li>
        <li>合併症については「合併症なし」以外は自動での読み込みが出来ません. ご面倒ですが個々に入力を御願いします.</li>
      </ul>
    </div>
    <div>
      <InputFile @change="LoadFile"></InputFile>
      <el-button type="primary" :disabled="InFile.length <= 0" @click="ProcessFile()">読み込みを開始</el-button>
      <el-button type="primary" :disabled="!ReadyToRegister" :loading="Processing" @click="CommitImported">読み込んだデータの登録</el-button>
    </div>

    <el-collapse-transition>
      <div class="export-progression" v-show="ProcessStep">
        <el-steps :active="ProcessStep" process-status="warning" finish-status="success" direction="vertical" space="42px">
          <el-step title="入力ファイルのフォーマット検証とフィールドの割り当て">
            <template #description>
              <span>ファイル中に{{InFile.length}}件のデータがあります.<br/></span>
              <span v-if="FileIsLabeled">指定のファイルは提出用データです.患者IDは登録番号から自動生成されます.</span>
            </template>
          </el-step>
          <el-step title="レコードの検証">
            <template #description>
              <span v-if="QueryDocuments.length > 0">{{QueryDocuments.length}}件のデータが対象になります.</span>
            </template>
          </el-step>
          <el-step title="登録" v-show="ProcessStep === 3">
            <template #description>
              <el-progress :percentage="ImportPercentage"></el-progress>
            </template>
          </el-step>
        </el-steps>
      </div>
    </el-collapse-transition>

    <TheWrapper v-if="Processing"/>
  </div>
</template>

<script>
import InputFile from '@/components/Molecules/InputFile'
import TheWrapper from '@/components/Atoms/AtomTheWrapper'
import { phraseTitledCSV, CreateDocument } from '@/modules/CSVimporter'
import Popups from 'depmodules/Popups'

export default {
  name: 'ViewImport',
  components: { InputFile, TheWrapper },
  data () {
    return ({
      Processing: false,
      ProcessStep: 0,
      ImportPercentage: 0,
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
        Popups.alert('指定されたファイルは適切な JOED ver 4 の mergeファイルではありません.')
        this.ReadyToRegister = false
      }
      this.ProcessStep = 0
    },
    ProcessFile () {
      this.QueryDocuments.splice(0)
      try {
        this.ProcessStep = 1
        for (const record of this.InFile) {
          // console.log(record)
          const createddocument = CreateDocument(record)
          if (createddocument) {
            this.QueryDocuments.push(createddocument)
          } else {
            Popups.alert('指定されたファイル中に不適切なレコードがあります.')
          }
        }

        this.ProcessStep = 2
        this.ReadyToRegister = true
      } catch (error) {
        console.log(error)
      }
    },
    async CommitImported () {
      this.ProcessStep = 3
      this.ImportPercentage = 0
      this.Processing = true
      let processedDocuments = 0
      for (const newdocument of this.QueryDocuments) {
        try {
          await this.$store.dispatch('UpsertDocument', newdocument)
          this.ImportPercentage = Math.round(++processedDocuments * 100 / this.QueryDocuments.length)
        } catch (error) {
          Popups.alert(error)
        }
      }
      this.Processing = false
    }
  }
}
</script>
