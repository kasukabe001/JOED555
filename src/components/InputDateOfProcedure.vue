<template>
  <div>
    <div class="label"><span>手術日</span></div>
    <Datepicker
      v-model="DateOfProcedure"
      wrapper-class="field"
      placeholder="クリックでカレンダー"
      :typeable="true"
      format="yyyy-MM-dd"
      :input-class="RequiredClass"
      :language="DatepickerTranslation" >
    </Datepicker>
  </div>
</template>

<script>
import Datepicker from 'vuejs-datepicker'
import { ja } from 'vuejs-datepicker/dist/locale'

export default {
  name: 'InputDateOfProcedure',
  props: {
    value: {},
    required: { default: false }
  },
  components: {
    Datepicker
  },
  data () {
    return ({
      DatepickerTranslation: ja
    })
  },
  computed: {
    DateOfProcedure: {
      get () { return this.value },
      set (newvalue) {
        // Datepickerから渡されるnewvalueはISO datestrなので整形が必要
        const dateobj = new Date(newvalue)
        const datestr = dateobj.getFullYear() + '-' +
          ('0' + (dateobj.getMonth() + 1)).slice(-2) + '-' +
          ('0' + dateobj.getDate()).slice(-2)
        this.$emit('input', datestr)
      }
    },
    RequiredClass () {
      return (this.required === true && this.value === '') ? 'vacant' : ''
    }
  }
}
</script>
