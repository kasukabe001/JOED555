<template>
  <div class="menu-item">
    <div class="menu-item-content w80">
      <div class="subtitle-section">表示の順番</div>
      <div>
        <select v-model="Sort.Item">
          <option value="SequentialId">登録順</option>
          <option value="DateOfProcedure">手術日</option>
          <option value="ProcedureTime">手術時間</option>
          <option value="TypeOfProcedure">カテゴリ</option>
          <option value="Age">年齢</option>
          <option value="InstitutionalPatientId">施設の患者ID</option>
        </select>
      </div>

      <el-switch
        v-model="Sort.Order"
        active-text="昇順"
        :active-value="1"
        active-color="#444444"
        inactive-text="降順"
        :inactive-value="-1"
        inactive-color="#444444" />
    </div>

    <div>表示する内容</div>
    <div class="menu-item-content w80">
      <el-select v-model="FilterItems" multiple :clearable="true" placeholder="全て表示する">
        <el-option-group label="カテゴリ">
          <el-option :value="{ field: 'TypeOfProcedure', value: '腹腔鏡' }" label="腹腔鏡" />
          <el-option :value="{ field: 'TypeOfProcedure', value: '腹腔鏡悪性' }" label="腹腔鏡悪性" />
          <el-option :value="{ field: 'TypeOfProcedure', value: 'ロボット' }" label="ロボット" />
          <el-option :value="{ field: 'TypeOfProcedure', value: 'ロボット悪性' }" label="ロボット悪性" />
          <el-option :value="{ field: 'TypeOfProcedure', value: '子宮鏡' }" label="子宮鏡" />
          <el-option :value="{ field: 'TypeOfProcedure', value: '卵管鏡' }" label="卵管鏡" />
        </el-option-group>
        <el-option-group label="年次">
          <el-option v-for="item in FilterYears" :key="item" :value="{ field: 'DateOfProcedure', value: item }" :label="item + '年'" />
        </el-option-group>
        <el-option-group label="情報">
          <el-option :value="{ field: 'PresentAE', value: true }" label="合併症あり" />
          <el-option :value="{ field: 'Notification', value: true }" label="警告あり" />
        </el-option-group>
      </el-select>
    </div>
    <div class="menu-item-bottom">
      <el-button type="primary" @click="Apply()">設定</el-button>
      <el-button type="success"  @click="Revert()">初期設定に戻す</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DisplaySettingMenu',
  data () {
    return ({
      Sort: {
        Item: 'SequentialId',
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
    if (preserved.FilterItems) {
      this.FilterItems.splice(0)
      this.FilterItems.splice(0, 0, ...preserved.FilterItems)
    }
  },
  methods: {
    Apply () {
      const SortOrder = { [this.Sort.Item]: Number(this.Sort.Order) }

      const Filter = { SequentialId: { $gt: 0 } }
      for (const item of this.FilterItems) {
        if (Filter[item.field] === undefined) {
          Filter[item.field] = item.value
        } else {
          if (Filter[item.field].$in) {
            Filter[item.field].$in.push(item.value)
          } else {
            Filter[item.field] = { $in: [Filter[item.field], item.value] }
          }
        }
      }

      if (Filter.DateOfProcedure) {
        let regexStr = ''
        if (Filter.DateOfProcedure.$in) {
          regexStr = Filter.DateOfProcedure.$in.join('|')
        } else {
          regexStr = Filter.DateOfProcedure
        }
        regexStr = '^(' + regexStr + ')-'
        Filter.DateOfProcedure = { $regex: new RegExp(regexStr) }
      }

      this.$store.commit('SetSortOrder', SortOrder)
      this.$store.commit('SetFilter', Filter)

      this.$store.commit('SetViewSettings', { Sort: this.Sort, FilterItems: this.FilterItems })

      this.$store.dispatch('ReloadDatastore').then(_ => {
        this.$notify({
          title: '表示設定が変更されました',
          message: this.$store.getters.GetNumberOfCases + '件表示します.',
          duration: 3000
        })
      })
    },
    Revert () {
      this.Sort.Item = 'SequentialId'
      this.Sort.Order = -1
      this.FilterItems.splice(0)
      this.$nextTick()
      this.Apply()
    }
  }
}
</script>
