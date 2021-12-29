<template>
  <PageCard name="审计日志">
    <v-card>
      <v-card-title>
        <v-form style="width: 100%">
          <v-container class="d-flex flex-wrap" fluid>
            <v-row>
              <v-col cols="3">
                <v-autocomplete
                  :items="typesResponse.data.opTypes"
                  label="审计日志类型"
                  dense
                  small-chips
                  multiple
                  clearable
                  v-model="pageRequest.opTypes"
                  @change="$observables.queryPage$.next('opTypesChange')"
                ></v-autocomplete>
              </v-col>
              <v-col>
                <v-select
                  :items="projectNamesResponse.data.projectNames"
                  label="项目名称"
                  dense
                  small-chips
                  multiple
                  clearable
                  v-model="pageRequest.projectNames"
                  @change="$observables.queryPage$.next('projectNamesChange')"
                ></v-select>
              </v-col>
              <v-col cols="3">
                <v-select
                  :items="[ 'SUCCESS', 'FAIL' ]"
                  label="执行结果"
                  dense
                  small-chips
                  multiple
                  clearable
                  v-model="pageRequest.statusResults"
                  @change="$observables.queryPage$.next('statusResultsChange')"
                ></v-select>
              </v-col>
              <v-col cols="3">
                <v-select
                  :items="[ 'yes', 'no' ]"
                  label="是否包含管理日志"
                  dense
                  clearable
                  v-model="pageRequest.withAdminLog"
                  @change="$observables.queryPage$.next('withAdminLogChange')"
                ></v-select>
              </v-col>
              <v-col cols="3">
                <v-select
                  :items="[ 'yes', 'no' ]"
                  label="是否申请工单"
                  dense
                  clearable
                  v-model="pageRequest.withApplyTicket"
                  @change="$observables.queryPage$.next('withApplyTicketChange')"
                ></v-select>
              </v-col>
              <v-col cols="3">
                <v-text-field
                  label="申请单号"
                  dense
                  v-model="pageRequest.applyTicket"
                  @keyup.enter="$observables.queryPage$.next('applyTicketChange')"
                />
              </v-col>
              <v-col cols="3">
                <v-text-field
                  label="操作用户名"
                  dense
                  v-model="pageRequest.username"
                  @keyup.enter="$observables.queryPage$.next('userNameChange')"
                />
              </v-col>
              <v-col cols="3">
                <template>
                  <v-menu
                    v-model="menu2"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field
                        v-model="dateRangeText"
                        label="提交时间"
                        prepend-icon="mdi-calendar"
                        readonly
                        dense
                        class="mr-8"
                        v-bind="attrs"
                        v-on="on"
                      ></v-text-field>
                    </template>
                    <v-date-picker
                      v-model="dates"
                      range
                      no-title
                      @change="() => {
                        menu2 = false
                        $observables.queryPage$.next('submitDateChange')
                      }"
                    >
                      <v-spacer></v-spacer>
                      <v-btn
                        text
                        color="primary"
                        small
                        @click="clearDates()"
                      >
                        清空
                      </v-btn>
                    </v-date-picker>
                  </v-menu>
                </template>
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </v-card-title>
      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="pageResponse.data.auditLogs"
          :server-items-length="pageResponse.data.totalCount"
          class="elevation-1"
          dense
          item-key="auditLogID"
          show-expand
          :options="{
            page: pageRequest.page,
            itemsPerPage: pageRequest.perPage
          }"
          :loading="pageLoading"
          @update:options="(value) => {
            $observables.pageOptionChange$.next(value)
          }"
        >
          <template v-slot:item.params="{ item }">
            <template v-if="rtnParamsMaxLength(item.params) < 50">
              <div class="my-1" v-for="(entry, i) in Object.entries(item.params)" :key="i">
                {{ entry[0] }}: {{ entry[1] }}
              </div>
            </template>
            <v-btn v-else color="primary" small @click="() => {
              paramsDetailObj = item.params
              paramsDetailDialog = true
            }">
              点击查看详情
            </v-btn>
          </template>
          <template v-slot:item.duration="{ item }">
            <div class="my-1">{{ item.duration }}</div>
            <v-chip v-if="item.status == 'FAIL'" small class="mb-1 white--text" color="red">
              {{ item.status }}
            </v-chip>
            <v-chip v-else-if="item.status == 'SUCCESS'" small class="mb-1 white--text" color="green">
              {{ item.status }}
            </v-chip>
            <v-chip v-else-if="item.status == 'INPUT'" small class="mb-1 white--text" color="orange">
              {{ item.status }}
            </v-chip>
            <v-chip v-else-if="item.status == 'RUNNING'" small class="mb-1 white--text" color="blue">
              {{ item.status }}
            </v-chip>
            <v-chip v-else-if="item.status == 'ABORT'" small class="mb-1 white--text" color="grey">
              {{ item.status }}
            </v-chip>
          </template>
          <template v-slot:expanded-item="{ item, headers }">
            <td :colspan="headers.length + 1" class="pa-1">
              <v-card class="rounded-0">
                <v-card-text v-if="rtnParamsInfos(item.params).length > 0">
                  <div>提交参数</div>
                  <info-single-table
                    :infos="rtnParamsInfos(item.params)"
                  />
                </v-card-text>
                <v-card-text>
                  <div>更多信息</div>
                  <v-simple-table>
                    <template v-slot:default>
                      <thead>
                        <tr>
