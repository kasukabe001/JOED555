<template>
  <div>
    <div><span>PREFERENCES and UTILITIES</span></div>
    <div>
      <span> <router-link :to="{name: 'settings'}">[SETTINGS]</router-link> </span>
      <span> <router-link :to="{name: 'export'}">[EXPORT]</router-link> </span>
    </div>
    <router-view>
    </router-view>
    <div><span @click="goBack">UNDER IMPLIMENTATION click here to return to the list</span></div>
  </div>
</template>

<script>
export default {
  name: 'ViewUtilities',
  methods: {
    goBack () {
      this.$router.push({ name: 'list' })
    }
  }
}
</script>
