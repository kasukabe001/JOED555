<template>
  <div>
    <div class="label"><span>{{title}}</span></div>
    <div class="field number-field">
      <div>
        <input type="text"
          v-model="InputText"
          :placeholder="placeholder"
          :min="min"
          :max="max"
          :class="AdditionalClass"
          :disabled="disabled"
          />
        <span class="number-field__control number-field__decrease" @click="Decrease">&#xe790;</span>
        <span class="number-field__control number-field__increase" @click="Increase">&#xe78f;</span>
      </div>
    </div>
</div>
</template>

<script>
import { ZenToHanNumbers } from '@/modules/ZenHanChars'

export default {
  name: 'InputNumberField',
  props: {
    value: {
      type: [Number, String]
    },
    title: {
      default: 'NUMBER FIELD'
    },
    placeholder: {
      default: ''
    },
    min: {
      type: Number
    },
    max: {
      type: Number
    },
    required: {
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    InputText: {
      get () { return this.value },
      set (newvalue) {
        this.$emit('input', ZenToHanNumbers(newvalue))
      }
    },
    AdditionalClass () {
      return !this.value ? 'vacant' : ''
    }
  },
  methods: {
    Increase () {
      const newValue = Number(ZenToHanNumbers(this.value) || 0) + 1
      this.InputText = (newValue >= this.max ? this.max : newValue).toString(10)
    },
    Decrease () {
      if (this.value) {
        const newValue = Number(ZenToHanNumbers(this.value)) - 1
        this.InputText = (newValue <= this.min ? this.min : newValue).toString(10)
      }
    }
  }
}
</script>

<style lang="sass">
div.number-field > div
  position: relative
  margin-right: 50%
span.number-field__control
  position: absolute
  right: 2px
  width: 28px
  border-left: solid 1px var(--border-color-base)
  text-align: center
  font-family: 'element-icons'
  line-heigt: 14px
span.number-field__increase
  top: 2px
  border-bottom: solid 1px var(--border-color-base)
  height: 12px
span.number-field__decrease
  bottom: 2px
  line-height: 12px
span.number-field__disabled
  color: var(--border-color-base)
</style>
