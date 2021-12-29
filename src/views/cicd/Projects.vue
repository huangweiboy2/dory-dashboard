<script>
import InfoCard from '@/lib/ui-lib/components/InfoCard'
import InfoSingleTable from '@/lib/ui-lib/components/InfoSingleTable'
import SearchForm from '@/lib/ui-lib/components/SearchForm'
import PageCard from '@/lib/ui-lib/page-templates/PageCard'
import ModuleInfos from '@/components/ModuleInfos'
import PROJECTS_API from '@/api/cicd/projects'
import { Subject, of, defer } from 'rxjs'
import { mergeMap, tap, filter, catchError, debounce, retry } from 'rxjs/operators'
import PipelinesDataTable from '@/components/PipelinesDataTable'
import DataTable from '@/lib/ui-lib/components/DataTable'
import { rtnRetryWhenOperator } from '@/utils/request'
import YAML from 'yamljs';
import request from '@/utils/request';
import MonacoDiff from "@/lib/monaco/MonacoDiff";
import Monaco from "@/lib/monaco/Monaco";
export default {
  inject: ['successTip', 'errorTip', 'warnTip'],
  name: 'Projects',
  components: { DataTable, PipelinesDataTable, ModuleInfos, PageCard, SearchForm, InfoSingleTable, InfoCard, MonacoDiff, Monaco },
  subscriptions () {
    return {
      queryPage$: new Subject(),
      projectNamesChange$: new Subject(),
      projectNamesBlur$: new Subject()
    }
  },
  data () {
    return {
      searchForm: {
        projectNames: [],
        projectTeam: ''
      },
      projectNames: [],
      pageData: {
        loading: false,
        total: 0,
        pageSize: 10,
        currentPage: 1,
        rows: [],
        displayRows: [],
        expanded: []
      },
      pipelineDefForm: {
        isAutoDetectBuild: null,
        builds: [],
        pipelineStep: {},
        customStepInsertDefs: {},
        customStepPhaseDefs: {}
      },
      pipelineDefDialog: false,
      targetBranchName: '',
      targetProjectName: '',
      YAMLDialog: false,
      yamlText: '',
      errMsgPipelineDef: '',
      cicdCustomStepInserts: {},
      InsertDefNames: [],
      monacoOptions: {
        automaticLayout:true,
        readOnly: true, // 是否只读
        theme: "vs-dark", // 编辑器主题
      },
      original: '',
      modified: '',
      commitHashList: [],
      dialogLoading: false,
      historyForm: {
        defName: '',
        branchName: '',
        envName: '',
        customStepName: '',
        createTimeRage: {
          startDate: '',
          endDate: ''
        }
      },
      historyDialog: false,
      dates:[],
      menu2: false,
      contentForm: {
        defName: '',
        branchName: '',
        envName: '',
        customStepName: '',
        commitHash: ''
      },
      pipelineList: [],
      stepDesc: {
        gitPull: '拉取代码',
        createRunFiles: '创建流水线运行文件',
        build: '编译构建代码',
        scanCode: '代码扫描',
        packageImage: '容器镜像打包上传',
        scanImage: '容器镜像扫描',
        artifact: '制品打包上传',
        syncImage: '同步生产环境镜像到集成环境',
        deploy: '容器应用部署',
        applyIngress: '部署ingress',
        applyMesh: '服务网格设置',
        checkDeploy: '容器应用状态检查',
        checkQuota: '项目容器资源配额检查',
        deployArtifact: '主机应用部署',
        testApi: '接口自动化测试',
        testPerformance: '性能自动化测试',
        testWebui: '界面自动化测试'
      },
      customDialog: false,
      customList: [],
      customSteps: [],
      targetName: '',
      stepInformation: null,
      textName: ''
    }
  },
  created () {
    const vm = this
    vm.$observables.queryPage$.pipe(
      tap(next => {
        vm.pageData.loading = true
      }),
      mergeMap(next => {
        const param = Object.assign({}, vm.searchForm, {
          page: vm.pageData.currentPage,
          perPage: vm.pageData.pageSize
        })
        return defer(() => PROJECTS_API.getProjects(param)).pipe(
          rtnRetryWhenOperator(),
          catchError((err, caught) => {
            console.log(err)
            vm.pageData.loading = false
            vm.errorTip(true, err.response.data.msg)
            return of(null)
          })
        )
      }),
      filter(next => {
        return next
      })
    ).subscribe(response => {
      vm.successTip(true, response.msg)
      vm.pageData.loading = false
      vm.pageData.rows = response.data.projects
      vm.pageData.displayRows = vm.pageData.rows.map(row => {
        return Object.assign({}, row, {
          pipelinesInfoCard: rtnPipelinesInfoCard(row)
        })
      })
      vm.pageData.expanded = [vm.pageData.displayRows[0]]
      vm.pageData.total = response.data.totalCount
    })
    // vm.$observables.queryPage$.next('init')
    PROJECTS_API.getProjectName().then(response => {
      vm.projectNames = response.data.projectNames
    }).catch((_) => {
      vm.errorTip(true, _.response.data.msg)
    })
    vm.$observables.projectNamesChange$.pipe(
      debounce(next => {
        return vm.$observables.projectNamesBlur$
      })
    ).subscribe(next => {
      vm.pageData.currentPage = 1
      vm.$observables.queryPage$.next('')
    })
    function rtnPipelinesInfoCard (row) {
      return {
        title: '流水线列表',
        content (h) {
          const dataTable = <PipelinesDataTable
            pipelines={row.pipelines}
            hideDefaultFooter
            disablePagination
            goRun={(runName) => {
              console.log(runName)
              vm.$router.push({
                name: 'CicdRun',
                params: {
                  runName: runName
                }
              })
            }}
            getPipelineDef={(projectName, branchName) => {
              if (projectName === "") {
                vm.targetProjectName = row.projectInfo.projectName
                projectName = vm.targetProjectName;
              }
              vm.targetBranchName = branchName;
              request.get(`/cicd/projectDef/${projectName}/${branchName}/pipelineDef`).then((response) => {
                vm.pipelineDefForm = response.data.pipelineDef;
                vm.errMsgPipelineDef = response.data.errMsgPipelineDef;
                console.log(vm.pipelineDefForm);
                vm.pageData.rows.map(row => {
                  if(row.projectInfo.projectName === projectName){
                    vm.cicdCustomStepInserts = row.cicdCustomStepInserts
                  }
                })
                console.log(vm.cicdCustomStepInserts)
                vm.organizeData()
                vm.stepInformation = null
                vm.textName = ''
                vm.pipelineDefDialog = true;
              }).catch((error) => {
                // vm.errorTip(true, error.response.data.msg);
              });
            }}
          />
          return dataTable
        }
      }
    }
  },
  computed: {
    dateRangeText () {
      return this.dates.join(' ~ ')
    }
  },
  methods: {
    // 重组数据
    organizeData() {
      const vm = this
      var pipelineList = []
      Object.keys(vm.pipelineDefForm.pipelineStep).map((item, i) => {
        let obj = {
          name: '',
          hint: '',
          data: '',
          type: '',
          isPush: true
        }
        if (item === 'gitPull' || item === 'syncImage') {
          obj.isPush = false
        } else {
          obj.isPush = true
        }
        obj.name = item
        obj.hint = vm.stepDesc[item]
        obj.type = 'original'
        obj.data = vm.pipelineDefForm.pipelineStep[item]
        pipelineList.push(obj)
      })
      pipelineList.splice(1, 0, {
        name: 'createRunFiles',
        hint: '创建流水线运行文件',
        data: null,
        type: 'original',
        isPush: true
      })
      vm.pipelineList = pipelineList
      vm.pipelineList.forEach((row, i) => {
        if (vm.pipelineDefForm.customStepInsertDefs[row.name] !== undefined) {
          vm.pipelineDefForm.customStepInsertDefs[row.name].forEach(c => {
            console.log(row.name, c, i)
            vm.pipelineList.splice(i + 1, 0, {
              name: c,
              hint: '',
              type: 'custom',
              higher: row.name,
              data: vm.pipelineDefForm.customStepPhaseDefs[c]
            })
          })
        }
      })
      console.log(vm.pipelineList)
    },
    historyClose() {
      const vm = this
      vm.historyDialog = false
      vm.dates = []
      vm.contentForm.commitHash = ''
      vm.original = ''
      vm.modified = ''
      vm.$refs.monacoDiff.originalModel.setValue('')
      vm.$refs.monacoDiff.modifiedModel.setValue('')
    },
    getHistory() {
      const vm = this
      var dates = vm.dates.sort()
      vm.historyForm.createTimeRage.startDate = dates[0]
      vm.historyForm.createTimeRage.endDate = dates[1]
      vm.menu2 = false
      request.post(`/cicd/projectDef/${vm.targetProjectName}/history`, vm.historyForm).then(response => {
        vm.commitHashList = response.data.logs
        if(vm.commitHashList.length > 0){
          vm.getOriginal()
          vm.getModified()
        }else{
          vm.original = ''
          vm.modified = ''
          vm.$refs.monacoDiff.originalModel.setValue('')
          vm.$refs.monacoDiff.modifiedModel.setValue('')
        }
      }).catch(error => {
        vm.errorTip(true, error.response.data.msg);
      })
    },
    getOriginal() {
      const vm = this
      vm.contentForm.defName = vm.historyForm.defName
      vm.contentForm.branchName = vm.historyForm.branchName
      vm.contentForm.envName = vm.historyForm.envName
      vm.contentForm.customStepName = vm.historyForm.customStepName
      if(vm.commitHashList.length > 0){
        vm.contentForm.commitHash = vm.commitHashList[0].commitHash
        vm.commitHashList[0].disabled = true
      }
      vm.dialogLoading = true
      request.post(`/cicd/projectDef/${vm.targetProjectName}/content`, vm.contentForm).then(response => {
        vm.original = response.data.content
        vm.dialogLoading = false
        vm.$refs.monacoDiff.originalModel.setValue(vm.original)
      }).catch(error => {
        vm.errorTip(true, error.response.data.msg); 
      })
    },
    getModified() {
      const vm = this
      vm.contentForm.defName = vm.historyForm.defName
      vm.contentForm.branchName = vm.historyForm.branchName
      vm.contentForm.envName = vm.historyForm.envName
      vm.contentForm.customStepName = vm.historyForm.customStepName
      if(vm.commitHashList.length > 1){
        vm.contentForm.commitHash = vm.commitHashList[1].commitHash
      }
      vm.dialogLoading = true
      request.post(`/cicd/projectDef/${vm.targetProjectName}/content`, vm.contentForm).then(response => {
        vm.modified = response.data.content
        vm.dialogLoading = false
        vm.$refs.monacoDiff.modifiedModel.setValue(vm.modified)
      }).catch(error => {
        vm.errorTip(true, error.response.data.msg); 
      })
    },
    getHistoryContent() {
      const vm = this
      vm.contentForm.defName = vm.historyForm.defName
      vm.contentForm.branchName = vm.historyForm.branchName
      vm.contentForm.envName = vm.historyForm.envName
      vm.contentForm.customStepName = vm.historyForm.customStepName
      vm.dialogLoading = true
      request.post(`/cicd/projectDef/${vm.targetProjectName}/content`, vm.contentForm).then(response => {
        vm.modified = response.data.content
        vm.dialogLoading = false
        vm.$refs.monacoDiff.originalModel.setValue(vm.original)
        vm.$refs.monacoDiff.modifiedModel.setValue(vm.modified)
      }).catch(error => {
        vm.errorTip(true, error.response.data.msg); 
      })
    },
    clearDates() {
      this.dates = []
      this.menu2 = false
      this.getHistory()
    },
  },
  render (createElement, context) {
    const vm = this
    return <PageCard
      name='持续交付'
    >
      <DataTable
        loading={vm.pageData.loading}
        headers={[
          { value: 'data-table-expand' },
          {
            value: 'projectName',
            text: '项目名',
            sortable: false
          },
          { value: 'projectInfo.projectTeam', text: '项目团队', sortable: false },
          { value: 'projectRepo', text: '项目仓库', sortable: false },
          {
            value: 'nodePort',
            text: '可用NodePort',
            sortable: false
          },
          {
            value: 'env',
            text: '可用环境信息',
            sortable: false
          },
          {
            value: 'handle',
            text: '操作',
            sortable: false
          }
        ]}
        items={vm.pageData.displayRows}
        itemKey='projectInfo.projectName'
        footerProps={{
          showCurrentPage: true
        }}
        scopedSlots={{
          /* 'footer.page-text': (config) => {
            return <VPagination
              value={1}
              length={6}
            />
          }, */
          'item.projectName': (config) => {
            return <router-link to={{ name: 'CicdProject', params: { projectName: config.item.projectInfo.projectName } }}>
              <div>{config.item.projectInfo.projectName}</div>
              <div>{config.item.projectInfo.projectDesc}</div>
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
          'item.nodePort': (config) => {
            return <div>
              {
                config.item.projectNodePorts.map(item => {
                  return <div class="my-1"><v-chip color="primary" small>{item.nodePortStart}-{item.nodePortEnd}</v-chip></div>
                })
              }
            </div>
          },
          'item.env': (config) => {
            return <div>
              {
                config.item.projectAvailableEnvs.map(item => {
                  return <div class="my-1"><v-chip color="primary" small>{item.envName}</v-chip></div>
                })
              }
            </div>
          },'item.handle': (config) => {
            return <div>
              <v-btn small color="primary" vOn:click={() => {
                vm.$router.push({
                  name: 'CicdProjectDef',
                  params: {
                    projectName: config.item.projectInfo.projectName
                  }
                })
              }}>项目定义</v-btn> 
            </div>
          },
          'expanded-item': (config) => {
            return <td colspan={config.headers.length} class="pa-1">
              <InfoCard>
                <ModuleInfos
                  modules={config.item.modules}
                  projectName={config.item.projectInfo.projectName}
                />
              </InfoCard>
              <InfoCard
                props={ config.item.pipelinesInfoCard }
              />
            </td>
          }
        }}
        showExpand
        expanded={vm.pageData.expanded}
        serverItemsLength={vm.pageData.total}
        options={{
          page: vm.pageData.currentPage,
          itemsPerPage: vm.pageData.pageSize
        }}
        on={{
          'update:expanded': (value) => {
            vm.pageData.expanded = value
          },
          'update:options': (value) => {
            vm.pageData.currentPage = value.page
            vm.pageData.pageSize = value.itemsPerPage
            vm.$observables.queryPage$.next('dataOptionChange')
          }
        }}
      >
        <SearchForm
          slot="top"
          formEls={[
            <VSelect
              v-model={vm.searchForm.projectNames}
              items={vm.projectNames}
              menu-props="{ maxHeight: '400' }"
              label="项目名称"
              multiple
              dense
              small-chips
              clearable
              vOn:change={(value) => {
                vm.pageData.currentPage = 1
                vm.$observables.queryPage$.next('projectNamesChange')
                // vm.$observables.projectNamesChange$.next('')
              }}
              vOn:blur={(value) => {
                // vm.pageData.currentPage = 1
                // vm.$observables.queryPage$.next('projectNamesChange')
                // vm.$observables.projectNamesBlur$.next('')
              }}
              on={{
                'click:clear': (value) => {}
              }}
            >
              {/* <v-text-field slot="prepend-item" placeholder="查询" /> */}
            </VSelect>,
            <VTextField
              label="项目团队"
              v-model={vm.searchForm.projectTeam}
              dense
              vOn:keyup_enter={(ev) => {
                vm.pageData.currentPage = 1
                vm.$observables.queryPage$.next('projectTeamEnterUp')
              }}
            />
          ]}
        />
      </DataTable>
      <VDialog
        v-model={vm.pipelineDefDialog}
        max-width="1200px"
        persistent
      >
        <v-card>
          <v-card-title>
            <span class="headline">设置流水线定义</span>
            <v-spacer></v-spacer>
            <v-tooltip bottom={true} scopedSlots={{ 
                activator:({on, attrs}) =>{
                  return <v-icon color="primary" class="mr-4"
                  {...{
                    props: attrs,
                    on: on,
                  }} 
                  vOn:click={() => {
                    vm.historyForm = {
                      defName: 'pipelineDef',
                      branchName: vm.targetBranchName,
                      envName: '',
                      customStepName: '',
                      createTimeRage: {
                        startDate: '',
                        endDate: ''
                      }
                    }
                    vm.dates = []
                    vm.getHistory()
                    vm.historyDialog = true
                  }}>
                    mdi-history
                  </v-icon>
                } 
              }}>
              <span>历史版本</span>
            </v-tooltip>
            <v-tooltip bottom={true} scopedSlots={{ 
                activator:({on, attrs}) =>{
                  return <v-icon color="primary"
                  {...{
                    props: attrs,
                    on: on,
                  }} 
                  vOn:click={() => {
                    let copyData = JSON.parse(JSON.stringify(vm.pipelineDefForm))
                    // if(copyData.customStepPhaseDefs !== null){
                    //   let PhaseDefObj = {}
                    //   copyData.customStepPhaseDefs.map(item => {
                    //     PhaseDefObj[item[0]] = item[1]
                    //   })
                    //   copyData.customStepPhaseDefs = PhaseDefObj
                    // }
                    // if(copyData.customStepInsertDefs !== null) {
                    //   let InsertDefObj = {}
                    //   copyData.customStepInsertDefs.map(item => {
                    //     InsertDefObj[item[0]] = item[1]
                    //   })
                    //   copyData.customStepInsertDefs = InsertDefObj
                    // }
                    console.log(copyData)
                    vm.yamlText = YAML.stringify(copyData, 4)
                    vm.$refs.monaco.monacoEditor.setValue(vm.yamlText)
                    vm.YAMLDialog = true
                  }}>
                    mdi-cube-scan
                  </v-icon>
                } 
              }}>
              <span>查看YAML定义</span>
            </v-tooltip>
            <v-tooltip bottom={true} scopedSlots={{ 
                activator:({on, attrs}) =>{
                  return <v-icon color="primary" class="mx-4"
                  {...{
                    props: attrs,
                    on: on,
                  }} 
                  vOn:click={
                    () =>{
                      let copyData = JSON.parse(JSON.stringify(vm.pipelineDefForm))
                      // copyData.customStepPhaseDefs.map(item => {
                      // })
                      // let PhaseDefObj = {}
                      // copyData.customStepPhaseDefs.map(item => {
                      //   PhaseDefObj[item[0]] = item[1]
                      // })
                      // copyData.customStepPhaseDefs = PhaseDefObj
                      // let InsertDefObj = {}
                      // copyData.customStepInsertDefs.map(item => {
                      //   InsertDefObj[item[0]] = item[1]
                      // })
                      // copyData.customStepInsertDefs = InsertDefObj
                      var YAMLstring = YAML.stringify(copyData, 4);
                      request.post(`/cicd/projectDef/${vm.targetProjectName}/pipelineDef`, {
                        pipelineDefYaml: YAMLstring,
                        branchName: vm.targetBranchName
                      }).then(response => {
                        vm.successTip(true, response.msg)
                        vm.pipelineDefDialog = false
                        vm.$observables.queryPage$.next('refreshList')
                      }).catch(error => {
                        vm.errorTip(true,error.response.data.msg)
                      })
                    }
                  }>
                    mdi-progress-upload
                  </v-icon>
                } 
              }}>
              <span>提交更新</span>
            </v-tooltip>
            <v-icon vOn:click={
              () =>{
                vm.pipelineDefDialog = false
              }
            }>
              mdi-close
            </v-icon>
          </v-card-title>
          <v-card-text>
            <v-alert
              prominent
              type="error"
              vShow={vm.errMsgPipelineDef}
            >
              {vm.errMsgPipelineDef}
            </v-alert>
            <v-form ref="pipelineDefRef">
              <v-container>
                <div class="pipeline-switch">
                  <small>是否开启构建模块自动检测（isAutoDetectBuild）</small>
                  <v-switch
                    v-model={vm.pipelineDefForm.isAutoDetectBuild}
                    dense
                    inset
                    hint="假如开启，cicd流水线将会根据代码提交内容自动检测对应构建模块的代码路径中是否有代码文件发生变更，自动设置本次流水线开启哪些构建模块"
                    persistent-hint
                  ></v-switch>
                  <div class="mb-4">
                    <small>如果本设置开启，那么cicd流水线自动忽略以下builds(构建模块开关设置)的设置</small>
                  </div>
                  <small>是否串行执行（isQueue）</small>
                  <v-switch
                    v-model={vm.pipelineDefForm.isQueue}
                    dense
                    inset
                    hint="假如开启，同时只能执行一条流水线，其他流水线将会以队列的形式等待执行"
                    persistent-hint
                  ></v-switch>
                </div> 
                <div class="pipelineBuilds">
                  <small>构建模块开关设置（builds）*</small>
                  <div class="my-2">
                    {
                      vm.pipelineDefForm.isAutoDetectBuild ? vm.pipelineDefForm.builds.map(item => {
                        return <v-chip class={item.run ? 'mr-2 mb-2 white--text': 'mr-2 mb-2'} color={item.run ? 'orange': ''} vOn:click={
                          () => {
                            vm.warnTip(true, '是否开启构建模块自动检测（isAutoDetectBuild）开启状态下不能设置')
                          }
                        }>{item.name}</v-chip>
                      }) : vm.pipelineDefForm.builds.map(item => {
                        return <v-chip class="mr-2 mb-2" color={item.run ? 'success': ''} vOn:click={
                          () => {
                            item.run = !item.run
                          }
                        }>{item.name}</v-chip>
                      })
                    }
                  </div>
                  <small>点击模块chip表示开启或者关闭</small>
                </div>
                <small class="mt-4">流水线步骤开关设置（pipelineStep）*</small>
                {
                  vm.stepInformation ? <v-card><v-simple-table dense>
                    <template slot='default'>
                      <thead>
                        <tr>
                          <th class="text-left">步骤标题</th>
                          <th class="text-left" vShow={vm.stepInformation.enable !== undefined}>
                            是否启用(enable)
                          </th>
                          <th class="text-left" vShow={vm.stepInformation.ignoreError !== undefined}>
                            异常是否继续执行(ignoreError)
                          </th>
                          <th class="text-left" vShow={vm.stepInformation.timeout !== undefined}>
                            超时设置(timeout)
                          </th>
                          <th class="text-left" vShow={vm.stepInformation.retry !== undefined}>
                            重试设置(retry)
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>{vm.textName}</td>
                          <td vShow={vm.stepInformation.enable !== undefined}>
                            <span>
                              <v-switch
                                v-model={vm.stepInformation.enable}
                                dense
                                inset
                                small
                                persistent-hint
                                // vOn:change={() => {
                                //   console.log(123)
                                // }}
                              ></v-switch>
                            </span>
                          </td>
                          <td vShow={vm.stepInformation.ignoreError !== undefined}>
                            <span>
                              <v-switch
                                v-model={vm.stepInformation.ignoreError}
                                dense
                                inset
                                small
                                persistent-hint
                                // vOn:change={() => {
                                //   console.log(123)
                                // }}
                              ></v-switch>
                            </span>
                          </td>
                          <td vShow={vm.stepInformation.timeout !== undefined}>
                            <v-text-field
                              dense
                              persistent-hint
                              hint="0表示不限时，单位:秒"
                              type="number"
                              vOn:blur={
                                () => {
                                  if (vm.stepInformation.timeout.length <= 0) {
                                    vm.stepInformation.timeout = 0
                                  } else {
                                    vm.stepInformation.timeout = Number(vm.stepInformation.timeout)
                                  }
                                }
                              }
                              v-model={vm.stepInformation.timeout}
                            />
                          </td>
                          <td vShow={vm.stepInformation.retry !== undefined}>
                            <v-text-field
                              dense
                              persistent-hint
                              hint="执行异常的情况下重试次数"
                              type="number"
                              vOn:blur={
                                () => {
                                  if (vm.stepInformation.retry.length <= 0) {
                                    vm.stepInformation.retry = 0
                                  } else {
                                    vm.stepInformation.retry = Number(vm.stepInformation.retry)
                                  }
                                }
                              }
                              v-model={vm.stepInformation.retry}
                            />
                          </td>
                        </tr>
                      </tbody>
                    </template>
                  </v-simple-table></v-card> : <div></div>
                }
                <div class="pipeline-wrap">
                  {
                    // vm.pipelineList.length > 0 ? <vue-pipeline
                    //   ref="pipeline"
                    //   x={50}
                    //   y={55}
                    //   data={vm.pipelineList}
                    //   showArrow={false}
                    //   ystep={70}
                    //   xstep={160}
                    //   lineStyle={'default'}
                    //   vOn:node-click={(node, index) => {
                    //     console.log(node.type, index)
                    //   }}
                    // /> : <div></div>
                    vm.pipelineList.length > 0 ? <v-breadcrumbs scopedSlots={{ 
                      'item':({item}) =>{
                        var name = item.name
                        return <div class={vm.textName === item.name ? 'step-item avtive' : 'step-item'}>
                          {
                            item.type === 'original' ? <div class={item.data !== null && item.data.enable === false ? 'step-icon original-icon off' : 'step-icon original-icon'} vOn:click_stop={
                              item.isPush ? () => {
                                vm.targetName = name
                                vm.customList = vm.cicdCustomStepInserts[vm.targetName]
                                vm.customDialog = true
                                vm.customSteps = vm.pipelineDefForm.customStepInsertDefs[vm.targetName]
                              } : () => {}
                            }>
                              {item.isPush ? '+' : ''}
                            </div> : <div class={item.data.enable === false ? 'step-icon custom-icon off' : 'step-icon custom-icon'} vOn:click_stop={() => {
                              console.log(item)
                              vm.pipelineDefForm.customStepInsertDefs[item.higher].forEach((row, i) => {
                                if (row === item.name) {
                                  vm.pipelineDefForm.customStepInsertDefs[item.higher].splice(i, 1)
                                }
                              })
                              if (vm.pipelineDefForm.customStepInsertDefs[item.higher].length <= 0) {
                                delete vm.pipelineDefForm.customStepInsertDefs[item.higher]
                              }
                              vm.organizeData()
                              console.log(vm.pipelineDefForm)
                            }}>
                            -
                            </div>
                          }
                          <v-chip vOn:click={
                            () =>{
                              vm.stepInformation = item.data
                              vm.textName = item.name
                            }
                          }>
                            <div class="text-center">
                              <span>{item.name}</span>
                              <br /> 
                              <small style="height: 22px;">{item.hint}</small>
                            </div> 
                          </v-chip>
                        </div>
                      }
                    }} items={vm.pipelineList}>
                    <template slot='divider'>
                      <v-icon>mdi-forward</v-icon>
                    </template>
                    </v-breadcrumbs> : <div></div>
                  }
                </div>
              </v-container>
            </v-form>
          </v-card-text>
        </v-card>
      </VDialog>
      <VDialog
        v-model={vm.customDialog}
        max-width="600px"
        persistent
      >
        <v-card>
          <v-card-title>
            <span class="headline">请选择插入的自定义步骤</span>
          </v-card-title>
          <v-card-text>
            <v-select
              items={vm.customList}
              label="插入的步骤名称"
              dense
              multiple
              small-chips
              v-model={vm.customSteps}
            />
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="blue darken-1"
              text
              vOn:click={
                () =>{
                  vm.pipelineDefForm.customStepInsertDefs[vm.targetName] = vm.customSteps
                  vm.customDialog = false
                  if (vm.pipelineDefForm.customStepInsertDefs[vm.targetName] === undefined || vm.pipelineDefForm.customStepInsertDefs[vm.targetName].length <= 0) {
                    delete vm.pipelineDefForm.customStepInsertDefs[vm.targetName]
                  }
                  vm.organizeData()
                  console.log(vm.pipelineDefForm)
                }
              }
            >
              确认
            </v-btn>
          </v-card-actions>
        </v-card>
      </VDialog>
      <VDialog
        v-model={vm.YAMLDialog}
        max-width="1200px"
        persistent
        eager
      >
        <v-card>
          <v-card-title>
            <span class="headline">YAML定义</span>
          </v-card-title>
          <v-card-text>
            <Monaco
              ref="monaco"
              monacoOptions={{
                value: '',
                automaticLayout:true,
                readOnly: true, // 是否只读
                theme: "vs-dark", // 编辑器主题
                language: "yaml"
              }}
              height={500}
            ></Monaco>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="blue darken-1"
              text
              vOn:click={
                () =>{
                  vm.YAMLDialog = false
                  vm.$refs.monaco.monacoEditor.setValue('')
                }
              }
            >
              确认
            </v-btn>
          </v-card-actions>
        </v-card>
      </VDialog>
      <VDialog
        v-model={vm.historyDialog}
        max-width="1200px"
        persistent
      >
        <VCard loading={vm.dialogLoading}>
          <VCardTitle>
            <span class="headline">历史版本</span>
            <VSpacer></VSpacer>
            <VTooltip bottom={true} scopedSlots={{ 
                activator:({on, attrs}) =>{
                  return <VIcon color="primary"
                  {...{
                    props: attrs,
                    on: on,
                  }} 
                  vOn:click={() => {
                    request.post(`/cicd/projectDef/${vm.targetProjectName}/pipelineDef`,{
                      pipelineDefYaml: vm.modified,
                      branchName: vm.targetBranchName
                    }).then(response => {
                      vm.historyDialog = false
                      vm.pipelineDefDialog = false
                      vm.successTip(true, response.msg);
                      vm.$observables.queryPage$.next('refreshList')
                    }).catch(error => {
                      vm.errorTip(true, error.response.data.msg);
                    })
                  }}>
                    mdi-progress-upload
                  </VIcon>
                } 
              }}>
              <span>应用旧版本</span>
            </VTooltip>
            <VIcon class="ml-4" 
              vOn:click={
                () =>{
                  vm.historyClose()
                }
              }>
              mdi-close
            </VIcon>
          </VCardTitle>
          <VCardText>
            <VForm class="d-flex" ref="historyRef">
              <div class="v-input">
                <VMenu
                  v-model={vm.menu2}
                  close-on-content-click={false}
                  nudge-right="40"
                  // transition="scale-transition"
                  offset-y
                  min-width="auto"
                  scopedSlots={{ 
                    activator:({on, attrs}) =>{
                      return <VTextField
                        v-model={vm.dateRangeText}
                        label="时间"
                        prepend-icon="mdi-calendar"
                        readonly
                        dense
                        class="mr-8"
                        {...{
                          props: attrs,
                          on: on,
                        }} 
                      ></VTextField>
                    } 
                  }}>
                  <VDatePicker
                    v-model={vm.dates}
                    range
                    no-title
                    vOn:change={
                      () => {
                        vm.getHistory()
                      }
                    }
                  >
                    <VSpacer></VSpacer>
                    <VBtn
                      text
                      color="primary"
                      small
                      vOn:click={
                        () => {
                          vm.clearDates()
                        }
                      }
                    >
                      清空
                    </VBtn>
                  </VDatePicker>
                </VMenu>
              </div>
              <VSelect
                items={vm.commitHashList}
                label="历史版本"
                class="mr-8"
                dense
                item-text="message"
                item-value="commitHash"
                item-disabled="disabled"
                v-model={vm.contentForm.commitHash}
                vOn:change={
                  () => {
                    vm.getHistoryContent()
                  }
                }
              ></VSelect>
            </VForm>
            <MonacoDiff
              ref="monacoDiff"
              monacoOptions={vm.monacoOptions}
              original={vm.original}
              modified={vm.modified}
              height={500}
            ></MonacoDiff>
          </VCardText>
        </VCard>
      </VDialog>
    </PageCard>
  }
}
</script>

<style scoped>
.pipeline-wrap .v-chip.v-size--default {
  height: 42px;
  margin-top: 8px;
}
.pipeline-switch .v-input--selection-controls {
  margin-top: 0px;
}
.pipeline-wrap {
  overflow-y: auto;
}
.pipeline-wrap .v-breadcrumbs{
  flex-wrap: nowrap;
  padding: 18px 0;
}
.step-item {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
}
.step-item.avtive {
  background-color: #D1D1D1;
}
.step-icon {
  width: 24px;
  height: 24px;
  font-size: 18px;
  font-weight: 700;
  text-align: center;
  line-height: 24px;
  border-radius: 50%;
  cursor: pointer;
  color: #fff;
  user-select: none;
}
.step-icon.off {
  background-color: #607D8B;
}
.original-icon {
  background-color: #2196F3;
}
.custom-icon {
  background-color: #4CAF50;
}
.pipeline-wrap .v-stepper__header .v-stepper__step {
  flex-shrink: 0;
  justify-content: center;
}
.steps-switch {
  width: 50%;
}
.yaml-btn {
  background-color: #fff !important;
  box-shadow: none !important;
}
.yaml-btn:hover::before {
  opacity: 0 !important;
}
.form-item-15 {
  width: 15%;
}
.form-item-20 {
  width: 20%;
}
.form-item {
  width: 30%;
}
.form-item-40 {
  width: 40%;
}
.form-item-45 {
  width: 45%;
}
.form-item-50 {
  width: 50%;
}
.form-item-60 {
  width: 60%;
}
.form-item-70 {
  width: 70%;
}
.form-item-100 {
  width: 100%;
}
.yaml-btn {
  background-color: #fff !important;
  box-shadow: none !important;
}
.yaml-btn:hover::before {
  opacity: 0 !important;
}
.pr-20 {
  padding-right: 80px;
}
.tip-color {
  color: rgba(0, 0, 0, 0.6);
}
.error-text {
  font-size: 16px;
  font-weight: 400;
  color: #ff5252;
}
.params-item {
  padding: 8px;
  border: 1px solid #d2c7c7;
  border-radius: 5px;
  margin-bottom: 16px;
}
</style>
