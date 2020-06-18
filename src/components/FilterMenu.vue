<template>
  <div class="menu-item">
    <!-- <div class="menu-item-title">フィルタ</div> -->
    <div class="menu-item-content">
      <el-select v-model="FilterItems" multiple clearable placeholder="全て表示する">
        <el-option-group label="カテゴリ">
          <el-option :value="{ field: 'TypeOfProcedure', value: '腹腔鏡' }" label="腹腔鏡" />
          <el-option :value="{ field: 'TypeOfProcedure', value: '腹腔鏡悪性' }" label="腹腔鏡悪性" />
          <el-option :value="{ field: 'TypeOfProcedure', value: 'ロボット' }" label="ロボット" />
          <el-option :value="{ field: 'TypeOfProcedure', value: 'ロボット悪性' }" label="ロボット悪性" />
          <el-option :value="{ field: 'TypeOfProcedure', value: '子宮鏡' }" label="子宮鏡" />
          <el-option :value="{ field: 'TypeOfProcedure', value: '卵管鏡' }" label="卵管鏡" />
        </el-option-group>
        <el-option-group label="情報">
          <el-option :value="{ field: 'PresentAE', value: true }" label="合併症あり" />
          <el-option :value="{ field: 'Notification', value: true }" label="警告あり" />
        </el-option-group>
      </el-select>
    </div>
    <div class="menu-item-bottom">
      <el-button type="primary" @click="Apply()">設定</el-button>
      <el-button type="success"  @click="Revert()">初期設定に戻す</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FilterMenu',
  data () {
    return ({
      FilterItems: []
    })
  },
  computed: {
    Filters () {
      const filterObj = {}
      for (const item of this.FilterItems) {
        if (filterObj[item.field] === undefined) {
          filterObj[item.field] = item.value
        } else {
          if (filterObj[item.field].$in) {
            filterObj[item.field].$in.push(item.value)
          } else {
            filterObj[item.field] = { $in: [filterObj[item.field], item.value] }
          }
        }
      }
      return filterObj
    }
  },
  methods: {
    Apply () {
      this.$store.commit('SetFilters', this.Filters)
      this.$store.dispatch('ReloadDatastore')
    },
    Revert () {
      this.FilterItems.splice(0)
      this.Apply()
    }
  }
}
</script>

<style lang="sass">

</style>
