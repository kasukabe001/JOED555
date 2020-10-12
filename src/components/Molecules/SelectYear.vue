<template>
  <div>
    <select v-model="SelectedValue">
      <option v-for="(value, name) of Selections" :key="value" :value="name">{{name}}年 ({{value}}件)</option>
      <option value="">すべて</option>
    </select>
  </div>
</template>

<script>
export default {
  name: 'SelectYear',
  model: {
    prop: 'value',
    event: 'update'
  },
  props: {
    value: { required: true }
  },
  data () {
    return ({
      Selections: {}
    })
  },
  mounted () {
    this.$store.dispatch('GetYears')
      .then(CountByYear => {
        for (const year of Object.keys(CountByYear)) {
          this.$set(this.Selections, year, CountByYear[year])
        }
      })
  },
  computed: {
    SelectedValue: {
      get () { return this.value },
      set (newvalue) { this.$emit('update', newvalue) }
    }
  }
}
</script>
