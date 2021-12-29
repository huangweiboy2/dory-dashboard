<script>
export default {
  name: 'AssemblyLine',
  functional: true,
  props: {
    title: {
      type: String,
      required: false,
      default: null
    },
    tabValue: {
      type: [String, Number],
      required: false,
      default: null
    },
    tabs: {
      type: Array,
      required: false,
      default () {
        return []
      }
    }
  },
  render (createElement, context) {
    const updateTabValue = context.listeners['update:tabValue'] || (() => {})
    return <VCard color="basil" class="elevation-8 rounded-0">
      <VCardTitle class="text-center justify-center py-6">
        <h4>
          { /*context.props.title*/ }
        </h4>
      </VCardTitle>
      <VDataTable dense>
        <template v-slot:default>
          <thead>
            <tr>
            <th class="text-left">
              流水线名称
            </th>
            <th class="text-left">
              流水线字段1
            </th>
            </tr>
          </thead>
          <tbody>
            <tr>
            <td>123</td>
            <td>456</td>
            </tr>
          </tbody>
        </template>
      </VDataTable>
    </VCard>
  }
}
</script>

<style scoped>

</style>
