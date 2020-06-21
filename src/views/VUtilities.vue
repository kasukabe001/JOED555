<template>
  <div>
    <el-tabs v-model="SelectedTab">
      <el-tab-pane name="list">
        <span slot="label"><i class="el-icon-d-arrow-left" /> 戻る</span>
      </el-tab-pane>
      <el-tab-pane v-for="(item, name, index) in Tabs" :key="index" :label="name" :name="item"/>
    </el-tabs>
    <router-view>
    </router-view>
  </div>
</template>

<script>
export default {
  name: 'ViewUtilities',
  data () {
    return ({
      Tabs: {
        設定: 'settings',
        データ出力: 'export',
        データ読み込み: 'import',
        JOED5について: 'about'
      },
      SelectedTab: 'settings'
    })
  },
  watch: {
    SelectedTab (newvalue) {
      this.$router.push({ name: newvalue })
    }
  },
  methods: {
    goBack () {
      this.$router.push({ name: 'list' })
    }
  }
}
</script>
