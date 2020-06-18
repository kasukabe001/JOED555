<template>
  <div class="menubar">
    <div>
      <div class="menu" @click="MenuSort()">[表示設定]</div>
      <div class="menu">[検索]</div>
      <div class="menu" @click="Utilities()">[ツール]</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MenuBar',
  methods: {
    MenuSort () {
      this.$router.push({ name: 'sort' })
    },
    MenuFilter () {
      this.$router.push({ name: 'filter' })
    },
    MenuSearch () {
      // no operation
    },
    Utilities () {
      this.$router.push({ name: 'utilities' })
    }
  }
}
</script>

<style lang="sass">
div.menubar
  position: fixed
  z-index: 80
  left: 0
  top: 0
  right: 0
  height: 32px
  background-color: #dbdbdb
  padding-top: 3px
  div
    width: 940px
    display: flex
    justify-content: space-around
    border: 1px #dbdbdb solid

div.menu:hover
  background-color: #b9b9b9
.expanded
  background-color: yellow
</style>
