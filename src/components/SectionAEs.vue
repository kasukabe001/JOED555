<template>
  <div class="section">
    <span class="section-title">合併症 ： </span>
    <span>
      <label>
        <input type="checkbox" v-model="ItemOption">
        合併症なし
      </label>
    </span>
    <!-- Quick hack for designs -->
    <div class="section-item-list" style="display: none;"><div class="item-description"></div></div>
    <div class="section-item-list"
      v-for="(item, index) in ItemContainer"
      :key="index">
      <ItemOfSection :item="item" @remove="RemoveItem(index)" :draggable="false" #default="slotProps">
        <span class="w20">{{ slotProps.item.Category }}</span>
        <span class="w30">
          {{ (slotProps.item.Category === '出血')
            ? (slotProps.item.BloodCount === '不明'
              ? '出血量不明'
              : slotProps.item.BloodCount + 'ml')
            : slotProps.item.Title[0] }}
        </span>
        <span class="w20">( Grade : {{slotProps.item.Grade}} )</span>
      </ItemOfSection>
    </div>
    <div class="new-entry-button" @click="AddNewItem()" tabindex="0"></div>
  </div>
</template>

<script>
import EditSectionMixins from '@/mixins/EditSectionMixins'

export default {
  name: 'SectionAEs',
  mixins: [EditSectionMixins],
  watch: {
    optionValue () {
      this.Validate()
    }
  },
  methods: {
    Validate () {
      // 合併症ありなしと合併症入力の有無との整合性確認
      const adequacy = (!this.optionValue && this.container.length > 0) ||
        (this.optionValue && this.container.length === 0)

      // 重複確認
      const flattenContainer = []
      for (const item of this.container) {
        if (item.Category === '出血') {
          flattenContainer.push('出血')
        } else {
          flattenContainer.push([item.Category, item.Title, item.Cause].join(':'))
        }
      }
      const isDup = flattenContainer
        .filter((item, index, self) => self.indexOf(item) !== self.lastIndexOf(item))
        .length > 0

      this.$emit('validate', adequacy && isDup === false)
    }
  }
}
</script>
