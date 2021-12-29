<script>
import AssemblyLine from '@/lib/ui-lib/components/AssemblyLine'
import ChipPairs from '@/lib/ui-lib/components/ChipPairs'
import InfoCard from '@/lib/ui-lib/components/InfoCard'
import InfoSingleTable from '@/lib/ui-lib/components/InfoSingleTable'
import Operations from '@/lib/ui-lib/components/Operations'
import Module from '@/services/module'
import Pipeline from '@/services/pipeline'
import request from '@/utils/request'
const moduleService = Module.getInstance()
const pipelineService = Pipeline.getInstance()
export default {
  inject: ['successTip', 'errorTip', 'warnTip', 'reload'],
  name: 'Projects',
  components: { InfoSingleTable, InfoCard, ChipPairs, AssemblyLine, Operations },
  data () {
    return {
      projectsForm: {
        projectNames: [],
        projectTeam: '',
        page: 1,
        perPage: 10
      },
      addProjectForm: {
        projectName: '',
        projectDesc: '',
        projectShortName: '',
        projectTeam: '',
        envName: ''
      },
      tableLoading: true,
      targetProjectName: '',
      recyleNodePort: '',
      pageData: {
        totalCount: 0,
        rows: [],
        displayRows: []
      },
      addProject: false,
      nodePortDialog: false,
      envsDialog: false,
      recycleNodeportDialog: false,
      projectName: [],
      projectList: [],
      newEnvDialog: false,
      newEnvSelect: [],
      newEnvSelectList: [],
      modifyProject: false,
      deleteProject: false,
      deleteAll: false,
      deleteProjectName: '',
      deleteProjectAll: '',
      auditDialog: false,
      auditMessage: '',
      ws: null,
      userToken: '',
      logList: [],
      handleEnvType: '0',
      handleEnvName: '',
      updateProjectForm: {
        projectDesc: '',
        projectTeam: ''
      },
      deleteEnvName: ''
    }
  },
  methods: {
    getProjects() {
      const vm = this
      request.post('admin/projects', vm.projectsForm).then(response => {
        vm.pageData.rows = response.data.projects
        vm.pageData.totalCount = response.data.totalCount
        vm.pageData.displayRows = vm.pageData.rows.map((row,index) => {
          row.index = index
          return Object.assign({}, row, {
            pipelinesInfoCard: vm.rtnPipelinesInfoCard(row),
            projectTeam: row.projectInfo.projectTeam,
            projectGit: row.projectInfo.projectGroup,
          })
        })
        vm.tableLoading = false
        vm.successTip(true, response.msg)
      }).catch(error => {
        vm.errorTip(true, error.response.data.msg)
      })
    },
    updateOptions() {
      const vm = this
      vm.tableLoading = true
      request.post('admin/projects', vm.projectsForm).then(response => {
        vm.pageData.rows = response.data.projects
        vm.pageData.totalCount = response.data.totalCount
        vm.pageData.displayRows = vm.pageData.rows.map((row,index) => {
          row.index = index
          return Object.assign({}, row, {
            pipelinesInfoCard: vm.rtnPipelinesInfoCard(row),
            projectTeam: row.projectInfo.projectTeam,
            projectGit: row.projectInfo.projectGroup,
          })
        })
        vm.tableLoading = false
      }).catch(error => {
        vm.errorTip(true, error.response.data.msg)
      })
    },
    // 流水线列表
    rtnPipelinesInfoCard (row) {
      const vm = this
      return {
        title: '流水线列表',
        content (h) {
          return <VSimpleTable dense>
            <template slot="default">
              <thead>
                <tr>
                  <th class="text-left">
                  流水线名称
                  </th>
                  <th class="text-left">
                  分支名称
                  </th>
                  <th class="text-left">
                  集成环境
                  </th>
                  <th class="text-left">
                  正式环境
                  </th>
                  <th class="text-left">
                  成功/失败/终止次数
                  </th>
                  <th class="text-left">
                  最新启动
                  </th>
                  <th class="text-left">
                  最新运行结果
                  </th>
                  <th class="text-left">
                  操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {row.pipelines.map(item => {
                  var chipColor = ''
                  switch(item.status.result) {
                    case 'FAIL':
                      chipColor = 'red'
                      break;
                    case 'RUNNING':
                      chipColor = 'blue'
                      break;
                    case 'SUCCESS':
                      chipColor = 'green'
                      break;
                    case 'ABORT':
                      chipColor = 'grey'
                      break;
                    case 'INPUT':
                      chipColor = 'orange'
                      break;
                  }
                  return <tr>
                    <td>
                      <router-link to={{name: 'CicdPipeline', params: { pipelineName: item.pipelineName }}}>{ item.pipelineName }</router-link>
                    </td>
                    <td>{ item.branchName }</td>
                    <td>
                      {
                        item.envs.map(item => {
                          return <div class="my-1"><VChip color="primary" small>{ item }</VChip></div>
                        })
                      }
                    </td>
                    <td>
                      {
                        item.envProductions.map(item => {
                          return <div class="my-1"><VChip color="primary" small>{ item }</VChip></div>
                        })
                      }
                    </td>
                    <td>
                      <span class="green--text">{ item.successCount }</span>/
                      <span class="red--text">{ item.failCount }</span>/
                      <span class="grey--text">{ item.abortCount }</span>
                    </td>
                    <td>{ item.status.startTime }</td>
                    <td>
                      <div slot="default">
                        <div>{ item.status.duration }</div>
                        <VChip vShow={item.status.result} small class="mb-1 white--text" color={ chipColor }>
                          { item.status.result }
                        </VChip>
                      </div>
                    </td>
                    <td>
                      <div>
                        <VBtn small color="primary" vOn:click_stop={ () => {
                          request.post(`/cicd/pipeline/${item.pipelineName}`).then(response => {
                            vm.$router.push({
                              name: 'CicdRun',
                              params: {
                                'runName': response.data.runName
                              }
                            })
                          }).catch(error => {
                            vm.errorTip(true, error.response.data.msg)
                          })
                        } }>运行</VBtn>
                      </div>
                    </td>
                  </tr>
                })}
              </tbody>
            </template>
          </VSimpleTable>
        }
      }
    },
    // websocket 
    showLog (response) {
      const vm =this
      vm.logList = []
      vm.auditDialog = response.data.withAdminLog
      if(response.data.withAdminLog){
        vm.ws = new WebSocket(`${vm.GLOBAL}/ws/log/audit/admin/${response.data.auditID}?x-user-token=${vm.userToken}`)
        vm.ws.onmessage = (event) => {
          vm.logList.push(JSON.parse(event.data))
        }
        vm.ws.onclose = () => {
          vm.logList.push({logType: 'END'})
        }
      }
    }
  },
  created () {
    const vm = this
    vm.userToken = JSON.parse(localStorage.getItem('userObj')).userToken
    request.get('/admin/projectNames').then(response => {
      vm.projectList = response.data.projectNames
    }).catch(error => {
      vm.errorTip(true, error.response.data.msg)
    })
    request.post('/admin/projects',vm.projectsForm).then(response => {
      vm.pageData.rows = response.data.projects
      vm.pageData.totalCount = response.data.totalCount
      vm.tableLoading = false
      vm.pageData.displayRows = vm.pageData.rows.map((row,index) => {
        row.index = index
        return Object.assign({}, row, {
          pipelinesInfoCard: vm.rtnPipelinesInfoCard(row),
          projectTeam: row.projectInfo.projectTeam,
          projectGit: row.projectInfo.projectGroup,
        })
      })
    }).catch(error => {
      console.log(error.response.data)
      vm.errorTip(true, error.response.data.msg)
    })
    request.get('/admin/envNames').then(response => {
      vm.newEnvSelectList = response.data.envNames
    }).catch(error => {
      vm.errorTip(true, error.response.data.msg)
    })
  },
  render (createElement, context) {
    const vm = this
    return <VCard flat>
      <VCardTitle>
        项目列表
      </VCardTitle>
      <VDataTable
        headers={[
          { value: 'projectName', text: '项目名', sortable: false },
          { value: 'projectTeam', text: '项目团队',sortable: false },
          { value: 'projectRepo', text: '项目仓库',sortable: false },
          { value: 'nodePort', text: '可用NodePort', sortable: false },
          { value: 'env', text: '可用环境信息', sortable: false },
          { value: 'handle', text: '操作', sortable: false }
        ]}
        items={vm.pageData.displayRows}
        server-items-length={vm.pageData.totalCount}
        footerProps={{
          showCurrentPage: true,
          itemsPerPageOptions: [ 5, 10, 15, 20 ]
        }}
        page={vm.projectsForm.page}
        items-per-page={vm.projectsForm.perPage}
        showExpand
        itemKey="index"
        expanded={[0]}
        loading={vm.tableLoading}
        on={{
          'update:options': (value) => {
            vm.projectsForm.page = value.page
            vm.projectsForm.perPage = value.itemsPerPage
            vm.updateOptions()
          }
        }}
        scopedSlots={{
          'item.projectName': ({item}) => {
            return <router-link to={{name: 'AdminProject', params: { projectName: item.projectInfo.projectName }}}>
              <div>{item.projectInfo.projectName} （<span>{item.projectInfo.projectShortName}</span>）</div>
              <div>{item.projectInfo.projectDesc}</div>
            </router-link>
          },
          'item.projectRepo': (config) => {
            return <div class="repo-wrap">
              <div class="mb-1">
                <a target="_Blank" href={config.item.projectRepo.gitRepo}>
                  <v-chip small color="success">代码仓库</v-chip>
                </a>
              </div>
              <div class="mb-1">
                <a target="_Blank" href={config.item.projectRepo.imageRepo}>
                  <v-chip small color="success">镜像仓库</v-chip>
                </a>
              </div>
              <div class="mb-1">
                <a target="_Blank" href={config.item.projectRepo.artifactRepo}>
                  <v-chip small color="success">制品仓库</v-chip>
                </a>
              </div>
            </div>
          },
          'item.nodePort': ({item}) => {
            return <div>
              {
                item.projectNodePorts.map(i => {
                  if(i.isDefault){
                    return <div class="my-1"><v-chip color="success" small>{i.nodePortStart}-{i.nodePortEnd}</v-chip></div>
                  }else{
                    return <div class="my-1"><v-chip color="primary" small vOn:click={() => {
                      vm.recycleNodeportDialog = true
                      vm.targetProjectName = item.projectInfo.projectName
                      vm.recyleNodePort = i.nodePortStart
                    }}>{i.nodePortStart}-{i.nodePortEnd}</v-chip></div>
                  }
                })
              }
            </div>
          },
          'item.env': ({item}) => {
            return <div>
              {
                item.projectAvailableEnvs.map(i => {
                  return <div class="my-1"><v-chip color="primary" small vOn:click={() => {
                    vm.envsDialog = true
                    vm.targetProjectName = item.projectInfo.projectName
                    vm.handleEnvName = i.envName
                  }}>{i.envName}</v-chip></div>
                })
              }
            </div>
          },
          'item.handle': ({item}) => {
            return <div>
              <Operations
                operations={[
                  { text: '分配新NodePort', onClick: () => { 
                    vm.nodePortDialog = true
                    vm.targetProjectName = item.projectInfo.projectName
                   } }, 
                  { text: '分配新环境', onClick: () => { 
                    vm.newEnvDialog = true
                    vm.targetProjectName = item.projectInfo.projectName
                   } }, 
                  { text: '修改项目', onClick: () => { 
                    vm.modifyProject = true
                    vm.targetProjectName = item.projectInfo.projectName
                    vm.updateProjectForm.projectDesc = item.projectInfo.projectDesc
                    vm.updateProjectForm.projectTeam = item.projectInfo.projectTeam
                   } }, 
                  { text: '删除项目', onClick: () => { 
                    vm.deleteProject = true
                    vm.targetProjectName = item.projectInfo.projectName
                   } }, 
                  { text: '删除项目与环境', onClick: () => { 
                    vm.deleteAll = true
                    vm.targetProjectName = item.projectInfo.projectName
                   } } ]}
              >
              </Operations>
            </div>
          },
          'expanded-item': (config) => {
            return <td colspan={config.headers.length} class="pa-1">
              <InfoCard
                props={ config.item.pipelinesInfoCard }
              />
            </td>
          }
        }}
      >
        <template slot="top">
          <VForm>
            <VContainer fluid>
              <VRow class="flex-wrap">
                <VCol
                  cols="4"
                >
                  <VSelect
                    v-model={vm.projectsForm.projectNames}
                    items={vm.projectList}
                    label="项目名称"
                    multiple
                    dense
                    small-chips
                    vOn:blur={() => {
                      vm.getProjects()
                    }}
                  />
                </VCol>

                <VCol
                  cols="4"
                >
                  <VTextField
                    label="项目团队"
                    dense
                    v-model={vm.projectsForm.projectTeam}
                    vOn:keydown_enter={() => {
                      vm.getProjects()
                    }}
                  />
                </VCol>
                <VCol
                  cols="3"
                >
                  <VBtn color="primary" vOn:click_stop={ () => {
                    vm.addProject = true
                  } }>新增项目</VBtn>
                </VCol>
              </VRow>
            </VContainer>
          </VForm>
        </template>
      </VDataTable>
      <VDialog
        v-model={vm.addProject}
        max-width="600px"
        persistent
      >
        <VCard>
          <VCardTitle>
            <span class="headline">新增项目</span>
          </VCardTitle>
          <VCardText>
            <VForm ref="addProjectRef">
            <v-alert icon="mdi-alert-circle" prominent text type="info">
              <small>创建持续交付项目，创建成功后会自动创建对应的项目git代码仓库、harbor镜像仓库、nexus依赖制品仓库以及项目的kubernetes名字空间。</small>
            </v-alert>
              <VContainer>
                <VRow>
                  <VCol cols="12">
                    <VTextField
                      label="项目名称（projectName）*"
                      required
                      dense
                      rules={[v => !!v || '项目名为必填项']}
                      vModel={vm.addProjectForm.projectName}
                      hint="项目的英文唯一标识，创建后不能修改，格式例如：test-project1"
                      persistent-hint
                    ></VTextField>
                  </VCol>
                  <VCol cols="12">
                    <VTextField
                      label="项目全称（projectDesc）*"
                      required
                      dense
                      rules={[v => !!v || '项目全称为必填项']}
                      vModel={vm.addProjectForm.projectDesc}
                      hint="项目的全称信息，格式例如：测试-项目1"
                      persistent-hint
                    ></VTextField>
                  </VCol>
                  <VCol cols="12">
                    <VTextField
                      label="项目缩写（projectShortName）*"
                      required
                      dense
                      rules={[v => !!v || '项目缩写为必填项']}
                      vModel={vm.addProjectForm.projectShortName}
                      hint="项目缩写，kubernetes中项目所有部署模块必须包含项目缩写作为前缀，小写英文或者数字，格式例如：tp1"
                      persistent-hint
                    ></VTextField>
                  </VCol>
                  <VCol cols="12">
                    <VTextField
                      label="项目团队（projectTeam）*"
                      required
                      dense
                      rules={[v => !!v || '项目团队为必填项']}
                      vModel={vm.addProjectForm.projectTeam}
                      hint="项目团队，用于对该项目团队的持续交付信息进行统计，格式例如：测试团队1"
                      persistent-hint
                    ></VTextField>
                  </VCol>
                  <VCol cols="12">
                    <VSelect
                      v-model={vm.addProjectForm.envName}
                      items={vm.newEnvSelectList}
                      label="环境名称（envName）*"
                      rules={[v => !!v || '环境名称为必填项']}
                      dense
                      hint="请选择项目开通的默认流水线要发布到在哪个kubernetes环境。"
                      persistent-hint
                    />
                  </VCol>
                </VRow>
              </VContainer>
            </VForm>
          </VCardText>
          <VCardActions>
            <VSpacer></VSpacer>
            <VBtn
              color="blue darken-1"
              text
              vOn:click={() => {
                vm.$refs.addProjectRef.reset()
                vm.addProject = false
              }}
            >
              取消
            </VBtn>
            <VBtn
              color="blue darken-1"
              text
              vOn:click={() => {
                if(vm.$refs.addProjectRef.validate()) {
                  request.post('/admin/project', vm.addProjectForm).then(response => {
                  vm.successTip(true, response.msg)
                  vm.addProject = false
                  vm.$refs.addProjectRef.reset()
                  vm.showLog(response)
                }).catch(error => {
                  vm.errorTip(true, error.response.data.msg)
                })
                }
              }}
            >
              确认
            </VBtn>
          </VCardActions>
        </VCard>
      </VDialog>
      <VDialog
        v-model={vm.recycleNodeportDialog}
        max-width="600px"
      >
        <VCard>
          <VCardTitle>
            <span class="headline">回收NodePort</span>
          </VCardTitle>
          <VCardText>
            <v-alert icon="mdi-alert-circle" prominent text type="info">
              <small>回收NodePort后，项目将不能再使用该NodePort端口段发布服务</small>
            </v-alert>
            确认要回收NodePort端口段 { vm.recyleNodePort }-{ vm.recyleNodePort+9 }吗？
          </VCardText>
          <VCardActions>
            <VSpacer></VSpacer>
            <VBtn
              color="blue darken-1"
              text
              vOn:click={() => {
                vm.recycleNodeportDialog = false
              }}
            >
              取消
            </VBtn>
            <VBtn
              color="blue darken-1"
              text
              vOn:click={() => {
                request.post(`/admin/project/${vm.targetProjectName}/nodePortDelete`, {nodePort: vm.recyleNodePort}).then(response => {
                  vm.recycleNodeportDialog = false
                  vm.successTip(true, response.msg)
                  vm.showLog(response)
                  vm.updateOptions()
                }).catch(error => {
                  vm.errorTip(true, error.response.data.msg)
                })
              }}
            >
              确认
            </VBtn>
          </VCardActions>
        </VCard>
      </VDialog>
      <VDialog
        v-model={vm.envsDialog}
        width="500px"
      >
        <VCard>
          <VCardTitle>
            <span class="headline">{vm.handleEnvType == 0 ? '回收环境' : '回收环境并清理名字空间'}</span>
          </VCardTitle>
          <VCardText>
            <v-alert icon="mdi-alert-circle" prominent text type={vm.handleEnvType == 1 ? 'error' : 'info'}>
              <small vShow={vm.handleEnvType == 0}>
                回收项目可用环境后，项目将不能再把应用发布到本环境中。
              </small>
              <small vShow={vm.handleEnvType == 1}>
                回收项目可用环境后，项目将不能再把应用发布到本环境，同时会清除该kubernetes环境中该项目的名字空间。<v-chip small color="red">危险操作，请输入环境名。</v-chip>
              </small>
            </v-alert>
            <v-container>
              <v-form ref="deleteEnvRef">
                <v-row>
                  <v-col cols="12">
                    <v-select
                      v-model={ vm.handleEnvType }
                      items={ [{text: '回收环境', value: '0'}, {text: '回收环境并清理名字空间', value: '1'}] }
                      label="选择操作"
                      dense
                    ></v-select>
                  </v-col>
                  <v-col cols="12" vShow={vm.handleEnvType == 0}>
                    <div>确认要回收项目{vm.targetProjectName}的环境{vm.handleEnvName}吗？</div>
                  </v-col>
                  <v-col cols="12" vShow={vm.handleEnvType == 1}>
                    <VTextField
                      label="环境名（envName）*"
                      required
                      dense
                      rules={[v => !!v || '环境名为必填项']}
                      vModel={vm.deleteEnvName}
                      hint={`确认要回收项目${vm.targetProjectName}的环境${vm.handleEnvName}，并清理该kubernetes环境中的项目名字空间吗？`}
                      persistent-hint
                    ></VTextField>
                  </v-col>
                </v-row>
              </v-form>
            </v-container>
          </VCardText>
          <VCardActions>
            <VSpacer></VSpacer>
            <VBtn
              color="blue darken-1"
              text
              vOn:click={() => {
                vm.envsDialog = false
                vm.deleteEnvName = ''
                vm.$refs.deleteEnvRef.resetValidation()
              }}
            >
              取消
            </VBtn>
            <VBtn
              color="blue darken-1"
              text
              vOn:click={() => {
                if(vm.handleEnvType == '0'){
                  request.post(`/admin/project/${vm.targetProjectName}/envDelete`, { envName: vm.handleEnvName }).then(response => {
                    vm.successTip(true, response.msg)
                    vm.showLog(response)
                    vm.updateOptions()
                    vm.envsDialog = false
                  }).catch(error => {
                    vm.errorTip(true, error.response.data.msg)
                  })
                }else{
                  if(vm.deleteEnvName == vm.handleEnvName){
                    request.post(`/admin/project/${vm.targetProjectName}/envDeleteAll`, { envName: vm.handleEnvName }).then(response => {
                      vm.successTip(true, response.msg)
                      vm.showLog(response)
                      vm.updateOptions()
                      vm.deleteEnvName = ''
                      vm.$refs.deleteEnvRef.resetValidation()
                      vm.envsDialog = false
                    }).catch(error => {
                      vm.errorTip(true, error.response.data.msg)
                    })
                  }else{
                    vm.warnTip(true, '请输入正确环境名')
                  }
                }
              }}
            >
              确认
            </VBtn>
          </VCardActions>
        </VCard>
      </VDialog>
      <VDialog
        v-model={vm.nodePortDialog}
        max-width="600px"
      >
        <VCard>
          <VCardTitle>
            <span class="headline">分配新NodePort</span>
          </VCardTitle>
          <VCardText>
            <v-alert icon="mdi-alert-circle" prominent text type="info">
              <small>自动为该项目分配一个可用的NodePort端口段。</small>
            </v-alert>
            确认要为项目{vm.targetProjectName}分配新的NodePort端口段吗？
          </VCardText>
          <VCardActions>
            <VSpacer></VSpacer>
            <VBtn
              color="blue darken-1"
              text
              vOn:click={() => {
                vm.nodePortDialog = false
              }}
            >
              取消
            </VBtn>
            <VBtn
              color="blue darken-1"
              text
              vOn:click={() => {
                vm.nodePortDialog = false
                vm.tableLoading = true
                request.post(`/admin/project/${vm.targetProjectName}/nodePortAdd`).then(response => {
                  vm.successTip(true, response.msg)
                  vm.tableLoading = false
                  vm.showLog(response)
                  vm.updateOptions()
                }).catch(error => {
                  vm.tableLoading = false
                  vm.errorTip(true, error.response.data.msg)
                })
              }}
            >
              确认
            </VBtn>
          </VCardActions>
        </VCard>
      </VDialog>
      <v-dialog
        v-model={vm.newEnvDialog}
        max-width="600px"
      >
        <v-card>
          <v-card-title>
            分配新环境
          </v-card-title>

          <v-card-text>
            <v-alert icon="mdi-alert-circle" prominent text type="info">
              <small>分配新环境后，会自动在该kubernetes环境中为项目开通名字空间，项目的流水线就可以选择该环境作为集成环境或者正式环境，把应用发布到该环境。</small>
            </v-alert>
            <v-form ref="chooseEnvRef">
              <v-row>
                <v-col cols="12">
                  <v-select
                    v-model={ vm.newEnvSelect }
                    items={ vm.newEnvSelectList }
                    label="选择环境（envName）*"
                    multiple
                    persistent-hint
                    small-chips
                    dense
                    required
                  ></v-select>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              text
              vOn:click={() => {
                vm.newEnvDialog = false
                vm.$refs.chooseEnvRef.reset()
              }}
            >
              取消
            </v-btn>
            <v-btn
              color="primary"
              text
              vOn:click={() => {
                if(vm.newEnvSelect.length > 0){
                  vm.tableLoading = true
                  request.post(`/admin/project/${vm.targetProjectName}/envAdd`, { envNames: vm.newEnvSelect }).then(response => {
                    vm.newEnvDialog = false
                    vm.successTip(true, response.msg)
                    vm.showLog(response)
                    vm.$refs.chooseEnvRef.reset()
                    vm.updateOptions()
                  }).catch(error => {
                    vm.tableLoading = false
                    vm.errorTip(true, error.response.data.msg)
                  })
                }else{
                  vm.warnTip(true, '请选择环境')
                }
              }}
            >
              确认
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <VDialog
        v-model={vm.modifyProject}
        max-width="600px"
      >
        <VCard>
          <VCardTitle>
            <span class="headline">修改项目</span>
          </VCardTitle>
          <VCardText>
            <VForm ref="updateProjectRef">
              <small></small>
              <VContainer>
                <VRow>
                  <VCol cols="12">
                    <VTextField
                      label="项目全称（projectDesc）*"
                      required
                      dense
                      vModel={vm.updateProjectForm.projectDesc}
                      rules={[v => !!v || '全称为必填项']}
                      hint="项目的全称信息，格式例如：测试-项目1"
                      persistent-hint
                    ></VTextField>
                  </VCol>
                  <VCol cols="12">
                    <VTextField
                      label="项目团队（projectTeam）*"
                      required
                      dense
                      vModel={vm.updateProjectForm.projectTeam}
                      rules={[v => !!v || '项目团队为必填项']}
                      hint="项目团队，用于对该项目团队的持续交付信息进行统计，格式例如：测试团队1"
                      persistent-hint
                    ></VTextField>
                  </VCol>
                </VRow>
              </VContainer>
            </VForm>
          </VCardText>
          <VCardActions>
            <VSpacer></VSpacer>
            <VBtn
              color="blue darken-1"
              text
              vOn:click={() => {
                vm.modifyProject = false
                vm.$refs.updateProjectRef.resetValidation()
              }}
            >
              取消
            </VBtn>
            <VBtn
              color="blue darken-1"
              text
              vOn:click={() => {
                if(vm.$refs.updateProjectRef.validate()){
                  vm.tableLoading = true
                  vm.modifyProject = false
                  request.post(`/admin/project/${vm.targetProjectName}`, vm.updateProjectForm).then(response => {
                    vm.tableLoading = false
                    vm.successTip(true, response.msg)
                    vm.$refs.updateProjectRef.resetValidation()
                    vm.showLog(response)
                    vm.updateOptions()
                  }).catch(error => {
                    vm.tableLoading = false
                   vm.errorTip(true, error.response.data.msg)
                  })
                }
              }}
            >
              确认
            </VBtn>
          </VCardActions>
        </VCard>
      </VDialog>
      <VDialog
        v-model={vm.deleteProject}
        max-width="600px"
      >
        <VCard>
          <VCardTitle>
            <span class="headline">删除项目</span>
          </VCardTitle>
          <VCardText>
            <VForm ref="deleteProjectRef">
              <v-alert icon="mdi-alert-circle" prominent text type="error">
                <small>删除项目将会删除项目的所有配置信息，以及git代码仓库、harbor镜像仓库、nexus依赖制品仓库的配置信息。删除项目后所有项目流水线记录都将全部清除。<v-chip small color="red">危险操作，请输入项目名称。</v-chip></small>
              </v-alert>
              <VContainer>
                <VRow>
                  <VCol cols="12">
                    <VTextField
                      label="项目名称（projectName）*"
                      required
                      dense
                      rules={[v => !!v || '项目名称为必填项']}
                      vModel={vm.deleteProjectName}
                      hint={`确认要删除项目${vm.targetProjectName}吗？`}
                      persistent-hint
                    ></VTextField>
                  </VCol>
                </VRow>
              </VContainer>
            </VForm>
          </VCardText>
          <VCardActions>
            <VSpacer></VSpacer>
            <VBtn
              color="blue darken-1"
              text
              vOn:click={() => {
                vm.deleteProject = false
                vm.$refs.deleteProjectRef.reset()
              }}
            >
              取消
            </VBtn>
            <VBtn
              color="blue darken-1"
              text
              vOn:click={() => {
                if(vm.$refs.deleteProjectRef.validate() && (vm.targetProjectName === vm.deleteProjectName)){
                  request.delete(`/admin/project/${vm.deleteProjectName}`).then(response => {
                    vm.successTip(true, response.msg)
                    vm.deleteProject = false
                    vm.$refs.deleteProjectRef.reset()
                    vm.showLog(response)
                    vm.updateOptions()
                  }).catch(error => {
                    vm.errorTip(true, error.response.data.msg)
                  })
                }else{
                  vm.warnTip(true, '请输入正确项目全称')
                }
              }}
            >
              确认
            </VBtn>
          </VCardActions>
        </VCard>
      </VDialog>
      <VDialog
        v-model={vm.deleteAll}
        max-width="600px"
      >
        <VCard>
          <VCardTitle>
            <span class="headline">删除项目与环境</span>
          </VCardTitle>
          <VCardText>
            <VForm ref="deleteProjectAllRef">
              <v-alert icon="mdi-alert-circle" prominent text type="error">
                <small>删除项目并清理名字空间将会删除项目的所有配置信息，以及git代码仓库、harbor镜像仓库、nexus依赖制品仓库的配置信息。删除项目后所有项目流水线记录都将全部清除。同时将会清除项目所有kubernetes环境中的名字空间。<v-chip small color="red">危险操作，请输入项目名称。</v-chip></small>
              </v-alert>
              <VContainer>
                <VRow>
                  <VCol cols="12">
                    <VTextField
                      label="项目名称（projectName）*"
                      required
                      dense
                      rules={[v => !!v || '项目名称为必填项']}
                      vModel={vm.deleteProjectAll}
                      hint={`确认要删除项目${vm.targetProjectName}并清理名字空间吗？`}
                      persistent-hint
                    ></VTextField>
                  </VCol>
                </VRow>
              </VContainer>
            </VForm>
          </VCardText>
          <VCardActions>
            <VSpacer></VSpacer>
            <VBtn
              color="blue darken-1"
              text
              vOn:click={() => {
                vm.deleteAll = false
                vm.$refs.deleteProjectAllRef.reset()
              }}
            >
              取消
            </VBtn>
            <VBtn
              color="blue darken-1"
              text
              vOn:click={() => {
                if(vm.$refs.deleteProjectAllRef.validate() && (vm.targetProjectName === vm.deleteProjectAll)){
                  request.post(`/admin/project/${vm.deleteProjectAll}/deleteAll`).then(response => {
                    vm.successTip(true, response.msg)
                    vm.deleteAll = false
                    vm.$refs.deleteProjectAllRef.reset()
                    vm.showLog(response)
                    vm.updateOptions()
                  }).catch(error => {
                    vm.errorTip(true, error.response.data.msg)
                  })
                }else{
                  vm.warnTip(true, '请输入正确项目全称')
                }
              }}
            >
              确认
            </VBtn>
          </VCardActions>
        </VCard>
      </VDialog>
      <VDialog
        v-model={vm.auditDialog}
        max-width="800px"
      >
        <VCard>
          <VCardTitle>
            <span class="headline">查看详情</span>
          </VCardTitle>
          <VCardText id='log-container' style="overflow-x: scroll; background: #151515; color: #e0e0e0; position: relative; height: 500px;">
            {
              vm.logList.map((item, i) => {
                let logColor = ''
                switch (item.logType) {
                  case 'FAIL':
                    logColor = 'red'
                    break
                  case 'INFO':
                    logColor = 'green'
                    break
                }
                return <pre style={{color: logColor}} id={'log'+i} >[{item.logType}] {item.endTime}  {item.content}</pre>
              })
            }
          </VCardText>
          <VCardActions>
            <VSpacer></VSpacer>
            <VBtn
              color="blue darken-1"
              text
              vOn:click={() => {
                vm.auditDialog = false
                vm.ws.close()
                vm.updateOptions()
              }}
            >
              确认
            </VBtn>
          </VCardActions>
        </VCard>
      </VDialog>
    </VCard>
  }
}
</script>

<style scoped>
#log-container .CodeMirror {
  height: auto;
}
#log-container .CodeMirror-scroll {
  height: auto;
  overflow-y: hidden;
  overflow-x: auto;
}
</style>
