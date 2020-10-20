<template>
  <div>
    <WelcomeBanner v-if="ShowWelcomeBanner"></WelcomeBanner>

    <DrawerButton div-class="open-drawer" tab-index="0" @click="OpenDrawer" accesskey="D"/>
    <el-drawer
      title="MenuDrawer"
      size="26rem"
      direction="ltr"
      :with-header="false"
      :destroy-on-close="true"
      :visible.sync="showMenuDrawer">
      <Drawer @close="CloseDrawer" @changed="FilterChanged"></Drawer>
    </el-drawer>
    <NewEntryButton div-class="list-new-entry" tab-index="0" @click="CreateNewEntry()" accesskey="N"/>

    <div class="itemlist">
      <Caseitem v-for="uid in Uids" :key="uid" :uid="uid" />
      <InfiniteLoading @infinite="HandleInfinite" :identifier="DisplayIdentifier" ref="infiniteloading">
        <span slot="no-more"></span>
        <span slot="no-results"></span>
      </InfiniteLoading>
    </div>

    <router-view></router-view>
  </div>
</template>

<script>
import DrawerButton from '@/components/Atoms/AtomDrawerButton.vue'
import NewEntryButton from '@/components/Atoms/AtomNewEntryButton'
import Caseitem from '@/components/Caseitem'
import Drawer from '@/components/Drawer'
import WelcomeBanner from '@/components/Molecules/WelcomeBanner'
import InfiniteLoading from 'vue-infinite-loading'

export default {
  name: 'ViewList',
  components: {
    DrawerButton, NewEntryButton, Caseitem, Drawer, WelcomeBanner, InfiniteLoading
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
      return this.$store.getters.PagedUids
    },
    ShowWelcomeBanner () {
      return this.$store.state.ShowWelcomeBanner
    },
    DisplayIdentifier () {
      return this.$store.getters.DisplayIdentifier
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
    },
    HandleInfinite (state) {
      this.$store.commit('IncrementDocumentListRange')
      if (this.$store.getters.PagedUidsRange >= this.$store.getters.NumberOfCases) {
        state.complete()
      } else {
        state.loaded()
      }
    },
    FilterChanged () {
      // nop this.$refs.infiniteloading.$emit('$InfiniteLoading:reset')
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
