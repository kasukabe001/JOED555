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
      <div><el-checkbox v-model="isFilterItemsEmpty">全て表示する</el-checkbox></div>

      <el-checkbox-group v-model="FilterItems">
        <div>
          <div>カテゴリー</div>
          <div>
            <template v-for="(value, category) in Categories">
              <el-checkbox :key="category" :label="category"></el-checkbox>
            </template>
          </div>
        </div>

        <div>
          <div>年次</div>
          <div v-for="(value, year) in FilterYears" :key="year">
            <el-checkbox :label="year"></el-checkbox>
          </div>
        </div>

        <div>
          <div>情報</div>
          <div>
            <template v-for="(value, condition) in Conditions">
              <el-checkbox :key="condition" :label="condition"></el-checkbox>
            </template>
          </div>
        </div>
      </el-checkbox-group>
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
      Categories: {},
      // 年次: created()で非同期にロードされる
      FilterYears: {},
      Conditions: {
        合併症あり: { Field: 'PresentAE', Value: true },
        要確認: { Field: 'Imported', Value: true },
        エラーあり: { Field: 'Notification', Value: { $exists: true } }
      },
      FilterItems: [],
      Sort: {
        Item: 'DocumentId',
        Order: -1
      }
    })
  },
  created () {
    // dataの初期化
    Object.keys(CategoryTranslation).forEach(categorylabel => {
      this.$set(this.Categories, categorylabel, { Field: 'TypeOfProcedure', Value: categorylabel })
    })
    this.$store.dispatch('GetYears').then((CountByYear) => {
      Object.keys(CountByYear).forEach(year => {
        this.$set(this.FilterYears, year + '年', { Field: 'DateOfProcedure', Value: year })
      })
    })

    // 現在の表示をロード
    const preserved = this.$store.getters.ViewSettings
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
      const FilterObjects = []
      this.FilterItems.forEach(filter => {
        const filterobj = this.Categories[filter] || this.FilterYears[filter] || this.Conditions[filter]
        if (filterobj) {
          FilterObjects.push(filterobj)
        }
      })
      this.$emit('commit', { Sort: this.Sort, Filter: FilterObjects })
    },
    Revert () {
      this.$emit('commit')
    }
  }
}
</script>
