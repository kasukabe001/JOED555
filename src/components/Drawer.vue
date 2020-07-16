<template>
  <div class="drawer-content">
    <div class="drawer-alignright"><i class="el-icon-close" @click="CloseDrawer"></i></div>
    <el-collapse accordion @change="AccordionChanged" :value="1">
      <el-collapse-item title="表示の設定" :name="1">
        <DisplaySettingMenu></DisplaySettingMenu>
      </el-collapse-item>
      <el-collapse-item title="検索" :name="10">
        <SearchMenu></SearchMenu>
      </el-collapse-item>
      <el-collapse-item title="ユーティリティ" :name="99">
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
import DisplaySettingMenu from '@/components/DisplaySettingMenu'
import SearchMenu from '@/components/SearchMenu'

export default {
  name: 'Drawer',
  components: {
    DisplaySettingMenu, SearchMenu
  },
  methods: {
    CloseDrawer () {
      this.$emit('close')
    },
    AccordionChanged (value) {
      if (value === 99) {
        this.$router.push({ name: 'settings' })
      }
    }
  }
}
</script>

<style lang="sass">
.el-collapse-item__header
  padding: 0 0 0 2rem
  font-size: 1.2rem !important
.el-collapse-item__content
  padding: 0 2rem
  font-size: 1rem !important
.drawer-alignright
  text-align: right
div.menu-item-content
  display: flex
  flex-direction: column
  & > div
    min-height: 2.6rem
  select
    width: 100%
    margin: 0.3rem 0
    height: 2rem
  input[type="text"]
    width: 100%
    height: 2rem

</style>
