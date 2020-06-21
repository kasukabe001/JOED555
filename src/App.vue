<template>
  <div id="app">
    <router-view :key="routeKey"></router-view>
  </div>
</template>

<script>
export default {
  created () {
    this.$store.commit('onCreated')
    // this.$router.push('/') // comment out in Electron environment
  },
  computed: {
    routeKey () {
      const path = this.$route.path.split('/')
      return (path.length > 2 && path[2].match(/^\d+$/)) ? path[1] + '/' + path[2] : (path[1] || '/')
    }
  }
}
</script>

<style lang="sass">
@import 'cross-plathome-yu-gothic.css'
@import 'app-global.sass'
</style>
