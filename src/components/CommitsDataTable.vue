
<script>
import { cloneDeep, get, mergeAll } from 'lodash/fp'
import { set } from 'lodash'
import DataTable from '@/lib/ui-lib/components/DataTable'
export default {
  name: 'CommitsDataTable',
  components: { DataTable },
  functional: true,
  props: ['commits', 'runLink'],
  render (createElement, context) {
    const headers = [
      { text: '项目名称', value: 'projectName', sortable: false },
      { text: '分支', value: 'branchName', sortable: false },
      { text: 'commit编号', value: 'commit', sortable: false },
      { text: '提交时间', value: 'commitTime', sortable: false },
      { text: '提交者', value: 'commitUser', sortable: false },
      { text: '运行名称', sortable: false, value: 'runName' },
      { text: '启动时间', value: 'startTime', sortable: false },
      { text: '运行结果', value: 'status', sortable: false }
    ]
    const data = cloneDeep(context.data)
    const commits = (context.props.commits || []).map((row, index) => {
      return mergeAll([row, { index }])
    })
    set(data, ['attrs', 'headers'], get(['attrs', 'headers'], data) || headers)
    set(data, ['attrs', 'items'], get(['attrs', 'items'], data) || commits)
    set(data, ['attrs', 'itemKey'], get(['attrs', 'itemKey'], data) || 'index')
    if (get(['attrs', 'showExpand'], data) === undefined) {
      set(data, ['attrs', 'showExpand'], true)
    }
    set(data, ['scopedSlots', 'item.runName'], context.scopedSlots['item.runName'] || ((config) => {
      if (context.props.runLink === false) {
        return config.item.runName
      }
      return <router-link to={{ name: 'CicdRun', params: { runName: config.item.runName } }}>
        { config.item.runName }
      </router-link>
    }))
    set(data, ['scopedSlots', 'item.commit'], context.scopedSlots['item.commit'] || ((config) => {
      const shortCommit = config.item.commit.slice(0, 8)
      return createElement('div', {
        style: 'cursor: pointer;',
        directives: [
          {
            name: 'clipboard',
            rawName: 'v-clipboard:success',
            value: () => {
              console.log(123)
              return <v-snackbar
                timeout="2000"
                color="success"
                class="white--text"
              >
                复制成功
              </v-snackbar>
            },
            arg: 'success'
          },
          {
            name: 'clipboard',
            rawName: 'v-clipboard:copy',
            value: config.item.commit,
            arg: 'copy'
          },
          {
            name: 'clipboard',
            rawName: 'v-clipboard:error',
            value: () => {
              return <v-snackbar
                timeout="2000"
                color="error"
                class="white--text"
              >
                复制失败
              </v-snackbar>
            },
            arg: 'error'
          }
        ]
      }, [<v-tooltip
        bottom={true}
        scopedSlots={{
          activator: ({on, attrs}) => {
            return <span
              {...{
                props: attrs,
                on
              }}
            >{shortCommit}...</span>
          }
        }}
      >
        <span>{config.item.commit}</span>
      </v-tooltip>])
    }))
    set(data, ['scopedSlots', 'item.commitUser'], context.scopedSlots['item.commitUser'] || ((config) => {
      return [
        <div>{ config.item.committerName }</div>,
        <div class="text-no-wrap">{ config.item.committerEmail }</div>
      ]
    }))
    set(data, ['scopedSlots', 'item.projectName'], context.scopedSlots['item.projectName'] || ((config) => {
      return <router-link to={{ name: 'CicdProject', params: { projectName: config.item.projectName } }}>{ config.item.projectName }</router-link>
    }))
    set(data, ['scopedSlots', 'item.startTime'], context.scopedSlots['item.startTime'] || ((config) => {
      return config.item.createTime
    }))
    set(data, ['scopedSlots', 'item.status'], context.scopedSlots['item.status'] || ((config) => {
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
        case 'PAUSE':
          chipColor = 'blue-grey'
          break
      }
      return [
        <div>{ config.item.status.duration }</div>,
        <v-chip small class="mb-1 white--text" color={chipColor}>
          { config.item.status.result }
        </v-chip>
      ]
    }))
    set(data, ['scopedSlots', 'expanded-item'], context.scopedSlots['expanded-item'] || ((config) => {
      const item = config.item
      return <td colspan={config.headers.length} class="pa-1">
        <v-card class="rounded-0">
          <v-card-title>
            commit详情
          </v-card-title>
          <v-card-text>
            <codemirror
              value={item.fullMessage}
              options={{
                mode: 'text/plain',
                theme: 'base16-dark',
                lineNumbers: true,
                line: true,
                lineWrapping: true,
                readOnly: true,
                cursorBlinkRate: -1
              }}
            />
          </v-card-text>
          <v-card-title>
          文件变更详情
          </v-card-title>
          <v-card-text>
            <v-simple-table dense>
              <thead>
                <tr>
                  <th class="text-left">
                  变更
                  </th>
                  <th class="text-left">
                  文件名
                  </th>
                  <th class="text-left">
                  变更状态
                  </th>
                </tr>
              </thead>
              <tbody>
                { (item.diffs || []).map((diffsItem, index) => {
                  return <tr key={index}>
                    <td>{ diffsItem.action }</td>
                    <td>{ diffsItem.fileName }</td>
                    <td>{ diffsItem.stats }</td>
                  </tr>
                })}
              </tbody>

            </v-simple-table>
          </v-card-text>
        </v-card>
      </td>
    }))
    return <DataTable {...data} >
      { context.children }
    </DataTable>
  }
}
</script>

<style scoped>

</style>
