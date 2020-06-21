<template>
  <div class="menu-item">
    <div class="menu-item-content">
      <el-select v-model="ComponentFilterItems" multiple clearable placeholder="全て表示する">
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
  </div>
</template>

<script>
export default {
  name: 'FilterMenu',
  props: {
    FilterItems: {
      type: Array,
      required: true
    }
  },
  computed: {
    ComponentFilterItems: {
      get () { return this.FilterItems },
      set (newvalue) {
        this.$emit('update', newvalue)
      }
    }
  }
}
</script>

<style lang="sass">

</style>
