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
  inject: ['successTip', 'errorTip', 'warnTip'],
  name: 'Projects',
  components: { InfoSingleTable, InfoCard, ChipPairs, AssemblyLine, Operations },
  data () {
    return {
      pageData: {
        totalCount: 0,
        rows: [],
        displayRows: []
      },
      projectsForm: {
        projectNames: [],
        projectTeam: '',
        page: 1,
        perPage: 10
      },
      tableLoading: true,
      projectList: [],
    }
  },
  created () {
    const vm = this
    request.get('/console/projectNames').then(response => {
      vm.projectList = response.data.projectNames
    }).catch(error => {
      vm.errorTip(true, error.response.data.msg)
    })
    request.post('/console/projects', vm.projectsForm).then(response => {
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
      vm.tableLoading = false
      vm.errorTip(true, error.response.data.msg)
    })
  },
  methods: {
    getProjects() {
      const vm = this
      vm.tableLoading = true
      request.post('console/projects', vm.projectsForm).then(response => {
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
        vm.successTip(true, response.msg)
      }).catch(error => {
        vm.errorTip(true, error.response.data.msg)
      })
    },
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
    updateOptions() {
      const vm = this
      vm.tableLoading = true
      request.post('console/projects', vm.projectsForm).then(response => {
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
        vm.tableLoading = false
        vm.errorTip(true, error.response.data.msg)
      })
    },
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
            return <router-link to={{name: 'ConsoleProject', params: { projectName: item.projectInfo.projectName }}}>
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
                  return <div class="my-1"><v-chip color="primary" small>{i.nodePortStart}-{i.nodePortEnd}</v-chip></div>
                })
              }
            </div>
          },
          'item.env': ({item}) => {
            return <div>
              {
                item.projectAvailableEnvs.map(i => {
                  return <div class="my-1"><v-chip color="primary" small>{i.envName}</v-chip></div>
                })
              }
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
                <VCol cols="4">
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
                <VCol cols="3">
                  <VTextField
                    label="项目团队"
                    dense
                    v-model={vm.projectsForm.projectTeam}
                    vOn:keydown_enter={() => {
                      vm.getProjects()
                    }}
                  />
                </VCol>
              </VRow>
            </VContainer>
          </VForm>
        </template>
      </VDataTable>
    </VCard>
  }
}
</script>

<style scoped>

</style>
