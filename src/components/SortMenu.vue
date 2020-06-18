<template>
  <div class="menu-item">
    <!-- <div class="menu-item-title">ソート</div> -->
    <div class="menu-item-content">
      <div>
        <select v-model="SortItem">
          <option value="SequentialId">登録順</option>
          <option value="DateOfProcedure">手術日</option>
          <option value="ProcedureTime">手術時間</option>
          <option value="TypeOfProcedure">カテゴリ</option>
          <option value="Age">年齢</option>
          <option value="InstitutionalPatientId">施設の患者ID</option>
        </select>
      </div>

      <el-switch
        v-model="SortOrder"
        active-text="昇順"
        active-value="1"
        active-color="#444444"
        inactive-text="降順"
        inactive-value="-1"
        inactive-color="#444444" />
    </div>
    <div class="menu-item-bottom">
      <el-button type="primary" @click="Apply()">設定</el-button>
      <el-button type="success"  @click="Revert()">初期設定に戻す</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SortMenu',
  data () {
    return ({
      SortItem: 'SequentialId',
      SortOrder: '1'
    })
  },
  computed: {
    SortOrders () {
      return { [this.SortItem]: Number(this.SortOrder) }
    }
  },
  methods: {
    Apply () {
      this.$store.commit('SetSortOrders', this.SortOrders)
      this.$store.dispatch('ReloadDatastore')
    },
    Revert () {
      this.SortItem = 'SequentialId'
      this.SortOrder = '1'
      this.Apply()
    }
  }
}
</script>

<style lang="sass">
div.menu-item-content
  display: flex
  flex-direction: column
  & > div
    height: 2.6rem
  select
    width: 80%
    margin: 0.3rem 0
    height: 2rem
</style>