<!--                          <th class="text-left">
                            提交参数
                          </th>-->
                          <th class="text-left">
                            返回信息
                          </th>
                          <th class="text-left">
                            详细执行日志
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
<!--                          <td>
                            <div v-if="rtnParamsMaxLength(item.params) < 50">
                              <div class="my-1" v-for="(entry, i) in Object.entries(item.params)" :key="i">
                                {{ entry[0] }}: {{ entry[1] }}
                              </div>
                            </div>
                            <v-btn v-else color="primary" small @click="() => {
                                paramsDetailObj = item.params
                                paramsDetailDialog = true
                              }"
                            >
                              点击查看详情
                            </v-btn>
                          </td>-->
                          <td>{{ item.msg }}</td>
                          <td>
                            <v-btn
                              v-if="item.withAdminLog"
                              class="my-1"
                              color="primary"
                              small
                              @click="() => {
                                $observables.viewDetailLogClick$.next(item.auditLogID)
                              }"
                            >
                              点击查看详细日志
                            </v-btn>
                            <span v-else>无详细日志</span>
                          </td>
                        </tr>
                      </tbody>
                    </template>
                  </v-simple-table>
                </v-card-text>
              </v-card>
            </td>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <v-dialog
      v-model="detailLogDialog"
      width="800"
    >
      <v-card>
        <v-card-title>
          <span class="headline">查看详情</span>
        </v-card-title>
        <v-card-text id='log-container' style="overflow-x: scroll; background: #151515; color: #e0e0e0; position: relative; height: 300px;">
            <pre
              v-for="(logMsg, i) in detailLogItems"
              :key="i"
              :id="'log' + i"
              :style="logMsg.logType | changeColor"
            >[{{ logMsg.logType }}] {{ logMsg.endTime }}  {{ logMsg.content }}</pre>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            text
            @click="() => {
                detailLogDialog = false
              }"
          >
            确认
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="paramsDetailDialog"
      width="800"
    >
      <info-card
        title='详细信息'
      >
        <template v-for="(entry, i) in Object.entries(paramsDetailObj)" >
          <div class="my-1" :key="i">
            {{ entry[0] }}: <pre style="overflow-x: auto">{{ entry[1] }}</pre>
          </div>
          <v-divider :key="i + 'br'"/>
        </template>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            text
            @click="paramsDetailDialog = false"
          >
            关闭
          </v-btn>
        </v-card-actions>
      </info-card>
    </v-dialog>
  </PageCard>
</template>

