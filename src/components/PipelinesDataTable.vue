<script>
import { set } from 'lodash'
import { get, cloneDeep } from 'lodash/fp'
import { DateTime } from 'luxon'
import DataTable from '@/lib/ui-lib/components/DataTable'
import request from '@/utils/request'
export default {
  name: 'PipelinesDataTable',
  functional: true,
  props: ['pipelines', 'goRun', 'getPipelineDef', 'goProjectDef'],
  render (createElement, context) {
    const data = cloneDeep(context.data)
    set(data, ['attrs', 'headers'], get(['attrs', 'headers'], data) || [
      { value: 'pipelineName', text: '流水线名称', sortable: false },
      { value: 'branchName', text: '分支名称', sortable: false },
      { value: 'envs', text: '集成环境', sortable: false },
      { value: 'envProductions', text: '正式环境', sortable: false },
      { value: 'count', text: '成功/失败/终止次数', sortable: false },
      { value: 'lastRunTime', text: '最新启动', sortable: false },
      { value: 'lastRunResult', text: '最新运行结果', sortable: false },
      { value: 'operation', text: '操作', sortable: false }
    ])
    set(data, ['attrs', 'items'], get(['attrs', 'items'], data) || context.props.pipelines || [])
    set(data, ['scopedSlots', 'item.pipelineName'], context.scopedSlots['item.pipelineName'] || ((config) => {
      return <router-link to={{name: 'CicdPipeline', params: { pipelineName: config.item.pipelineName }}}>{ config.item.pipelineName }</router-link>
    }))
    set(data, ['scopedSlots', 'item.envs'], context.scopedSlots['item.envs'] || ((config) => {
      return config.item.envs.map(row => {
        return <div class="my-1"><VChip color="primary" small>{ row }</VChip></div>
      })
    }))
    set(data, ['scopedSlots', 'item.envProductions'], context.scopedSlots['item.envProductions'] || ((config) => {
      return config.item.envProductions.map(row => {
        return <div class="my-1"><VChip color="primary" small>{ row }</VChip></div>
      })
    }))
    set(data, ['scopedSlots', 'item.count'], context.scopedSlots['item.count'] || ((config) => {
      return [
        <span class="green--text">{ config.item.successCount }</span>,
        '/',
        <span class="red--text">{ config.item.failCount }</span>,
        '/',
        <span class="grey--text">{ config.item.abortCount }</span>
      ]
    }))
    set(data, ['scopedSlots', 'item.lastRunTime'], context.scopedSlots['item.lastRunTime'] || ((config) => {
      const dataTime = DateTime.fromISO(config.item.status.startTime)
      return dataTime.isValid ? DateTime.fromISO(config.item.status.startTime).toFormat('yyyy-MM-dd HH:mm:ss') : config.item.status.startTime
    }))
    set(data, ['scopedSlots', 'item.lastRunResult'], context.scopedSlots['item.lastRunResult'] || ((config) => {
      let chipColor = ''
      switch (config.item.status.result) {
        case 'FAIL':
          chipColor = 'red'
          break
        case 'RUNNING':
          chipColor = 'blue'
          break
        case 'SUCCESS':
          chipColor = 'green'
          break
        case 'ABORT':
          chipColor = 'grey'
          break
        case 'INPUT':
          chipColor = 'orange'
          break
      }
      return [
        <div>{ config.item.status.duration }</div>,
        <VChip vShow={config.item.status.result} small class="mb-1 white--text" color={ chipColor }>
          { config.item.status.result }
        </VChip>
      ]
    }))
    set(data, ['scopedSlots', 'item.operation'], context.scopedSlots['item.operation'] || ((config) => {
      return <div>
        <VBtn color={config.item.errMsgPipelineDef === '' ? 'primary' : 'error'} small class="my-1 mr-2" vShow={config.item.branchName} vOn:click_stop={() => {
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

</style>
