<template>
  <div id="app">
    <router-view :key="routeKey"></router-view>
  </div>
</template>

<script>
export default {
  created () {
    this.$store.commit('initDatabase')
    this.$store.dispatch('ReloadDocumentList')
    this.$store.dispatch('system/LoadPreferences')

    // this.$router.push('/') // comment out in Electron environment
  },
  computed: {
    routeKey () {
      // 同一uidからのroutingに対するquick-hack どんな環境でも動作する
      const path = this.$route.path.split('/')
      return (path.length > 2 && path[2].match(/^\d+$/))
        ? path[1] + '/' + path[2]
        : (path[1] || '/')
    }
  }
}
</script>
