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
      <el-tooltip placement="top-start" :open-delay="700">
        <div slot="content">
          <DescriptionOfAE :item="item"></DescriptionOfAE>
        </div>
        <ItemOfSection :item="item" @remove="RemoveItem(index)" :draggable="false" #default="slotProps">
          <span class="w20">{{ slotProps.item.Category }}</span>
          <span class="w30">
            {{ (slotProps.item.Category === '出血')
              ? (slotProps.item.BloodCount === '不明'
                ? '出血量不明'
                : slotProps.item.BloodCount + 'ml')
              : ' … ' + ((slotProps.item.Title&&slotProps.item.Title[0])
                ||(slotProps.item.Cause&&slotProps.item.Cause[0])) }}
          </span>
          <span class="w20">( Grade : {{slotProps.item.Grade}} )</span>
        </ItemOfSection>
      </el-tooltip>
    </div>
    <NewEntryButton @click="AddNewItem()" tabindex="0" />
  </div>
</template>

<script>
import EditSectionMixins from '@/mixins/EditSectionMixins'
import DescriptionOfAE from '@/components/Molecules/DescriptionOfAE'

export default {
  name: 'SectionAEs',
  mixins: [EditSectionMixins],
  components: {
    DescriptionOfAE
  }
}
</script>