<script>
import PageCard from '@/lib/ui-lib/page-templates/PageCard'
import Operations from '@/lib/ui-lib/components/Operations'
import AUDIT_API from '@/api/admin/audit'
import { defer, forkJoin, of, Subject, combineLatest } from 'rxjs'
import { catchError, mergeMap, filter, skip, tap, switchMap, finalize, scan, pluck, map, delayWhen, withLatestFrom } from 'rxjs/operators'
import { rtnRetryWhenOperator } from '@/utils/request'
import { webSocket } from 'rxjs/webSocket'
import User from '@/services/user'
import InfoCard from '@/lib/ui-lib/components/InfoCard'
import InfoSingleTable from '@/lib/ui-lib/components/InfoSingleTable'
export default {
  name: 'AuditLogs',
  components: {
    InfoSingleTable,
    InfoCard,
    PageCard,
    Operations
  },
  inject: ['successTip', 'errorTip', 'warnTip'],
  subscriptions () {
    // const vm = this
    return {
      queryPage$: new Subject(),
      queryTypes$: new Subject(),
      pageOptionChange$: new Subject(),
      viewDetailLogClick$: new Subject(),
      queryProjectNames$: new Subject()
    }
  },
  data () {
    return {
      pageRequest: {
        username: '',
        projectNames: [],
        opTypes: [],
        withAdminLog: '',
        withApplyTicket: '',
        statusResults: [],
        startTimeRage: {
          startDate: '',
          endDate: ''
        },
        page: 1,
        perPage: 10
      },
      pageResponse: {
        data: {
          auditLogs: [],
          totalCount: 0
        }
      },
      pageLoading: false,
      typesResponse: {
        data: {
          opTypes: []
        }
      },
      projectNamesResponse: {
        data: {
          projectNames: []
        }
      },
      detailLogDialog: false,
      detailLogItems: [],
      dates: [],
      menu2: false,
      headers: [
        { text: '审计日志类型', value: 'opType', sortable: false },
        { text: '项目名', value: 'projectName', sortable: false },
        { text: '申请工单', value: 'applyTicket', sortable: false },
        { text: '操作用户名', value: 'username', sortable: false },
        // { text: '提交参数', value: 'params', sortable: false },
        { text: '时间', value: 'startTime', sortable: false },
        { text: '执行结果', value: 'duration', sortable: false }
      ],
      paramsDetailDialog: false,
      paramsDetailObj: {}
    }
  },
  methods: {
    clearDates () {
      this.dates = []
      this.menu2 = false
      this.$observables.queryPage$.next('clearDates')
    },
    rtnParamsMaxLength (params) {
      return Object.entries(params).reduce((acc, [key, value]) => {
        if (typeof value === 'string') {
          acc = Math.max(value.length, acc)
        } else {
          acc = Math.max(JSON.stringify(value).length, acc)
        }
        return acc
      }, 0)
    },
    rtnParamsInfos (params) {
      const vm = this
      return Object.entries(params).map(([key, value]) => {
        const valueStr = (typeof value === 'string' ? value : JSON.stringify(value, null, 2))
        return {
          key,
          value: valueStr.length > 50 ? <v-btn color="primary" small vOn:click={() => {
            vm.paramsDetailObj = { [key]: value }
            vm.paramsDetailDialog = true
          }}
          >
            点击查看详情
          </v-btn> : <pre>{valueStr}</pre>,
          name: key
        }
      })
    }
  },
  created () {
    const vm = this
    vm.$observables.queryProjectNames$.pipe(
      mergeMap(next => {
        return defer(() => {
          return AUDIT_API.getProjectNames()
        }).pipe(
          rtnRetryWhenOperator(),
          catchError(next => {
            return null
          })
        )
      })
    ).subscribe(next => {
      vm.projectNamesResponse = next
    })
    vm.$observables.queryPage$.pipe(
      tap(next => {
        vm.pageLoading = true
      }),
      mergeMap(next => {
        const dates = [...vm.dates].sort()
        vm.pageRequest.startTimeRage.startDate = dates[0]
        vm.pageRequest.startTimeRage.endDate = dates[1]
        return defer(() => {
          return AUDIT_API.getAuditLogs(vm.pageRequest)
        }).pipe(
          rtnRetryWhenOperator(),
          catchError(next => {
            vm.pageLoading = false
            return null
          })
        )
      }),
      filter(next => next),
      withLatestFrom(of(vm.$observables.queryPage$))
    ).subscribe(([next, queryDate]) => {
      vm.pageLoading = false
      next.data.auditLogs.forEach((row, index) => {
        if (row.withAdminLog) {
          // console.log(row, index)
        }
      })
      vm.pageResponse = next
      if (queryDate !== 'init') {
        vm.successTip(true, next.msg)
      }
    })
    vm.$observables.queryTypes$.pipe(
      mergeMap(next => {
        return defer(() => {
          return AUDIT_API.getAuditLogTypes()
        }).pipe(
          rtnRetryWhenOperator(),
          catchError(next => {
            return null
          })
        )
      }),
      filter(next => next)
    ).subscribe(next => {
      vm.typesResponse = next
    })
    vm.$observables.pageOptionChange$.pipe(
      skip(1)
    ).subscribe(next => {
      vm.pageRequest.perPage = next.itemsPerPage
      vm.pageRequest.page = next.page
      vm.$observables.queryPage$.next('optionChange')
    })
    vm.$observables.viewDetailLogClick$.pipe(
      tap(next => {
        vm.detailLogDialog = true
      }),
      switchMap(next => {
        return webSocket(`${vm.GLOBAL}/ws/log/audit/admin/${next}?x-user-token=${User.getInstance().state.userObj.userToken}`).pipe(
          catchError(error => {
            console.log(error)
            return of(null)
          }),
          finalize(() => {
            console.log('final')
          }),
          filter(next => next),
          scan((acc, next) => {
            acc.push(next)
            return acc
          }, []),
          tap(next => {
            vm.detailLogItems = next
          })
        )
      }),
      switchMap(next => {
        return vm.$watchAsObservable('detailLogDialog').pipe(
          pluck('newValue'),
          filter(next => next === false)
        )
      })
    ).subscribe(next => {
      console.log(next)
      vm.detailLogItems = []
    })
    vm.$observables.queryTypes$.next('init')
    vm.$observables.queryPage$.next('init')
    vm.$observables.queryProjectNames$.next('init')
  },
  computed: {
    dateRangeText () {
      return this.dates.join(' ~ ')
    }
  },
  filters: {
    changeColor: function (value) {
      if (value == 'FAIL') {
        return { color: 'red' }
      } else if (value == 'INFO') {
        return { color: 'green' }
      } else {
        return null
      }
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
