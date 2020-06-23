<template>
  <div class="menu-item">
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
        :active-value="1"
        active-color="#444444"
        inactive-text="降順"
        :inactive-value="-1"
        inactive-color="#444444" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'SortMenu',
  prop: {
    value: {
      SortItem: { required: true },
      SortOrder: { required: true }
    }
  },
  computed: {
    SortItem: {
      get () { return this.value.SortItem },
      set (newvalue) {
        this.value.SortItem = newvalue
        this.$emit('update', this.value) }
    },
    SortOrder: {
      get () { return this.value.SortOrder },
      set (newvalue) {
        this.value.SortOrder = newvalue
        this.$emit('update', this.value)
      }
    }
  }
}
</script>

<style lang="sass">
</style>
