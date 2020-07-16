<template>
  <div class="section">
    <span class="section-title">手術診断 ： </span>
    <draggable handle=".handle" v-model="ItemContainer">
      <div class="section-item-list"
        v-for="(item, index) in ItemContainer"
        :key="index">
        <ItemOfSection :item="item" @remove="RemoveItem(index)" @edit="EditItem(index, item)"/>
      </div>
    </draggable>
    <div class="new-entry-button" @click="AddNewItem()" tabindex="0"></div>
  </div>
</template>

<script>
import EditSectionMixins from '@/mixins/EditSectionMixins'

export default {
  name: 'SectionDiagnoses',
  mixins: [EditSectionMixins]
}
</script>
