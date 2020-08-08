<template>
  <div style="width: 900px;">
    <div class="title-section">merge/CSVファイルからのデータ読み込み</div>
    <div>
      Filemakerなどで生成されたmergeファイルから症例データを読み込むことが出来ます.<br/>
      システムの大幅な変更に伴い,データの修正は必ず必要になります.併せて以下の制限がありますがご了承ください.<br/>
      <ul>
        <li>この処理で読み込まれたデータについては, 全て編集と確認が必要になります.</li>
        <li>合併症については「合併症なし」以外は自動での読み込みが出来ません. ご面倒ですが入力を御願いします.</li>
      </ul>
    </div>
    <div>
      <input type="file" style="display: none;" accept="" @change="SelectInFile"><el-button type="primary">ファイルの指定</el-button>
      <el-button type="primary" :disabled="!InFile">読み込みを開始</el-button>
    </div>

    <el-collapse-transition>
      <div class="export-progression" v-if="ProcessingStep !== undefined">
        <el-steps :active="ProcessingStep" process-status="warning" finish-status="success" direction="vertical" space="42px">
          <el-step title="入力ファイルのフォーマット検証">
            <span>入力ファイルは提出用データです.</span>
          </el-step>
          <el-step title="フィールドの割り当て">
            <span>患者IDは自動生成されます.</span>
          </el-step>
          <el-step title="レコードの検証">
            <span>n件のデータが処理されました.</span>
          </el-step>
        </el-steps>
      </div>
    </el-collapse-transition>

    <div>
      <el-button type="primary" :disabled="!ReadyForExport" @click="ShowPreview = true">読み込まれたデータの登録</el-button>
    </div>

  </div>
</template>

<script>
import {} from '@/modules/CaseValidater'

export default {
  name: 'ViewImport',
  data () {
    return ({
      InFile: undefined,
      ReadyToRegister: false,
      QueryDocument: undefined
    })
  },
  methods: {
    SelectInFile (event) {
      const files = event.target.files || event.dataTransfer.files
      this.InFile = files[0]
    }
  }
}
</script>
