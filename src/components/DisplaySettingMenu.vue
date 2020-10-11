<template>
  <div class="menu-item">
    <div class="subtitle-section">表示の順番</div>
    <div class="menu-item-content">
      <div>
        <select v-model="Sort.Item">
          <option value="DocumentId">登録順</option>
          <option value="DateOfProcedure">手術日</option>
          <option value="ProcedureTime">手術時間</option>
          <option value="TypeOfProcedure">カテゴリ</option>
          <option value="Age">年齢</option>
          <option value="PatientId">施設の患者ID</option>
        </select>
      </div>

      <el-switch
        v-model="Sort.Order"
        active-text="昇順"
        :active-value="1"
        active-color="var(--color-primary)"
        inactive-text="降順"
        :inactive-value="-1"
        inactive-color="var(--color-primary)" />
    </div>

    <div class="subtitle-section">表示する内容</div>
    <div class="menu-item-content" id="display-item-selection">
      <div><label><input type="checkbox" v-model="isFilterItemsEmpty">全て表示する</label></div>

      <div>
        <div>カテゴリー</div>
        <div>
          <template v-for="category in Categories">
            <label :key="category"><input type="checkbox" v-model="FilterItems" :value="{ Field: 'TypeOfProcedure', Value: category }">{{category}}</label>
          </template>
        </div>
      </div>

      <div>
        <div>年次</div>
        <div v-for="item in FilterYears" :key="item">
          <label><input type="checkbox" v-model="FilterItems" :value="{ Field: 'DateOfProcedure', Value: item }">{{item + '年'}}</label>
        </div>
      </div>

      <div>
        <div>情報</div>
        <div>
          <label><input type="checkbox" v-model="FilterItems" :value="{ Field: 'PresentAE', Value: true }">合併症あり</label>
          <label><input type="checkbox" v-model="FilterItems" :value="{ Field: 'Notification', Value: { $exists: true } }">エラーあり</label>
        </div>
      </div>
    </div>
    <div class="menu-item-bottom">
      <el-button type="primary" @click="Apply()">設定</el-button>
      <el-button type="success"  @click="Revert()">初期設定に戻す</el-button>
    </div>
  </div>
</template>

<script>
import { CategoryTranslation } from '@/modules/CaseValidater'

export default {
  name: 'DisplaySettingMenu',
  data () {
    return ({
      Categories: Object.keys(CategoryTranslation),
      Sort: {
        Item: 'DocumentId',
        Order: -1
      },
      FilterItems: [],
      // 年次: created()で非同期にロードされる
      FilterYears: []
    })
  },
  created () {
    this.$store.dispatch('GetYears').then((CountByYear) => {
      this.FilterYears.splice(0, 0, ...Object.keys(CountByYear))
    })

    const preserved = this.$store.getters.GetViewSettings
    if (preserved.Sort) {
      Object.assign(this.Sort, preserved.Sort)
    }
    if (preserved.Filter) {
      this.FilterItems.splice(0, this.FilterItems.length, ...preserved.Filter)
    }
  },
  computed: {
    isFilterItemsEmpty: {
      get () {
        return this.FilterItems.length === 0
      },
      set (newvalue) {
        if (newvalue === true) {
          this.FilterItems.splice(0)
        }
      }
    }
  },
  methods: {
    Apply () {
      this.$emit('commit', { Sort: this.Sort, Filter: [...this.FilterItems] })
    },
    Revert () {
      this.$emit('commit')
    }
  }
}
</script>
