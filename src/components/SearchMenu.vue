<template>
  <div class="menu-item">
    <div class="menu-item-content">
      <div>
        <div><span>検索対象</span></div>
        <div>
          <select v-model="Selection">
            <option v-for="(item, index) of Query" :key="index" :value="item">{{item.label}}</option>
          </select>
        </div>
      </div>
    </div>
    <div class="menu-item-content">
      <input type="text" />
    </div>
    <div>
      <InputSwitchField
        v-model="UseRegexp"
        title="検索式"
        :options="{ 部分一致: false, 正規表現: true }"
        :disabled="RegexpDisabled"
      />
    </div>
    <div>
      <el-button type="primary">検索</el-button>
    </div>
  </div>
</template>

<script>
import InputSwitchField from '@/components/Molecules/InputSwitchField'

export default {
  name: 'SearchMenu',
  components: {
    InputSwitchField
  },
  data () {
    return ({
      UseRegexp: false,
      Selection: {},
      Query: [
        { label: '問い合わせ番号', regexp: false },
        { label: '患者ID', regexp: false },
        { label: '患者名', regexp: true },
        { label: '手術診断', regexp: true },
        { label: '実施術式', regexp: true }
      ]
    })
  },
  computed: {
    RegexpDisabled () {
      return this.Selection.regexp !== undefined ? !this.Selection.regexp : true
    }
  }
}
</script>
