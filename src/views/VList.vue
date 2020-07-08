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

    <div class="itemlist" @keyup.ctrl.65="CreateNewEntry()">
      <Caseitem v-for="uid in Uids" :key="uid" :uid="uid" />
    </div>

    <WelcomeBanner v-if="ShowWelcomeBanner"></WelcomeBanner>

    <router-view></router-view>
  </div>
</template>

<script>
import Caseitem from '@/components/Caseitem'
import Drawer from '@/components/Drawer'
import WelcomeBanner from '@/components/Molecules/WelcomeBanner'

export default {
  name: 'ViewList',
  components: {
    Caseitem, Drawer, WelcomeBanner
  },
  mounted () {
    // routerのモードにかかわらずhashが効果をもたらすようにscrollを代替する
    if (this.$route.hash && document.querySelector(this.$route.hash)) {
      document.querySelector(this.$route.hash).scrollIntoView({ block: 'center' })
    }
  },
  data () {
    return ({
      showMenuDrawer: false
    })
  },
  computed: {
    Uids () {
      return this.$store.getters.GetUids
    },
    ShowWelcomeBanner () {
      return this.$store.state.ShowWelcomeBanner
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
  left: 935px
</style>
