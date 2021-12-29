<script>
import { cloneDeep, get } from 'lodash/fp'
import { set } from 'lodash'
import Operations from '@/lib/ui-lib/components/Operations'
import Monaco from "@/lib/monaco/Monaco"
export default {
  name: 'EnvPvsDataTable',
  components: { Operations, Monaco },
  functional: true,
  props: ['pvs', 'envItem'],
  // listeners: modifyPv, deletePv
  render (createElement, context) {
    const headers = [
      { text: 'PV名称', value: 'pvName', sortable: false },
      { text: 'PV描述', value: 'pvDesc', sortable: false },
      { text: 'PV类型', value: 'pvType', sortable: false },
      { text: 'PV对象YAML', value: 'pvYaml', sortable: false },
      { text: '绑定项目名', value: 'claimRef.namespace', sortable: false },
      { text: '绑定状态', value: 'status.phase', sortable: false },
      { text: 'PVC名称', value: 'claimRef.name', sortable: false },
      { text: '操作', value: 'operation', sortable: false }
    ]
    const data = cloneDeep(context.data)
    set(data, ['attrs', 'headers'], get(['attrs', 'headers'], data) || headers)
    set(data, ['attrs', 'items'], get(['attrs', 'items'], data) || context.props.pvs || [])
    set(data, ['attrs', 'itemKey'], get(['attrs', 'itemKey'], data) || 'pvName')
    // if (get(['attrs', 'showExpand'], data) === undefined) {
    //   set(data, ['attrs', 'showExpand'], true)
    // }
    set(data, ['scopedSlots', 'item.operation'], context.scopedSlots['item.operation'] || ((config) => {
      return <Operations
        operations={[
          {
            text: '修改PV',
            onClick: () => {
              (context.listeners.modifyPv || (() => {}))(config.item, context.props.envItem)
            }
          },
          {
            text: '删除PV',
            onClick: () => {
              console.log(context.listeners);
              (context.listeners.deletePv || (() => {}))(config.item)
            }
          }
        ]}
      />
    }))
    set(data, ['scopedSlots', 'item.pvYaml'], context.scopedSlots['item.pvYaml'] || ((config) => {
      let codeValue = config.item.pvYaml
      if(codeValue){
        return <v-dialog
        width="800"
        delay= "3000"
        scopedSlots={{
          activator: ({on, attrs}) => {
            return <v-btn
            small
            color="primary"
            {...{
              props: attrs,
              on
            }}>
            查看详情
            </v-btn>
          }
        }}
        >
          <v-card>
            <v-card-title class="headline">
              查看详情
            </v-card-title>

            <v-card-text>
              <Monaco
                ref="monaco"
                monacoOptions={{
                  value: config.item.pvYaml,
                  automaticLayout:true,
                  readOnly: true, // 是否只读
                  theme: "vs-dark", // 编辑器主题
                  language: "yaml"
                }}
                height={500}
              ></Monaco>
            </v-card-text>
          </v-card>
        </v-dialog>
      }else{
        return <div></div>
      }
    }))
    return <v-data-table
      {...data}
    >
    </v-data-table>
  }
}
</script>

<style scoped>

</style>
