<script>
import { cloneDeep, get } from 'lodash/fp'
import { set } from 'lodash'
import DataTable from '@/lib/ui-lib/components/DataTable'
import Monaco from "@/lib/monaco/Monaco"

const stepsDetailMap = {
  build: 'build',
  scanCode: 'scanCode',
  packageImage: 'package',
  scanImage: 'scanImage',
  deploy: 'deploy',
  undo: 'undo',
  syncImage: 'syncImage',
  checkDeploy: 'checkDeploy',
  artifact: 'artifact',
  deployArtifact: 'deployArtifact',
  testApi: 'test',
  testPerformance: 'test',
  testWebui: 'test',
  databaseExec: 'databaseScript',
  databaseRollback: 'databaseScript',
  applyMesh: 'applyMesh',
  changeMesh: 'changeMesh',
  deployDebug: 'deployDebug',
  deployStatic: 'deployStatic'
}

export default {
  name: 'WebhookDataTable',
  functional: true,
  components: {
    DataTable,
    Monaco,
    EmbedTd: {
      functional: true,
      render (createElement, context) {
        return createElement('td', context.data, context.children)
      }
    }
  },
  props: ['steps'],
  render (createElement, context) {
    const vm = this
    const stepsData = {
      build: {
        headers: [
          { value: 'stepDetail.moduleName', text: '模块名', sortable: false },
          { value: 'stepDetail.branch', text: '分支', sortable: false },
          { value: 'stepDetail.buildPath', text: '构建目录', sortable: false },
          { value: 'stepDetail.buildEnv', text: '构建环境', sortable: false },
          { value: 'stepDetail.buildCmds', text: '构建命令', sortable: false },
          { value: 'stepDetail.buildChecks', text: '检查命令', sortable: false }
        ]
      },
      package: {
        headers: [
          { value: 'stepDetail.moduleName', text: '模块名', sortable: false },
          { value: 'stepDetail.branch', text: '分支', sortable: false },
          { value: 'stepDetail.tagName', text: '镜像标签', sortable: false },
          { value: 'stepDetail.size', text: '镜像大小', sortable: false }
        ]
      },
      artifact: {
        headers: [
          { value: 'stepDetail.moduleName', text: '模块名', sortable: false },
          { value: 'stepDetail.branch', text: '分支', sortable: false },
          { value: 'stepDetail.tarName', text: 'tarName', sortable: false },
          { value: 'stepDetail.size', text: '镜像大小', sortable: false }
        ]
      },
      deploy: {
        headers: [
          { value: 'stepDetail.moduleName', text: '模块名', sortable: false },
          { value: 'stepDetail.envName', text: '环境', sortable: false },
          { value: 'stepDetail.isMeshEnable', text: '是否启用服务网格', sortable: false },
          { value: 'stepDetail.tagName', text: '镜像标签', sortable: false },
          { value: 'stepDetail.deployYaml', text: '部署YAML', sortable: false },
          { value: 'stepDetail.serviceYaml', text: '服务YAML', sortable: false },
          { value: 'stepDetail.hpaYaml', text: '水平扩缩容YAML', sortable: false }
        ],
        scopedSlots: {
          'item.stepDetail.deployYaml': (config) => {
            let codeValue = config.item.stepDetail.deployYaml
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
              vOn:input={() => {

              }}
              >
                <v-card>
                  <v-card-title class="headline grey lighten-2">
                    查看详情
                  </v-card-title>

                  <v-card-text>
                    <Monaco
                      ref="monaco"
                      monacoOptions={{
                        value: config.item.stepDetail.deployYaml,
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
          },
          'item.stepDetail.serviceYaml': (config) => {
            let codeValue = config.item.stepDetail.serviceYaml
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
              vOn:input={() => {

              }}
              >
                <v-card>
                  <v-card-title class="headline grey lighten-2">
                    查看详情
                  </v-card-title>

                  <v-card-text>
                    <Monaco
                      ref="monaco"
                      monacoOptions={{
                        value: config.item.stepDetail.serviceYaml,
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
          },
          'item.stepDetail.hpaYaml': (config) => {
            let codeValue = config.item.stepDetail.hpaYaml
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
              vOn:input={() => {

              }}
              >
                <v-card>
                  <v-card-title class="headline grey lighten-2">
                    查看详情
                  </v-card-title>

                  <v-card-text>
                    <Monaco
                      ref="monaco"
                      monacoOptions={{
                        value: config.item.stepDetail.hpaYaml,
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
            } else {
              return <div></div>
            }
          }
        }
      },
      checkDeploy: {
        headers: [
          { value: 'stepDetail.moduleName', text: '模块名', sortable: false },
          { value: 'stepDetail.envName', text: '环境', sortable: false },
          { value: 'stepDetail.deploymentStatus', text: '部署结果', sortable: false }
        ],
        subTable: {
          title: 'pod状态列表',
          headers: [
            { value: 'podName', text: 'podName', sortable: false },
            { value: 'imageName', text: 'imageName', sortable: false },
            { value: 'ready', text: 'ready', sortable: false },
            { value: 'reason', text: 'reason', sortable: false },
            { value: 'restart', text: 'restart', sortable: false },
            { value: 'age', text: 'age', sortable: false }
          ],
          itemsPath: ['stepDetail', 'podStatuses']
        }
      },
      deployArtifact: {
        headers: [
          { value: 'stepDetail.moduleName', text: '模块名', sortable: false },
          { value: 'stepDetail.envName', text: '环境', sortable: false }
        ]
      },
      test: {
        headers: [
          { value: 'stepDetail.moduleName', text: '模块名', sortable: false },
          { value: 'stepDetail.envName', text: '环境', sortable: false },
          { value: 'stepDetail.testType', text: '测试类型', sortable: false },
          { value: 'stepDetail.result', text: '测试结果', sortable: false },
          { value: 'stepDetail.report', text: '测试报告', sortable: false }
        ],
        scopedSlots: {
          'item.stepDetail.result': (config) => {
            let codeValue = config.item.stepDetail.result
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
              vOn:input={() => {

              }}
              >
                <v-card>
                  <v-card-title class="headline grey lighten-2">
                    查看详情
                  </v-card-title>

                  <v-card-text>
                    <Monaco
                      ref="monaco"
                      monacoOptions={{
                        value: config.item.stepDetail.result,
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
          },
          'item.stepDetail.report': (config) => {
            let codeValue = config.item.stepDetail.filePath
            if(codeValue){
             return <v-btn
                small
                color="primary"
                vOn:click={() => {
                  window.open(process.env.VUE_APP_BASE+config.item.stepDetail.filePath)
                }}
                >
                查看详情
                </v-btn>
            }else{
              return <div></div>
            }
          }
        }
      },
      scanCode: {
        headers: [
          { value: 'stepDetail.moduleName', text: '模块名', sortable: false },
          { value: 'stepDetail.branch', text: '分支', sortable: false },
          { value: 'stepDetail.scanStatus.projectStatus.status', text: '扫描状态', sortable: false }
        ],
        subTable: {
          title: '扫描结果记录列表',
          headers: [
            { value: 'status', text: 'status', sortable: false },
            { value: 'metricKey', text: 'metricKey', sortable: false },
            { value: 'comparator', text: 'comparator', sortable: false },
            { value: 'periodIndex', text: 'periodIndex', sortable: false },
            { value: 'errorThreshold', text: 'errorThreshold', sortable: false },
            { value: 'actualValue', text: 'actualValue', sortable: false }
          ],
          itemsPath: ['stepDetail', 'scanStatus', 'projectStatus', 'conditions']
        }
      },
      syncImage: {
        headers: [
          { value: 'stepDetail.moduleName', text: '模块名', sortable: false },
          { value: 'stepDetail.envName', text: '环境', sortable: false },
          { value: 'stepDetail.isMeshEnable', text: '是否集成环境/正式环境启用服务网格', sortable: false },
          { value: 'stepDetail.fromImages', text: '源镜像名（多个）', sortable: false },
          { value: 'stepDetail.toImages', text: '目标镜像名（多个）', sortable: false }
        ]
      },
      scanImage: {
        headers: [
          { value: 'stepDetail.moduleName', text: '模块名', sortable: false },
          { value: 'stepDetail.branch', text: '分支', sortable: false },
          { value: 'stepDetail.tagName', text: '镜像标签', sortable: false },
          { value: 'stepDetail.checkStatistics', text: '扫描统计', sortable: false },
          { value: 'stepDetail.checkStatus', text: '扫描结果', sortable: false }
        ],
        subTable: {
          title: '扫描状态列表',
          headers: [
            { value: 'gateAction', text: '扫描门禁状态', sortable: false },
            { value: 'checkOutput', text: '扫描输出', sortable: false }
          ],
          itemsPath: ['stepDetail', 'scanStatus']
        }
      },
      undo: {
        headers: [
          { value: 'stepDetail.moduleName', text: '模块名', sortable: false },
          { value: 'stepDetail.envName', text: '环境', sortable: false },
          { value: 'stepDetail.isMeshEnable', text: '是否启用服务网格', sortable: false },
          { value: 'stepDetail.fromImageName', text: '源镜像名', sortable: false },
          { value: 'stepDetail.toImageName', text: '目标镜像名', sortable: false }
        ]
      },
      applyMesh: {
        headers: [
          { value: 'stepDetail.envName', text: '环境', sortable: false },
          { value: 'stepDetail.isMeshEnable', text: '是否启用服务网格', sortable: false },
          { value: 'stepDetail.istioInfoYaml', text: '网格定义', sortable: false }
        ],
        subTable: {
          title: '扫描状态列表',
          headers: [
            { value: 'moduleName', text: '模块名', sortable: false },
            { value: 'defaultBuildID', text: '默认版本buildID', sortable: false },
            { value: 'newBuildID', text: '新版本buildID', sortable: false }
          ],
          itemsPath: ['stepDetail', 'meshSubsets']
        }
      },
      changeMesh: {
        headers: [
          { value: 'stepDetail.envName', text: '环境', sortable: false },
          { value: 'stepDetail.weight', text: '测试流量百分比', sortable: false }
        ]
      },
      databaseScript: {
        headers: [
          { value: 'stepDetail.envName', text: '环境', sortable: false },
          { value: 'stepDetail.action', text: '操作类型', sortable: false }
        ]
      }
    }
    const headers = [
      { value: 'data-table-expand' },
      { value: 'param.runName', text: '运行名称', sortable: false },
      { value: 'webhook', text: '邮件状态', sortable: false },
      { value: 'type', text: '步骤/模块类型', sortable: false },
      { value: 'createTime', text: '创建/已读时间', sortable: false },
      { value: 'param.result', text: '执行结果', sortable: false }
    ]
    const data = cloneDeep(context.data)
    set(data, ['attrs', 'headers'], get(['attrs', 'headers'], data) || headers)
    set(data, ['attrs', 'items'], get(['attrs', 'items'], data) || context.props.steps || [])
    set(data, ['scopedSlots', 'item.webhook'], context.scopedSlots['item.webhook'] || ((config) => {
      let chipColor = ''
      switch (config.item.result) {
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
        <div>{ config.item.duration }</div>,
        <v-chip small class="mb-1 white--text" color={chipColor}>
          { config.item.result }
        </v-chip>
      ]
    }))
    set(data, ['scopedSlots', 'item.type'], context.scopedSlots['item.type'] || ((config) => {
      return <div>
        <div>{ config.item.param.stepAction }</div>
        <div>{ config.item.param.moduleType }</div>
      </div>
    }))
    set(data, ['scopedSlots', 'item.createTime'], context.scopedSlots['item.createTime'] || ((config) => {
      return <div>
        <div class="text-nowrap">{ config.item.createTime }</div>
        <div class="text-nowrap">{ config.item.readTime }</div>
      </div>
    }))
    set(data, ['scopedSlots', 'item.param.result'], context.scopedSlots['item.param.result'] || ((config) => {
      let chipColor = ''
      switch (config.item.param.result) {
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
        <div>{ config.item.param.duration }</div>,
        <v-chip small class="mb-1 white--text" color={chipColor}>
          { config.item.param.result }
        </v-chip>
      ]
    }))
    if (get(['attrs', 'showExpand'], data) === undefined) {
      set(data, ['attrs', 'showExpand'], true)
    }
    if (get(['scopedSlots', 'item.data-table-expand'], data) === undefined) {
      set(data, ['scopedSlots', 'item.data-table-expand'], (config) => {
        const stepDetailType = stepsDetailMap[config.item.param.stepDetail] || config.item.param.stepDetail
        if (stepDetailType) {
          return createElement('v-icon', {
            staticClass: 'v-data-table__expand-icon',
            class: {
              'v-data-table__expand-icon--active': config.isExpanded
            },
            on: {
              click: (e) => {
                e.stopPropagation()
                config.expand(!config.isExpanded)
              }
            }
          }, ['$expand'])
        } else {
          return null
        }
      })
    }

    set(data, ['scopedSlots', 'expanded-item'], context.scopedSlots['expanded-item'] || ((config) => {
      const stepDetailType = stepsDetailMap[config.item.param.stepAction] || config.item.param.stepAction
      const tableData = {
        attrs: {
          headers: get([stepDetailType, 'headers'], stepsData) || [],
          items: [config.item.param],
          disablePagination: true,
          hideDefaultFooter: true
        },
        scopedSlots: get([stepDetailType, 'scopedSlots'], stepsData) || {}
      }
      if (get([stepDetailType, 'subTable'], stepsData)) {
        tableData.attrs.headers = [{ value: 'data-table-expand' }].concat(tableData.attrs.headers)
        tableData.attrs.showExpand = true
        set(tableData, ['scopedSlots', 'expanded-item'], (subConfig) => {
          const subTableData = {
            attrs: {
              headers: get([stepDetailType, 'subTable', 'headers'], stepsData) || [],
              items: get(get([stepDetailType, 'subTable', 'itemsPath'], stepsData), config.item) || [],
              disablePagination: true,
              hideDefaultFooter: true
            }
          }
          return <td colspan={subConfig.headers.length} class="pa-1">
            <v-card class="rounded-0">
              <v-card-text class="px-1">
                <v-simple-table>
                  <thead>
                    <tr>
                      <th class="text-left">
                        邮箱
                      </th>
                      <th class="text-left">
                        请求错误信息
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{ config.item.mail }</td>
                      <td>{ config.item.errMsg }</td>
                    </tr>
                  </tbody>
                </v-simple-table>
                <v-simple-table>
                  <thead>
                    <tr>
                      <th class="text-left">
                        邮件标题
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{ config.item.title }</td>
                    </tr>
                  </tbody>
                  <thead>
                    <tr>
                      <th class="text-left">
                        邮件内容
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <Monaco
                          ref="monaco"
                          monacoOptions={{
                            value: config.item.content,
                            automaticLayout:true,
                            readOnly: true, // 是否只读
                            theme: "vs-dark", // 编辑器主题
                            language: "text"
                          }}
                          height={500}
                        ></Monaco>
                      </td>
                    </tr>
                  </tbody>
                </v-simple-table>
              </v-card-text>
            </v-card>
            <div class="py-1 px-2">{get([stepDetailType, 'subTable', 'title'], stepsData)}</div>
            <v-data-table {...subTableData} />
          </td>
        })
      }
      return <td colspan={config.headers.length} class="pa-1">
        <v-card class="rounded-0">
          <v-card-text class="px-1">
            <v-simple-table>
              <thead>
                <tr>
                  <th class="text-left">
                    邮箱
                  </th>
                  <th class="text-left">
                    请求错误信息
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{ config.item.mail }</td>
                  <td>{ config.item.errMsg }</td>
                </tr>
              </tbody>
            </v-simple-table>
            <v-simple-table>
              <thead>
                <tr>
                  <th class="text-left">
                    邮件标题
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{ config.item.title }</td>
                </tr>
              </tbody>
              <thead>
                <tr>
                  <th class="text-left">
                    邮件内容
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <Monaco
                      ref="monaco"
                      monacoOptions={{
                        value: config.item.content,
                        automaticLayout:true,
                        readOnly: true, // 是否只读
                        theme: "vs-dark", // 编辑器主题
                        language: "text"
                      }}
                      height={500}
                    ></Monaco>
                  </td>
                </tr>
              </tbody>
            </v-simple-table>
          </v-card-text>
        </v-card>
        <v-data-table {...tableData}/>
      </td>
    }))
    return <DataTable class="steps-data-table" {...data} item-key="index">
      {context.children}
    </DataTable>
  }
}
</script>

<style scoped>
.text-nowrap {
  word-break: keep-all;
  white-space: nowrap;
}
</style>
