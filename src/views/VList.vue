<template>
  <div>
    <DrawerButton div-class="open-drawer" tab-index="0" @click="OpenDrawer" />
    <el-drawer
      title="MenuDrawer"
      size="26rem"
      direction="ltr"
      :with-header="false"
      :destroy-on-close="true"
      :visible.sync="showMenuDrawer">
      <Drawer @close="CloseDrawer"></Drawer>
    </el-drawer>
    <NewEntryButton div-class="list-new-entry" tab-index="0" @click="CreateNewEntry()"/>

    <div class="itemlist" @keyup.ctrl.65="CreateNewEntry()">
      <Caseitem v-for="uid in Uids" :key="uid" :uid="uid" />
    </div>

    <WelcomeBanner v-if="ShowWelcomeBanner"></WelcomeBanner>

    <router-view></router-view>
  </div>
</template>

<script>
import DrawerButton from '@/components/Atoms/AtomDrawerButton.vue'
import NewEntryButton from '@/components/Atoms/AtomNewEntryButton'
import Caseitem from '@/components/Caseitem'
import Drawer from '@/components/Drawer'
import WelcomeBanner from '@/components/Molecules/WelcomeBanner'

export default {
  name: 'ViewList',
  components: {
    DrawerButton, NewEntryButton, Caseitem, Drawer, WelcomeBanner
  },
  created () {
    if (this.$store.state.ShowWelcomeBanner && !this.$store.getters['system/ShowWelcomeMessage']) {
      this.$store.commit('HideWelcome')
    }
  },
  mounted () {
    // routerのモードにかかわらずhashが効果をもたらすようにscrollを代替 - #hashが中心になるようにスクロールする
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
  top: 14px
  left: 9px

div.list-new-entry
  z-index: 10
  position: fixed
  top: 14px
  left: 895px
</style>
