<script>
import { set } from 'lodash'
import { get, cloneDeep } from 'lodash/fp'
import { DateTime } from 'luxon'
import DataTable from '@/lib/ui-lib/components/DataTable'
import DefsModule from '@/components/DefsModule'
import InfoCard from '@/lib/ui-lib/components/InfoCard'
import request from '@/utils/request'
export default {
  name: 'DefsPipelinesTable',
  functional: true,
  props: ['pipelines', 'goRun', 'getPipelineDef'],
  render (createElement, context) {
    const data = cloneDeep(context.data)
    set(data, ['attrs', 'headers'], get(['attrs', 'headers'], data) || [
      { value: 'branchName', text: '分支名称', sortable: false },
      { value: 'envs', text: '集成环境', sortable: false },
      { value: 'envProductions', text: '正式环境', sortable: false },
      { value: 'operation', text: '操作', sortable: false }
    ])
    set(data, ['attrs', 'items'], get(['attrs', 'items'], data) || context.props.pipelines || [])
    set(data, ['attrs', 'itemKey'], get(['attrs', 'itemKey'], data) || 'branchName')
    if (get(['attrs', 'showExpand'], data) === undefined) {
      set(data, ['attrs', 'showExpand'], true)
    }
    set(data, ['scopedSlots', 'item.envs'], context.scopedSlots['item.envs'] || ((config) => {
      return config.item.envs.map(row => {
        return <v-chip small class="mr-2" color="primary">{row}</v-chip> 
      })
    }))
    set(data, ['scopedSlots', 'item.envProductions'], context.scopedSlots['item.envProductions'] || ((config) => {
      return config.item.envProductions.map(row => {
        return <v-chip small class="mr-2" color="primary">{row}</v-chip> 
      })
    }))
    set(data, ['scopedSlots', 'expanded-item'], context.scopedSlots['expanded-item'] || ((config) => {
      return <td colspan={config.headers.length} class="pa-1">
        <VCard>
          <VCardText class="flex-nowrap">
            <DefsModule
              modules={config.item.modules}
            />
          </VCardText>
        </VCard>
      </td>
    }))
    set(data, ['scopedSlots', 'item.operation'], context.scopedSlots['item.operation'] || ((config) => {
      return <div>
        <VBtn color={config.item.errMsgPipelineDef === '' ? 'primary' : 'error'} small class="my-1 mr-2" vOn:click_stop={() => {
          context.props.getPipelineDef('', config.item.branchName)
        }}>流水线定义</VBtn>
        <VBtn color="primary" small class="my-1" vOn:click={() => {
          request.post(`/cicd/pipeline/${config.item.pipelineName}`).then(response => {
            context.props.goRun(response.data.runName)
          }).catch(_ => {})
        }}>运行</VBtn>
      </div>
    }))
    const children = context.children
    return createElement(DataTable, data, children)
  }
}
</script>

<style scoped>
.flex-nowrap .row {
  flex-wrap: nowrap !important;
}
</style>
