<template>
  <div>
    <div class="label"><span class="required">手術時間</span></div>
    <div class="field">
      <select v-model="ProcedureTime"
        :class="(!ProcedureTime)?'vacant':''">
        <option value="" disabled style="display:none;">手術所要時間</option>
        <option v-for="item in ProcedureTimeSelections"
          :key="item"
          :value="item">
          {{item}}
        </option>
      </select>
    </div>
  </div>
</template>

<script>
import ProcedureTimeSelections from '@/modules/ProcedureTimes'

export default {
  name: 'InputProcedureTime',
  props: ['value'],
  data () {
    return ({
      ProcedureTimeSelections: ProcedureTimeSelections()
    })
  },
  computed: {
    ProcedureTime: {
      get () { return this.value },
      set (newvalue) {
        this.$emit('input', newvalue)
      }
    }
  }
}
</script>
