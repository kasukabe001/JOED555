<template>
  <div>
    <div class="flex-content">
      <div class="w30"></div>
      <div class="w30">
        <div class="subtitle-section">
          <span>付随する実施手術</span>
        </div>
      </div>
      <div class="w30">
        <span>{{Source.Text}}</span>
      </div>
      <div class="w10"></div>
    </div>

    <DescriptionPane v-if="Source.Description"
      :container="PassedContainer"
      :source="Source.Description"
    />
  </div>
</template>

<script>
import DescriptionPane from '@/components/Molecules/DescriptionPane'

export default {
  name: 'AdditionalProcedurePane',
  components: { DescriptionPane },
  model: {
    prop: 'Container',
    event: 'update'
  },
  created () {
    this.$emit('update', {
      Text: this.Source.Text,
      Description: []
    })
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
    PassedContainer: {
      get () {
        return this.Container
      },
      set (value) {
        this.$emit('update', value)
      }
    }
  }
}
</script>
