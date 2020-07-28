<template>
  <div class="drawer-content">
    <div class="drawer-alignright"><i class="el-icon-close" @click="CloseDrawer"></i></div>
    <el-collapse accordion @change="AccordionChanged" :value="1">
      <el-collapse-item title="表示の設定" :name="1">
        <DisplaySettingMenu @commit="SetViewSettings"></DisplaySettingMenu>
      </el-collapse-item>
      <el-collapse-item title="検索" :name="10">
        <SearchMenu @commit="SetViewSettings"></SearchMenu>
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
    AccordionChanged (itemname) {
      if (itemname === 99) {
        this.$router.push({ name: 'settings' })
      }
    },
    SetViewSettings (payload) {
      if (payload) {
        this.$store.commit('SetViewSettings', payload)
      } else {
        this.$store.commit('SetViewSettings')
      }

      this.$store.dispatch('ReloadDatastore').then(_ => {
        this.$notify({
          title: '表示設定が変更されました',
          message: this.$store.getters.GetNumberOfCases + '件表示します.',
          duration: 3000
        })
      })
    },
    RevertViewSetting () {
      this.SetiViewSettings()
    }
  }
}
</script>

<style lang="sass">
// override element's styles
.el-collapse-item__header
  padding: 0 0 0 2rem
  font-size: 1.2rem !important
.el-collapse-item__content
  padding: 0 2rem
  font-size: 1rem !important

.drawer-alignright
  font-size: 1.2rem
  padding-right: 0.5rem
  text-align: right

div.menu-item-content
  & > div
    min-height: 2.6rem
    line-height: 2rem
  select
    width: 100%
    margin: 0.3rem 0
    height: 2rem
  input[type="text"]
    width: 100%
    height: 2rem
  label
    display: inline-block
    margin-left: 0.8rem

div.menu-item-bottom
  margin: 1rem 0
  text-align: right

#display-item-selection
  height: 12rem
  overflow-y: scroll
  border: 2px solid var(--border-color-base)
</style>
