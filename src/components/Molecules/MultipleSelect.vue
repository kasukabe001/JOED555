<template>
  <div class="singleline-multiselect" :disabled="disabled === true">
    <div class="singleline-multiselect--list" :class="classOfBox">
      <button class="singleline-multiselect--item"
        v-for="(item, index) in Selection"
        :key="index"
        @click="SelectedValue = item"
      >
      {{ item.label }}
      </button>
    </div>
    <div class="singleline-multiselect--select">
      <select v-model="SelectedValue">
        <option value="" style="display: none" disabled>{{ Selection.length === 0 ? placeholder : '' }}</option>
        <option v-for="(optionItem, optionIndex) in CheckableOptions"
          :key="optionIndex"
          :value="optionItem"
          :disabled="optionItem.separator === true"
          :checked="optionItem.checked === true">
          {{ optionItem.label }}
        </option>
      </select>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MultipleSelect',
  props: {
    value: {
      type: Array,
      default () {
        return []
      }
    },
    placeholder: {
      type: String,
      default: ''
    },
    classOfBox: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    options: {
      type: Object
    }
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  data () {
    return ({
      Selection: [],
      CheckableOptions: this.options
    })
  },
  computed: {
    SelectedValue: {
      get () { return '' },
      set (value) {
        const SelectionIndex = this.Selection.indexOf(value)
        if (SelectionIndex < 0) {
          this.Selection.push(value)
          this.CheckableOptions[this.CheckableOptions.indexOf(value)].checked = true
        } else {
          this.Selection.splice(SelectionIndex, 1)
          this.CheckableOptions[this.CheckableOptions.indexOf(value)].checked = false
        }
        this.$emit('change')
      }
    }
  }

}
</script>

<style lang="sass">
div.singleline-multiselect
  position: relative
  z-index: auto

div.singleline-multiselect--list
  box-sizing: border-box
  width: 100%
  border: 2px solid val(--border-color-base)
  border-radius: 2px
  min-height: 2rem
  line-height: 1.8rem
  padding-right: 1rem
  button
    position: relative
    z-index: +1
    padding: 0.8rem 0.8rem
    margin: 0.1rem 0.3rem
    border: 1px solid val(--border-color-base)
    background-color: val(--color-text-placeholder)
    border-radius: 0.4rem
    font-size: 1rem
    &::after
      content: '*'

div.singleline-multiselect--select
  position: absolute
  z-index: +0
  top: 2px
  left: 2px
  right: 2px
  bottom: 2px
  select
    appearance: none
    width: 100%
    height: 100%
    background: transparent
    border: none
  option[checked]
    font-weight: bold
</style>
