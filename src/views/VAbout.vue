<template>
  <div>
    <h2>ABOUT JOED5</h2>
    <hr/>
    <span>JOED5は以下のオープンソースコンポーネントを用いて作成されています.</span>
    <ul>
      <li v-for="(item, index) of List" :key="index">
        {{item.name}} (<a target="_blank" rel="noopener noreferrer" :href="item.href">{{item.href}}</a>) - License : {{item.license}}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'ViewAbout',
  data () {
    return ({
      List: [
        // { name: '', href: '', license: '' },
        { name: 'Vue.js', href: 'https://vuejs.org/', license: 'MIT' },
        { name: 'Vue cli 3', href: 'https://cli.vuejs.org/', license: 'MIT' },
        { name: 'Vuex', href: 'https://vuex.vuejs.org/', license: 'MIT' },
        { name: 'Vue Router', href: 'https://router.vuejs.org/', license: 'MIT' },
        { name: 'Element', href: 'https://element.eleme.io/', license: 'MIT' },
        { name: 'nedb', href: 'https://github.com/louischatriot/nedb', license: 'MIT' },
        { name: 'Vue.Draggable', href: 'https://github.com/SortableJS/Vue.Draggable', license: 'MIT' },
        { name: 'Datepicker', href: 'https://github.com/charliekassel/vuejs-datepicker', license: 'MIT' },
        { name: 'Vue-infinite-loading', href: 'https://github.com/PeachScript/vue-infinite-loading', license: 'MIT' },
        { name: 'cross-platform-yu-gothic', href: 'https://github.com/rxon/cross-platform-yu-gothic', license: 'MIT' },
        { name: 'js-xxhash', href: 'https://github.com/pierrec/js-xxhash', license: 'MIT' },
        { name: 'Difflib.js', href: 'https://github.com/qiao/difflib.js', license: 'PSF' },
        { name: 'encoding.js', href: 'https://github.com/polygonplanet/encoding.js', license: 'MIT' }
      ]
    })
  }
}
</script>
