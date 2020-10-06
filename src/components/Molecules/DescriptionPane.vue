<template>
  <div class="flex-content">
    <div class="w30"></div>
    <div class="w20 selectionbox">
      <div class="subtitle-section">
        {{Source.Text}}
      </div>
      <div class="w40 selectionbox">
        <template v-if="IsMultipleSelection">
          <template v-for="item of Source.Values">
            <label :key="item" v-if="item !== '$Multi'">
              <input type="checkbox" v-model="SelectedValue" :value="item" />
              {{spliceMarker(item)}}
            </label>
          </template>
        </template>
        <template v-else>
          <select v-model="SelectedValue[0]">
            <option v-for="item of Source.Values" :key="item" :value="item">
              {{spliceMarker(item)}}
            </option>
          </select>
        </template>
      </div>
    </div>
    <div class="w10"></div>
  </div>
</template>

<script>
export default {
  name: 'DescriptionPane',
  model: {
    prop: 'Container',
    event: 'update'
  },
  props: {
    Container: {
      type: Object,
      required: true
    },
    Source: {
      type: Object,
      required: true
    }
  },
  computed: {
    IsMultipleSelection () {
      return (this.Source && this.Source.Values && this.Source.Values[this.Source.Values.length] === '$Multi')
    },
    SelectedValue: {
      get () {
        return (this.Container && this.Container.Description) ? this.Container.Description : []
      },
      set (value) {
        const temporaryvalue = { Description: [] }
        if (value === undefined || typeof newvalue === 'string') {
          if (value) {
            temporaryvalue.Description.push(value)
          }
        } else {
          if (value.length) {
            temporaryvalue.Description.push(...value)
          }
        }
        this.$emit('update', temporaryvalue)
      }
    }
  },
  methods: {
    spliceMarker (str) {
      return str[str.length - 1] !== '$' ? str : str.substr(0, str.length - 1)
    }
  }
}
</script>
