<template>
  <div>
    <div class="open-drawer open-drawer-button" tabindex="0" @click="OpenDrawer"></div>
    <el-drawer
      title="MenuDrawer"
      size="30rem"
      direction="ltr"
      :with-header="false"
      :visible.sync="showMenuDrawer">
      <Drawer @close="CloseDrawer"></Drawer>
    </el-drawer>
    <div class="list-new-entry new-entry-button" @click="CreateNewEntry()"></div>

    <div class="itemlist">
      <Caseitem v-for="uid in Uids" :key="uid" :uid="uid" />
    </div>

    <router-view></router-view>
  </div>
</template>

<script>
import Caseitem from '@/components/Caseitem'
import Drawer from '@/components/Drawer'

export default {
  name: 'ViewList',
  components: {
    Caseitem, Drawer
  },
  mounted () {
    this.$store.dispatch('ReloadDatastore')
  },
  data () {
    return ({
      showMenuDrawer: false
    })
  },
  computed: {
    Uids () {
      return this.$store.getters.GetUids
    }
  },
  methods: {
    CreateNewEntry () {
      this.$router.push({ name: 'edit', params: { uid: 0 } })
    },
    OpenDrawer () {
      this.showMenuDrawer = true
    },
    CloseDrawer () {
      this.showMenuDrawer = false
    }
  }
}
</script>

<style lang="sass">
/* ========================================
    症例一覧画面  VListOfCaseitems
   ======================================== */
// リストコンテナ
div.itemlist
  position: absolute
  left: 0
  top: 0
  width: 100%
  height: 100%
  background-color: ivory
  overflow: auto
  &::after
    display: block
    height: 60px
    width: 1px
    content: ''

div.open-drawer
  z-index: 10
  position: fixed
  top: 9px
  left: 5px

div.list-new-entry
  z-index: 10
  position: fixed
  top: 9px
  left: 953px
</style>
