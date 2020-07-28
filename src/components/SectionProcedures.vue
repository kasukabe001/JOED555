<template>
  <div>
    <div class="section">
      <span class="section-title">実施手術 ： </span>
      <draggable handle=".handle" v-model="ItemContainer">
        <div class="section-item-list"
          v-for="(item, index) in ItemContainer"
          :key="index">
          <ItemOfSection :item="item" @remove="RemoveItem(index)" @edit="EditItem(index, item)"/>
          <ItemOfSection v-if="item.AdditionalProcedure" :item="item.AdditionalProcedure" @click="RemoveItem(index)" />
        </div>
      </draggable>
      <NewEntryButton @click="AddNewItem()" tabindex="0" />
    </div>
  </div>
</template>

<script>
import EditSectionMixins from '@/mixins/EditSectionMixins'

export default {
  name: 'SectionProcedures',
  mixins: [EditSectionMixins]
}
</script>
