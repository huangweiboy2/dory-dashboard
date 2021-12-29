<script>
import { cloneDeep, get } from 'lodash/fp'
import { set } from 'lodash'
import DataTable from '@/lib/ui-lib/components/DataTable'
import Monaco from "@/lib/monaco/Monaco"
import YAML from "yamljs";

const stepsDetailMap = {
  build: 'build',
  packageImage: 'package',
  deploy: 'deploy',
  undo: 'undo',
  syncImage: 'syncImage',
  applyIngress: 'applyIngress',
  checkQuota: 'checkQuota',
  checkDeploy: 'checkDeploy',
  artifact: 'artifact',
  deployArtifact: 'deployArtifact',
  databaseExec: 'databaseScript',
  databaseRollback: 'databaseScript',
  deployDebug: 'deployDebug',
  deployStatic: 'deployStatic'
}

export default {
  name: 'StepsDataTable',
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
  props: ['steps', 'console'],
  render (createElement, context) {
    const vm = this
    const stepsData = {
      build: {
        headers: [
          { value: 'stepDetail.moduleName', text: '模块名' },
          { value: 'stepDetail.branch', text: '分支' },
          { value: 'stepDetail.buildPath', text: '构建目录' },
          { value: 'stepDetail.buildEnv', text: '构建环境' },
          { value: 'stepDetail.buildCmds', text: '构建命令' },
          { value: 'stepDetail.buildChecks', text: '检查命令' }
        ]
      },
      package: {
        headers: [
          { value: 'stepDetail.moduleName', text: '模块名' },
          { value: 'stepDetail.branch', text: '分支' },
          { value: 'stepDetail.tagName', text: '镜像标签' },
          { value: 'stepDetail.size', text: '镜像大小' }
        ]
      },
      artifact: {
        headers: [
          { value: 'stepDetail.moduleName', text: '模块名' },
          { value: 'stepDetail.branch', text: '分支' },
          { value: 'stepDetail.tarName', text: 'tarName' },
          { value: 'stepDetail.size', text: '镜像大小' }
        ]
      },
      deploy: {
        headers: [
          { value: 'stepDetail.moduleName', text: '模块名' },
          { value: 'stepDetail.envName', text: '环境' },
          { value: 'stepDetail.isMeshEnable', text: '是否启用服务网格' },
          { value: 'stepDetail.tagName', text: '镜像标签' },
          { value: 'stepDetail.deployYaml', text: '部署YAML' },
          { value: 'stepDetail.serviceYaml', text: '服务YAML' },
          { value: 'stepDetail.hpaYaml', text: '水平扩缩容YAML' }
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
          { value: 'stepDetail.moduleName', text: '模块名' },
          { value: 'stepDetail.envName', text: '环境' },
          { value: 'stepDetail.deploymentStatus', text: '部署结果' }
        ],
        subTable: {
          title: 'pod状态列表',
          headers: [
            { value: 'podName', text: 'podName' },
            { value: 'imageName', text: 'imageName' },
            { value: 'ready', text: 'ready' },
            { value: 'reason', text: 'reason' },
            { value: 'restart', text: 'restart' },
            { value: 'age', text: 'age' }
          ],
          itemsPath: ['stepDetail', 'podStatuses']
        }
      },
      deployArtifact: {
        headers: [
          { value: 'stepDetail.moduleName', text: '模块名' },
          { value: 'stepDetail.envName', text: '环境' }
        ]
      },
      test: {
        headers: [
          { value: 'stepDetail.moduleName', text: '模块名' },
          { value: 'stepDetail.envName', text: '环境' },
          { value: 'stepDetail.testType', text: '测试类型' },
          { value: 'stepDetail.result', text: '测试结果' },
          { value: 'stepDetail.report', text: '测试报告' }
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
                  // console.log(process.env.VUE_APP_BASE+config.item.stepDetail.filePath)
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
      syncImage: {
        headers: [
          { value: 'stepDetail.moduleName', text: '模块名' },
          { value: 'stepDetail.envName', text: '环境' },
          { value: 'stepDetail.isMeshEnable', text: '是否集成环境/正式环境启用服务网格' },
          { value: 'stepDetail.fromImages', text: '源镜像名（多个）' },
          { value: 'stepDetail.toImages', text: '目标镜像名（多个）' }
        ]
      },
      undo: {
        headers: [
          { value: 'stepDetail.moduleName', text: '模块名' },
          { value: 'stepDetail.envName', text: '环境' },
          { value: 'stepDetail.isMeshEnable', text: '是否启用服务网格' },
          { value: 'stepDetail.fromImageName', text: '源镜像名' },
          { value: 'stepDetail.toImageName', text: '目标镜像名' }
        ]
      },
      applyIngress: {
        headers: [
          { value: 'stepDetail.envName', text: '环境' },
          { value: 'stepDetail.ingressInfoYaml', text: 'ingress定义' },
          // { value: 'stepDetail.ingressInfoYaml', text: 'ingress定义' },
        ],
        scopedSlots: {
          'item.stepDetail.ingressInfoYaml': (config) => {
            let codeValue = config.item.stepDetail.ingressInfoYaml
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
                        value: config.item.stepDetail.ingressInfoYaml,
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
          'item.stepDetail.paramOutput': (config) => {
            let codeValue = config.item.stepDetail.paramOutput
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
                        value: YAML.stringify(config.item.stepDetail.paramOutput, 4),
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
          }
        }
      },
      checkQuota: {
        headers: [
          { value: 'stepDetail.envName', text: '环境' },
          { value: 'stepDetail.resourceQuotaDesc', text: '资源配额占用详情' }
        ],
        scopedSlots: {
          'item.stepDetail.resourceQuotaDesc': (config) => {
            let codeValue = config.item.stepDetail.resourceQuotaDesc
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
                        value: config.item.stepDetail.resourceQuotaDesc,
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
          }
        },
        subTable: {
          title: '配额占比情况概览',
          headers: [
            { value: 'memoryRequestRate', text: 'memory请求已使用配额百分比' },
            { value: 'memoryLimitRate', text: 'memory限制已使用配额百分比' },
            { value: 'cpuRequestRate', text: 'cpu请求已使用配额百分比' },
            { value: 'cpuLimitRate', text: 'cpu限制已使用配额百分比' },
            { value: 'podsRate', text: 'pod数量限制已使用配额百分比' },
          ],
          itemsPath: ['stepDetail', 'resourceRate']
        }
      },
      applyMesh: {
        headers: [
          { value: 'stepDetail.envName', text: '环境' },
          { value: 'stepDetail.isMeshEnable', text: '是否启用服务网格' },
          { value: 'stepDetail.istioInfoYaml', text: '网格定义' }
        ],
         scopedSlots: {
          'item.stepDetail.istioInfoYaml': (config) => {
            let codeValue = config.item.stepDetail.istioInfoYaml
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
                        value: config.item.stepDetail.istioInfoYaml,
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
          }
        },
        subTable: {
          title: '扫描状态列表',
          headers: [
            { value: 'moduleName', text: '模块名' },
            { value: 'defaultBuildID', text: '默认版本buildID' },
            { value: 'newBuildID', text: '新版本buildID' }
          ],
          itemsPath: ['stepDetail', 'meshSubsets']
        }
      },
      changeMesh: {
        headers: [
          { value: 'stepDetail.envName', text: '环境' },
          { value: 'stepDetail.weight', text: '测试流量百分比' }
        ]
      },
      databaseScript: {
        headers: [
          { value: 'stepDetail.envName', text: '环境' },
          { value: 'stepDetail.action', text: '操作类型' }
        ]
      },
      diy: {
        headers: [
          { value: 'stepDetail.moduleName', text: '模块名' },
          { value: 'stepDetail.branchName', text: '分支名称' },
          { value: 'stepDetail.envName', text: '环境' },
          { value: 'stepDetail.paramInput', text: '输入参数' },
          { value: 'stepDetail.paramOutput', text: '输出参数' }
        ],
        scopedSlots: {
          'item.stepDetail.paramInput': (config) => {
            let codeValue = config.item.stepDetail.paramInput
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
                        value: YAML.stringify(config.item.stepDetail.paramInput, 4),
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
          'item.stepDetail.paramOutput': (config) => {
            let codeValue = config.item.stepDetail.paramOutput
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
                        value: YAML.stringify(config.item.stepDetail.paramOutput, 4),
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
          }
        }
      },
    }
    const headers = [
      { value: 'data-table-expand' },
      { value: 'stepName', text: '步骤描述', sortable: false },
      { value: 'stepAction', text: '步骤类型', sortable: false },
      { value: 'moduleName', text: '模块', sortable: false },
      { value: 'runName', text: '运行名称', sortable: false },
      { value: 'status.startTime', text: '执行时间', sortable: false },
      { value: 'status.result', text: '执行结果', sortable: false },
      { value: 'handle', text: '操作', sortable: false },
    ]
    const data = cloneDeep(context.data)
    set(data, ['attrs', 'headers'], get(['attrs', 'headers'], data) || headers)
    set(data, ['attrs', 'items'], get(['attrs', 'items'], data) || context.props.steps || [])
    set(data, ['scopedSlots', 'item.moduleName'], context.scopedSlots['item.moduleName'] || ((config) => {
      if(config.item.moduleType&&config.item.moduleName){
        return [
        <div class="mb-1 mt-1"><router-link to={{name: 'CicdModule', params: { projectName: config.item.projectName, moduleName: config.item.moduleName, moduleType: config.item.moduleType }}}>{config.item.moduleName}</router-link></div>,
        <div class="mb-1">{config.item.moduleType}</div>
      ]
      }else{
        return [
          <div class="mb-1 mt-1">{config.item.moduleName}</div>,
          <div class="mb-1">{config.item.moduleType}</div>
        ]
      }
    }))
    set(data, ['scopedSlots', 'item.runName'], context.scopedSlots['item.runName'] || ((config) => {
      return <router-link to={{name: 'CicdRun', params: { 'runName': config.item.runName }}}>
        { config.item.runName }
      </router-link>
    }))
    set(data, ['scopedSlots', 'item.status.result'], context.scopedSlots['item.status.result'] || ((config) => {
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
    set(data, ['scopedSlots', 'item.handle'], context.scopedSlots['item.handle'] || ((config) => {
      return <div>
        <v-btn small class="my-1" color="primary" vOn:click={() => {
          context.props.console(config.item.runName, config.item.stepID)
        }}>查看日志</v-btn>
      </div>
    }))
    if (get(['attrs', 'showExpand'], data) === undefined) {
      set(data, ['attrs', 'showExpand'], true)
    }
    if (get(['attrs', 'itemKey'], data) === undefined) {
      set(data, ['attrs', 'itemKey'], 'stepID')
    }
    if (get(['scopedSlots', 'item.data-table-expand'], data) === undefined) {
      set(data, ['scopedSlots', 'item.data-table-expand'], (config) => {
        const stepDetailType = stepsDetailMap[config.item.stepDetail] || config.item.stepDetail
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
      let stepDetailType = ''
      if(config.item.isCustomStep){
        stepDetailType = 'diy'
      }else{
        stepDetailType = stepsDetailMap[config.item.stepAction] || config.item.stepAction
      }
      const tableData = {
        attrs: {
          headers: get([stepDetailType, 'headers'], stepsData) || [],
          items: [config.item],
          disablePagination: true,
          hideDefaultFooter: true
        },
        scopedSlots: get([stepDetailType, 'scopedSlots'], stepsData) || {}
      }
      if (get([stepDetailType, 'subTable'], stepsData)) {
        tableData.attrs.headers = [{ value: 'data-table-expand' }].concat(tableData.attrs.headers)
        tableData.attrs.showExpand = true
        set(tableData, ['scopedSlots', 'expanded-item'], (subConfig) => {
          let subTableData
          if(subConfig.item.stepDetail.resourceRate) {
            subTableData = {
              attrs: {
                headers: get([stepDetailType, 'subTable', 'headers'], stepsData) || [],
                items: [subConfig.item.stepDetail.resourceRate] || [],
                disablePagination: true,
                hideDefaultFooter: true
              },
              scopedSlots: {
                'item.memoryRequestRate': (config) => {
                  return <div>
                    <v-progress-linear height={20} value={config.item.memoryRequestRate * 100}>
                      <strong>{config.item.memoryRequestRate * 100}%</strong>
                    </v-progress-linear>
                  </div>
                },
                'item.memoryLimitRate': (config) => {
                  return <div>
                    <v-progress-linear height={20} value={config.item.memoryLimitRate * 100}>
                      <strong>{config.item.memoryLimitRate * 100}%</strong>
                    </v-progress-linear>
                  </div>
                },
                'item.cpuRequestRate': (config) => {
                  return <div>
                    <v-progress-linear height={20} value={config.item.cpuRequestRate * 100}>
                      <strong>{config.item.cpuRequestRate * 100}%</strong>
                    </v-progress-linear>
                  </div>
                },
                'item.cpuLimitRate': (config) => {
                  return <div>
                    <v-progress-linear height={20} value={config.item.cpuLimitRate * 100}>
                      <strong>{config.item.cpuLimitRate * 100}%</strong> 
                    </v-progress-linear>
                  </div>
                },
                'item.podsRate': (config) => {
                  return <div>
                    <v-progress-linear height={20} value={config.item.podsRate * 100}>
                      <strong>{config.item.podsRate * 100}%</strong> 
                    </v-progress-linear>
                  </div>
                }
              }
            }
          } else {
            subTableData = {
              attrs: {
                headers: get([stepDetailType, 'subTable', 'headers'], stepsData) || [],
                items: get(get([stepDetailType, 'subTable', 'itemsPath'], stepsData), config.item) || [],
                disablePagination: true,
                hideDefaultFooter: true
              }
            }
          }
          
          return <td colspan={subConfig.headers.length} class="pa-1">
            <div class="py-1 px-2">{get([stepDetailType, 'subTable', 'title'], stepsData)}</div>
            <v-data-table {...subTableData} />
          </td>
        })
      }
      return <td colspan={config.headers.length} class="pa-1">
        <v-data-table {...tableData}/>
      </td>
    }))
    return <DataTable class="steps-data-table" {...data}>
      {context.children}
    </DataTable>
  }
}
</script>

<style scoped>

</style>
