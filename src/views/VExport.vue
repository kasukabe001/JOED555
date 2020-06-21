<template>
  <div>
    <div class="title-section">学会提出データの出力</div>
    <div class="label"><span>出力する年次</span></div>
    <div class="field">
      <select>
        <option value="2020">2020年</option>
        <option value="2019">2019年</option>
        <option value="whole">すべて</option>
      </select>
    </div>
    <InputSwitchField
      v-model="ExportDateOfProcedure"
      title="手術実施日の出力"
      :options="{しない: false, する: true}" />
    <el-button type="primary">出力データの作成</el-button>
    <el-button type="primary" disabled>出力先を指定してファイルの出力</el-button>
  </div>
</template>

<script>
import InputSwitchField from '@/components/Molecules/InputSwitchField'

export default {
  name: 'ViewExport',
  components: {
    InputSwitchField
  },
  data () {
    return ({
      ExportDateOfProcedure: true
    })
  }
}
</script>
