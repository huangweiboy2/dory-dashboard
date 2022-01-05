<template>
  <div class="project pa-4">
    <PageCard name="项目查看">
      <v-card class="mb-4" :loading="cardLoading">
        <v-card-title>
          项目基础信息
        </v-card-title>
        <v-card-text>
          <v-simple-table dense v-if="project">
            <template v-slot:default>
              <thead>
                <tr>
                  <th class="text-left">
                    项目名称
                  </th>
                  <th class="text-left">
                    项目团队
                  </th>
                  <th class="text-left">
                    项目仓库
                  </th>
                  <th class="text-left">
                    可用NodePort
                  </th>
                  <th class="text-left">
                    可用环境信息
                  </th>
                  <th class="text-left">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <template>
                      <span>{{ project.projectInfo.projectName }}</span><span>（{{ project.projectInfo.projectShortName }}）</span>
                      <div>{{ project.projectInfo.projectDesc }}</div>
                    </template>
                  </td>
                  <td>{{ project.projectInfo.projectTeam }}</td>
                  <td>
                    <div class="repo-wrap">
                      <div class="mb-1">
                        <a target="_Blank" :href="project.projectRepo.gitRepo">
                          <v-chip small color="success">代码仓库</v-chip>
                        </a>
                      </div>
                      <div class="mb-1">
                        <a target="_Blank" :href="project.projectRepo.imageRepo">
                          <v-chip small color="success">镜像仓库</v-chip>
                        </a>
                      </div>
                      <div class="mb-1">
                        <a target="_Blank" :href="project.projectRepo.artifactRepo">
                          <v-chip small color="success">制品仓库</v-chip>
                        </a>
                      </div>
                    </div>
                  </td>
                  <td>
                    <template>
                      <div class="my-1" v-for="(item,index) in project.projectNodePorts" :key="index">
                        <v-chip :color="item.isDefault ? 'success' : 'primary'" small @click="item.isDefault ? '' : openRecycleNodeport(item.nodePortStart)">
                          {{ item.nodePortStart }}-{{ item.nodePortEnd }}
                        </v-chip>
                      </div>
                    </template>
                  </td>
                  <td>
                    <template>
                      <div class="my-1" v-for="(item,index) in project.projectAvailableEnvs" :key="index">
                        <v-chip color="primary" small @click="openRecycleEnv(item.envName)">{{ item.envName }}</v-chip>
                      </div>
                    </template>
                  </td>
                  <td>
                    <template>
                      <Operations
                        :operations="[
                          { text: '分配新NodePort', onClick: () => {newNodePortDialog = true} },
                          { text: '分配新环境', onClick: () => {newEnvDialog = true} },
                          { text: '修改项目', onClick: openModifyProject },
                          { text: '删除项目', onClick: () => {deleteProjectDialog = true} },
                          { text: '删除项目与环境', onClick: () => {deleteAllDialog = true} }
                        ]"
                      />
                    </template>
                  </td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </v-card-text>
        <v-card-title>
          项目密钥信息
        </v-card-title>
        <v-card-text>
          <v-simple-table dense v-if="project">
            <template v-slot:default>
              <thead>
                <tr>
                  <th class="text-left">
                    harbor密码
                  </th>
                  <th class="text-left">
                    nexus密码
                  </th>
                  <th class="text-left">
                    kubernetes环境秘钥
                  </th>
                  <th class="text-left">
                    更新时间
                  </th>
                  <th class="text-left">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    ***
                    <v-chip small color="primary" class="ml-1" v-clipboard:copy="project.projectSecret.harborPassword" v-clipboard:success="onCopy" v-clipboard:error="onError">COPY</v-chip>
                  </td>
                  <td>
                    ***
                    <v-chip small color="primary" class="ml-1" v-clipboard:copy="project.projectSecret.nexusPassword" v-clipboard:success="onCopy" v-clipboard:error="onError">COPY</v-chip>
                  </td>
                  <td>
                    <template>
                      <div v-for="(item,index) in project.projectAvailableEnvs" :key="index">
                        <v-chip small color="primary" class="mr-1 my-1">{{ item.envName }}</v-chip>
                        ***
                        <v-chip small color="primary" class="ml-1 my-1" v-clipboard:copy="item.k8sToken" v-clipboard:success="onCopy" v-clipboard:error="onError">COPY</v-chip>
                      </div>
                    </template>
                  </td>
                  <td>{{ project.projectSecret.refreshTime }}</td>
                  <td>
                    <template>
                      <v-btn color="primary" small @click="updateSecretKeyDialog = true">更新所有秘钥</v-btn>
                    </template>
                  </td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </v-card-text>
      </v-card>
      <v-card class="mb-4">
        <v-card-title>
          用户权限
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="AssignPermissions = true">分配权限</v-btn>
        </v-card-title>
        <v-card-text>
          <v-simple-table dense v-if="project">
            <template v-slot:default>
              <thead>
                <tr>
                  <th class="text-center">
                    头像
                  </th>
                  <th class="text-left">
                    用户名
                  </th>
                  <th class="text-left">
                    是否激活
                  </th>
                  <th class="text-left">
                    是否管理员
                  </th>
                  <th class="text-left">
                    用户角色
                  </th>
                  <th class="text-left">
                    修改时间
                  </th>
                  <th class="text-left">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item,index) in project.projectMembers" :key="index">
                  <td class="avatar-wrap">
                    <img :src="item.avatarUrl" alt="" class="user-avatar">
                  </td>
                  <td>{{ item.username }}</td>
                  <td>{{ item.isActive }}</td>
                  <td>{{ item.isAdmin }}</td>
                  <td>{{ item.accessLevel }}</td>
                  <td>{{ item.updateTime | dateFormat }}</td>
                  <td>
                    <template>
                      <v-btn color="primary" small class="my-1 mr-1" @click="modifyPermissions(item.username)">修改权限</v-btn>
                      <v-btn color="primary" small class="my-1" @click="deletePermissions(item.username)">回收权限</v-btn>
                    </template>
                  </td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </v-card-text>
      </v-card>
      <v-card class="mb-4">
        <v-card-title>
          流水线列表
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="addPipelineDialog = true">新增流水线</v-btn>
        </v-card-title>
        <v-card-text>
          <v-data-table
            v-if="project"
            :headers="pipelineHeaders"
            :items="project.pipelines"
            :single-expand="false"
            item-key="pipelineName"
            show-expand
            hide-default-footer
            >
            <template v-slot:item.pipelineName="{ item }">
              <router-link :to="{ name: 'CicdPipeline', params: { pipelineName: item.pipelineName }}">
                {{ item.pipelineName }}
              </router-link>
            </template>
            <template v-slot:item.envs="{ item }">
              <div class="my-1" v-for="(i,index) in item.envs" :key="index">
                <v-chip color="primary" small @click="handleEnv(item.branchName,i,false)">{{ i }}</v-chip>
              </div>
            </template>
            <template v-slot:item.envProductions="{ item }">
              <div class="my-1" v-for="(i,index) in item.envProductions" :key="index">
                <v-chip color="primary" small @click="handleEnv(item.branchName,i,true)">{{ i }}</v-chip>
              </div>
            </template>
            <template v-slot:item.webhookPushEvent="{ item }">
              <div class="my-1 text-center">
                <v-switch
                  v-model="item.webhookPushEvent"
                  dense
                  inset
                  @change="changeSwitch(item.branchName,item.webhookPushEvent)"
                ></v-switch>
              </div>
            </template>
            <template v-slot:item.handle="{ item }">
              <Operations
                :operations="[
                  { text: '删除流水线', onClick: () => {openDeletePipeline(item.branchName)} },
                  { text: '新增环境', onClick: () => {openAddPipelineEnv(item.branchName,item.pipelineName)} },
                  { text: '更新流水线token', onClick: () => {openRfreshToken(item.branchName)} }
                ]"
              />
            </template>
            <template v-slot:expanded-item="{ headers,item }">
              <td :colspan="headers.length" class="pa-1">
                <v-card class="rounded-0">
                  <v-card-title>
                    计划任务设置
                    <v-spacer></v-spacer>
                    <v-btn small color="primary" @click="openCronAdd(item.branchName)">新增计划任务</v-btn>
                  </v-card-title>
                  <v-card-text>
                    <v-simple-table dense>
                      <template v-slot:default>
                        <thead>
                          <tr>
                            <th class="text-left">
                              计划名称
                            </th>
                            <th class="text-left">
                              执行分钟
                            </th>
                            <th class="text-left">
                              执行小时
                            </th>
                            <th class="text-left">
                              执行日期
                            </th>
                            <th class="text-left">
                              执行月份
                            </th>
                            <th class="text-left">
                              执行星期几
                            </th>
                            <th class="text-left">
                              操作
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(i,index) in item.pipelineCrons" :key="index" v-if="item.pipelineCrons.length > 0">
                            <td>{{ i.crontabName }}</td>
                            <td>{{ i.crontabMinute | filterAll }}</td>
                            <td>{{ i.crontabHour | filterAll }}</td>
                            <td>{{ i.crontabDay | filterAll }}</td>
                            <td>{{ i.crontabMonth | filterAll }}</td>
                            <td>{{ i.crontabWeek | filterAll }}</td>
                            <td>
                              <template>
                                <v-btn color="primary" small class="mr-1 my-1" @click="openCronDelete(item.branchName, i.crontabName)">删除计划任务</v-btn>
                              </template>
                            </td>
                          </tr>
                          <tr v-if="item.pipelineCrons.length <= 0">
                            <td colspan="7" class="text-center">暂无计划</td>
                          </tr>
                        </tbody>
                      </template>
                    </v-simple-table>
                  </v-card-text>
                </v-card>
                <v-card class="rounded-0">
                  <v-card-title>
                    触发器设置
                    <v-spacer></v-spacer>
                    <v-btn small color="primary" @click="openTriggerAdd(item.branchName)">新增触发器</v-btn>
                  </v-card-title>
                  <v-card-text>
                    <v-data-table
                      :headers="[
                        { text: '触发方式', value: 'stepAction', sortable: false },
                        { text: '触发状态', value: 'statusResults', sortable: false },
                        { text: '是否激活', value: 'enable', sortable: false },
                        { text: '是否通知代码提交人', value: 'committeeMail', sortable: false },
                        { text: '操作', value: 'handle', sortable: false },
                      ]"
                      ref="triggerRef"
                      :items="item.pipelineTriggers"
                      disable-pagination
                      class="elevation-1"
                      dense
                      :branchName="item.branchName"
                      item-key="stepAction"
                      show-expand
                      hide-default-footer
                    >
                      <template v-slot:item.stepAction="{ item }">
                        {{ item.stepAction | stepActionFilter }}
                      </template>
                      <template v-slot:item.enable="{ item }">
                        {{ item.enable ? '是' : '否' }}
                      </template>
                      <template v-slot:item.committeeMail="{ item }">
                        {{ item.committeeMail ? '是' : '否' }}
                      </template>
                      <template v-slot:item.handle="{ item }">
                        <Operations
                          :operations="[
                            { text: '修改触发器', onClick: () => {openTriggerUpdate($refs.triggerRef.$attrs.branchName, item.stepAction)} },
                            { text: '删除触发器', onClick: () => {openTriggerDelete($refs.triggerRef.$attrs.branchName, item.stepAction)} }
                          ]"
                        />
                      </template>
                      <template v-slot:expanded-item="{ headers, item }">
                        <td :colspan="headers.length" class="pa-1">
                          <v-simple-table dense>
                            <template v-slot:default>
                              <thead>
                                <tr>
                                  <th class="text-left">
                                    webhook callback URL
                                  </th>
                                  <th class="text-left">
                                    webhook callback token
                                  </th>
                                  <th class="text-left">
                                    通知邮箱（多个）
                                  </th>
                                  <th class="text-left">
                                    通知用户（多个）
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td>{{ item.webhookUrl }}</td>
                                  <td>{{ item.webhookToken }}</td>
                                  <td>{{ item.mails ? item.mails.toString() : ''  }}</td>
                                  <td>{{ item.usernames.toString() }}</td>
                                </tr>
                              </tbody>
                            </template>
                          </v-simple-table>
                        </td>
                      </template>
                    </v-data-table>
                  </v-card-text>
                </v-card>
              </td>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
      <v-card class="mb-4">
        <v-card-title>
          环境配置
        </v-card-title>
        <v-card-text>
          <v-data-table
            v-if="project"
            :headers="[{ text: '环境名', sortable: false, value: 'envName' }]"
            :items="project.projectAvailableEnvs"
            :single-expand="false"
            item-key="envName"
            show-expand
            hide-default-footer
            >
            <template v-slot:expanded-item="{ headers,item }">
              <td :colspan="headers.length" class="pa-1">
                <v-card class="rounded-0">
                  <v-card class="rounded-0">
                    <v-card-title>
                      环境资源配额limitConfig
                      <v-spacer></v-spacer>
                      <v-btn color="primary" small class="my-1" @click="openLimitConfig(item.envName)">设置资源配额</v-btn>
                    </v-card-title>
                    <v-card-text>
                      <v-simple-table dense class="limit-config">
                        <template v-slot:default>
                          <thead>
                            <tr>
                              <th class="text-center" colspan="5">
                                项目资源配额
                              </th>
                              <th class="text-center" colspan="4">
                                默认资源配额
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>请求内存资源</td>
                              <td>请求CPU资源</td>
                              <td>最大内存资源</td>
                              <td>最大CPU资源</td>
                              <td>pod数量限制</td>
                              <td>请求内存资源</td>
                              <td>请求CPU资源</td>
                              <td>最大内存资源</td>
                              <td>最大CPU资源</td>
                            </tr>
                            <tr>
                              <td>{{ item.limitConfig.namespaceLimit.memoryRequest }}</td>
                              <td>{{ item.limitConfig.namespaceLimit.cpuRequest }}</td>
                              <td>{{ item.limitConfig.namespaceLimit.memoryLimit }}</td>
                              <td>{{ item.limitConfig.namespaceLimit.cpuLimit }}</td>
                              <td>{{ item.limitConfig.namespaceLimit.podsLimit }}</td>
                              <td>{{ item.limitConfig.containerLimit.memoryRequest }}</td>
                              <td>{{ item.limitConfig.containerLimit.cpuRequest }}</td>
                              <td>{{ item.limitConfig.containerLimit.memoryLimit }}</td>
                              <td>{{ item.limitConfig.containerLimit.cpuLimit }}</td>
                            </tr>
                          </tbody>
                        </template>
                      </v-simple-table>
                    </v-card-text>
                  </v-card>
                  <v-card class="rounded-0 mt-1">
                    <v-card-title>
                      环境PV配置
                      <v-spacer></v-spacer>
                      <v-btn color="primary" small class="my-1 mr-1" @click="openAllotPV(item.envName)">分配新PV</v-btn>
                    </v-card-title>
                    <v-card-text>
                      <v-simple-table dense>
                        <template v-slot:default>
                          <thead>
                            <tr>
                              <th class="text-left">
                                PV名称
                              </th>
                              <th class="text-left">
                                PV描述
                              </th>
                              <th class="text-left">
                                PV类型
                              </th>
                              <th class="text-left">
                                绑定项目名
                              </th>
                              <th class="text-left">
                                绑定状态
                              </th>
                              <th class="text-left">
                                PVC名称
                              </th>
                              <th class="text-left">
                                操作
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="(i,index) in item.pvs" :key="index" v-if="item.pvs.length > 0">
                              <td>{{ i.pvName }}</td>
                              <td>{{ i.pvDesc }}</td>
                              <td>{{ i.pvType }}</td>
                              <td>{{ project.projectInfo.projectName }}</td>
                              <td>{{ i.status.phase }}</td>
                              <td>{{ i.claimRef.name }}</td>
                              <td>
                                <template>
                                  <v-btn color="primary" small class="my-1 mr-1" @click="openDeletePV(item.envName,i.pvName)">回收PV</v-btn>
                                </template>
                              </td>
                            </tr>
                            <tr v-if="item.pvs.length <= 0">
                              <td colspan="7" class="text-center">暂无环境PV配置</td>
                            </tr>
                          </tbody>
                        </template>
                      </v-simple-table>
                    </v-card-text>
                  </v-card>
                  <v-card class="rounded-0 mt-1">
                    <v-card-title>
                      调试组件配置
                      <v-spacer></v-spacer>
                      <v-btn color="primary" small class="my-1 mr-1" @click="openAddDebug(item.envName)">新增调试组件</v-btn>
                    </v-card-title>
                    <v-card-text class="info-table">
                      <v-data-table
                        :headers="debugComponentHeaders"
                        :items="Object.keys(item.componentDebug).length > 0 ? [item.componentDebug] : []"
                        disable-pagination
                        class="elevation-1"
                        dense
                        ref="debugRef"
                        :envname="item.envName"
                        item-key="componentDebugYaml"
                        show-expand
                        hide-default-footer
                      >
                        <template v-slot:item.componentDebugYaml="{ item }">
                          <v-btn small color="primary" @click="showYaml(item.deploySpecDebug, '调试组件定义YAML详情')">查看详情</v-btn>
                        </template>
                        <template v-slot:item.deploymentSSHYaml="{ item }">
                          <v-btn small color="primary" @click="showYaml(item.deploymentSSHYaml, 'SSH组件部署YAML详情')">查看详情</v-btn>
                        </template>
                        <template v-slot:item.deploymentVNCYaml="{ item }">
                          <v-btn small color="primary" @click="showYaml(item.deploymentVNCYaml, 'VNC组件部署YAML详情')">查看详情</v-btn>
                        </template>
                        <template v-slot:item.serviceSSHYaml="{ item }">
                          <v-btn small color="primary" @click="showYaml(item.serviceSSHYaml, 'SSH组件服务YAML详情')">查看详情</v-btn>
                        </template>
                        <template v-slot:item.serviceVNCYaml="{ item }">
                          <v-btn small color="primary" @click="showYaml(item.serviceVNCYaml, 'VNC组件服务YAML详情')">查看详情</v-btn>
                        </template>
                        <template v-slot:item.time="{ item }">
                          {{item.createTime}}/{{item.updateTime}}
                        </template>
                        <template v-slot:expanded-item="{ headers, item }">
                          <td :colspan="headers.length" class="pa-1">
                            <v-simple-table dense>
                              <template v-slot:default>
                                <thead>
                                  <tr>
                                    <th class="text-left">
                                      podName
                                    </th>
                                    <th class="text-left">
                                      imageName
                                    </th>
                                    <th class="text-left">
                                      ready
                                    </th>
                                    <th class="text-left">
                                      reason
                                    </th>
                                    <th class="text-left">
                                      restart
                                    </th>
                                    <th class="text-left">
                                      age
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr v-for="i in item.podStatuses" :key="i.podName">
                                    <td>{{ i.podName }}</td>
                                    <td>{{ i.imageName }}</td>
                                    <td>{{ i.ready }}</td>
                                    <td>{{ i.reason }}</td>
                                    <td>{{ i.restart }}</td>
                                    <td>{{ i.age }}</td>
                                  </tr>
                                </tbody>
                              </template>
                            </v-simple-table>
                          </td>
                        </template>
                        <template v-slot:item.handle="{item}">
                          <Operations
                            :operations="[
                              { text: '修改调试组件', onClick: () => {openUpdateDebug($refs.debugRef.$attrs.envname)} },
                              { text: '删除调试组件', onClick: () => {openDeleteDebug($refs.debugRef.$attrs.envname)} },
                            ]"
                          />
                        </template>
                      </v-data-table>
                    </v-card-text>
                  </v-card>
                  <v-card class="rounded-0 mt-1">
                    <v-card-title>
                      组件配置
                      <v-spacer></v-spacer>
                      <v-btn color="primary" small class="my-1 mr-1" @click="openAddComponent(item.envName)">新增组件</v-btn>
                    </v-card-title>
                    <v-card-text class="info-table">
                      <v-data-table
                        :headers="componentHeaders"
                        :items="item.components"
                        disable-pagination
                        class="elevation-1"
                        dense
                        ref="componentRef"
                        :envname="item.envName"
                        item-key="componentName"
                        show-expand
                        hide-default-footer
                      >
                        <template v-slot:item.componentYaml="{ item }">
                          <v-btn small color="primary" @click="showYaml(item.deploySpecStatic, '组件定义YAML详情')">查看详情</v-btn>
                        </template>
                        <template v-slot:item.deploymentYaml="{ item }">
                          <v-btn small color="primary" @click="showYaml(item.deploymentYaml, '组件部署YAML详情')">查看详情</v-btn>
                        </template>
                        <template v-slot:item.serviceYaml="{ item }">
                          <v-btn small color="primary" @click="showYaml(item.serviceYaml, '组件服务YAML详情')">查看详情</v-btn>
                        </template>
                        <template v-slot:item.time="{ item }">
                          {{item.createTime}}/{{item.updateTime}}
                        </template>
                        <template v-slot:item.handle="{ item }">
                          <Operations
                            :operations="[
                              { text: '修改组件', onClick: () => {openUpdateComponent($refs.componentRef.$attrs.envname,item.componentName)} },
                              { text: '删除组件', onClick: () => {openDeleteComponent($refs.componentRef.$attrs.envname,item.componentName)} },
                            ]"
                          />
                        </template>
                        <template v-slot:expanded-item="{ headers, item }">
                          <td :colspan="headers.length" class="pa-1">
                            <v-simple-table dense>
                              <template v-slot:default>
                                <thead>
                                  <tr>
                                    <th class="text-left">
                                      podName
                                    </th>
                                    <th class="text-left">
                                      imageName
                                    </th>
                                    <th class="text-left">
                                      ready
                                    </th>
                                    <th class="text-left">
                                      reason
                                    </th>
                                    <th class="text-left">
                                      restart
                                    </th>
                                    <th class="text-left">
                                      age
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr v-for="i in item.podStatuses" :key="i.podName">
                                    <td>{{ i.podName }}</td>
                                    <td>{{ i.imageName }}</td>
                                    <td>{{ i.ready }}</td>
                                    <td>{{ i.reason }}</td>
                                    <td>{{ i.restart }}</td>
                                    <td>{{ i.age }}</td>
                                  </tr>
                                </tbody>
                              </template>
                            </v-simple-table>
                          </td>
                        </template>
                      </v-data-table>
                    </v-card-text>
                  </v-card>
                </v-card>
              </td>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </PageCard>
    <div class="dialog-box">
      <v-dialog
        v-model="newEnvDialog"
        width="500"
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
              <v-select
                v-model="newEnvSelect"
                :items="newEnvSelectList"
                label="选择环境（envName）*"
                multiple
                dense
                small-chips
              ></v-select>
            </v-form>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              text
              @click="() => {
                this.newEnvDialog = false
                this.$refs.chooseEnvRef.reset()
              }"
            >
              取消
            </v-btn>
            <v-btn
              color="primary"
              text
              @click="newEnv()"
            >
              确认
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog
        v-model="nodePortDialog"
        max-width="600px"
      >
        <v-card>
          <v-card-title>
            <span class="headline">回收NodePort</span>
          </v-card-title>
          <v-card-text>
            <v-alert icon="mdi-alert-circle" prominent text type="info">
              <small>回收NodePort后，项目将不能再使用该NodePort端口段发布服务</small>
            </v-alert>
            确认要回收NodePort端口段 {{targetNodeport}}-{{targetNodeport+9}}吗？
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="blue darken-1"
              text
              @click="nodePortDialog = false"
            >
              取消
            </v-btn>
            <v-btn
              color="blue darken-1"
              text
              @click="recycleNodeport()"
            >
              确认
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog
        v-model="envDialog"
        max-width="600px"
      >
        <v-card>
          <v-card-title>
            <span class="headline">{{handleEnvType == 0 ? '回收环境' : '回收环境并清理名字空间'}}</span>
          </v-card-title>
          <v-card-text>
            <v-alert icon="mdi-alert-circle" prominent text type="info" v-if="handleEnvType == 0">
              <small>
                回收项目可用环境后，项目将不能再把应用发布到本环境中。
              </small>
            </v-alert>
            <v-alert icon="mdi-alert-circle" prominent text type="error" v-else>
              <small>
                回收项目可用环境后，项目将不能再把应用发布到本环境，同时会清除该kubernetes环境中该项目的名字空间。<v-chip small color="red">危险操作，请输入环境名。</v-chip>
              </small>
            </v-alert>
            <v-container>
              <v-form ref="deleteEnvRef">
                <v-row>
                  <v-col cols="12">
                    <v-select
                      v-model="handleEnvType"
                      :items="[{text: '回收环境', value: '0'}, {text: '回收环境并清理名字空间', value: '1'}]"
                      label="选择操作"
                      dense
                    ></v-select>
                  </v-col>
                  <v-col cols="12" v-if="handleEnvType == 0">
                    <div>确认要回收项目{{targetProjectName}}的环境{{handleEnvName}}吗？</div>
                  </v-col>
                  <v-col cols="12" v-else>
                    <v-text-field
                      label="环境名"
                      required
                      dense
                      :rules="[v => !!v || '环境名为必填项']"
                      v-model="deleteEnvName"
                      :hint="`确认要回收项目${targetProjectName}的环境${handleEnvName}，并清理该kubernetes环境中的项目名字空间吗？`"
                      persistent-hint
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-form>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="blue darken-1"
              text
              @click="envDialog = false"
            >
              取消
            </v-btn>
            <v-btn
              color="blue darken-1"
              text
              @click="recycleEnv()"
            >
              确认
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog
        v-model="newNodePortDialog"
        max-width="600px"
      >
        <v-card>
          <v-card-title>
            <span class="headline">分配新NodePort</span>
          </v-card-title>
          <v-card-text>
            <v-alert icon="mdi-alert-circle" prominent text type="info">
              <small>自动为该项目分配一个可用的NodePort端口段。</small>
            </v-alert>
            确认要为项目{{targetProjectName}}分配新的NodePort端口段吗？
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="blue darken-1"
              text
              @click="newNodePortDialog = false"
            >
              取消
            </v-btn>
            <v-btn
              color="blue darken-1"
              text
              @click="newNodePort()"
            >
              确认
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog
        v-model="modifyProjectDialog"
        max-width="600px"
      >
        <v-card>
          <v-card-title>
            <span class="headline">修改项目</span>
          </v-card-title>
          <v-card-text>
            <v-form ref="updateProjectRef">
              <small></small>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      label="项目名称（projectName）*"
                      v-model="updateProjectForm.projectDesc"
                      required
                      dense
                      :rules="[v => !!v || '项目全称为必填项']"
                      hint="项目的全称信息，格式例如：测试-项目1"
                      persistent-hint
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      label="项目团队*"
                      v-model="updateProjectForm.projectTeam"
                      required
                      dense
                      :rules="[v => !!v || '项目团队为必填项']"
                      hint="项目团队，用于对该项目团队的持续交付信息进行统计，格式例如：测试团队1"
                      persistent-hint
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="blue darken-1"
              text
              @click="() => {
                this,$refs.updateProjectRef.resetValidation()
                this.modifyProjectDialog = false
              }"
            >
              取消
            </v-btn>
            <v-btn
              color="blue darken-1"
              text
              @click="modifyProject()"
            >
              确认
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog
        v-model="deleteProjectDialog"
        max-width="600px"
      >
        <v-card>
          <v-card-title>
            <span class="headline">删除项目</span>
          </v-card-title>
          <v-card-text>
            <v-form ref="deleteProjectRef">
              <v-alert icon="mdi-alert-circle" prominent text type="error">
                <small>删除项目将会删除项目的所有配置信息，以及git代码仓库、harbor镜像仓库、nexus依赖制品仓库的配置信息。删除项目后所有项目流水线记录都将全部清除。<v-chip small color="red">危险操作，请输入项目名称。</v-chip></small>
              </v-alert>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      label="项目名称（projectName）*"
                      required
                      dense
                      :rules="[v => !!v || '项目全称为必填项']"
                      v-model="deleteProjectName"
                      :hint="`确认要删除项目${targetProjectName}吗？`"
                      persistent-hint
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="blue darken-1"
              text
              @click="() => {
                this.deleteProjectDialog = false
                this.$refs.deleteProjectRef.reset()
              }"
            >
              取消
            </v-btn>
            <v-btn
              color="blue darken-1"
              text
              @click="deleteProject()"
            >
              确认
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog
        v-model="deleteAllDialog"
        max-width="600px"
      >
        <v-card>
          <v-card-title>
            <span class="headline">删除项目与环境</span>
          </v-card-title>
          <v-card-text>
            <v-form ref="deleteProjectAllRef">
              <v-alert icon="mdi-alert-circle" prominent text type="error">
                <small>删除项目并清理名字空间将会删除项目的所有配置信息，以及git代码仓库、harbor镜像仓库、nexus依赖制品仓库的配置信息。删除项目后所有项目流水线记录都将全部清除。同时将会清除项目所有kubernetes环境中的名字空间。<v-chip small color="red">危险操作，请输入项目名称。</v-chip></small>
              </v-alert>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      label="项目名称（projectName）*"
                      required
                      dense
                      :rules="[v => !!v || '项目全称为必填项']"
                      v-model="deleteProjectAll"
                      :hint="`确认要删除项目${targetProjectName}吗？`"
                      persistent-hint
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="blue darken-1"
              text
              @click="()=> {
                this.deleteAllDialog = false
                this.$refs.deleteProjectAllRef.reset()
              }"
            >
              取消
            </v-btn>
            <v-btn
              color="blue darken-1"
              text
              @click="deleteAll()"
            >
              确认
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog
        v-model="updateSecretKeyDialog"
        max-width="600px"
      >
        <v-card>
          <v-card-title>
            <span class="headline">更新所有密钥</span>
          </v-card-title>
          <v-card-text>
            <v-alert icon="mdi-alert-circle" prominent text type="info">
              <small>有人员离职或者其他需要更新密钥信息的情况下，更新所有密钥，将会更新项目的harbor密码、nexus密码以及所有kubernetes环境的dashboard登录token。</small>
            </v-alert>
            确认要更新项目{{targetProjectName}}的所有密钥吗？
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="blue darken-1"
              text
              @click="updateSecretKeyDialog = false"
            >
              取消
            </v-btn>
            <v-btn
              color="blue darken-1"
              text
              @click="updateToken()"
            >
              确认
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog
        v-model="AssignPermissions"
        max-width="600px"
      >
        <v-card>
          <v-card-title>
            <span class="headline">分配权限</span>
          </v-card-title>
          <v-card-text>
            <v-form ref="memberAddRef">
              <v-alert icon="mdi-alert-circle" prominent text type="info">
                <small>给用户分配该项目的权限</small>
              </v-alert>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-autocomplete
                      v-model="memberAddForm.username"
                      :items="userName"
                      dense
                      label="用户名（username）*"
                      :rules="[v => !!v || '用户名为必选项']"
                    ></v-autocomplete>
                  </v-col>
                  <v-col cols="12">
                    <v-select
                      :items="accessLevel"
                      label="用户角色（accessLevel）*"
                      dense
                      v-model="memberAddForm.accessLevel"
                      :rules="[v => !!v || '用户角色为必选项']"
                      :messages="[ 'developer：git代码仓库的默认分支的修改权限，可以执行流水线', 'maintainer：git代码仓库的维护者权限，可以修改所有分支，可以执行流水线，可以通过项目控制台对项目进行设置。']"
                    >
                      <template v-slot:message>
                        <div>developer：git代码仓库的默认分支的修改权限，可以执行流水线</div>
                        <div>maintainer：git代码仓库的维护者权限，可以修改所有分支，可以执行流水线，可以通过项目控制台对项目进行设置。</div>
                      </template>
                    </v-select>
                  </v-col>
                </v-row>
              </v-container>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="blue darken-1"
              text
              @click="() => {
                this.$refs.memberAddRef.reset()
                this.AssignPermissions = false
              }"
            >
              取消
            </v-btn>
            <v-btn
              color="blue darken-1"
              text
              @click="memberAdd()"
            >
              确认分配
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog
        v-model="permissionsDialog"
        max-width="600px"
      >
        <v-card>
          <v-card-title>
            <span class="headline">修改权限</span>
          </v-card-title>
          <v-card-text>
            <v-form ref="updateMemberRef">
              <v-alert icon="mdi-alert-circle" prominent text type="info">
                <small>变更用户{{memberAddForm.username}}的项目{{targetProjectName}}权限</small>
              </v-alert>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-select
                      :items="accessLevel"
                      label="用户角色（accessLevel）*"
                      dense
                      v-model="memberAddForm.accessLevel"
                      :rules="[v => !!v || '用户角色为必选项']"
                      :messages="[ 'developer：git代码仓库的默认分支的修改权限，可以执行流水线', 'maintainer：git代码仓库的维护者权限，可以修改所有分支，可以执行流水线，可以通过项目控制台对项目进行设置。']"
                    >
                      <template v-slot:message>
                        <div>developer：git代码仓库的默认分支的修改权限，可以执行流水线</div>
                        <div>maintainer：git代码仓库的维护者权限，可以修改所有分支，可以执行流水线，可以通过项目控制台对项目进行设置。</div>
                      </template>
                    </v-select>
                  </v-col>
                </v-row>
              </v-container>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="blue darken-1"
              text
              @click="() => {
                this.$refs.updateMemberRef.reset()
                this.permissionsDialog = false
              }"
            >
              取消
            </v-btn>
            <v-btn
              color="blue darken-1"
              text
              @click="updateMember()"
            >
              确认
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog
        v-model="deletePermissionsDialog"
        max-width="600px"
      >
        <v-card>
          <v-card-title>
            <span class="headline">回收权限</span>
          </v-card-title>
          <v-card-text>
            确认要回收用户{{targetUsername}}的项目{{targetProjectName}}权限吗？
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="blue darken-1"
              text
              @click="deletePermissionsDialog = false"
            >
              取消
            </v-btn>
            <v-btn
              color="blue darken-1"
              text
              @click="deleteMember()"
            >
              确认
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog
        v-model="addPipelineDialog"
        max-width="600px"
        persistent
      >
        <v-card>
          <v-card-title>
            <span class="headline">新增流水线</span>
          </v-card-title>
          <v-card-text>
            <v-alert icon="mdi-alert-circle" prominent text type="info">
              <small>为项目{{targetProjectName}}新增流水线，将会自动在git代码仓库中创建对应的版本分支，该版本分支的应用模块将会发布到该流水线设置的集成环境以及正式环境中。</small>
            </v-alert>
            <v-form ref="addPipelineRef">
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      label="分支名称（branchName）*"
                      dense
                      v-model="addPipelineForm.branchName"
                      :rules="[v => !!v || '分支名称为必填项']"
                      hint="流水线对应的git代码仓库的分支，将会自动从当前默认分支创建新分支，小写英文与数字，格式例如：release"
                      persistent-hint
                    >
                    </v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      label="标签后缀（tagSuffix）"
                      dense
                      v-model="addPipelineForm.tagSuffix"
                      hint="为该版本分支自动创建的标签后缀，小写英文与数字"
                      persistent-hint
                    >
                    </v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12">
                    <v-select
                      :items="envList"
                      label="集成环境（envs）*"
                      multiple
                      dense
                      small-chips
                      v-model="addPipelineForm.envs"
                      :rules="[v => v.length > 0 || '集成环境为必选项']"
                      hint="选择流水线要发布的集成环境，集成环境可以进行自动化测试。多个集成环境情况下，按顺序进行串行发布。"
                      persistent-hint
                    ></v-select>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12">
                    <v-select
                      :items="envList"
                      label="正式环境（envProductions）"
                      multiple
                      dense
                      small-chips
                      v-model="addPipelineForm.envProductions"
                      hint="选择流水线要发布的正式环境，正式环境为生产发布用途，不可以进行自动化测试。多个正式环境情况下，按顺序进行串行发布。"
                      persistent-hint
                    ></v-select>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12">
                    <v-select
                      :items="gitPush"
                      label="是否启用git push触发流水线（webhookPushEvent）*"
                      dense
                      v-model="addPipelineForm.webhookPushEvent"
                      :rules="[v => typeof(v)== 'boolean' || '启用git push触发流水线为必选项']"
                      hint="当有代码push到git代码仓库的时候触发该流水线。"
                      persistent-hint
                    ></v-select>
                  </v-col>
                </v-row>
              </v-container>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="blue darken-1"
              text
              @click="() => {
                this.$refs.addPipelineRef.reset()
                this.addPipelineDialog = false
              }"
            >
              取消
            </v-btn>
            <v-btn
              color="blue darken-1"
              text
              @click="addPipeline()"
            >
              确认
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog
        v-model="deletePipelineDialog"
        max-width="600px"
      >
        <v-card>
          <v-card-title>
            <span class="headline">删除流水线</span>
          </v-card-title>
          <v-card-text>
            <v-form ref="deleteBranchNameRef">
              <v-alert icon="mdi-alert-circle" prominent text type="error">
                <small>删除流水线将会清除该流水线所有执行记录。<v-chip small color="red">危险操作，请输入流水线分支名称。</v-chip></small>
              </v-alert>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      label="分支名称（branchName）*"
                      required
                      dense
                      v-model="deleteBranchName"
                      :rules="[v => !!v || '分支名称为必填项']"
                      :hint="deleteBranchTip"
                      persistent-hint
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="blue darken-1"
              text
              @click="() =>{
                this.$refs.deleteBranchNameRef.reset()
                this.deletePipelineDialog = false
              }"
            >
              取消
            </v-btn>
            <v-btn
              color="blue darken-1"
              text
              @click="deletePipeline()"
            >
              确认
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog
        v-model="addPipelineEnvDialog"
        max-width="600px"
      >
        <v-card>
          <v-card-title>
            <span class="headline">为流水线分配环境</span>
          </v-card-title>
          <v-card-text>
            <v-form ref="addPipelineEnvRef">
              <v-alert icon="mdi-alert-circle" prominent text type="info">
                <small>设置{{targetPipelineName}}流水线可以发布应用到该环境</small>
              </v-alert>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-select
                      :items="envList"
                      label="选择环境（envName）*"
                      dense
                      v-model="addPipelineEnvForm.envName"
                      :rules="[v => !!v || '环境为必选项']"
                      hint="选择需要发布的环境名称"
                      persistent-hint
                    ></v-select>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12">
                    <v-select
                      :items="[{ text: '正式环境', value: true }, { text: '集成环境', value: false }]"
                      label="分配环境类型（isProductionEnv）*"
                      dense
                      v-model="addPipelineEnvForm.isProductionEnv"
                      :rules="[v => typeof(v)== 'boolean' || '环境类型为必选项']"
                      hint="集成环境可以进行自动化测试；正式环境为生产发布用途，不可以进行自动化测试。"
                      persistent-hint
                    ></v-select>
                  </v-col>
                </v-row>
              </v-container>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="blue darken-1"
              text
              @click="() => {
                this.$refs.addPipelineEnvRef.reset()
                this.addPipelineEnvDialog = false
              }"
            >
              取消
            </v-btn>
            <v-btn
              color="blue darken-1"
              text
              @click="addPipelineEnv()"
            >
              确认
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog
        v-model="addPlanDialog"
        max-width="600px"
      >
        <v-card>
          <v-card-title>
            <span class="headline">新增计划任务</span>
          </v-card-title>
          <v-card-text>
            <v-alert icon="mdi-alert-circle" prominent text type="info">
              <small>按照计划任务设置，定期执行流水线</small>
            </v-alert>
            <v-form ref="cornAddRef">
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      label="计划名称（crontabName）*"
                      dense
                      :rules="[v => !!v || '计划名称为必填项']"
                      v-model="cronAddForm.crontabName"
                      hint="推荐格式：${branchName}-xxx，格式例如：develop-daily-job"
                      persistent-hint
                    >
                    </v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12">
                    <v-select
                      label="计划执行星期（crontabWeek）*"
                      dense
                      :items="[ -1, 0, 1, 2, 3, 4, 5, 6 ]"
                      :rules="[v => typeof v === 'number' || '计划执行星期为必填项']"
                      v-model="cronAddForm.crontabWeek"
                      hint="星期几执行计划任务，0 - 6表示周日-周六，-1表示不限星期几"
                      persistent-hint
                    >
                    </v-select>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12">
                    <v-select
                      label="计划执行月份（crontabMonth）*"
                      dense
                      :items="[ -1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ]"
                      :rules="[v => typeof v === 'number' || '计划执行月份为必填项']"
                      v-model="cronAddForm.crontabMonth"
                      hint="每年的几月份执行计划任务，1 - 12 表示1月-12月，-1表示不限几月份"
                      persistent-hint
                    >
                    </v-select>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12">
                    <v-select
                      label="计划执行日（crontabDay）*"
                      dense
                      :items="[ -1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31 ]"
                      :rules="[v => typeof v === 'number' || '计划执行日为必填项']"
                      v-model="cronAddForm.crontabDay"
                      hint="每月的几日执行计划任务，1 - 31 表示1日-31日，-1表示不限几号"
                      persistent-hint
                    >
                    </v-select>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12">
                    <v-select
                      label="计划执行小时（crontabHour）*"
                      dense
                      :items="[ -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23 ]"
                      :rules="[v => typeof v === 'number' || '计划执行小时为必填项']"
                      v-model="cronAddForm.crontabHour"
                      hint="每天的几点执行计划任务，0 - 23 表示0点-23点，-1表示不限几点"
                      persistent-hint
                    >
                    </v-select>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12">
                    <v-select
                      label="计划执行分钟（crontabMinute）*"
                      dense
                      :items="[ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59 ]"
                      :rules="[v => typeof v === 'number' || '计划执行分钟为必填项']"
                      v-model="cronAddForm.crontabMinute"
                      hint="每小时的第几分钟执行计划任务，0 - 59 表示第0分钟-59分钟"
                      persistent-hint
                    >
                    </v-select>
                  </v-col>
                </v-row>
              </v-container>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="blue darken-1"
              text
              @click="() => {
                this.$refs.cornAddRef.reset()
                this.addPlanDialog = false
              }"
            >
              取消
            </v-btn>
            <v-btn
              color="blue darken-1"
              text
              @click="cornAdd()"
            >
              确认
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog
        v-model="deletePlanDialog"
        max-width="600px"
      >
        <v-card>
          <v-card-title>
            <span class="headline">删除计划任务</span>
          </v-card-title>
          <v-card-text>
            <v-alert icon="mdi-alert-circle" prominent text type="info">
              <small>删除计划任务</small>
            </v-alert>
            确认要删除计划任务吗？
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="blue darken-1"
              text
              @click="deletePlanDialog = false"
            >
              取消
            </v-btn>
            <v-btn
              color="blue darken-1"
              text
              @click="cronDelete()"
            >
              确认
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog
        v-model="addTriggerDialog"
        max-width="600px"
      >
        <v-card>
          <v-card-title>
            <span class="headline">新增触发器</span>
          </v-card-title>
          <v-card-text>
            <v-alert icon="mdi-alert-circle" prominent text type="info">
              <small>在流水线执行完特定步骤，会触发该触发器</small>
            </v-alert>
            <v-form ref="triggerAddRef">
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-select
                      label="触发方式（stepAction）*"
                      dense
                      :items="stepActionList"
                      :rules="[v => typeof v === 'string' || '触发方式为必填项']"
                      v-model="triggerAddForm.stepAction"
                      hint="请选择在执行完特定步骤后，会触发该触发器"
                      persistent-hint
                    >
                    </v-select>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12">
                    <v-select
                      label="触发状态（statusResults）*"
                      dense
                      :items="[
                        { text: '执行成功', value: 'SUCCESS' },
                        { text: '执行失败', value: 'FAIL' },
                      ]"
                      :rules="[v => !!v || '触发状态为必填项']"
                      v-model="triggerAddForm.statusResults"
                      multiple
                      small-chip
                      hint="在步骤执行状态是什么状态的情况下，会触发该触发器"
                      persistent-hint
                    >
                    </v-select>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12">
                    <v-select
                      label="是否激活（enable）*"
                      dense
                      :items="[
                        { text: '是', value: true },
                        { text: '否', value: false },
                      ]"
                      :rules="[v => typeof v === 'boolean' || '是否激活为必填项']"
                      v-model="triggerAddForm.enable"
                      hint="是否启用该触发器"
                      persistent-hint
                    >
                    </v-select>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      label="webhook callback URL（webhookUrl）"
                      dense
                      v-model="triggerAddForm.webhookUrl"
                      hint=""
                      persistent-hint
                    >
                    </v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      label="webhook callback token（webhookToken）"
                      dense
                      v-model="triggerAddForm.webhookToken"
                      hint=""
                      persistent-hint
                    >
                    </v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="blue darken-1"
              text
              @click="() => {
                this.$refs.triggerAddRef.reset()
                this.addTriggerDialog = false
              }"
            >
              取消
            </v-btn>
            <v-btn
              color="blue darken-1"
              text
              @click="triggerAdd()"
            >
              确认
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog
        v-model="updateTriggerDialog"
        max-width="600px"
      >
        <v-card :loading="dialogLoading">
          <v-card-title>
            <span class="headline">修改触发器</span>
          </v-card-title>
          <v-card-text>
            <v-alert icon="mdi-alert-circle" prominent text type="info">
              <small>在流水线执行完特定步骤，会触发该触发器</small>
            </v-alert>
            <v-form ref="triggerUpdateRef">
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-select
                      label="触发状态（statusResults）*"
                      dense
                      :items="[
                        { text: '执行成功', value: 'SUCCESS' },
                        { text: '执行失败', value: 'FAIL' },
                      ]"
                      :rules="[v => !!v || '触发状态为必填项']"
                      v-model="triggerUpdateForm.statusResults"
                      multiple
                      small-chip
                      hint="在步骤执行状态是什么状态的情况下，会触发该触发器"
                      persistent-hint
                    >
                    </v-select>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12">
                    <v-select
                      label="是否激活（enable）*"
                      dense
                      :items="[
                        { text: '是', value: true },
                        { text: '否', value: false },
                      ]"
                      :rules="[v => typeof v === 'boolean' || '是否激活为必填项']"
                      v-model="triggerUpdateForm.enable"
                      hint="是否启用该触发器"
                      persistent-hint
                    >
                    </v-select>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12">
                    <v-select
                      label="是否通知代码提交人（committeeMail）*"
                      dense
                      :items="[
                        { text: '是', value: true },
                        { text: '否', value: false },
                      ]"
                      :rules="[v => typeof v === 'boolean' || '是否通知代码提交人为必填项']"
                      v-model="triggerUpdateForm.committeeMail"
                      hint="当调用该触发器的时候，是否通过邮件方式通知对应代码提交人"
                      persistent-hint
                    >
                    </v-select>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      label="webhook callback URL（webhookUrl）"
                      dense
                      v-model="triggerUpdateForm.webhookUrl"
                      hint=""
                      persistent-hint
                    >
                    </v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      label="webhook callback token（webhookToken）"
                      dense
                      v-model="triggerUpdateForm.webhookToken"
                      hint=""
                      persistent-hint
                    >
                    </v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12">
                    <v-combobox
                      label="通知邮箱（mails）"
                      dense
                      multiple
                      small-chips
                      hide-selected
                      v-model="triggerUpdateForm.mails"
                      hint="当调用该触发器的时候，是否通过邮件方式通知的目标邮箱，支持多个邮箱"
                      persistent-hint
                      append-icon=""
                    >
                    </v-combobox>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12">
                    <v-select
                      label="通知用户（usernames）"
                      dense
                      :items="project.projectMembers"
                      v-model="triggerUpdateForm.usernames"
                      item-value="username"
                      item-text="username"
                      multiple
                      small-chip
                      hint="当调用该触发器的时候，是否通过站内提醒方式通知的用户，支持多个用户"
                      persistent-hint
                    >
                    </v-select>
                  </v-col>
                </v-row>
              </v-container>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="blue darken-1"
              text
              @click="() => {
                this.$refs.triggerUpdateRef.reset()
                this.updateTriggerDialog = false
              }"
            >
              取消
            </v-btn>
            <v-btn
              color="blue darken-1"
              text
              @click="triggerUpdate()"
            >
              确认
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog
        v-model="deleteTriggerDialog"
        max-width="600px"
      >
        <v-card>
          <v-card-title>
            <span class="headline">删除触发器</span>
          </v-card-title>
          <v-card-text>
            <v-alert icon="mdi-alert-circle" prominent text type="info">
              <small>删除触发器</small>
            </v-alert>
            确认要删除触发器吗？
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="blue darken-1"
              text
              @click="() => {
                this.deleteTriggerDialog = false
              }"
            >
              取消
            </v-btn>
            <v-btn
              color="blue darken-1"
              text
              @click="triggerDelete()"
            >
              确认
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog
        v-model="limitConfigDialog"
        max-width="800px"
      >
        <v-card>
          <v-card-title>
            <span class="headline">设置资源配额</span>
          </v-card-title>
          <v-card-text>
            <v-alert icon="mdi-alert-circle" prominent text type="info">
              <small>设置项目{{targetProjectName}}在kubernetes环境{{limitConfigForm.envName}}的资源配额</small>
            </v-alert>
            <v-form ref="limitConfigRef" class="d-flex justify-space-between">
              <div style="width: 50%">
                <div><strong>项目资源配额</strong></div>
                <small>为整个项目名字空间分配的资源配额，超过该资源配额设置应用将无法发布。</small>
                <v-container>
                  <v-row>
                    <v-col cols="12">
                      <v-text-field
                        label="请求内存资源（memoryRequest）*"
                        dense
                        v-model="limitConfigForm.namespaceLimit.memoryRequest"
                        :rules="[v => !!v || '请求内存资源为必填项']"
                        hint="Ti、Gi、Mi、Ki分别表示T、G、M、K的内存。格式例如：10Ti、10Gi、10Mi、10Ki。"
                        persistent-hint
                      >
                      </v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12">
                      <v-text-field
                        label="请求CPU资源（cpuRequest）*"
                        dense
                        v-model="limitConfigForm.namespaceLimit.cpuRequest"
                        :rules="[v => !!v || '请求CPU资源为必填项']"
                        hint="1表示一个vCPU，0.1表示1/10个vCPU，100m表示0.1个vCPU。格式例如：1、0.1、100m。"
                        persistent-hint
                      >
                      </v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12">
                      <v-text-field
                        label="最大内存配额（memoryLimit）*"
                        dense
                        v-model="limitConfigForm.namespaceLimit.memoryLimit"
                        :rules="[v => !!v || '最大内存资源为必填项']"
                        hint="Ti、Gi、Mi、Ki分别表示T、G、M、K的内存。格式例如：10Ti、10Gi、10Mi、10Ki。"
                        persistent-hint
                      >
                      </v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12">
                      <v-text-field
                        label="最大CPU配额（cpuLimit）*"
                        dense
                        v-model="limitConfigForm.namespaceLimit.cpuLimit"
                        :rules="[v => !!v || '最大CPU资源为必填项']"
                        hint="1表示一个vCPU，0.1表示1/10个vCPU，100m表示0.1个vCPU。格式例如：1、0.1、100m。"
                        persistent-hint
                      >
                      </v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12">
                      <v-text-field
                        label="最大pods数量（podsLimit）*"
                        dense
                        type="number"
                        v-model="limitConfigForm.namespaceLimit.podsLimit"
                        :rules="[v => !!v || 'pod数量限制为必填项']"
                        hint="最多允许在名字空间下运行多少个Pods。"
                        persistent-hint
                      >
                      </v-text-field>
                    </v-col>
                  </v-row>
                </v-container>
              </div>
              <div style="width: 50%">
                <div><strong>默认资源配额</strong></div>
                <small>如果deploy-info-xxx.yaml中没有指定给应用分配多少资源的情况下，就会使用该设置作为应用默认的资源配额。</small>
                <v-container>
                  <v-row>
                    <v-col cols="12">
                      <v-text-field
                        label="请求内存资源（memoryRequest）*"
                        dense
                        v-model="limitConfigForm.containerLimit.memoryRequest"
                        :rules="[v => !!v || '请求内存资源为必填项']"
                        hint="Ti、Gi、Mi、Ki分别表示T、G、M、K的内存。格式例如：10Ti、10Gi、10Mi、10Ki。"
                        persistent-hint
                      >
                      </v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12">
                      <v-text-field
                        label="请求CPU资源（cpuRequest）*"
                        dense
                        v-model="limitConfigForm.containerLimit.cpuRequest"
                        :rules="[v => !!v || '请求CPU资源为必填项']"
                        hint="1表示一个vCPU，0.1表示1/10个vCPU，100m表示0.1个vCPU。格式例如：1、0.1、100m。"
                        persistent-hint
                      >
                      </v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12">
                      <v-text-field
                        label="最大内存配额（memoryLimit）*"
                        dense
                        v-model="limitConfigForm.containerLimit.memoryLimit"
                        :rules="[v => !!v || '最大内存资源为必填项']"
                        hint="Ti、Gi、Mi、Ki分别表示T、G、M、K的内存。格式例如：10Ti、10Gi、10Mi、10Ki。"
                        persistent-hint
                      >
                      </v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12">
                      <v-text-field
                        label="最大CPU配额（cpuLimit）*"
                        dense
                        v-model="limitConfigForm.containerLimit.cpuLimit"
                        :rules="[v => !!v || '最大CPU资源为必填项']"
                        hint="1表示一个vCPU，0.1表示1/10个vCPU，100m表示0.1个vCPU。格式例如：1、0.1、100m。"
                        persistent-hint
                      >
                      </v-text-field>
                    </v-col>
                  </v-row>
                </v-container>
              </div>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="blue darken-1"
              text
              @click="() => {
                this.$refs.limitConfigRef.resetValidation()
                this.limitConfigDialog = false
                this.getEnvLimitConfig()
              }"
            >
              取消
            </v-btn>
            <v-btn
              color="blue darken-1"
              text
              @click="limitConfig()"
            >
              确认
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog
        v-model="allotPVDialog"
        max-width="600"
        @input="() => {this.$refs.allotPVRef.reset()}"
      >
        <v-card :loading="dialogLoading">
          <v-card-title>
            分配新持久化卷PV
          </v-card-title>

          <v-card-text>
            <v-alert icon="mdi-alert-circle" prominent text type="info">
              <small>设置项目{{targetProjectName}}在kubernetes环境{{targetEnvName}}中，可以挂装持久化存储卷（PV），分配后自动在该环境下创建对应${pvName}-pvc的PVC。deploy-info-xxx.yaml中可以挂装该PVC</small>
            </v-alert>
            <v-form ref="allotPVRef">
              <v-autocomplete
                v-model="pvNames"
                :items="PVlist"
                multiple
                dense
                small-chips
                label="选择持久化卷PV（pvNames）*"
                :rules="[v => v.length>0 || 'PV为必选项']"
                hint="支持分配多个PV"
                persistent-hint
              ></v-autocomplete>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              text
              @click="() => {
                this.allotPVDialog = false
                this.$refs.allotPVRef.reset()
              }"
            >
              取消
            </v-btn>
            <v-btn
              color="primary"
              text
              @click="allotPV()"
            >
              确认
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog
        v-model="recyclingDialog"
        max-width="600px"
      >
        <v-card>
          <v-card-title>
            <span class="headline">移除持久化卷PV</span>
          </v-card-title>
          <v-card-text>
            <v-alert icon="mdi-alert-circle" prominent text type="error">
              <small>移除持久化卷将会把kubernetes环境{{deletePVForm.envName}}中的项目{{targetProjectName}}的PV {{deletePVForm.pvName}}以及对应的PVC删除。<v-chip small color="red">危险操作，请输入持久化卷PV名称。</v-chip></small>
            </v-alert>
            <v-form ref="deletePVRef">
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      label="持久化卷PV名称（pvName）*"
                      required
                      dense
                      v-model="deletePVName"
                      :rules="[v => !!v || '持久化卷PV名称为必填项']"
                      hint="确认要移除持久化卷PV吗？"
                      persistent-hint
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="blue darken-1"
              text
              @click="() => {
                this.recyclingDialog = false
                this.$refs.deletePVRef.reset()
              }"
            >
              取消
            </v-btn>
            <v-btn
              color="blue darken-1"
              text
              @click="deletePV()"
            >
              确认
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog
        v-model="hostConfigDialog"
        max-width="600px"
      >
        <v-card>
          <v-card-title>
            <span class="headline">修改主机信息</span>
          </v-card-title>
          <v-card-text>
            <small></small>
            <v-form ref="updateHostRef">
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      label="主机地址（hostAddr）*"
                      dense
                      v-model="updateHostForm.hostAddr"
                      :rules="[v => !!v || '主机地址为必填项']"
                      hint="主机地址，格式例如：192.168.0.1或者主机名。"
                      persistent-hint
                    >
                    </v-text-field>
                  </v-col>
                </v-row>
                <v-row class="mb-2">
                  <v-col cols="12">
                    <v-combobox
                      label="主机分组（groups）"
                      dense
                      multiple
                      small-chips
                      hide-selected
                      v-model="updateHostForm.groups"
                      hint="设置主机所属分组，一个主机支持属于多个分组，进行制品发布的时候，可以把制品发布到特定分组的一批主机上。输入分组后请按回车，回车自动创建分组，格式例如：backend_group frontend_group"
                      persistent-hint
                      append-icon=""
                    >
                    </v-combobox>
                  </v-col>
                </v-row>
                <small class="my-3">主机变量（variables）</small>
                <v-icon color="success" class="input-btn" @click="addInputBox()">mdi-plus-box</v-icon>
                <div class="host-variables">
                  <div class="d-flex align-center" v-for="(item, index) in variableList">
                    <v-row class="mr-1">
                      <v-col cols="6">
                        <v-text-field
                          prefix="变量名："
                          dense
                          v-model="item[0]"
                        >
                        </v-text-field>
                      </v-col>
                      <v-col cols="6">
                        <v-text-field
                          prefix="变量值："
                          dense
                          v-model="item[1]"
                        >
                        </v-text-field>
                      </v-col>
                    </v-row>
                    <v-icon color="error" class="input-btn" @click="deleteInputBox(index)">mdi-trash-can</v-icon>
                  </div>
                  <div class="mb-2">
                    <small>设置进行制品发布的时候，该主机所使用的变量，在ansible-playbook中，可以引用该变量，支持多个变量。变量名格式例如：test_var</small>
                  </div>
                </div>
                <v-row class="mt-2">
                  <v-col cols="12">
                    <v-text-field
                      label="主机SSH端口（hostPort）*"
                      dense
                      type="number"
                      v-model="updateHostForm.hostPort"
                      :rules="[v => !!v || '主机ssh端口为必填项']"
                      hint="主机的SSH远程连接端口。"
                      persistent-hint
                    >
                    </v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      label="主机SSH远程登录用户名（hostUser）*"
                      dense
                      v-model="updateHostForm.hostUser"
                      :rules="[v => !!v || '远程登录用户为必填项']"
                      hint="主机的SSH远程连接登录用户名。"
                      persistent-hint
                    >
                    </v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      label="主机SSH远程登录密码（hostPassword）*"
                      dense
                      type="password"
                      v-model="updateHostForm.hostPassword"
                      :type="hostPasswordDisplay2 ? 'text' : 'password'"
                      :append-icon="hostPasswordDisplay2 ? 'mdi-eye' : 'mdi-eye-off'"
                      @click:append="hostPasswordDisplay2 = !hostPasswordDisplay2"
                      :rules="[v => !!v || '远程登录密码必填项']"
                      hint="主机的SSH远程连接登录密码。"
                      persistent-hint
                    >
                    </v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12">
                    <v-select
                      label="是否需要切换用户（hostBecome）*"
                      :items="[ { text: '是', value: true }, { text: '否', value: false } ]"
                      dense
                      v-model="updateHostForm.hostBecome"
                      :rules="[v => typeof(v)== 'boolean' || '是否需要切换用户为必选项']"
                      hint="如果ssh登录后需要切换用户，请设置为需要切换用户"
                      persistent-hint
                    >
                    </v-select>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      label="登录后切换用户名（hostBecomeUser）"
                      dense
                      v-model="updateHostForm.hostBecomeUser"
                      hint="登录后切换用户名"
                      persistent-hint
                    >
                    </v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      label="登录后切换用户的密码（hostBecomePassword）"
                      dense
                      type="password"
                      v-model="updateHostForm.hostBecomePassword"
                      :type="hostBecomePasswordDisplay2 ? 'text' : 'password'"
                      :append-icon="hostBecomePasswordDisplay2 ? 'mdi-eye' : 'mdi-eye-off'"
                      @click:append="hostBecomePasswordDisplay2 = !hostBecomePasswordDisplay2"
                      hint="如果ssh登录后需要切换用户，需要提供切换用户的密码"
                      persistent-hint
                    >
                    </v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="blue darken-1"
              text
              @click="() => {
                this.hostConfigDialog = false
                this.$refs.updateHostRef.resetValidation()
              }"
            >
              取消
            </v-btn>
            <v-btn
              color="blue darken-1"
              text
              @click="updateHost()"
            >
              确认
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog
        v-model="deleteHostDialog"
        max-width="600px"
      >
        <v-card>
          <v-card-title>
            <span class="headline">删除主机</span>
          </v-card-title>
          <v-card-text>
            <v-form ref="deleteHostRef">
              <v-alert icon="mdi-alert-circle" prominent text type="error">
                <small>如果主机{{deleteHostForm.hostName}}只配置多个项目环境之下，所有项目环境下该主机信息都会删除。<v-chip small color="red">危险操作，请输入主机名标识。</v-chip></small>
              </v-alert>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      label="主机名标识（hostName）*"
                      required
                      dense
                      v-model="deleteHostName"
                      :rules="[v => !!v || '主机名称为必填项']"
                      :hint="`确认要将主机${deleteHostForm.hostName}从项目环境移除吗？`"
                      persistent-hint
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="blue darken-1"
              text
              @click="() => {
                this.deleteHostDialog = false
                this.$refs.deleteHostRef.reset()
              }"
            >
              取消
            </v-btn>
            <v-btn
              color="blue darken-1"
              text
              @click="envHostDelete()"
            >
              确认
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog
        v-model="modifyDBDialog"
        max-width="600px"
      >
        <v-card>
          <v-card-title>
            <span class="headline">修改数据库</span>
          </v-card-title>
          <v-card-text>
            <small></small>
            <v-form ref="updateDbRef">
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      label="数据库的JDBC连接URL（dbUrl）*"
                      dense
                      v-model="updateDbForm.dbUrl"
                      :rules="[v => !!v || '数据库连接的JDBC连接串为必填项']"
                      hint="支持不同类型的关系数据库，格式例如：jdbc:mysql://192.168.0.1:3306/testdb。"
                      persistent-hint
                    >
                    </v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      label="数据库用户名（dbUser）*"
                      dense
                      v-model="updateDbForm.dbUser"
                      :rules="[v => !!v || '数据库用户名为必填项']"
                    >
                    </v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      label="数据库密码（dbPassword）*"
                      dense
                      :type="updateDbPasswordDisplay ? 'text' : 'password'"
                      :append-icon="updateDbPasswordDisplay ? 'mdi-eye' : 'mdi-eye-off'"
                      @click:append="updateDbPasswordDisplay = !updateDbPasswordDisplay"
                      :rules="[v => !!v || '数据库密码为必填项']"
                      v-model="updateDbForm.dbPassword"
                    >
                    </v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="blue darken-1"
              text
              @click="() => {
                this.$refs.updateDbRef.resetValidation()
                this.modifyDBDialog = false
              }"
            >
              取消
            </v-btn>
            <v-btn
              color="blue darken-1"
              text
              @click="updateDb()"
            >
              确认
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog
        v-model="allotDbDialog"
        max-width="600px"
      >
        <v-card>
          <v-card-title>
            <span class="headline">分配新数据库到环境</span>
          </v-card-title>
          <v-card-text>
            <v-alert icon="mdi-alert-circle" prominent text type="info">
              <small>分配新数据库到{{DbAddForm.envName}}环境，执行流水线的时候，可以对数据库进行数据库脚本执行与回滚。</small>
            </v-alert>
            <v-form ref="dbAddRef">
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      label="数据库名标识（dbName）*"
                      dense
                      v-model="DbAddForm.dbName"
                      :rules="[v => !!v || '数据库标识名字为必填项']"
                      hint="全局唯一的数据库名标识，建议格式为${projectName}-xxx，添加后不可修改，格式例如：test-project1-db01。"
                      persistent-hint
                    >
                    </v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      label="数据库的JDBC连接URL（dbUrl）*"
                      dense
                      v-model="DbAddForm.dbUrl"
                      :rules="[v => !!v || '数据库连接的JDBC连接串为必填项']"
                      hint="支持不同类型的关系数据库，格式例如：jdbc:mysql://192.168.0.1:3306/testdb。"
                      persistent-hint
                    >
                    </v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      label="数据库用户名（dbUser）*"
                      dense
                      v-model="DbAddForm.dbUser"
                      :rules="[v => !!v || '数据库用户名为必填项']"
                    >
                    </v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      label="数据库密码（dbPassword）*"
                      dense
                      :type="dbPasswordDisplay ? 'text' : 'password'"
                      :append-icon="dbPasswordDisplay ? 'mdi-eye' : 'mdi-eye-off'"
                      @click:append="dbPasswordDisplay = !dbPasswordDisplay"
                      v-model="DbAddForm.dbPassword"
                      :rules="[v => !!v || '数据库密码为必填项']"
                    >
                    </v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="blue darken-1"
              text
              @click="() => {
                this.allotDbDialog = false
                this.$refs.dbAddRef.reset()
              }"
            >
              取消
            </v-btn>
            <v-btn
              color="blue darken-1"
              text
              @click="dbAdd()"
            >
              确认
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog
        v-model="dbJoinDialog"
        max-width="600px"
      >
        <v-card>
          <v-card-title>
            <span class="headline">将数据库加入其他项目环境</span>
          </v-card-title>
          <v-card-text>
            <v-alert icon="mdi-alert-circle" prominent text type="info">
              <small>将数据库加入其他项目环境后，该项目所在的环境也能在该数据库执行或者回滚数据库脚本。（注意，如果修改该数据库信息，其他项目环境的数据库信息也会发生修改）</small>
            </v-alert>
            <v-form ref="dbJoinRef">
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-select
                      :items="projectEnvList"
                      label="请选择项目*"
                      dense
                      :rules="[v => !!v || '项目必填项']"
                      v-model="dbJoinForm.projectName"
                      @change="projectChange(dbJoinForm.projectName)"
                    ></v-select>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12">
                    <v-select
                      :items="projectEnvListChildren"
                      label="请选择环境*"
                      dense
                      :disabled="dbJoinForm.projectName ? false: true"
                      :rules="[v => !!v || '环境必填项']"
                      v-model="dbJoinForm.envName"
                    ></v-select>
                  </v-col>
                </v-row>
              </v-container>
              <!-- <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-treeview
                      activatable
                      return-object
                      :items="projectEnvs"
                      :active.sync="dbSelection"
                    ></v-treeview>
                    </v-text-field>
                  </v-col>
                </v-row>
              </v-container> -->
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="blue darken-1"
              text
              @click="() => {
                this.dbJoinDialog = false
                this.$refs.dbJoinRef.reset()
              }"
            >
              取消
            </v-btn>
            <v-btn
              color="blue darken-1"
              text
              @click="dbJoin()"
            >
              确认
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog
        v-model="dbLeaveDialog"
        max-width="600px"
      >
        <v-card>
          <v-card-title>
            <span class="headline">将数据库从项目环境移除</span>
          </v-card-title>
          <v-card-text>
            <v-alert icon="mdi-alert-circle" prominent text type="error">
              <small>如果数据库{{dbLeaveForm.dbName}}只配置在一个项目环境之下，将会删除该数据库信息。<v-chip small color="red">危险操作，请输入数据库名标识。</v-chip></small>
            </v-alert>
            <v-form ref="dbLeaveRef">
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      label="数据库名标识（dbName）*"
                      required
                      dense
                      v-model="leaveDbName"
                      :rules="[v => !!v || '数据库名标识为必填项']"
                      :hint="`确认要将数据库${dbLeaveForm.dbName}从项目环境移除吗？`"
                      persistent-hint
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="blue darken-1"
              text
              @click="() => {
                this.dbLeaveDialog = false
                this.$refs.dbLeaveRef.reset()
              }"
            >
              取消
            </v-btn>
            <v-btn
              color="blue darken-1"
              text
              @click="dbLeave()"
            >
              确认
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog
        v-model="deleteDBDialog"
        max-width="600px"
      >
        <v-card>
          <v-card-title>
            <span class="headline">删除数据库</span>
          </v-card-title>
          <v-card-text>
            <v-form ref="deleteDbNameRef">
              <v-alert icon="mdi-alert-circle" prominent text type="error">
                <small>如果数据库{{deleteDbForm.dbName}}只配置在一个项目环境之下，将会删除该数据库信息。<v-chip small color="red">危险操作，请输入数据库名标识。</v-chip></small>
              </v-alert>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      label="数据库名标识（dbName）*"
                      required
                      dense
                      v-model="deleteDbName"
                      :rules="[v => !!v || '数据库名称为必填项']"
                      :hint="`确认要将数据库${deleteDbForm.dbName}从项目环境移除吗？`"
                      persistent-hint
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="blue darken-1"
              text
              @click="() => {
                this.deleteDBDialog = false
                this.$refs.deleteDbNameRef.reset()
              }"
            >
              取消
            </v-btn>
            <v-btn
              color="blue darken-1"
              text
              @click="deleteDb()"
            >
              确认
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog
        v-model="handleDialog"
        max-width="600px"
      >
        <v-card>
          <v-card-title>
            <span class="headline">把环境从流水线移除</span>
          </v-card-title>
          <v-card-text>
            <v-alert icon="mdi-alert-circle" prominent text type="info">
              <small>移除环境配置后，该流水线无法发布应用到该环境</small>
            </v-alert>
            确认要把{{deletePipelineEnvForm.envName}}环境从流水线移除配置吗？
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="blue darken-1"
              text
              @click="handleDialog = false"
            >
              取消
            </v-btn>
            <v-btn
              color="blue darken-1"
              text
              @click="deletePipelineEnv()"
            >
              确认
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog
        v-model="refreshTokenDialog"
        max-width="600px"
      >
        <v-card>
          <v-card-title>
            <span class="headline">更新流水线token</span>
          </v-card-title>
          <v-card-text>
            <v-alert icon="mdi-alert-circle" prominent text type="info">
              <small>流水线token用于代码仓库的push事件自动触发构建，更新流水线token也会自动更新代码仓库的webhook。</small>
            </v-alert>
            确认要更新{{targetBranchName}}分支流水线的token吗？
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="blue darken-1"
              text
              @click="refreshTokenDialog = false"
            >
              取消
            </v-btn>
            <v-btn
              color="blue darken-1"
              text
              @click="refreshToken()"
            >
              确认
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog
        v-model="auditDialog"
        max-width="800px"
      >
        <v-card>
          <v-card-title>
            <span class="headline">查看详情</span>
          </v-card-title>
          <v-card-text id='log-container' style="overflow-x: scroll; background: #151515; color: #e0e0e0; position: relative; height: 300px;">
            <pre
              v-for="(logMsg, i) in logList"
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
              @click="closeLog()"
              :disabled="disableBtn"
              :loading="disableBtn"
            >
              确认
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog
        v-model="addDebugDialog"
        max-width="1100px"
        persistent
      >
        <v-card>
          <v-card-title>
            <span class="headline">
              {{ actionType === 'add' ? '新增调试组件' : '修改调试组件' }}
            </span>
            <v-spacer></v-spacer>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn class="mx-4 yaml-btn" small v-bind="attrs" v-on="on">
                  <v-icon color="primary" @click="previewDebugYaml()">mdi-cube-scan</v-icon>
                </v-btn>
              </template>
              <div>查看YAML定义</div>
            </v-tooltip>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-icon color="primary" v-bind="attrs" v-on="on" @click="addDebug()">mdi-progress-upload</v-icon>
              </template>
              <div>提交更新</div>
            </v-tooltip>
            <v-icon class="ml-4" @click="() => {
              this.addDebugDialog = false
              this.$refs.addDebugRef.resetValidation()
            }">
              mdi-close
            </v-icon>
          </v-card-title>
          <v-card-text>
            <v-form ref="addDebugRef">
              <v-alert icon="mdi-alert-circle" prominent text type="info">
                <small>调试组件包含两个组件，ssh-debug（命令行调试组件）和vnc-debug（图形化调试组件），用于在项目的kubernetes名字空间里边进行项目调试用途。</small>
              </v-alert>
              <v-container>
                <div class="form-item-100">
                  <div>ssh-debug容器资源配额(debugSSH)*</div>
                  <div class="d-flex justify-space-between mt-4">
                    <div class="form-item-20 d-flex align-center">
                      <v-text-field
                        label="请求分配的内存资源(memoryRequest)*"
                        dense
                        v-model="addDebugForm.debugSSH.memoryRequest"
                        :rules="[v => !!v || '请求分配的内存资源为必填项']"
                      />
                      <v-tooltip right max-width="250px">
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                        </template>
                        <div style="font-size: 12px;">
                          <div>100Mi表示100M内存，1Gi表示1G内存</div>
                        </div>
                      </v-tooltip>
                    </div>
                    <div class="form-item-20 d-flex align-center">
                      <v-text-field
                        label="最大分配内存资源(memoryLimit)*"
                        dense
                        v-model="addDebugForm.debugSSH.memoryLimit"
                        :rules="[v => !!v || '最大分配内存资源为必填项']"
                      />
                      <v-tooltip right max-width="250px">
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                        </template>
                        <div style="font-size: 12px;">
                          <div>200Mi表示200M内存，1Gi表示1G内存</div>
                        </div>
                      </v-tooltip>
                    </div>
                    <div class="form-item-20 d-flex align-center">
                      <v-text-field
                        label="请求分配的CPU资源(cpuRequest)*"
                        dense
                        v-model="addDebugForm.debugSSH.cpuRequest"
                        :rules="[v => !!v || '请求分配的CPU资源为必填项']"
                      />
                      <v-tooltip right max-width="250px">
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                        </template>
                        <div style="font-size: 12px;">
                          <div>100m表示0.1，表示0.1个CPU</div>
                        </div>
                      </v-tooltip>
                    </div>
                    <div class="form-item-20 d-flex align-center">
                      <v-text-field
                        label="最大分配的CPU资源(cpuLimit)*"
                        dense
                        v-model="addDebugForm.debugSSH.cpuLimit"
                        :rules="[v => !!v || '最大分配的CPU资源为必填项']"
                      />
                      <v-tooltip right max-width="250px">
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                        </template>
                        <div style="font-size: 12px;">
                          <div>100m表示0.1，表示0.1个CPU</div>
                        </div>
                      </v-tooltip>
                    </div>
                  </div>
                </div>
                <div class="form-item-100">
                  <div>vnc-debug容器资源配额(debugVNC)*</div>
                  <div class="d-flex justify-space-between mt-4">
                    <div class="form-item-20 d-flex align-center">
                      <v-text-field
                        label="请求分配的内存资源(memoryRequest)*"
                        dense
                        v-model="addDebugForm.debugVNC.memoryRequest"
                        :rules="[v => !!v || '请求分配的内存资源为必填项']"
                      />
                      <v-tooltip right max-width="250px">
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                        </template>
                        <div style="font-size: 12px;">
                          <div>100Mi表示100M内存，1Gi表示1G内存</div>
                        </div>
                      </v-tooltip>
                    </div>
                    <div class="form-item-20 d-flex align-center">
                      <v-text-field
                        label="最大分配内存资源(memoryLimit)*"
                        dense
                        v-model="addDebugForm.debugVNC.memoryLimit"
                        :rules="[v => !!v || '最大分配内存资源为必填项']"
                      />
                      <v-tooltip right max-width="250px">
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                        </template>
                        <div style="font-size: 12px;">
                          <div>200Mi表示200M内存，1Gi表示1G内存</div>
                        </div>
                      </v-tooltip>
                    </div>
                    <div class="form-item-20 d-flex align-center">
                      <v-text-field
                        label="请求分配的CPU资源(cpuRequest)*"
                        dense
                        v-model="addDebugForm.debugVNC.cpuRequest"
                        :rules="[v => !!v || '请求分配的CPU资源为必填项']"
                      />
                      <v-tooltip right max-width="250px">
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                        </template>
                        <div style="font-size: 12px;">
                          <div>100m表示0.1，表示0.1个CPU</div>
                        </div>
                      </v-tooltip>
                    </div>
                    <div class="form-item-20 d-flex align-center">
                      <v-text-field
                        label="最大分配的CPU资源(cpuLimit)*"
                        dense
                        v-model="addDebugForm.debugVNC.cpuLimit"
                        :rules="[v => !!v || '最大分配的CPU资源为必填项']"
                      />
                      <v-tooltip right max-width="250px">
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                        </template>
                        <div style="font-size: 12px;">
                          <div>100m表示0.1，表示0.1个CPU</div>
                        </div>
                      </v-tooltip>
                    </div>
                  </div>
                </div>
              </v-container>
            </v-form>
          </v-card-text>
        </v-card>
      </v-dialog>
      <v-dialog
        v-model="defaultDebugDialog"
        max-width="800px"
        persistent
        eager
      >
        <v-card>
          <v-card-title>
            <span class="headline">{{defaultDialogTitle}}</span>
          </v-card-title>
          <v-card-text>
            <v-form ref="addComponentRef">
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <Monaco
                      ref="monaco2"
                      :monacoOptions="singleMonacoOptions"
                      :height="400"
                    ></Monaco>
                  </v-col>
                </v-row>
              </v-container>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="blue darken-1"
              text
              @click="() => {
                this.defaultDebugDialog = false
                this.$refs.monaco2.monacoEditor.setValue('')
              }"
            >
              确认
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog
        v-model="deleteDebugDialog"
        max-width="600px"
      >
        <v-card>
          <v-card-title>
            <span class="headline">删除调试组件</span>
          </v-card-title>
          <v-card-text>
            <v-alert icon="mdi-alert-circle" prominent text type="error">
              <small>在项目的kubernetes环境中，删除ssh-debug（命令行调试组件）和vnc-debug（图形化调试组件）两个调试组件。<v-chip small color="red">危险操作，请输入环境名标识。</v-chip></small>
            </v-alert>
            <v-form ref="deleteDebugRef">
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      label="环境名（envName）*"
                      required
                      dense
                      v-model="deleteDebugName"
                      :rules="[v => !!v || '环境名为必填项']"
                      :hint="`确认要将调试组件从项目${deleteDebugForm.envName}环境移除吗？`"
                      persistent-hint
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="blue darken-1"
              text
              @click="() => {
                this.deleteDebugDialog = false
                this.$refs.deleteDebugRef.reset()
              }"
            >
              取消
            </v-btn>
            <v-btn
              color="blue darken-1"
              text
              @click="deleteDebug()"
            >
              确认
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog
        v-model="addComponentDialog"
        max-width="1100px"
        persistent
      >
        <v-card :loading="dialogLoading">
          <v-card-title>
            <span class="headline">新增组件</span>
            <v-spacer></v-spacer>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn class="mx-4 yaml-btn" small v-bind="attrs" v-on="on">
                  <v-icon color="primary" @click="previewComponent()">mdi-cube-scan</v-icon>
                </v-btn>
              </template>
              <div>查看YAML定义</div>
            </v-tooltip>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-icon color="primary" v-bind="attrs" v-on="on" @click="addComponent()">mdi-progress-upload</v-icon>
              </template>
              <div>提交更新</div>
            </v-tooltip>
            <v-icon class="ml-4" @click="() => {
              this.addComponentDialog = false
              this.$refs.addComponentRef.resetValidation()
            }">
              mdi-close
            </v-icon>
          </v-card-title>
          <v-card-text>
            <v-form ref="addComponentRef">
              <v-alert icon="mdi-alert-circle" prominent text type="info">
                <small>在项目的kubernetes名字空间中部署中间件组件，例如mysql、redis、nginx等。</small>
              </v-alert>
              <div class="form-item-100 d-flex justify-space-between">
                <div class="form-item-45">
                  <v-select
                    label="选择组件模板"
                    required
                    :items="componentList"
                    dense
                    v-model="addComponentForm"
                  ></v-select>
                </div>
                <div class="form-item-45">
                  <v-text-field
                    label="组件说明（componentDesc）*"
                    required
                    dense
                    :rules="[v => !!v || '组件模板说明为必填项']"
                    v-model="addComponentForm.componentTemplateDesc"
                  ></v-text-field>
                </div>
              </div>
              <div class="form-row d-flex justify-space-between">
                <div class="form-item">
                  <v-text-field
                    label="容器发布模块名称(deployName)*"
                    dense
                    v-model="addComponentForm.deploySpecStatic.deployName"
                    :rules="[v => !!v || '容器发布模块名称为必填项']"
                  />
                </div>
                <div class="form-item d-flex align-center">
                  <v-text-field
                    label="镜像名称(deployImage)*"
                    dense
                    v-model="addComponentForm.deploySpecStatic.deployImage"
                    :rules="[v => !!v || '镜像名称为必填项']"
                  />
                  <v-tooltip right max-width="200px">
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                    </template>
                    <div style="font-size: 12px;">
                      <div>可以填写hub.docker.io上的公网镜像名称，流水线会自动拉取公网镜像，建议不要使用latest标签的镜像</div>
                      <div>也可以填写harbor中的基础镜像</div>
                    </div>
                  </v-tooltip>
                </div>
                <div class="form-item">
                  <v-text-field
                    label="应用启动的副本实例数(deployReplicas)*"
                    dense
                    type="number"
                    v-model="addComponentForm.deploySpecStatic.deployReplicas"
                    :rules="[v => !!v && v > 0 || '应用启动的副本实例数为必填项']"
                  >
                  </v-text-field>
                </div>
              </div>
              <div class="form-row mt-4">
                <div class="form-item">
                  <v-spacer></v-spacer>
                  <v-select
                    :items="[
                      { text: '应用的资源配额设置', value: 'deployResources' },
                      { text: '杂项', value: '杂项' },
                      { text: '服务端口设置', value: '服务端口设置' },
                      { text: '应用挂装存储设置', value: 'deployVolumes' },
                      { text: '应用状态检查设置', value: 'deployHealthCheck' },
                      { text: '服务依赖', value:'dependServices' },
                      { text: '应用容器主机名解析', value: 'hostAliases' },
                      { text: '启动应用使用的用户和用户组配置', value: 'securityContext' },
                    ]"
                    dense
                    label="选择添加配置参数"
                    @change="chooseParams($event)"
                  ></v-select>
                </div>
                <div class="form-item-100 params-item" v-if="addComponentForm.deploySpecStatic.deployResources.cpuLimit !== '' || addComponentForm.deploySpecStatic.deployResources.cpuRequest !== '' || addComponentForm.deploySpecStatic.deployResources.memoryLimit !== '' || addComponentForm.deploySpecStatic.deployResources.memoryRequest !== ''" :id="'deployResources-add'">
                  <div>
                    应用的资源配额设置(deployResources)
                    <v-tooltip right max-width="200px">
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                      </template>
                      <span style="font-size: 12px;">给应用分配多少cpu和内存资源</span>
                    </v-tooltip>
                    <v-icon color="error" class="ml-4" @click="clearParams('deployResources')">mdi-minus-circle-outline</v-icon>
                  </div>
                  <div class="params-content d-flex justify-space-between mt-4" v-if="addComponentForm.deploySpecStatic.deployResources">
                    <div class="form-item-20 d-flex">
                      <v-text-field
                        label="内存请求配额(memoryRequest)*"
                        dense
                        v-model="addComponentForm.deploySpecStatic.deployResources.memoryRequest"
                        :rules="[v => !!v || '内存请求配额为必填项']"
                      />
                      <v-tooltip right max-width="200px">
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                        </template>
                        <span style="font-size: 12px;">应用预占的内存，所有应用的预占内存总量如超过节点内存总量将无法启动应用（100Mi表示100M内存，1Gi表示1G内存）</span>
                      </v-tooltip>
                    </div>
                    <div class="form-item-20 d-flex">
                      <v-text-field
                        label="内存最大配额(memoryLimit)*"
                        dense
                        v-model="addComponentForm.deploySpecStatic.deployResources.memoryLimit"
                        :rules="[v => !!v || '内存最大配额为必填项']"
                      />
                      <v-tooltip right max-width="200px">
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                        </template>
                        <span style="font-size: 12px;">应用可以分配的最大内存资源，所有应用的最大内存配额总量可以超过节点内存总量（200Mi表示200M内存，1Gi表示1G内存）</span>
                      </v-tooltip>
                    </div>
                    <div class="form-item-20 d-flex">
                      <v-text-field
                        label="cpu请求配额(cpuRequest)*"
                        dense
                        v-model="addComponentForm.deploySpecStatic.deployResources.cpuRequest"
                        :rules="[v => !!v || 'cpu请求配额为必填项']"
                      />
                      <v-tooltip right max-width="200px">
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                        </template>
                        <span style="font-size: 12px;">应用预占的cpu，所有应用的预占cpu总量如超过节点cpu总量将无法启动应用（100m表示0.1，表示0.1个CPU）</span>
                      </v-tooltip>
                    </div>
                    <div class="form-item-20 d-flex">
                      <v-text-field
                        label="cpu最大配额(cpuLimit)*"
                        dense
                        v-model="addComponentForm.deploySpecStatic.deployResources.cpuLimit"
                        :rules="[v => !!v || 'cpu最大配额为必填项']"
                      />
                      <v-tooltip right max-width="200px">
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                        </template>
                        <span style="font-size: 12px;">应用可以分配的最大cpu资源，所有应用的最大cpu配额总量可以超过节点cpu总量（100m表示0.1，表示0.1个CPU）</span>
                      </v-tooltip>
                    </div>
                  </div>
                </div>
                <div class="form-item-100 params-item" v-show="addComponentForm.deploySpecStatic.deployCommand !== '' || addComponentForm.deploySpecStatic.deployEnvs !== null || addComponentForm.deploySpecStatic.deploySessionAffinityTimeoutSeconds !== 0 || addComponentForm.deploySpecStatic.deployArgs !== null" :id="'杂项-add'">
                  <div>杂项 <v-icon color="error" class="ml-4" @click="clearParams('other')">mdi-minus-circle-outline</v-icon></div>
                  <div class="params-content d-flex justify-space-between mt-4">
                    <div class="form-item">
                      <small>环境变量(deployEnvs)</small>
                      <v-icon color="success" class="ml-4" @click="addDeployEnvs()">mdi-table-plus</v-icon>
                      <div class="env-item d-flex justify-space-between" v-for="(row, i) in addComponentForm.deploySpecStatic.deployEnvs" :key="i" v-if="addComponentForm.deploySpecStatic.deployEnvs">
                        <div class="form-item-45 mt-4">
                          <v-text-field
                            label="变量名*"
                            dense
                            v-model="row[0]"
                            :rules="[v => !!v || '环境变量名为必填项']"
                          />
                        </div>
                        <div class="form-item-45 mt-4">
                          <v-text-field
                            label="变量值*"
                            dense
                            v-model="row[1]"
                            :rules="[v => !!v || '环境变量值为必填项']"
                          />
                        </div>
                        <div>
                          <v-icon color="error" class="mt-4" @click="deleteDeployEnvs(i)">mdi-trash-can-outline</v-icon>
                        </div>
                      </div>
                      <div><small class="tip-color">应用容器中的环境变量设置</small></div>
                    </div>
                    <div class="form-item-45 d-flex align-center">
                      <v-combobox
                        label="命令行的启动参数(deployArgs)"
                        dense
                        multiple
                        small-chips
                        hide-selected
                        v-model="addComponentForm.deploySpecStatic.deployArgs"
                        append-icon=""
                      />
                    </div>
                    <div class="form-item-15 d-flex align-center">
                      <v-text-field
                        label="会话持久时间(deploySessionAffinityTimeoutSeconds)"
                        dense
                        type="number"
                        v-model="addComponentForm.deploySpecStatic.deploySessionAffinityTimeoutSeconds"
                      />
                      <v-tooltip right max-width="200px">
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                        </template>
                        <span style="font-size: 12px;">对于多实例的有状态服务，如果需要启用session sticky支持，需要设置session sticky超时时间，单位秒</span>
                      </v-tooltip>
                    </div>
                  </div>
                  <div class="form-item-100 mt-4">
                    <v-text-field
                      label="启动应用命令行(deployCommand)"
                      dense
                      v-model="addComponentForm.deploySpecStatic.deployCommand"
                    />
                  </div>
                </div>
                <div class="form-item-100 params-item" :id="'服务端口设置-add'" v-if="addComponentForm.deploySpecStatic.deployNodePorts !== null || addComponentForm.deploySpecStatic.deployLocalPorts !== null">
                  <div class="form-item-45 mt-4 d-flex align-center">
                    <v-select
                      :items="[
                        { text: '模块的内部端口设置', value: 'deployLocalPorts' },
                        { text: '模块的NodePort端口设置', value: 'deployNodePorts' },
                      ]"
                      dense
                      :value="addComponentForm.deploySpecStatic.deployLocalPorts === null ? 'deployNodePorts' : 'deployLocalPorts'"
                      label="选择添加配置参数"
                      @change="changePortSet($event)"
                    ></v-select>
                    <v-icon color="error" class="ml-4" @click="clearParams('portSetting')">mdi-minus-circle-outline</v-icon>
                  </div>
                  <div class="form-item-100" v-if="addComponentForm.deploySpecStatic.deployLocalPorts !== null" :id="'deployLocalPorts-'">
                    <div>
                      模块的内部端口设置(deployLocalPorts)
                      <v-tooltip right max-width="200px">
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                        </template>
                        <div style="font-size: 12px;">
                          <div>假如模块应用不需要在kubernetes集群外被访问，那么设置内部端口即可</div>
                          <div>选择后不能选deployNodePorts</div>
                        </div>
                      </v-tooltip>
                      <v-icon color="success" class="mx-4" @click="addDeployLocalPort()">mdi-table-plus</v-icon> 
                    </div>
                    <div class="params-content d-flex justify-space-between mt-4" v-for="(row, i) in addComponentForm.deploySpecStatic.deployLocalPorts">
                      <div class="form-item-45">
                        <v-text-field
                          label="模块的内部服务端口号(port)*"
                          dense
                          type="number"
                          v-model="row.port"
                          :rules="[v => !!v || '模块的内部服务端口号为必填项']"
                        />
                      </div>
                      <div class="form-item-45">
                        <v-select
                          :items="[ 'http', 'tcp' ]"
                          label="协议类型(protocol)*"
                          dense
                          v-model="row.protocol"
                          :rules="[v => !!v || '协议类型为必填项']"
                        />
                      </div>
                      <div>
                        <div>
                          <v-icon color="success" class="mr-4" @click="copyDeployLocalPort(i)">mdi-content-copy</v-icon>
                          <v-icon color="error" @click="deleteDeployLocalPort(i)">mdi-trash-can-outline</v-icon>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="form-item-100" v-if="addComponentForm.deploySpecStatic.deployNodePorts !== null" :id="'deployNodePorts-'">
                    <div>
                      模块的NodePort端口设置(deployNodePorts)
                      <v-tooltip right max-width="200px">
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                        </template>
                        <div style="font-size: 12px;">
                          <div>模块应用需要在kubernetes集群外被访问的时候，需要通过NodePort端口对外提供服务</div>
                          <div>选择后不能选deployLocalPorts</div>
                        </div>
                      </v-tooltip>
                      <v-icon color="success" class="mx-4" @click="addDeployNodePort()">mdi-table-plus</v-icon> 
                    </div>
                    <div class="params-content d-flex justify-space-between mt-4" v-for="(row, i) in addComponentForm.deploySpecStatic.deployNodePorts">
                      <div class="form-item">
                        <v-text-field
                          label="模块的内部服务端口号(port)*"
                          dense
                          type="number"
                          v-model="row.port"
                          :rules="[v => !!v || '模块的内部服务端口号为必填项']"
                        />
                      </div>
                      <div class="form-item">
                        <v-select
                          :items="[ 'http', 'tcp' ]"
                          label="协议类型(protocol)*"
                          dense
                          v-model="row.protocol"
                          :rules="[v => !!v || '协议类型为必填项']"
                        />
                      </div>
                      <div class="form-item d-flex">
                        <v-select
                          :items="project.nodePorts"
                          label="模块的外部服务端口号(nodePort)*"
                          dense
                          v-model="row.nodePort"
                          :rules="[v => !!v || '模块的外部服务端口号为必填项']"
                          hint="访问该服务的域名"
                          persistent-hint
                        />
                        <v-tooltip right max-width="200px">
                          <template v-slot:activator="{ on, attrs }">
                            <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                          </template>
                          <div style="font-size: 12px;">
                            <div>kubernetes集群外通过访问NodePort可以访问到模块的内部端口，请保证项目的管理控制台该nodePort可用，并且nodePort没有复用，否则会无法发布应用。</div>
                          </div>
                        </v-tooltip>
                      </div>
                      <div>
                        <v-icon color="success" class="mr-4" @click="copyDeployNodePort(i)">mdi-content-copy</v-icon>
                        <v-icon color="error" @click="deleteDeployNodePort(i)">mdi-trash-can-outline</v-icon>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="form-item-100 params-item" v-show="addComponentForm.deploySpecStatic.deployVolumes !== null" :id="'deployVolumes-add'">
                  <div>
                    应用挂装存储设置(deployVolumes)
                    <v-tooltip right max-width="200px">
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                      </template>
                      <span style="font-size: 12px;">该应用哪些目录或者文件需要进行持久化到共享存储</span>
                    </v-tooltip>
                    <v-icon color="success" class="ml-4" @click="addDeployVolumes()">mdi-table-plus</v-icon> 
                    <v-icon color="error" class="ml-4" @click="clearParams('deployVolumes')">mdi-minus-circle-outline</v-icon>
                  </div>
                  <div class="params-content d-flex justify-space-between mt-4" v-for="(row, i) in addComponentForm.deploySpecStatic.deployVolumes">
                    <div class="form-item">
                      <v-text-field
                        label="容器中挂装的目录或文件的绝对路径(pathInPod)*"
                        dense
                        v-model="row.pathInPod"
                        :rules="[v => !!v || '容器中挂装的目录或文件的绝对路径为必填项']"
                      />
                    </div>
                    <div class="form-item">
                      <v-text-field
                        label="持久化卷pvc中目录或文件的相对路径(pathInPv)*"
                        dense
                        v-model="row.pathInPv"
                        :rules="[v => !!v || '持久化卷pvc中目录或文件的相对路径为必填项']"
                      />
                    </div>
                    <div class="form-item d-flex">
                      <v-select
                        :items="pvs || []"
                        item-value="pvcName"
                        item-text="pvcName"
                        label="挂装的pvc名字(pvc)"
                        dense
                        v-model="row.pvc"
                        hint="如果使用默认pvc请不要填写"
                        persistent-hint
                      />
                    </div>
                    <div>
                      <v-icon color="success" class="mr-4" @click="copyDeployVolumes(i)">mdi-content-copy</v-icon>
                      <v-icon color="error" @click="deleteDeployVolumes(i)">mdi-trash-can-outline</v-icon>
                    </div>
                  </div>
                </div>
                <div class="form-item-100 params-item" v-if="addComponentForm.deploySpecStatic.deployHealthCheck.livenessDelaySeconds !== 0 || addComponentForm.deploySpecStatic.deployHealthCheck.livenessPeriodSeconds !== 0 || addComponentForm.deploySpecStatic.deployHealthCheck.readinessDelaySeconds !== 0 || addComponentForm.deploySpecStatic.deployHealthCheck.readinessPeriodSeconds !== 0 || addComponentForm.deploySpecStatic.deployHealthCheck.checkPort !== 0 || addComponentForm.deploySpecStatic.deployHealthCheck.httpGet.port !== 0 || addComponentForm.deploySpecStatic.deployHealthCheck.httpGet.path !== '' || addComponentForm.deploySpecStatic.deployHealthCheck.httpGet.httpHeaders !== null" :id="'deployHealthCheck-add'">
                  <div>
                    应用状态检查设置(deployHealthCheck)
                    <v-tooltip right max-width="200px">
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon small class="mx-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                      </template>
                      <span style="font-size: 12px;">检查应用是否能正常对外提供服务，如果不能正常对外提供服务则进行重启或者标记服务不可访问</span>
                    </v-tooltip>
                    <v-icon color="error" @click="clearParams('deployHealthCheck')">mdi-minus-circle-outline</v-icon>
                  </div>
                  <div class="params-content d-flex justify-space-between mt-4">
                    <div class="form-item-20 d-flex align-center">
                      <v-text-field
                        label="启动容器后等待多长时间才启动可访问性检查(readinessDelaySeconds)*"
                        dense
                        v-model="addComponentForm.deploySpecStatic.deployHealthCheck.readinessDelaySeconds"
                        :rules="[v => v >= 0 && v!== '' || '启动容器后等待多长时间才启动可访问性检查为必填项']"
                        type="number"
                      />
                      <v-tooltip right max-width="200px">
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                        </template>
                        <div style="font-size: 12px;">
                          <div>如果检查通过service才可以正常对外访问，单位秒</div>
                        </div>
                      </v-tooltip>
                    </div>
                    <div class="form-item-20 d-flex align-center">
                      <v-text-field
                        label="多长时间间隔进行一次可访问性检查(readinessPeriodSeconds)*"
                        dense
                        v-model="addComponentForm.deploySpecStatic.deployHealthCheck.readinessPeriodSeconds"
                        :rules="[v => v >= 0 && v!== '' || '多长时间间隔进行一次可访问性检查为必填项']"
                        type="number"
                      />
                      <v-tooltip right max-width="200px">
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                        </template>
                        <div style="font-size: 12px;">
                          <div>如果检查通过service才可以正常对外访问，单位秒</div>
                        </div>
                      </v-tooltip>
                    </div>
                    <div class="form-item-20 d-flex align-center">
                      <v-text-field
                        label="启动容器后等待多长时间才启动服务异常检查(livenessDelaySeconds)*"
                        dense
                        v-model="addComponentForm.deploySpecStatic.deployHealthCheck.livenessDelaySeconds"
                        :rules="[v => v >= 0 && v!== '' || '启动容器后等待多长时间才启动服务异常检查为必填项']"
                        type="number"
                      />
                      <v-tooltip right max-width="200px">
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                        </template>
                        <div style="font-size: 12px;">
                          <div>如果检查不通过容器将会自动重启，单位秒</div>
                        </div>
                      </v-tooltip>
                    </div>
                    <div class="form-item-20 d-flex align-center">
                      <v-text-field
                        label="多长时间间隔进行一次服务异常检查(livenessPeriodSeconds)*"
                        dense
                        v-model="addComponentForm.deploySpecStatic.deployHealthCheck.livenessPeriodSeconds"
                        :rules="[v => v >= 0 && v!== '' || '多长时间间隔进行一次服务异常检查为必填项']"
                        type="number"
                      />
                      <v-tooltip right max-width="200px">
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                        </template>
                        <div style="font-size: 12px;">
                          <div>如果检查不通过容器将会自动重启，单位秒</div>
                        </div>
                      </v-tooltip>
                    </div>
                  </div>
                  <div class="params-content d-flex justify-space-between">
                    <div class="form-item-100">
                      <div class="form-item-20">
                        <v-select
                          :items="[ 'httpGet', 'checkPort' ]"
                          label="选择httpGet或checkPort"
                          @change="checkChange($event)"
                          hint="checkPort和httpGet必须选其一"
                          persistent-hint
                          :value="addComponentForm.deploySpecStatic.deployHealthCheck.checkPort === 0 ? 'httpGet' : 'checkPort'"
                        ></v-select>
                      </div>
                      <div class="mt-4" v-if="addComponentForm.deploySpecStatic.deployHealthCheck.checkPort !== 0">
                        <v-text-field
                          label="检查tcp端口是否可连接(checkPort)*"
                          dense
                          v-model="addComponentForm.deploySpecStatic.deployHealthCheck.checkPort"
                          :rules="[v => !!v || '检查tcp端口是否可连接为必填项']"
                          type="number"
                        />
                      </div>
                      <div v-if="addComponentForm.deploySpecStatic.deployHealthCheck.checkPort === 0">
                        <small>通过http get方法检查是否可连接(httpGet)*</small>
                        <div class="d-flex justify-space-between mt-4">
                          <div class="form-item-45">
                            <v-text-field
                              label="本应用的http路径(path)*"
                              dense
                              v-model="addComponentForm.deploySpecStatic.deployHealthCheck.httpGet.path"
                              :rules="[v => !!v || '本应用的http路径为必填项']"
                            />
                          </div>
                          <div class="form-item-45">
                            <v-text-field
                              label="本应用的http端口(port)*"
                              dense
                              v-model="addComponentForm.deploySpecStatic.deployHealthCheck.httpGet.port"
                              :rules="[v => !!v || '本应用的http端口为必填项']"
                              type="number"
                            />
                          </div>
                        </div>
                        <small>请求中自定义的HTTP头(httpHeaders)</small>
                        <v-tooltip right max-width="200px">
                          <template v-slot:activator="{ on, attrs }">
                            <v-icon small class="mx-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                          </template>
                          <div style="font-size: 12px;">
                            <div>通过http get方法访问指定路径和端口返回的状态码，如果状态码返回2XX-3XX则表示服务正常</div>
                            <div>建议每个应用单独开发一个http-get方式获取服务健康状态controller</div>
                          </div>
                        </v-tooltip>
                        <v-icon color="success" class="ml-4" @click="addHttpHeaders()">mdi-table-plus</v-icon>
                        <div v-for="(row, i) in addComponentForm.deploySpecStatic.deployHealthCheck.httpGet.httpHeaders" :key="i">
                          <div class="d-flex justify-space-between mt-4">
                            <div class="form-item-45">
                              <v-text-field
                                label="httpHeader名称(name)*"
                                dense
                                v-model="row.name"
                                :rules="[v => !!v || 'httpHeader名称为必填项']"
                              />
                            </div>
                            <div class="form-item-45">
                              <v-text-field
                                label="httpHeader值(value)*"
                                dense
                                v-model="row.value"
                                :rules="[v => !!v || 'httpHeader值为必填项']"
                              />
                            </div>
                            <div>
                              <v-icon color="success" class="mr-4" @click="copyHttpHeaders(i)">mdi-content-copy</v-icon>
                              <v-icon color="error" @click="deleteHttpHeaders(i)">mdi-trash-can-outline</v-icon>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="form-item-100 params-item" v-show="addComponentForm.deploySpecStatic.dependServices !== null" :id="'dependServices-add'">
                  <div>
                    服务依赖(dependServices)
                    <v-tooltip right max-width="200px">
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                      </template>
                      <div style="font-size: 12px;">
                        启动该服务前必须先保证哪个服务的哪个端口先启动，如果有多个服务依赖请注意依赖的先后顺序
                      </div>
                    </v-tooltip>
                    <v-icon color="success" class="ml-4" @click="addDependServices()">mdi-table-plus</v-icon> 
                    <v-icon color="error" class="ml-4" @click="clearParams('dependServices')">mdi-minus-circle-outline</v-icon>
                  </div>
                  <div class="params-content d-flex justify-space-between mt-4" v-for="(row, i) in addComponentForm.deploySpecStatic.dependServices">
                    <div class="form-item">
                      <v-text-field
                        label="依赖的服务名(dependName)*"
                        dense
                        v-model="row.dependName"
                        :rules="[v => !!v || '依赖的服务名为必填项']"
                        hint="可以是集群内的服务名，也可以是集群外的ip地址或者主机名"
                        persistent-hint
                      />
                    </div>
                    <div class="form-item">
                      <v-text-field
                        label="依赖的服务端口(dependPort)*"
                        dense
                        v-model="row.dependPort"
                        :rules="[v => !!v || '依赖的服务端口为必填项']"
                        type="number"
                      />
                    </div>
                    <div class="form-item">
                      <v-select
                        :items="[ 'TCP', 'UDP' ]"
                        label="依赖的服务协议类型(dependType)"
                        dense
                        v-model="row.dependType"
                        :rules="[v => !!v || '依赖的服务协议类型为必填项']"
                      />
                    </div>
                    <div>
                      <v-icon color="success" class="mr-4" @click="copyDependServices(i)">mdi-content-copy</v-icon>
                      <v-icon color="error" @click="deleteDependServices(i)">mdi-trash-can-outline</v-icon>
                    </div>
                  </div>
                </div>
                <div class="form-item-100 params-item" v-show="addComponentForm.deploySpecStatic.hostAliases !== null" :id="'hostAliases-add'">
                  <div>
                    应用容器主机名解析(hostAliases)
                    <v-tooltip right max-width="200px">
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                      </template>
                      <div style="font-size: 12px;">
                        设置后应用容器中的/etc/hosts将增加相关主机名解析
                      </div>
                    </v-tooltip>
                    <v-icon color="success" class="ml-4" @click="addHostAliases()">mdi-table-plus</v-icon> 
                    <v-icon color="error" class="ml-4" @click="clearParams('hostAliases')">mdi-minus-circle-outline</v-icon>
                  </div>
                  <div class="params-content d-flex justify-space-between mt-4 align-center" v-for="(row, i) in addComponentForm.deploySpecStatic.hostAliases">
                    <div class="form-item">
                      <v-text-field
                        label="对应的ip地址(ip)*"
                        dense
                        v-model="row.ip"
                        :rules="[v => !!v || '对应的ip地址为必填项']"
                      />
                    </div>
                    <div class="form-item-45">
                      <v-combobox
                        label="对应的主机名(hostnames)*"
                        dense
                        multiple
                        small-chips
                        hide-selected
                        v-model="row.hostnames"
                        hint="一个ip地址支持对应多个主机名"
                        persistent-hint
                        append-icon=""
                        :rules="[v => v.length > 0 || '对应的主机名为必填项']"
                      />
                    </div>
                    <div>
                      <v-icon color="success" class="mr-4" @click="copyHostAliases(i)">mdi-content-copy</v-icon>
                      <v-icon color="error" @click="deleteHostAliases(i)">mdi-trash-can-outline</v-icon>
                    </div>
                  </div>
                </div>
                <div class="form-item-100 params-item" v-show="addComponentForm.deploySpecStatic.securityContext.runAsUser !== 0 || addComponentForm.deploySpecStatic.securityContext.runAsGroup !== 0" :id="'securityContext-add'">
                  <div>
                    启动应用使用的用户和用户组配置(securityContext)
                    <v-tooltip right max-width="200px">
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon small class="mx-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                      </template>
                      <div style="font-size: 12px;">
                        假如使用容器镜像的默认启动用户请勿配置该选项
                      </div>
                    </v-tooltip>
                    <v-icon color="error" @click="clearParams('securityContext')">mdi-minus-circle-outline</v-icon>
                  </div>
                  <div class="params-content d-flex justify-space-between mt-4" v-if="addComponentForm.deploySpecStatic.securityContext">
                    <div class="form-item-45">
                      <v-text-field
                        label="应用运行的用户ID(runAsUser)*"
                        dense
                        type="number"
                        v-model="addComponentForm.deploySpecStatic.securityContext.runAsUser"
                      />
                    </div>
                    <div class="form-item-45">
                      <v-text-field
                        label="应用运行的用户组ID(runAsGroup)*"
                        dense
                        type="number"
                        v-model="addComponentForm.deploySpecStatic.securityContext.runAsGroup"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </v-form>
          </v-card-text>
        </v-card>
      </v-dialog>
      <v-dialog
        v-model="updateComponentDialog"
        max-width="1100px"
        persistent
      >
        <v-card :loading="dialogLoading">
          <v-card-title>
            <span class="headline">修改组件</span>
            <v-spacer></v-spacer>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn class="mx-4 yaml-btn" small v-bind="attrs" v-on="on">
                  <v-icon color="primary" @click="previewComponent()">mdi-cube-scan</v-icon>
                </v-btn>
              </template>
              <div>查看YAML定义</div>
            </v-tooltip>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-icon color="primary" v-bind="attrs" v-on="on" @click="addComponent()">mdi-progress-upload</v-icon>
              </template>
              <div>提交更新</div>
            </v-tooltip>
            <v-icon class="ml-4" @click="() => {
              this.updateComponentDialog = false
              this.$refs.addComponentRef.resetValidation()
            }">
              mdi-close
            </v-icon>
          </v-card-title>
          <v-card-text>
            <v-form ref="addComponentRef">
              <v-alert icon="mdi-alert-circle" prominent text type="info">
                <small>在项目的kubernetes名字空间中部署中间件组件，例如mysql、redis、nginx等。</small>
              </v-alert>
              <div class="form-item-100 d-flex justify-space-between">
                <div class="form-item-100">
                  <v-text-field
                    label="组件说明（componentDesc）*"
                    required
                    dense
                    :rules="[v => !!v || '组件模板说明为必填项']"
                    v-model="addComponentForm.componentTemplateDesc"
                  ></v-text-field>
                </div>
              </div>
              <div class="form-row d-flex justify-space-between">
                <div class="form-item">
                  <v-text-field
                    label="容器发布模块名称(deployName)*"
                    dense
                    v-model="addComponentForm.deploySpecStatic.deployName"
                    :rules="[v => !!v || '容器发布模块名称为必填项']"
                  />
                </div>
                <div class="form-item d-flex align-center">
                  <v-text-field
                    label="镜像名称(deployImage)*"
                    dense
                    v-model="addComponentForm.deploySpecStatic.deployImage"
                    :rules="[v => !!v || '镜像名称为必填项']"
                  />
                  <v-tooltip right max-width="200px">
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                    </template>
                    <div style="font-size: 12px;">
                      <div>可以填写hub.docker.io上的公网镜像名称，流水线会自动拉取公网镜像，建议不要使用latest标签的镜像</div>
                      <div>也可以填写harbor中的基础镜像</div>
                    </div>
                  </v-tooltip>
                </div>
                <div class="form-item">
                  <v-text-field
                    label="应用启动的副本实例数(deployReplicas)*"
                    dense
                    type="number"
                    v-model="addComponentForm.deploySpecStatic.deployReplicas"
                    :rules="[v => !!v && v > 0 || '应用启动的副本实例数为必填项']"
                  >
                  </v-text-field>
                </div>
              </div>
              <div class="form-row mt-4">
                <div class="form-item">
                  <v-spacer></v-spacer>
                  <v-select
                    :items="[
                      { text: '应用的资源配额设置', value: 'deployResources' },
                      { text: '杂项', value: '杂项' },
                      { text: '服务端口设置', value: '服务端口设置' },
                      { text: '应用挂装存储设置', value: 'deployVolumes' },
                      { text: '应用状态检查设置', value: 'deployHealthCheck' },
                      { text: '服务依赖', value:'dependServices' },
                      { text: '应用容器主机名解析', value: 'hostAliases' },
                      { text: '启动应用使用的用户和用户组配置', value: 'securityContext' },
                    ]"
                    dense
                    label="选择添加配置参数"
                    @change="chooseParams($event)"
                  ></v-select>
                </div>
                <div class="form-item-100 params-item" v-if="addComponentForm.deploySpecStatic.deployResources.cpuLimit !== '' || addComponentForm.deploySpecStatic.deployResources.cpuRequest !== '' || addComponentForm.deploySpecStatic.deployResources.memoryLimit !== '' || addComponentForm.deploySpecStatic.deployResources.memoryRequest !== ''" :id="'deployResources-'+targetIndex">
                  <div>
                    应用的资源配额设置(deployResources)
                    <v-tooltip right max-width="200px">
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                      </template>
                      <span style="font-size: 12px;">给应用分配多少cpu和内存资源</span>
                    </v-tooltip>
                    <v-icon color="error" class="ml-4" @click="clearParams('deployResources')">mdi-minus-circle-outline</v-icon>
                  </div>
                  <div class="params-content d-flex justify-space-between mt-4" v-if="addComponentForm.deploySpecStatic.deployResources">
                    <div class="form-item-20 d-flex">
                      <v-text-field
                        label="内存请求配额(memoryRequest)*"
                        dense
                        v-model="addComponentForm.deploySpecStatic.deployResources.memoryRequest"
                        :rules="[v => !!v || '内存请求配额为必填项']"
                      />
                      <v-tooltip right max-width="200px">
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                        </template>
                        <span style="font-size: 12px;">应用预占的内存，所有应用的预占内存总量如超过节点内存总量将无法启动应用（100Mi表示100M内存，1Gi表示1G内存）</span>
                      </v-tooltip>
                    </div>
                    <div class="form-item-20 d-flex">
                      <v-text-field
                        label="内存最大配额(memoryLimit)*"
                        dense
                        v-model="addComponentForm.deploySpecStatic.deployResources.memoryLimit"
                        :rules="[v => !!v || '内存最大配额为必填项']"
                      />
                      <v-tooltip right max-width="200px">
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                        </template>
                        <span style="font-size: 12px;">应用可以分配的最大内存资源，所有应用的最大内存配额总量可以超过节点内存总量（200Mi表示200M内存，1Gi表示1G内存）</span>
                      </v-tooltip>
                    </div>
                    <div class="form-item-20 d-flex">
                      <v-text-field
                        label="cpu请求配额(cpuRequest)*"
                        dense
                        v-model="addComponentForm.deploySpecStatic.deployResources.cpuRequest"
                        :rules="[v => !!v || 'cpu请求配额为必填项']"
                      />
                      <v-tooltip right max-width="200px">
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                        </template>
                        <span style="font-size: 12px;">应用预占的cpu，所有应用的预占cpu总量如超过节点cpu总量将无法启动应用（100m表示0.1，表示0.1个CPU）</span>
                      </v-tooltip>
                    </div>
                    <div class="form-item-20 d-flex">
                      <v-text-field
                        label="cpu最大配额(cpuLimit)*"
                        dense
                        v-model="addComponentForm.deploySpecStatic.deployResources.cpuLimit"
                        :rules="[v => !!v || 'cpu最大配额为必填项']"
                      />
                      <v-tooltip right max-width="200px">
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                        </template>
                        <span style="font-size: 12px;">应用可以分配的最大cpu资源，所有应用的最大cpu配额总量可以超过节点cpu总量（100m表示0.1，表示0.1个CPU）</span>
                      </v-tooltip>
                    </div>
                  </div>
                </div>
                <div class="form-item-100 params-item" v-show="addComponentForm.deploySpecStatic.deployCommand !== '' || addComponentForm.deploySpecStatic.deployEnvs !== null || addComponentForm.deploySpecStatic.deploySessionAffinityTimeoutSeconds !== 0 || addComponentForm.deploySpecStatic.deployArgs !== null" :id="'杂项-'+targetIndex">
                  <div>杂项 <v-icon color="error" class="ml-4" @click="clearParams('other')">mdi-minus-circle-outline</v-icon></div>
                  <div class="params-content d-flex justify-space-between mt-4">
                    <div class="form-item">
                      <small>环境变量(deployEnvs)</small>
                      <v-icon color="success" class="ml-4" @click="addDeployEnvs()">mdi-table-plus</v-icon>
                      <div class="env-item d-flex justify-space-between" v-for="(row, i) in addComponentForm.deploySpecStatic.deployEnvs" :key="i" v-if="addComponentForm.deploySpecStatic.deployEnvs">
                        <div class="form-item-45 mt-4">
                          <v-text-field
                            label="变量名*"
                            dense
                            v-model="row[0]"
                            :rules="[v => !!v || '环境变量名为必填项']"
                          />
                        </div>
                        <div class="form-item-45 mt-4">
                          <v-text-field
                            label="变量值*"
                            dense
                            v-model="row[1]"
                            :rules="[v => !!v || '环境变量值为必填项']"
                          />
                        </div>
                        <div>
                          <v-icon color="error" class="mt-4" @click="deleteDeployEnvs(i)">mdi-trash-can-outline</v-icon>
                        </div>
                      </div>
                      <div><small class="tip-color">应用容器中的环境变量设置</small></div>
                    </div>
                    <div class="form-item-45 d-flex align-center">
                      <v-combobox
                        label="命令行的启动参数(deployArgs)"
                        dense
                        multiple
                        small-chips
                        hide-selected
                        v-model="addComponentForm.deploySpecStatic.deployArgs"
                        append-icon=""
                      />
                    </div>
                    <div class="form-item-15 d-flex align-center">
                      <v-text-field
                        label="会话持久时间(deploySessionAffinityTimeoutSeconds)"
                        dense
                        type="number"
                        v-model="addComponentForm.deploySpecStatic.deploySessionAffinityTimeoutSeconds"
                      />
                      <v-tooltip right max-width="200px">
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                        </template>
                        <span style="font-size: 12px;">对于多实例的有状态服务，如果需要启用session sticky支持，需要设置session sticky超时时间，单位秒</span>
                      </v-tooltip>
                    </div>
                  </div>
                  <div class="form-item-100 mt-4">
                    <v-text-field
                      label="启动应用命令行(deployCommand)"
                      dense
                      v-model="addComponentForm.deploySpecStatic.deployCommand"
                    />
                  </div>
                </div>
                <div class="form-item-100 params-item" :id="'服务端口设置-'+targetIndex" v-if="addComponentForm.deploySpecStatic.deployNodePorts !== null || addComponentForm.deploySpecStatic.deployLocalPorts !== null">
                  <div class="form-item-45 mt-4 d-flex align-center">
                    <v-select
                      :items="[
                        { text: '模块的内部端口设置', value: 'deployLocalPorts' },
                        { text: '模块的NodePort端口设置', value: 'deployNodePorts' },
                      ]"
                      dense
                      :value="addComponentForm.deploySpecStatic.deployLocalPorts === null ? 'deployNodePorts' : 'deployLocalPorts'"
                      label="选择添加配置参数"
                      @change="changePortSet($event)"
                    ></v-select>
                    <v-icon color="error" class="ml-4" @click="clearParams('portSetting')">mdi-minus-circle-outline</v-icon>
                  </div>
                  <div class="form-item-100" v-if="addComponentForm.deploySpecStatic.deployLocalPorts !== null" :id="'deployLocalPorts-'">
                    <div>
                      模块的内部端口设置(deployLocalPorts)
                      <v-tooltip right max-width="200px">
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                        </template>
                        <div style="font-size: 12px;">
                          <div>假如模块应用不需要在kubernetes集群外被访问，那么设置内部端口即可</div>
                          <div>选择后不能选deployNodePorts</div>
                        </div>
                      </v-tooltip>
                      <v-icon color="success" class="mx-4" @click="addDeployLocalPort()">mdi-table-plus</v-icon> 
                    </div>
                    <div class="params-content d-flex justify-space-between mt-4" v-for="(row, i) in addComponentForm.deploySpecStatic.deployLocalPorts">
                      <div class="form-item-20">
                        <v-text-field
                          label="模块的内部服务端口号(port)*"
                          dense
                          type="number"
                          v-model="row.port"
                          :rules="[v => !!v || '模块的内部服务端口号为必填项']"
                        />
                      </div>
                      <div class="form-item-20">
                        <v-select
                          :items="[ 'http', 'tcp' ]"
                          label="协议类型(protocol)*"
                          dense
                          v-model="row.protocol"
                          :rules="[v => !!v || '协议类型为必填项']"
                        />
                      </div>
                      <div>
                        <v-icon color="success" class="mr-4" @click="copyDeployLocalPort(i)">mdi-content-copy</v-icon>
                        <v-icon color="error" @click="deleteDeployLocalPort(i)">mdi-trash-can-outline</v-icon>
                      </div>
                    </div>
                  </div>
                  <div class="form-item-100" v-if="addComponentForm.deploySpecStatic.deployNodePorts !== null" :id="'deployNodePorts-'">
                    <div>
                      模块的NodePort端口设置(deployNodePorts)
                      <v-tooltip right max-width="200px">
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                        </template>
                        <div style="font-size: 12px;">
                          <div>模块应用需要在kubernetes集群外被访问的时候，需要通过NodePort端口对外提供服务</div>
                          <div>选择后不能选deployLocalPorts</div>
                        </div>
                      </v-tooltip>
                      <v-icon color="success" class="mx-4" @click="addDeployNodePort()">mdi-table-plus</v-icon> 
                    </div>
                    <div class="params-content d-flex justify-space-between mt-4" v-for="(row, i) in addComponentForm.deploySpecStatic.deployNodePorts">
                      <div class="form-item">
                        <v-text-field
                          label="模块的内部服务端口号(port)*"
                          dense
                          type="number"
                          v-model="row.port"
                          :rules="[v => !!v || '模块的内部服务端口号为必填项']"
                        />
                      </div>
                      <div class="form-item">
                        <v-select
                          :items="[ 'http', 'tcp' ]"
                          label="协议类型(protocol)*"
                          dense
                          v-model="row.protocol"
                          :rules="[v => !!v || '协议类型为必填项']"
                        />
                      </div>
                      <div class="form-item d-flex">
                        <v-select
                          :items="project.nodePorts"
                          label="模块的外部服务端口号(nodePort)*"
                          dense
                          v-model="row.nodePort"
                          :rules="[v => !!v || '模块的外部服务端口号为必填项']"
                          hint="访问该服务的域名"
                          persistent-hint
                        />
                        <v-tooltip right max-width="200px">
                          <template v-slot:activator="{ on, attrs }">
                            <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                          </template>
                          <div style="font-size: 12px;">
                            <div>kubernetes集群外通过访问NodePort可以访问到模块的内部端口，请保证项目的管理控制台该nodePort可用，并且nodePort没有复用，否则会无法发布应用。</div>
                          </div>
                        </v-tooltip>
                      </div>
                      <div>
                        <v-icon color="success" class="mr-4" @click="copyDeployNodePort(i)">mdi-content-copy</v-icon>
                        <v-icon color="error" @click="deleteDeployNodePort(i)">mdi-trash-can-outline</v-icon>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="form-item-100 params-item" v-show="addComponentForm.deploySpecStatic.deployVolumes !== null" :id="'deployVolumes-'+targetIndex">
                  <div>
                    应用挂装存储设置(deployVolumes)
                    <v-tooltip right max-width="200px">
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                      </template>
                      <span style="font-size: 12px;">该应用哪些目录或者文件需要进行持久化到共享存储</span>
                    </v-tooltip>
                    <v-icon color="success" class="ml-4" @click="addDeployVolumes()">mdi-table-plus</v-icon> 
                    <v-icon color="error" class="ml-4" @click="clearParams('deployVolumes')">mdi-minus-circle-outline</v-icon>
                  </div>
                  <div class="params-content d-flex justify-space-between mt-4" v-for="(row, i) in addComponentForm.deploySpecStatic.deployVolumes">
                    <div class="form-item">
                      <v-text-field
                        label="容器中挂装的目录或文件的绝对路径(pathInPod)*"
                        dense
                        v-model="row.pathInPod"
                        :rules="[v => !!v || '容器中挂装的目录或文件的绝对路径为必填项']"
                      />
                    </div>
                    <div class="form-item">
                      <v-text-field
                        label="持久化卷pvc中目录或文件的相对路径(pathInPv)*"
                        dense
                        v-model="row.pathInPv"
                        :rules="[v => !!v || '持久化卷pvc中目录或文件的相对路径为必填项']"
                      />
                    </div>
                    <div class="form-item d-flex">
                      <v-select
                        :items="pvs || []"
                        item-value="pvcName"
                        item-text="pvcName"
                        label="挂装的pvc名字(pvc)"
                        dense
                        v-model="row.pvc"
                        hint="如果使用默认pvc请不要填写"
                        persistent-hint
                      />
                    </div>
                    <div>
                      <v-icon color="success" class="mr-4" @click="copyDeployVolumes(i)">mdi-content-copy</v-icon>
                      <v-icon color="error" @click="deleteDeployVolumes(i)">mdi-trash-can-outline</v-icon>
                    </div>
                  </div>
                </div>
                <div class="form-item-100 params-item" v-if="addComponentForm.deploySpecStatic.deployHealthCheck.livenessDelaySeconds !== 0 || addComponentForm.deploySpecStatic.deployHealthCheck.livenessPeriodSeconds !== 0 || addComponentForm.deploySpecStatic.deployHealthCheck.readinessDelaySeconds !== 0 || addComponentForm.deploySpecStatic.deployHealthCheck.readinessPeriodSeconds !== 0 || addComponentForm.deploySpecStatic.deployHealthCheck.checkPort !== 0 || addComponentForm.deploySpecStatic.deployHealthCheck.httpGet.port !== 0 || addComponentForm.deploySpecStatic.deployHealthCheck.httpGet.path !== '' || addComponentForm.deploySpecStatic.deployHealthCheck.httpGet.httpHeaders !== null" :id="'deployHealthCheck-'+targetIndex">
                  <div>
                    应用状态检查设置(deployHealthCheck)
                    <v-tooltip right max-width="200px">
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon small class="mx-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                      </template>
                      <span style="font-size: 12px;">检查应用是否能正常对外提供服务，如果不能正常对外提供服务则进行重启或者标记服务不可访问</span>
                    </v-tooltip>
                    <v-icon color="error" @click="clearParams('deployHealthCheck')">mdi-minus-circle-outline</v-icon>
                  </div>
                  <div class="params-content d-flex justify-space-between mt-4">
                    <div class="form-item-20 d-flex align-center">
                      <v-text-field
                        label="启动容器后等待多长时间才启动可访问性检查(readinessDelaySeconds)*"
                        dense
                        v-model="addComponentForm.deploySpecStatic.deployHealthCheck.readinessDelaySeconds"
                        :rules="[v => v >= 0 && v!== '' || '启动容器后等待多长时间才启动可访问性检查为必填项']"
                        type="number"
                      />
                      <v-tooltip right max-width="200px">
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                        </template>
                        <div style="font-size: 12px;">
                          <div>如果检查通过service才可以正常对外访问，单位秒</div>
                        </div>
                      </v-tooltip>
                    </div>
                    <div class="form-item-20 d-flex align-center">
                      <v-text-field
                        label="多长时间间隔进行一次可访问性检查(readinessPeriodSeconds)*"
                        dense
                        v-model="addComponentForm.deploySpecStatic.deployHealthCheck.readinessPeriodSeconds"
                        :rules="[v => v >= 0 && v!== '' || '多长时间间隔进行一次可访问性检查为必填项']"
                        type="number"
                      />
                      <v-tooltip right max-width="200px">
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                        </template>
                        <div style="font-size: 12px;">
                          <div>如果检查通过service才可以正常对外访问，单位秒</div>
                        </div>
                      </v-tooltip>
                    </div>
                    <div class="form-item-20 d-flex align-center">
                      <v-text-field
                        label="启动容器后等待多长时间才启动服务异常检查(livenessDelaySeconds)*"
                        dense
                        v-model="addComponentForm.deploySpecStatic.deployHealthCheck.livenessDelaySeconds"
                        :rules="[v => v >= 0 && v!== '' || '启动容器后等待多长时间才启动服务异常检查为必填项']"
                        type="number"
                      />
                      <v-tooltip right max-width="200px">
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                        </template>
                        <div style="font-size: 12px;">
                          <div>如果检查不通过容器将会自动重启，单位秒</div>
                        </div>
                      </v-tooltip>
                    </div>
                    <div class="form-item-20 d-flex align-center">
                      <v-text-field
                        label="多长时间间隔进行一次服务异常检查(livenessPeriodSeconds)*"
                        dense
                        v-model="addComponentForm.deploySpecStatic.deployHealthCheck.livenessPeriodSeconds"
                        :rules="[v => v >= 0 && v!== '' || '多长时间间隔进行一次服务异常检查为必填项']"
                        type="number"
                      />
                      <v-tooltip right max-width="200px">
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                        </template>
                        <div style="font-size: 12px;">
                          <div>如果检查不通过容器将会自动重启，单位秒</div>
                        </div>
                      </v-tooltip>
                    </div>
                  </div>
                  <div class="params-content d-flex justify-space-between">
                    <div class="form-item-100">
                      <div class="form-item-20">
                        <v-select
                          :items="[ 'httpGet', 'checkPort' ]"
                          label="选择httpGet或checkPort"
                          @change="checkChange($event)"
                          hint="checkPort和httpGet必须选其一"
                          persistent-hint
                          :value="addComponentForm.deploySpecStatic.deployHealthCheck.checkPort === 0 ? 'httpGet' : 'checkPort'"
                        ></v-select>
                      </div>
                      <div class="mt-4" v-if="addComponentForm.deploySpecStatic.deployHealthCheck.checkPort !== 0">
                        <v-text-field
                          label="检查tcp端口是否可连接(checkPort)*"
                          dense
                          v-model="addComponentForm.deploySpecStatic.deployHealthCheck.checkPort"
                          :rules="[v => !!v || '检查tcp端口是否可连接为必填项']"
                          type="number"
                        />
                      </div>
                      <div v-if="addComponentForm.deploySpecStatic.deployHealthCheck.checkPort === 0">
                        <small>通过http get方法检查是否可连接(httpGet)*</small>
                        <div class="d-flex justify-space-between mt-4">
                          <div class="form-item-45">
                            <v-text-field
                              label="本应用的http路径(path)*"
                              dense
                              v-model="addComponentForm.deploySpecStatic.deployHealthCheck.httpGet.path"
                              :rules="[v => !!v || '本应用的http路径为必填项']"
                            />
                          </div>
                          <div class="form-item-45">
                            <v-text-field
                              label="本应用的http端口(port)*"
                              dense
                              v-model="addComponentForm.deploySpecStatic.deployHealthCheck.httpGet.port"
                              :rules="[v => !!v || '本应用的http端口为必填项']"
                              type="number"
                            />
                          </div>
                        </div>
                        <small>请求中自定义的HTTP头(httpHeaders)</small>
                        <v-tooltip right max-width="200px">
                          <template v-slot:activator="{ on, attrs }">
                            <v-icon small class="mx-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                          </template>
                          <div style="font-size: 12px;">
                            <div>通过http get方法访问指定路径和端口返回的状态码，如果状态码返回2XX-3XX则表示服务正常</div>
                            <div>建议每个应用单独开发一个http-get方式获取服务健康状态controller</div>
                          </div>
                        </v-tooltip>
                        <v-icon color="success" class="ml-4" @click="addHttpHeaders()">mdi-table-plus</v-icon>
                        <div v-for="(row, i) in addComponentForm.deploySpecStatic.deployHealthCheck.httpGet.httpHeaders" :key="i">
                          <div class="d-flex justify-space-between mt-4">
                            <div class="form-item-45">
                              <v-text-field
                                label="httpHeader名称(name)*"
                                dense
                                v-model="row.name"
                                :rules="[v => !!v || 'httpHeader名称为必填项']"
                              />
                            </div>
                            <div class="form-item-45">
                              <v-text-field
                                label="httpHeader值(value)*"
                                dense
                                v-model="row.value"
                                :rules="[v => !!v || 'httpHeader值为必填项']"
                              />
                            </div>
                            <div>
                              <v-icon color="success" class="mr-4" @click="copyHttpHeaders(i)">mdi-content-copy</v-icon>
                              <v-icon color="error" @click="deleteHttpHeaders(i)">mdi-trash-can-outline</v-icon>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="form-item-100 params-item" v-show="addComponentForm.deploySpecStatic.dependServices !== null" :id="'dependServices-'+targetIndex">
                  <div>
                    服务依赖(dependServices)
                    <v-tooltip right max-width="200px">
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                      </template>
                      <div style="font-size: 12px;">
                        启动该服务前必须先保证哪个服务的哪个端口先启动，如果有多个服务依赖请注意依赖的先后顺序
                      </div>
                    </v-tooltip>
                    <v-icon color="success" class="ml-4" @click="addDependServices()">mdi-table-plus</v-icon> 
                    <v-icon color="error" class="ml-4" @click="clearParams('dependServices')">mdi-minus-circle-outline</v-icon>
                  </div>
                  <div class="params-content d-flex justify-space-between mt-4" v-for="(row, i) in addComponentForm.deploySpecStatic.dependServices">
                    <div class="form-item">
                      <v-text-field
                        label="依赖的服务名(dependName)*"
                        dense
                        v-model="row.dependName"
                        :rules="[v => !!v || '依赖的服务名为必填项']"
                        hint="可以是集群内的服务名，也可以是集群外的ip地址或者主机名"
                        persistent-hint
                      />
                    </div>
                    <div class="form-item">
                      <v-text-field
                        label="依赖的服务端口(dependPort)*"
                        dense
                        v-model="row.dependPort"
                        :rules="[v => !!v || '依赖的服务端口为必填项']"
                        type="number"
                      />
                    </div>
                    <div class="form-item">
                      <v-select
                        :items="[ 'TCP', 'UDP' ]"
                        label="依赖的服务协议类型(dependType)"
                        dense
                        v-model="row.dependType"
                        :rules="[v => !!v || '依赖的服务协议类型为必填项']"
                      />
                    </div>
                    <div>
                      <v-icon color="success" class="mr-4" @click="copyDependServices(i)">mdi-content-copy</v-icon>
                      <v-icon color="error" @click="deleteDependServices(i)">mdi-trash-can-outline</v-icon>
                    </div>
                  </div>
                </div>
                <div class="form-item-100 params-item" v-show="addComponentForm.deploySpecStatic.hostAliases !== null" :id="'hostAliases-'+targetIndex">
                  <div>
                    应用容器主机名解析(hostAliases)
                    <v-tooltip right max-width="200px">
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                      </template>
                      <div style="font-size: 12px;">
                        设置后应用容器中的/etc/hosts将增加相关主机名解析
                      </div>
                    </v-tooltip>
                    <v-icon color="success" class="ml-4" @click="addHostAliases()">mdi-table-plus</v-icon> 
                    <v-icon color="error" class="ml-4" @click="clearParams('hostAliases')">mdi-minus-circle-outline</v-icon>
                  </div>
                  <div class="params-content d-flex justify-space-between mt-4 align-center" v-for="(row, i) in addComponentForm.deploySpecStatic.hostAliases">
                    <div class="form-item">
                      <v-text-field
                        label="对应的ip地址(ip)*"
                        dense
                        v-model="row.ip"
                        :rules="[v => !!v || '对应的ip地址为必填项']"
                      />
                    </div>
                    <div class="form-item-45">
                      <v-combobox
                        label="对应的主机名(hostnames)*"
                        dense
                        multiple
                        small-chips
                        hide-selected
                        v-model="row.hostnames"
                        hint="一个ip地址支持对应多个主机名"
                        persistent-hint
                        append-icon=""
                        :rules="[v => v.length > 0 || '对应的主机名为必填项']"
                      />
                    </div>
                    <div>
                      <v-icon color="success" class="mr-4" @click="copyHostAliases(i)">mdi-content-copy</v-icon>
                      <v-icon color="error" @click="deleteHostAliases(i)">mdi-trash-can-outline</v-icon>
                    </div>
                  </div>
                </div>
                <div class="form-item-100 params-item" v-show="addComponentForm.deploySpecStatic.securityContext.runAsUser !== 0 || addComponentForm.deploySpecStatic.securityContext.runAsGroup !== 0" :id="'securityContext-'+targetIndex">
                  <div>
                    启动应用使用的用户和用户组配置(securityContext)
                    <v-tooltip right max-width="200px">
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon small class="mx-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                      </template>
                      <div style="font-size: 12px;">
                        假如使用容器镜像的默认启动用户请勿配置该选项
                      </div>
                    </v-tooltip>
                    <v-icon color="error" @click="clearParams('securityContext')">mdi-minus-circle-outline</v-icon>
                  </div>
                  <div class="params-content d-flex justify-space-between mt-4" v-if="addComponentForm.deploySpecStatic.securityContext">
                    <div class="form-item-45">
                      <v-text-field
                        label="应用运行的用户ID(runAsUser)*"
                        dense
                        type="number"
                        v-model="addComponentForm.deploySpecStatic.securityContext.runAsUser"
                      />
                    </div>
                    <div class="form-item-45">
                      <v-text-field
                        label="应用运行的用户组ID(runAsGroup)*"
                        dense
                        type="number"
                        v-model="addComponentForm.deploySpecStatic.securityContext.runAsGroup"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </v-form>
          </v-card-text>
        </v-card>
      </v-dialog>
      <v-dialog
        v-model="deleteComponentDialog"
        max-width="600px"
      >
        <v-card>
          <v-card-title>
            <span class="headline">删除组件</span>
          </v-card-title>
          <v-card-text>
            <v-alert icon="mdi-alert-circle" prominent text type="error">
              <small>在项目的kubernetes环境中，对应组件。<v-chip small color="red">危险操作，请输入组件名标识。</v-chip></small>
            </v-alert>
            <v-form ref="deleteComponentRef">
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      label="组件名（componentName）*"
                      required
                      dense
                      v-model="deleteComponentName"
                      :rules="[v => !!v || '环境名为必填项']"
                      :hint="`确认要将组件${deleteComponentForm.componentName}从项目${deleteComponentForm.envName}环境移除吗？`"
                      persistent-hint
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="blue darken-1"
              text
              @click="() => {
                this.deleteComponentDialog = false
                this.$refs.deleteComponentRef.reset()
              }"
            >
              取消
            </v-btn>
            <v-btn
              color="blue darken-1"
              text
              @click="deleteComponent()"
            >
              确认
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog
        v-model="YAMLDialog"
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
              :monacoOptions="singleMonacoOptions"
              :height="500"
            ></Monaco>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="blue darken-1"
              text
              @click="closeYaml()"
            >
              确认
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </div>
</template>

<script>
import Operations from '@/lib/ui-lib/components/Operations'
import { flatMap } from 'rxjs/operators'
import PageCard from '@/lib/ui-lib/page-templates/PageCard';
import request from '@/utils/request'
import YAML from "yamljs";
import Monaco from "@/lib/monaco/Monaco";
export default {
  inject: ['successTip', 'errorTip', 'warnTip'],
  name: "Project",
  components: {
    Operations,
    PageCard,
    Monaco
  },
  data () {
    return {
      project: '',
      cardLoading: true,
      auditDialog: false,
      logList: [],
      userToken: '',
      targetProjectName: '',
      targetNodeport: '',
      targetUsername: '',
      targetCrontabName: '',
      targetEnvName: '',
      targetPipelineName: '',
      deleteEnvName:'',
      deleteBranchTip:'',
      deletePVName: '',
      newEnvSelectList: [],
      newEnvSelect:[],
      handleEnvType: '0',
      handleEnvName: '',
      updateProjectForm: {
        projectDesc: '',
        projectTeam: ''
      },
      deleteProjectName: '',
      deleteProjectAll: '',
      memberAddForm: {
        username: '',
        accessLevel: ''
      },
      addPipelineForm: {
        branchName: '',
        tagSuffix: '',
        envs: [],
        envProductions: [],
        webhookPushEvent: '',
      },
      envList: [],
      deletePipelineEnvForm: {
        branchName: '',
        envName: '',
        isProductionEnv: null
      },
      addPipelineEnvForm : {
        branchName: '',
        envName: '',
        isProductionEnv: null
      },
      deleteBranchName: '',
      cronAddForm:{
        branchName: '',
        crontabName: '',
        crontabMinute: '',
        crontabHour: '',
        crontabDay: '',
        crontabMonth: '',
        crontabWeek: '',
      },
      limitConfigForm: {
        envName: '',
        namespaceLimit: {
          memoryRequest: '',
          cpuRequest: '',
          memoryLimit: '',
          cpuLimit: '',
          podsLimit: '',
        },
        containerLimit: {
          memoryRequest: '',
          cpuRequest: '',
          memoryLimit: '',
          cpuLimit: '',
        }
      },
      updateHostForm: {
        envName: '',
        hostName: '',
        hostAddr: '',
        hostPort: '',
        hostUser: '',
        hostPassword: '',
        hostBecome: null,
        hostBecomeUser: '',
        hostBecomePassword: '',
        groups: [],
        variables: {}
      },
      hostPasswordDisplay: false,
      hostBecomePasswordDisplay: false,
      hostPasswordDisplay2: false,
      hostBecomePasswordDisplay2: false,
      dialogLoading: true,
      hostJoinDialog: false,
      hostJoinForm: {
        projectName: '',
        envName: '',
        hostName: '',
        groups: [],
        variables: {}
      },
      hostLeaveForm: {
        envName: '',
        hostName: ''
      },
      hostLeaveDialog: false,
      leaveHostName: '',
      deleteHostForm: {
        envName: '',
        hostName: ''
      },
      deleteHostName: '',
      projectEnvs: [],
      selection: [],
      DbAddForm: {
        envName: '',
        dbName: '',
        dbUrl: '',
        dbUser: '',
        dbPassword: ''
      },
      dbPasswordDisplay: false,
      deletePVForm: {
        envName: '',
        pvName: ''
      },
      updateDbForm: {
        envName: '',
        dbName: '',
        dbUrl: '',
        dbUser: '',
        dbPassword: ''
      },
      updateDbPasswordDisplay: false,
      deleteDbForm: {
        envName: '',
        dbName: ''
      },
      deleteDbName: '',
      dbJoinDialog: false,
      dbSelection: [],
      dbJoinForm: {
        projectName: '',
        envName: '',
        dbName: ''
      },
      dbLeaveDialog: false,
      dbLeaveForm: {
        envName: '',
        dbName: ''
      },
      leaveDbName: '',
      envDialog: false,
      newEnvDialog: false,
      nodePortDialog: false,
      newNodePortDialog: false,
      modifyProjectDialog: false,
      deleteProjectDialog: false,
      deleteAllDialog: false,
      updateSecretKeyDialog: false,
      AssignPermissions: false,
      permissionsDialog: false,
      deletePermissionsDialog: false,
      addPipelineDialog: false,
      deletePipelineDialog: false,
      addPipelineEnvDialog: false,
      limitConfigDialog: false,
      addPlanDialog: false,
      deletePlanDialog: false,
      allotPVDialog: false,
      allotDbDialog: false,
      recyclingDialog: false,
      hostConfigDialog: false,
      deleteHostDialog: false,
      modifyDBDialog: false,
      deleteDBDialog: false,
      handleDialog: false,
      PVlist: [],
      pvNames: [],
      userName: [],
      accessLevel: [ 'developer', 'maintainer' ],
      gitPush: [ {text: '是', value: true}, {text: '否', value: false} ],
      pipelineHeaders: [
        { text: '流水线名称', sortable: false, value: 'pipelineName' },
        { text: '分支名称', value: 'branchName', sortable: false },
        { text: '标签后缀', value: 'tagSuffix', sortable: false },
        { text: '集成环境', value: 'envs', sortable: false },
        { text: '正式环境', value: 'envProductions', sortable: false },
        { text: '是否启用git push触发流水线', value: 'webhookPushEvent', sortable: false },
        { text: '操作', value: 'handle', sortable: false },
      ],
      debugComponentHeaders: [
        { text: '调试组件定义YAML', sortable: false, value: 'componentDebugYaml' },
        { text: 'SSH组件部署YAML', value: 'deploymentSSHYaml', sortable: false },
        { text: 'VNC组件部署YAML', value: 'deploymentVNCYaml', sortable: false },
        { text: 'SSH组件服务YAML', value: 'serviceSSHYaml', sortable: false },
        { text: 'VNC组件服务YAML', value: 'serviceVNCYaml', sortable: false },
        { text: '创建时间/更新时间', value: 'time', sortable: false },
        { text: '操作', value: 'handle', sortable: false },
      ],
      componentHeaders: [
        { text: '组件名', sortable: false, value: 'componentName' },
        { text: '组件描述', value: 'componentDesc', sortable: false },
        { text: '组件定义YAML', value: 'componentYaml', sortable: false },
        { text: '组件部署YAML', value: 'deploymentYaml', sortable: false },
        { text: '组件服务YAML', value: 'serviceYaml', sortable: false },
        { text: '创建时间/更新时间', value: 'time', sortable: false },
        { text: '操作', value: 'handle', sortable: false },
      ],
      addDebugForm: {
        debugSSH: {},
        debugVNC: {}
      },
      addDebugDialog: false,
      defaultDebugDialog: false,
      defaultDebugYaml: '',
      defaultDialogTitle: '',
      updateDebugForm: {
        envName: '',
        componentDebugYaml: ''
      },
      updateDebugDialog: false,
      updateDebugLoading: false,
      deleteDebugName: '',
      deleteDebugForm: {
        envName: ''
      },
      deleteDebugDialog: false,
      addComponentDialog: false,
      chooseComponent: '',
      addComponentForm: {
        deploySpecStatic: {
          deployName: "",
          deployImage: "",
          deployReplicas: 1,
          deployResources: {
            cpuLimit: '',
            cpuRequest: '',
            memoryLimit: '',
            memoryRequest: ''
          },
          deployVolumes: null,
          deployHealthCheck: {
            checkPort: 0,
            httpGet: {
              httpHeaders: null,
              path: "",
              port: 0,
            },
            livenessDelaySeconds: 0,
            livenessPeriodSeconds: 0,
            readinessDelaySeconds: 0,
            readinessPeriodSeconds: 0,
          },
          deployLocalPorts: null,
          deployNodePorts: null,
          dependServices: null,
          hostAliases: null,
          securityContext: {
            runAsUser: 0,
            runAsGroup: 0,
          },
          deployEnvs: null,
          deployCommand: "",
          deploySessionAffinityTimeoutSeconds: 0,
        }
      },
      componentList: [],
      defaultComponent: '',
      updateComponentForm: {
        envName: '',
        componentDesc: '',
        componentYaml: ''
      },
      updateComponentDialog: false,
      deleteComponentForm: {
        envName: '',
        componentName: ''
      },
      deleteComponentName: '',
      deleteComponentDialog: false,
      variableList: [
        ['','']
      ],
      projectEnvList: [],
      projectEnvListChildren: [],
      addTriggerDialog: false,
      triggerAddForm: {
        branchName: '',
        stepAction: null,
        statusResults: [],
        enable: null,
        webhookUrl: '',
        webhookToken: '',
      },
      stepActionList: [],
      updateTriggerDialog: false,
      triggerUpdateForm: {
        branchName: '',
        stepAction: null,
        statusResults: [],
        enable: null,
        webhookUrl: '',
        webhookToken: '',
        committeeMail: null,
        mails: [],
        usernames: []
      },
      deleteTriggerDialog: false,
      triggerDeleteForm: {},
      disableBtn: false,
      YAMLDialog: false,
      yamlText: '',
      actionType: '',
      pvs: [],
      componentType: '',
      targetIndex: '',
      singleMonacoOptions: {
        value: '',
        automaticLayout:true,
        readOnly: true, // 是否只读
        theme: "vs-dark", // 编辑器主题
        language: "yaml"
      },
      refreshTokenDialog: false,
      targetBranchName: '',
      handle: ''
    }
  },
  created () {
    const vm = this
    vm.userToken = JSON.parse(localStorage.getItem('userObj')).userToken
    const projectName = vm.$route.params.projectName
    vm.targetProjectName = projectName
    request.get(`/admin/project/${projectName}`).then(response => {
      vm.project = response.data.project
      vm.cardLoading = false
      response.data.project.projectAvailableEnvs.map(item => {
        vm.envList.push(item.envName)
      })
    }).catch(error => {
      vm.errorTip(true,error.response.data.msg)
    })
    request.get('/admin/envNames').then(response => {
      vm.newEnvSelectList = response.data.envNames
    }).catch(error => {
      vm.errorTip(true,error.response.data.msg)
    })
    request.get('/admin/userNames').then(response => {
      response.data.users.map((item) => {
        vm.userName.push(item.username)
      })
    }).catch(error => {
      vm.errorTip(true,error.response.data.msg)
    })
    // 获取项目与可用环境列表，用于把主机/数据库加入到项目环境
    request.get('/admin/projectEnvs').then(response => {
      response.data.projectEnvs.map(item => {
        var node = {
          name: '',
          id: '',
          children: [],
        }
        node.name = item.projectName
        node.id = item.projectName
        vm.projectEnvList.push({
          text: item.projectName,
          value: item.projectName,
          children: item.envNames
        })
        item.envNames.map((i,index) => {
          var childrenItem = { name: '', id: '', projectName: '' }
          childrenItem.name = i
          childrenItem.id = i+item.projectName
          childrenItem.projectName = item.projectName
          node.children.push(childrenItem)
        })
        vm.projectEnvs.push(node)
      })
    })
    request.get(`/admin/project/${projectName}/envComponentTemplates`).then(response => {
      vm.defaultComponent = response.data.componentTemplateYaml
    }).catch(error => {
      vm.errorTip(true,error.response.data.msg)
    })
    request.get(`/admin/project/${projectName}/pipelineTriggerStepActions`).then(response => {
      console.log(response)
      vm.stepActionList = response.data.stepActions
    }).catch(error => {
      vm.errorTip(true,error.response.data.msg)
    })
  },
  methods: {
    showLog (response) {
      const vm =this
      vm.logList = []
      vm.auditDialog = response.data.withAdminLog
      if(response.data.withAdminLog){
        vm.disableBtn = true
        vm.ws = new WebSocket(`${vm.GLOBAL}/ws/log/audit/admin/${response.data.auditID}?x-user-token=${vm.userToken}`)
        vm.ws.onmessage = (event) => {
          vm.logList.push(JSON.parse(event.data))
        }
        vm.ws.onclose = (e) => {
          vm.disableBtn = false
          vm.logList.push({logType: 'END'})
        }
      }
    },
    closeLog () {
      this.auditDialog = false
      if (this.handle === 'delete') {
        this.$router.push({name: 'AdminProjects'})
      } else {
        this.refreshList()
      }
    },
    refreshList () {
      const vm =this
      vm.cardLoading = true
      vm.handle = ''
      request.get(`/admin/project/${vm.targetProjectName}`).then(response => {
        vm.project = response.data.project
        vm.cardLoading = false
      }).catch(error => {
        vm.cardLoading = false
        vm.errorTip(true,error.response.data.msg)
      })
    },
    newNodePort() {
      this.newNodePortDialog = false
      this.cardLoading = true
      request.post(`/admin/project/${this.targetProjectName}/nodePortAdd`).then(response => {
        this.successTip(true,response.msg)
        this.showLog(response)
        this.refreshList()
      }).catch(error => {
        this.cardLoading = false
        this.errorTip(true,error.response.data.msg)
      })
    },
    openRecycleNodeport (data) {
      this.nodePortDialog = true
      this.targetNodeport = data
    },
    recycleNodeport () {
      const vm =this
      request.post(`/admin/project/${vm.targetProjectName}/nodePortDelete`, {nodePort: vm.targetNodeport}).then(response => {
        vm.nodePortDialog = false
        vm.successTip(true,response.msg)
        vm.showLog(response)
        vm.refreshList()
      }).catch(error => {
        vm.errorTip(true,error.response.data.msg)
      })
    },
    openRecycleEnv (data) {
      this.handleEnvName = data
      this.envDialog = true
      this.handleEnvType = '0'
    },
    recycleEnv () {
      const vm = this
      if(vm.handleEnvType == '0'){
        request.post(`/admin/project/${vm.targetProjectName}/envDelete`, { envName: vm.handleEnvName }).then(response => {
          vm.successTip(true,response.msg)
          vm.showLog(response)
          vm.refreshList()
          vm.envDialog = false
        }).catch(error => {
          vm.errorTip(true,error.response.data.msg)
        })
      }else{
        if(vm.deleteEnvName == vm.handleEnvName){
          request.post(`/admin/project/${vm.targetProjectName}/envDeleteAll`, { envName: vm.handleEnvName }).then(response => {
            vm.successTip(true,response.msg)
            vm.showLog(response)
            vm.refreshList()
            vm.envDialog = false
          }).catch(error => {
            vm.errorTip(true,error.response.data.msg)
          })
        }else{
          vm.warnTip(true,'请输入正确环境名')
        }
      }
    },
    newEnv() {
      const vm = this
      if(vm.newEnvSelect.length > 0){
        request.post(`/admin/project/${vm.targetProjectName}/envAdd`, { envNames: vm.newEnvSelect }).then(response => {
          vm.newEnvDialog = false
          vm.successTip(true,response.msg)
          vm.showLog(response)
          vm.$refs.chooseEnvRef.reset()
          vm.refreshList()
        }).catch(error => {
          vm.errorTip(true,error.response.data.msg)
        })
      }else{
        vm.warnTip(true,'请选择环境')
      }
    },
    openModifyProject() {
      this.updateProjectForm.projectDesc = this.project.projectInfo.projectDesc
      this.updateProjectForm.projectTeam = this.project.projectInfo.projectTeam
      this.modifyProjectDialog = true
    },
    modifyProject () {
      const vm = this
      if(vm.$refs.updateProjectRef.validate()){
        request.post(`/admin/project/${vm.targetProjectName}`, vm.updateProjectForm).then(response => {
          vm.modifyProjectDialog = false
          vm.successTip(true,response.msg)
          vm.$refs.updateProjectRef.resetValidation()
          vm.showLog(response)
          vm.refreshList()
        }).catch(error => {
          vm.errorTip(true,error.response.data.msg)
        })
      }
    },
    deleteProject() {
      const vm = this
      if(vm.$refs.deleteProjectRef.validate() && (vm.targetProjectName === vm.deleteProjectName)){
        request.delete(`/admin/project/${vm.deleteProjectName}`).then(response => {
          vm.successTip(true,response.msg)
          vm.deleteProjectDialog = false
          vm.$refs.deleteProjectRef.reset()
          vm.showLog(response)
          vm.handle = 'delete'
        }).catch(error => {
          vm.errorTip(true,error.response.data.msg)
        })
      }else{
        vm.warnTip(true,'请输入正确项目全称')
      }
    },
    deleteAll() {
      const vm = this
      if(vm.$refs.deleteProjectAllRef.validate() && (vm.targetProjectName === vm.deleteProjectAll)){
        request.post(`/admin/project/${vm.deleteProjectAll}/deleteAll`).then(response => {
          vm.successTip(true,response.msg)
          vm.$refs.deleteProjectAllRef.reset()
          vm.showLog(response)
          vm.handle = 'delete'
        }).catch(error => {
          vm.errorTip(true,error.response.data.msg)
        })
      }else{
        vm.warnTip(true, '请输入正确项目全称')
      }
    },
    updateToken () {
      const vm = this
      request.post(`/admin/project/${vm.targetProjectName}/refreshToken`).then(response => {
        vm.updateSecretKeyDialog = false
        vm.successTip(true,response.msg)
        vm.showLog(response)
        vm.refreshList()
      }).catch(error => {
        vm.errorTip(true,error.response.data.msg)
      })
    },
    memberAdd () {
      const vm = this
      request.post(`/admin/project/${vm.targetProjectName}/memberAdd`,vm.memberAddForm).then(response => {
        vm.AssignPermissions = false
        vm.successTip(true,response.msg)
        vm.showLog(response)
        vm.refreshList()
      }).catch(error => {
        vm.errorTip(true,error.response.data.msg)
      })
    },
    modifyPermissions(data) {
      this.permissionsDialog = true
      this.memberAddForm.username = data
    },
    updateMember () {
      const vm = this
      request.post(`/admin/project/${vm.targetProjectName}/memberUpdate`, vm.memberAddForm).then(response => {
        vm.permissionsDialog = false
        vm.successTip(true,response.msg)
        vm.refreshList()
      }).catch(error => {
        vm.errorTip(true,error.response.data.msg)
      })
    },
    deletePermissions(data) {
      this.deletePermissionsDialog = true
      this.targetUsername = data
    },
    deleteMember () {
      const vm = this
      request.post(`/admin/project/${vm.targetProjectName}/memberDelete`,{username: vm.targetUsername}).then(response => {
        vm.deletePermissionsDialog = false
        vm.successTip(true,response.msg)
        vm.showLog(response)
        vm.refreshList()
      }).catch(error => {
        vm.errorTip(true,error.response.data.msg)
      })
    },
    // 新增流水线
    addPipeline () {
      const vm = this
      if(vm.$refs.addPipelineRef.validate()){
        request.post(`/admin/project/${vm.targetProjectName}/pipelineAdd`,vm.addPipelineForm).then(response => {
          vm.addPipelineDialog = false
          vm.successTip(true,response.msg)
          vm.showLog(response)
        }).catch(error => {
          vm.errorTip(true,error.response.data.msg)
        })
      }
    },
    openDeletePipeline(data) {
      this.deletePipelineDialog = true
      this.targetBranchName = data
      this.deleteBranchTip = `确认要删除${data}分支流水线吗？`
    },
    deletePipeline () {
      const vm = this
      if(vm.$refs.deleteBranchNameRef.validate() && vm.targetBranchName == vm.deleteBranchName){
        request.post(`/admin/project/${vm.targetProjectName}/pipelineDelete`,{branchName: vm.targetBranchName}).then(response => {
          vm.deletePipelineDialog = false
          vm.successTip(true,response.msg)
          vm.showLog(response)
        }).catch(error => {
          vm.errorTip(true,error.response.data.msg)
        })
      }else{
        vm.warnTip(true,'请输入正确的分支名称')
      }
    },
    openAddPipelineEnv (branchName,pipelineName) {
      this.addPipelineEnvDialog = true
      this.addPipelineEnvForm.branchName = branchName
      this.targetPipelineName = pipelineName
    },
    addPipelineEnv () {
      const vm = this
      if(vm.$refs.addPipelineEnvRef.validate()){
        request.post(`/admin/project/${vm.targetProjectName}/pipelineEnvAdd`, vm.addPipelineEnvForm).then(response => {
          vm.addPipelineEnvDialog = false
          vm.successTip(true,response.msg)
          vm.refreshList()
          vm.$refs.addPipelineEnvRef.reset()
        }).catch(error => {
          vm.errorTip(true,error.response.data.msg)
        })
      }
    },
    openRfreshToken (branchName) {
      const vm = this
      vm.targetBranchName = branchName
      vm.refreshTokenDialog = true
    },
    refreshToken () {
      const vm = this
      request.post(`/admin/project/${vm.targetProjectName}/pipelineTokenRefresh`, { branchName: vm.targetBranchName }).then(response => {
        vm.refreshTokenDialog = false
        vm.successTip(true,response.msg)
        vm.showLog(response)
      }).catch(error => {
        vm.errorTip(true,error.response.data.msg)
      })
    },
    changeSwitch(branchName,webhookPushEvent) {
      const vm = this
      request.post(`/admin/project/${vm.targetProjectName}/pipelineGitWebhook`,{branchName,webhookPushEvent}).then(response => {
        vm.successTip(true,response.msg)
        vm.showLog(response)
      }).catch(error => {
        vm.errorTip(true,error.response.data.msg)
        vm.refreshList()
      })
    },
    openCronAdd (data) {
      this.addPlanDialog = true
      this.cronAddForm.branchName = data
    },
    cornAdd () {
      const vm = this
      if(vm.$refs.cornAddRef.validate()){
        request.post(`/admin/project/${vm.targetProjectName}/pipelineCronAdd`, vm.cronAddForm).then(response => {
          vm.successTip(true,response.msg)
          vm.$refs.cornAddRef.reset()
          vm.refreshList()
          vm.addPlanDialog = false
        }).catch(error => {
          vm.errorTip(true,error.response.data.msg)
        })
      }
    },
    openCronDelete (branchName,crontabName) {
      this.deletePlanDialog = true
      this.targetBranchName = branchName
      this.targetCrontabName = crontabName
    },
    cronDelete () {
      const vm = this
      request.post(`/admin/project/${vm.targetProjectName}/pipelineCronDelete`,{
        branchName: vm.targetBranchName,
        crontabName: vm.targetCrontabName
      }).then(response => {
        vm.successTip(true,response.msg)
        vm.refreshList()
        vm.deletePlanDialog = false
      }).catch(error => {
        vm.errorTip(true,error.response.data.msg)
      })
    },
    openLimitConfig (envName) {
      this.limitConfigDialog = true
      this.limitConfigForm.envName = envName
      this.getEnvLimitConfig()
    },
    getEnvLimitConfig () {
      const vm = this
      request.get(`/admin/project/${vm.targetProjectName}`).then(response => {
        response.data.project.projectAvailableEnvs.map(item => {
          if(item.envName == vm.limitConfigForm.envName){
            vm.limitConfigForm.namespaceLimit = item.limitConfig.namespaceLimit
            vm.limitConfigForm.containerLimit = item.limitConfig.containerLimit
          }
        })
      }).catch(error => {
        vm.errorTip(true,error.response.data.msg)
      })
    },
    limitConfig () {
      const vm = this
      if(vm.$refs.limitConfigRef.validate()){
        vm.limitConfigForm.namespaceLimit.podsLimit = Number(vm.limitConfigForm.namespaceLimit.podsLimit)
        request.post(`/admin/project/${vm.targetProjectName}/envLimitConfigUpdate`,vm.limitConfigForm).then(response => {
          vm.successTip(true,response.msg)
          vm.$refs.limitConfigRef.reset()
          vm.limitConfigDialog = false
          vm.showLog(response)
        }).catch(error => {
          vm.errorTip(true,error.response.data.msg)
        })
      }
    },
    openAllotPV (envName) {
      this.allotPVDialog = true
      this.targetEnvName = envName
      this.dialogLoading = true
      request.get(`/admin/env/${envName}/pvNames`).then(response => {
        response.data.pvs.map(item => {
          this.PVlist.push(item.pvName)
        })
        this.dialogLoading = false
      }).catch(error => {
        vm.errorTip(true,error.response.data.msg)
      })
    },
    allotPV () {
      const vm = this
      if(vm.$refs.allotPVRef.validate()){
        request.post(`/admin/project/${vm.targetProjectName}/envPvAdd`,{
          envName: vm.targetEnvName,
          pvNames: vm.pvNames
        }).then(response => {
          vm.successTip(true,response.msg)
          vm.showLog(response)
          vm.allotPVDialog = false
        }).catch(error => {
          vm.errorTip(true,error.response.data.msg)
        })
      }
    },
    openDeletePV (envName, pvName) {
      this.recyclingDialog = true
      this.deletePVForm.envName = envName
      this.deletePVForm.pvName = pvName
    },
    deletePV () {
      const vm = this
      if(vm.$refs.deletePVRef.validate()){
        if(vm.deletePVName == vm.deletePVForm.pvName){
          request.post(`/admin/project/${vm.targetProjectName}/envPvDelete`, vm.deletePVForm).then(response => {
            vm.recyclingDialog = false
            vm.showLog(response)
            vm.successTip(true,response.msg)
          }).catch(error => {
            vm.errorTip(true, error.response.data.msg)
          })
        }else{
          vm.warnTip(true, '请输入正确的持久化卷PV名称')
        }
      }
    },
    openAllotDb (envName) {
      this.allotDbDialog = true
      this.DbAddForm.envName = envName
    },
    dbAdd () {
      const vm = this
      if(vm.$refs.dbAddRef.validate()){
        request.post(`/admin/project/${vm.targetProjectName}/envDbAdd`, vm.DbAddForm).then(response => {
          vm.allotDbDialog = false
          vm.successTip(true, response.msg)
          vm.refreshList()
        }).catch(error => {
          vm.errorTip(true,error.response.data.msg)
        })
      }
    },
    modifyDB (envName, dbName) {
      const vm = this
      vm.modifyDBDialog = true
      vm.updateDbForm.envName = envName
      vm.updateDbForm.dbName = dbName
      request.get(`/admin/project/${vm.targetProjectName}`).then(response => {
        response.data.project.projectAvailableEnvs.map(item => {
          if(item.envName == vm.updateDbForm.envName){
            item.databases.map(i => {
              if(i.dbName == vm.updateDbForm.dbName){
                vm.updateDbForm = {
                  envName: envName,
                  dbName: i.dbName,
                  dbUrl: i.dbUrl,
                  dbUser: i.dbUser,
                  dbPassword: i.dbPassword
                }
              }
            })
          }
        })
      }).catch(error => {
        vm.errorTip(true,error.response.data.msg)
      })
    },
    updateDb () {
      const vm = this
      if(vm.$refs.updateDbRef.validate()){
        request.post(`/admin/project/${vm.targetProjectName}/envDbUpdate`, vm.updateDbForm).then(response => {
          vm.modifyDBDialog = false
          vm.successTip(true, response.msg)
          vm.refreshList()
        }).catch(error => {
          vm.errorTip(true,error.response.data.msg)
        })
      }
    },
    openDbJoin (dbName) {
      this.dbJoinDialog = true
      this.dbJoinForm.dbName = dbName
    },
    dbJoin () {
      const vm = this
      if(vm.$refs.dbJoinRef.validate()){
        request.post(`/admin/project/${vm.targetProjectName}/envDbJoin`, vm.dbJoinForm).then(response => {
          vm.dbJoinDialog = false
          vm.successTip(true, response.msg)
          vm.refreshList()
        }).catch(error => {
          vm.errorTip(true,error.response.data.msg)
        })
      }
    },
    openDbLeave (envName, dbName) {
      this.dbLeaveDialog = true
      this.dbLeaveForm.envName = envName
      this.dbLeaveForm.dbName = dbName
    },
    dbLeave () {
      const vm = this
      if(vm.$refs.dbLeaveRef.validate() && vm.dbLeaveForm.dbName == vm.leaveDbName){
        request.post(`/admin/project/${vm.targetProjectName}/envDbLeave`, vm.dbLeaveForm).then(response => {
          vm.dbLeaveDialog = false
          vm.successTip(true, response.msg)
          vm.refreshList()
        }).catch(error => {
          vm.errorTip(true,error.response.data.msg)
        })
      }else{
        vm.warnTip(true, '请输入正确的数据库标识名称')
      }
    },
    openDeleteDB (envName, dbName) {
      this.deleteDBDialog = true
      this.deleteDbForm.envName = envName
      this.deleteDbForm.dbName = dbName
    },
    deleteDb () {
      const vm = this
      if(vm.$refs.deleteDbNameRef.validate() && vm.deleteDbForm.dbName == vm.deleteDbName){
        request.post(`/admin/project/${vm.targetProjectName}/envDbDelete`, vm.deleteDbForm).then(response => {
          vm.deleteDBDialog = false
          vm.successTip(true, response.msg)
          vm.refreshList()
        }).catch(error => {
          vm.errorTip(true,error.response.data.msg)
        })
      }else{
        vm.errorTip(true,'请输入正确的数据库名称')
      }
    },
    handleEnv (branchName, envName, isProductionEnv) {
      this.handleDialog = true
      this.deletePipelineEnvForm.branchName = branchName
      this.deletePipelineEnvForm.envName = envName
      this.deletePipelineEnvForm.isProductionEnv = isProductionEnv
    },
    deletePipelineEnv () {
      const vm = this
      request.post(`/admin/project/${vm.targetProjectName}/pipelineEnvDelete`, vm.deletePipelineEnvForm).then(response => {
        vm.handleDialog = false
        vm.successTip(true,response.msg)
        vm.refreshList()
      }).catch(error => {
        vm.errorTip(true,error.response.data.msg)
      })
    },
    onCopy() {
      this.successTip(true,'复制成功')
    },
    onError() {
      this.errorTip(true,'复制失败')
    },
    openAddDebug (envName) {
      const vm = this
      vm.addDebugDialog = true
      vm.targetEnvName = envName
      vm.actionType = 'add'
      request.get(`/admin/project/${vm.targetProjectName}/envComponentDebugDefault`).then(response => {
        vm.addDebugForm = response.data.deploySpecDebug
      }).catch(error => {
        vm.errorTip(true,error.response.data.msg)
      })
    },
    previewDebugYaml() {
      const vm = this;
      if(vm.$refs.addDebugRef.validate()){
        vm.yamlText = YAML.stringify(vm.addDebugForm, 4);
        vm.$refs.monaco.monacoEditor.setValue(vm.yamlText)
        vm.YAMLDialog = true;
      }
    },
    closeYaml() {
      const vm = this;
      vm.$refs.monaco.monacoEditor.setValue('')
      vm.YAMLDialog = false;
    },
    addDebug () {
      const vm = this
      if(vm.$refs.addDebugRef.validate()){
        var componentDebugYaml = YAML.stringify(vm.addDebugForm, 4);
        request.post(`/admin/project/${vm.targetProjectName}/envComponentDebugUpdate`, {
          componentDebugYaml: componentDebugYaml,
          envName: vm.targetEnvName
        }).then(response => {
          vm.addDebugDialog = false
          vm.successTip(true,response.msg)
          vm.showLog(response)
        }).catch(error => {
          vm.errorTip(true, error.response.data.msg)
        })
      }
    },
    showYaml (content, title) {
      const vm = this
      var yaml = JSON.parse(JSON.stringify(content))
      if(title === '组件定义YAML详情'){
        if (yaml.deploySessionAffinityTimeoutSeconds !== null && yaml.deploySessionAffinityTimeoutSeconds !== 0) {
          yaml.deploySessionAffinityTimeoutSeconds = Number(yaml.deploySessionAffinityTimeoutSeconds);
        }else{
          delete yaml.deploySessionAffinityTimeoutSeconds
        }
        if (yaml.deployLocalPorts !== null) {
          yaml.deployLocalPorts.map((item) => {
            item.port = Number(item.port);
          });
        }
        if (yaml.deployNodePorts !== null) {
          yaml.deployNodePorts.map((item) => {
            item.port = Number(item.port);
          });
        }
        if (yaml.dependServices !== null) {
          yaml.dependServices.map((item) => {
            item.dependPort = Number(item.dependPort);
          });
        }
        yaml.deployHealthCheck.checkPort = Number(yaml.deployHealthCheck.checkPort);
        yaml.deployHealthCheck.livenessDelaySeconds = Number(yaml.deployHealthCheck.livenessDelaySeconds);
        yaml.deployHealthCheck.livenessPeriodSeconds = Number(yaml.deployHealthCheck.livenessPeriodSeconds);
        yaml.deployHealthCheck.readinessDelaySeconds = Number(yaml.deployHealthCheck.readinessDelaySeconds);
        yaml.deployHealthCheck.readinessPeriodSeconds = Number(yaml.deployHealthCheck.readinessPeriodSeconds);
        yaml.deployHealthCheck.httpGet.port = Number(yaml.deployHealthCheck.httpGet.port);
        yaml.securityContext.runAsUser = Number(yaml.securityContext.runAsUser);
        yaml.securityContext.runAsGroup = Number(yaml.securityContext.runAsGroup);
        yaml.deployReplicas = Number(yaml.deployReplicas);
        Object.keys(yaml).forEach(item => {
          if(yaml[item] !== null){
            if(yaml[item] instanceof Array && yaml[item].length <= 0){
              delete yaml[item]
            }else if(yaml[item] instanceof Object && JSON.stringify(yaml[item]) == "{}"){
              delete yaml[item]
            }else if(yaml[item] === ''){
              delete yaml[item]
            }else if(yaml[item] instanceof Object){
              if(item === 'deployResources'){
                if(yaml.deployResources.cpuLimit === '' && yaml.deployResources.cpuRequest === '' && yaml.deployResources.memoryLimit === '' && yaml.deployResources.memoryRequest === ''){
                  delete yaml.deployResources
                }else{
                  vm.sortData(yaml.deployResources)
                }
              }else if(item === 'deployHealthCheck'){
                if(yaml.deployHealthCheck.checkPort === 0 && yaml.deployHealthCheck.livenessDelaySeconds === 0 && yaml.deployHealthCheck.livenessPeriodSeconds === 0 && yaml.deployHealthCheck.readinessDelaySeconds === 0 && yaml.deployHealthCheck.readinessPeriodSeconds === 0 && yaml.deployHealthCheck.httpGet.port === 0 && yaml.deployHealthCheck.httpGet.httpHeaders === null && yaml.deployHealthCheck.httpGet.path === ''){
                  delete yaml.deployHealthCheck
                }else{
                  vm.sortData(yaml.deployHealthCheck.httpGet)
                  vm.sortData(yaml.deployHealthCheck)
                }
              }else if(item === 'securityContext'){
                if(yaml.securityContext.runAsGroup === 0 && yaml.securityContext.runAsUser === 0){
                  delete yaml.securityContext
                }else{
                  vm.sortData(yaml.securityContext)
                }
              }else if(item === 'deployVolumes'){
                if(yaml.deployVolumes && yaml.deployVolumes !== null && yaml.deployVolumes.length > 0){
                  yaml.deployVolumes.forEach(row => {
                    vm.sortData(row)
                  })
                }
              }else if(item === 'deployLocalPorts'){
                if(yaml.deployLocalPorts && yaml.deployLocalPorts !== null && yaml.deployLocalPorts.length > 0){
                  yaml.deployLocalPorts.forEach(row => {
                    vm.sortData(row)
                  })
                }
              }
            }
          }else{
            delete yaml[item]
          }
        })
      }
      if(yaml instanceof Object){
        vm.defaultDebugYaml = YAML.stringify(yaml, 4)
      }else{
        vm.defaultDebugYaml = yaml
      }
      vm.$refs.monaco2.monacoEditor.setValue(vm.defaultDebugYaml)
      vm.defaultDialogTitle = title
      vm.defaultDebugDialog = true
    },
    openUpdateDebug (envName) {
      const vm = this
      vm.addDebugDialog = true
      vm.targetEnvName = envName
      vm.actionType = 'update'
      request.get(`/admin/project/${vm.targetProjectName}`).then(response => {
        response.data.project.projectAvailableEnvs.map(item => {
          if(item.envName === envName){
            vm.addDebugForm = item.componentDebug.deploySpecDebug
          }
        })
      }).catch(error => {
        vm.errorTip(true,error.response.data.msg)
      })
    },
    openDeleteDebug (envName) {
      const vm = this
      vm.deleteDebugForm.envName = envName
      vm.deleteDebugDialog = true
    },
    deleteDebug () {
      const vm = this
      if(vm.$refs.deleteDebugRef.validate && vm.deleteDebugForm.envName == vm.deleteDebugName){
        request.post(`/admin/project/${vm.targetProjectName}/envComponentDebugDelete`, vm.deleteDebugForm).then(response => {
          vm.deleteDebugDialog = false
          vm.successTip(true,response.msg)
          vm.showLog(response)
        }).catch(error => {
          vm.errorTip(true,error.response.data.msg)
        })
      }else{
        vm.warnTip(true, '请输入正确的环境名')
      }
    },
    getDefaultComponent () {
      const vm = this
      vm.dialogLoading = true
      request.get(`/admin/project/${vm.targetProjectName}/envComponentTemplates`).then(response => {
        var List = [ { text: '默认', value: '' } ]
        Object.keys(response.data.deploySpecStatic).forEach(item => {
          if(response.data.deploySpecStatic[item] !== null){
            if(response.data.deploySpecStatic[item] instanceof Array && response.data.deploySpecStatic[item].length <= 0){
              response.data.deploySpecStatic[item] = null
            }else if(response.data.deploySpecStatic[item] instanceof Object && JSON.stringify(response.data.deploySpecStatic[item]) == "{}"){
              response.data.deploySpecStatic[item] = null
            }
          }
        })
        if (response.data.deploySpecStatic.deployEnvs !== null) {
          response.data.deploySpecStatic.deployEnvs.forEach((row, rowIndex) => {
            row = row.split("=");
            response.data.deploySpecStatic.deployEnvs[rowIndex] = row;
          });
        }
        // if (response.data.deploySpecStatic.deployArgs !== null) {
        //   response.data.deploySpecStatic.deployArgs.forEach((row, rowIndex) => {
        //     row = row.split("=");
        //     response.data.deploySpecStatic.deployArgs[rowIndex] = row;
        //   });
        // }
        List[0].value = {
          deploySpecStatic: response.data.deploySpecStatic,
          componentTemplateDesc: '',
          componentTemplateName: '默认'
        }
        response.data.componentTemplates.map(item => {
          Object.keys(item.deploySpecStatic).forEach(i => {
            if(item.deploySpecStatic[i] !== null){
              if(item.deploySpecStatic[i] instanceof Array && item.deploySpecStatic[i].length <= 0){
                item.deploySpecStatic[i] = null
              }else if(item.deploySpecStatic[i] instanceof Object && JSON.stringify(item.deploySpecStatic[i]) == "{}"){
                item.deploySpecStatic[i] = null
              }
            }
          })
          if (item.deploySpecStatic.deployEnvs !== null) {
            item.deploySpecStatic.deployEnvs.forEach((row, rowIndex) => {
              row = row.split("=");
              item.deploySpecStatic.deployEnvs[rowIndex] = row;
            });
          }
          // if (item.deploySpecStatic.deployArgs !== null) {
          //   item.deploySpecStatic.deployArgs.forEach((row, rowIndex) => {
          //     row = row.split("=");
          //     item.deploySpecStatic.deployArgs[rowIndex] = row;
          //   });
          // }
          var listItem = {
            text: '',
            value: ''
          }
          listItem.text = item.componentTemplateName
          listItem.value = item
          List.push(listItem)
        })
        vm.componentList = List
        vm.dialogLoading = false
        vm.addComponentForm = vm.componentList[0].value
        vm.addComponentDialog = true
      }).catch(error => {
        vm.errorTip(true,error.response.data.msg)
      })
    },
    openAddComponent (envName) {
      const vm = this
      vm.targetEnvName = envName
      vm.targetIndex = 'add'
      request.get(`/admin/project/${vm.targetProjectName}`).then(response => {
        vm.project = response.data.project
        response.data.project.projectAvailableEnvs.map(item => {
          if(item.envName === envName){
            vm.pvs = item.pvs
          }
        })
      }).catch(error => {
        vm.errorTip(true,error.response.data.msg)
      })
      vm.getDefaultComponent()
    },
    previewComponent() {
      const vm = this;
      if (vm.$refs.addComponentRef.validate()) {
        var copyData = JSON.parse(JSON.stringify(vm.addComponentForm.deploySpecStatic))
        if (copyData.deploySessionAffinityTimeoutSeconds !== null && copyData.deploySessionAffinityTimeoutSeconds !== 0) {
          copyData.deploySessionAffinityTimeoutSeconds = Number(copyData.deploySessionAffinityTimeoutSeconds);
        }else{
          delete copyData.deploySessionAffinityTimeoutSeconds
        }
        if (copyData.deployLocalPorts !== null) {
          copyData.deployLocalPorts.map((item) => {
            item.port = Number(item.port);
          });
        }
        if (copyData.deployNodePorts !== null) {
          copyData.deployNodePorts.map((item) => {
            item.port = Number(item.port);
          });
        }
        if (copyData.dependServices !== null) {
          copyData.dependServices.map((item) => {
            item.dependPort = Number(item.dependPort);
          });
        }
        copyData.deployHealthCheck.checkPort = Number(copyData.deployHealthCheck.checkPort);
        copyData.deployHealthCheck.livenessDelaySeconds = Number(copyData.deployHealthCheck.livenessDelaySeconds);
        copyData.deployHealthCheck.livenessPeriodSeconds = Number(copyData.deployHealthCheck.livenessPeriodSeconds);
        copyData.deployHealthCheck.readinessDelaySeconds = Number(copyData.deployHealthCheck.readinessDelaySeconds);
        copyData.deployHealthCheck.readinessPeriodSeconds = Number(copyData.deployHealthCheck.readinessPeriodSeconds);
        copyData.deployHealthCheck.httpGet.port = Number(copyData.deployHealthCheck.httpGet.port);
        copyData.securityContext.runAsUser = Number(copyData.securityContext.runAsUser);
        copyData.securityContext.runAsGroup = Number(copyData.securityContext.runAsGroup);
        copyData.deployReplicas = Number(copyData.deployReplicas);
        if (copyData.deployEnvs !== null && copyData.deployEnvs.length > 0) {
          copyData.deployEnvs.map((row, rowIndex) => {
            row = row.join("=");
            copyData.deployEnvs[rowIndex] = row;
          });
        }
        Object.keys(copyData).forEach(item => {
          if(copyData[item] !== null){
            if(copyData[item] instanceof Array && copyData[item].length <= 0){
              delete copyData[item]
            }else if(copyData[item] instanceof Object && JSON.stringify(copyData[item]) == "{}"){
              delete copyData[item]
            }else if(copyData[item] === ''){
              delete copyData[item]
            }else if(copyData[item] instanceof Object){
              if(item === 'deployResources'){
                if(copyData.deployResources.cpuLimit === '' && copyData.deployResources.cpuRequest === '' && copyData.deployResources.memoryLimit === '' && copyData.deployResources.memoryRequest === ''){
                  delete copyData.deployResources
                }else{
                  vm.sortData(copyData.deployResources)
                }
              }else if(item === 'deployHealthCheck'){
                if(copyData.deployHealthCheck.checkPort === 0 && copyData.deployHealthCheck.livenessDelaySeconds === 0 && copyData.deployHealthCheck.livenessPeriodSeconds === 0 && copyData.deployHealthCheck.readinessDelaySeconds === 0 && copyData.deployHealthCheck.readinessPeriodSeconds === 0 && copyData.deployHealthCheck.httpGet.port === 0 && copyData.deployHealthCheck.httpGet.httpHeaders === null && copyData.deployHealthCheck.httpGet.path === ''){
                  delete copyData.deployHealthCheck
                }else{
                  vm.sortData(copyData.deployHealthCheck.httpGet)
                  vm.sortData(copyData.deployHealthCheck)
                }
              }else if(item === 'securityContext'){
                if(copyData.securityContext.runAsGroup === 0 && copyData.securityContext.runAsUser === 0){
                  delete copyData.securityContext
                }else{
                  vm.sortData(copyData.securityContext)
                }
              }else if(item === 'deployVolumes'){
                if(copyData.deployVolumes && copyData.deployVolumes !== null && copyData.deployVolumes.length > 0){
                  copyData.deployVolumes.forEach(row => {
                    vm.sortData(row)
                  })
                }
              }else if(item === 'deployLocalPorts'){
                if(copyData.deployLocalPorts && copyData.deployLocalPorts !== null && copyData.deployLocalPorts.length > 0){
                  copyData.deployLocalPorts.forEach(row => {
                    vm.sortData(row)
                  })
                }
              }
            }
          }else{
            delete copyData[item]
          }
        })
        vm.yamlText = YAML.stringify(copyData, 4);
        vm.$refs.monaco.monacoEditor.setValue(vm.yamlText)
        vm.YAMLDialog = true;
      }
    },
    clearParams(name) {
      const vm = this;
      if(name === "other") {
        vm.addComponentForm.deploySpecStatic.deployCommand = "";
        vm.addComponentForm.deploySpecStatic.deployEnvs = null;
        vm.addComponentForm.deploySpecStatic.deployArgs = null;
        vm.addComponentForm.deploySpecStatic.deploySessionAffinityTimeoutSeconds = 0;
      } else if (name === "securityContext") {
        vm.addComponentForm.deploySpecStatic.securityContext = {
          runAsUser: 0,
          runAsGroup: 0,
        };
      }else if(name === "deployHealthCheck") {
        vm.addComponentForm.deploySpecStatic.deployHealthCheck = {
          checkPort: 0,
          httpGet: {
            httpHeaders: null,
            path: "",
            port: 0,
          },
          livenessDelaySeconds: 0,
          livenessPeriodSeconds: 0,
          readinessDelaySeconds: 0,
          readinessPeriodSeconds: 0,
        };
      }else if(name === 'deployResources'){
        vm.addComponentForm.deploySpecStatic.deployResources = {
          cpuLimit: '',
          cpuRequest: '',
          memoryLimit: '',
          memoryRequest: ''
        };
      }else if(name === 'portSetting'){
        vm.addComponentForm.deploySpecStatic.deployNodePorts = null
        vm.addComponentForm.deploySpecStatic.deployLocalPorts = null
      }else{
        vm.addComponentForm.deploySpecStatic[name] = null;
      }
    },
    chooseParams(e) {
      const vm = this;
      if (e === "杂项") {
        if (vm.addComponentForm.deploySpecStatic.deployEnvs === null && vm.addComponentForm.deploySpecStatic.deploySessionAffinityTimeoutSeconds === 0 && vm.addComponentForm.deploySpecStatic.deployCommand === "" && vm.addComponentForm.deploySpecStatic.deployArgs === null){
          vm.addComponentForm.deploySpecStatic.deployEnvs = [["", ""]];
        }
      } else if (e === "deployLocalPorts" || e === "deployNodePorts") {
        if (
          vm.addComponentForm.deploySpecStatic.deployNodePorts === null &&
          vm.addComponentForm.deploySpecStatic.deployLocalPorts === null
        ) {
          vm.addComponentForm.deploySpecStatic[e] = [];
        } else {
          vm.warnTip(true, "已存在可用配置项或存在互斥配置项，请勿重复添加");
        }
      } else if (e === "securityContext") {
        if (
          vm.addComponentForm.deploySpecStatic.securityContext.runAsUser == 0 &&
          vm.addComponentForm.deploySpecStatic.securityContext.runAsGroup == 0
        ) {
          vm.addComponentForm.deploySpecStatic.securityContext = {
            runAsUser: 1000,
            runAsGroup: 0,
          };
        }
      } else if (e === "deployHealthCheck") {
        if (
          vm.addComponentForm.deploySpecStatic.deployHealthCheck
            .livenessDelaySeconds === 0 &&
          vm.addComponentForm.deploySpecStatic.deployHealthCheck
            .livenessPeriodSeconds === 0 &&
          vm.addComponentForm.deploySpecStatic.deployHealthCheck
            .readinessDelaySeconds === 0 &&
          vm.addComponentForm.deploySpecStatic.deployHealthCheck
            .readinessPeriodSeconds === 0 &&
          vm.addComponentForm.deploySpecStatic.deployHealthCheck.checkPort === 0 &&
          vm.addComponentForm.deploySpecStatic.deployHealthCheck.httpGet.port === 0 &&
          vm.addComponentForm.deploySpecStatic.deployHealthCheck.httpGet.path === "" &&
          vm.addComponentForm.deploySpecStatic.deployHealthCheck.httpGet.httpHeaders ===
            null
        ) {
         vm.addComponentForm.deploySpecStatic.deployHealthCheck.readinessDelaySeconds = 15;
         vm.addComponentForm.deploySpecStatic.deployHealthCheck.readinessPeriodSeconds = 5;
          vm.addComponentForm.deploySpecStatic.deployHealthCheck.livenessDelaySeconds = 60;
          vm.addComponentForm.deploySpecStatic.deployHealthCheck.livenessPeriodSeconds = 30;
        }
      } else if (e === "deployResources") {
        if (vm.addComponentForm.deploySpecStatic.deployResources.cpuLimit === '' && vm.addComponentForm.deploySpecStatic.deployResources.cpuRequest === '' && vm.addComponentForm.deploySpecStatic.deployResources.memoryLimit === '' && vm.addComponentForm.deploySpecStatic.deployResources.memoryRequest === '') {
          vm.addComponentForm.deploySpecStatic.deployResources = {
            memoryRequest: "10Mi",
            memoryLimit: "100Mi",
            cpuRequest: "10m",
            cpuLimit: "100m",
          };
        }
      }else if(e === '服务端口设置'){
        if(vm.addComponentForm.deploySpecStatic.deployNodePorts === null && vm.addComponentForm.deploySpecStatic.deployLocalPorts === null){
          vm.addComponentForm.deploySpecStatic.deployNodePorts = []
        }
      } else {
        if (vm.addComponentForm.deploySpecStatic[e] === null) {
          if (
            e === "deployVolumes" ||
            e === "dependServices" ||
            e === "hostAliases"
          ) {
            vm.addComponentForm.deploySpecStatic[e] = [];
          } else {
            vm.addComponentForm.deploySpecStatic[e] = {};
          }
        }
      }
      vm.timer = setTimeout(() => {
        document.querySelector("#" + e + '-' + vm.targetIndex).scrollIntoView(true);
      }, 500);
    },
    checkChange(e) {
      const vm = this;
      if (e === "checkPort") {
        vm.addComponentForm.deploySpecStatic.deployHealthCheck.httpGet = {
          port: 0,
          path: "",
          httpHeaders: null
        }
        vm.addComponentForm.deploySpecStatic.deployHealthCheck.checkPort = 8080
      }else{
        vm.addComponentForm.deploySpecStatic.deployHealthCheck.httpGet = {
          path: "",
          port: 8080,
          httpHeaders: null,
        }
        vm.addComponentForm.deploySpecStatic.deployHealthCheck.checkPort = 0
      }
    },
    changePortSet(e) {
      const vm = this;
      if(e === 'deployNodePorts'){
        vm.addComponentForm.deploySpecStatic.deployNodePorts = []
        vm.addComponentForm.deploySpecStatic.deployLocalPorts = null
      }else{
        vm.addComponentForm.deploySpecStatic.deployNodePorts = null
        vm.addComponentForm.deploySpecStatic.deployLocalPorts = []
      }
    },
    addDeployEnvs() {
      const vm = this;
      let addItem = ["", ""];
      if (vm.addComponentForm.deploySpecStatic.deployEnvs === null) {
        vm.addComponentForm.deploySpecStatic.deployEnvs = [];
        vm.addComponentForm.deploySpecStatic.deployEnvs.push(addItem);
      } else {
        vm.addComponentForm.deploySpecStatic.deployEnvs.push(addItem);
      }
    },
    addDeployLocalPort() {
      const vm = this;
      let addItem = {
        port: null,
        protocol: "tcp",
      };
      if (vm.addComponentForm.deploySpecStatic.deployLocalPorts === null) {
        vm.addComponentForm.deploySpecStatic.deployLocalPorts = [];
        vm.addComponentForm.deploySpecStatic.deployLocalPorts.push(addItem);
      } else {
        vm.addComponentForm.deploySpecStatic.deployLocalPorts.push(addItem);
      }
    },
    copyDeployLocalPort(j) {
      const vm = this;
      let copyItem = JSON.parse(
        JSON.stringify(vm.addComponentForm.deploySpecStatic.deployLocalPorts[j])
      );
      vm.addComponentForm.deploySpecStatic.deployLocalPorts.push(copyItem);
    },
    deleteDeployLocalPort(j) {
      const vm = this;
      vm.addComponentForm.deploySpecStatic.deployLocalPorts.splice(j, 1);
    },
    deleteDeployEnvs(j) {
      const vm = this;
      vm.addComponentForm.deploySpecStatic.deployEnvs.splice(j, 1);
    },
    addDeployNodePort() {
      const vm = this;
      let addItem = {
        port: null,
        protocol: "tcp",
        nodePort: null,
      };
      if (vm.addComponentForm.deploySpecStatic.deployNodePorts === null) {
        vm.addComponentForm.deploySpecStatic.deployNodePorts = [];
        vm.addComponentForm.deploySpecStatic.deployNodePorts.push(addItem);
      } else {
        vm.addComponentForm.deploySpecStatic.deployNodePorts.push(addItem);
      }
    },
    copyDeployNodePort(j) {
      const vm = this;
      let copyItem = JSON.parse(
        JSON.stringify(vm.addComponentForm.deploySpecStatic.deployNodePorts[j])
      );
      vm.addComponentForm.deploySpecStatic.deployNodePorts.push(copyItem);
    },
    deleteDeployNodePort(j) {
      const vm = this;
      vm.addComponentForm.deploySpecStatic.deployNodePorts.splice(j, 1);
    },
    addDeployVolumes() {
      const vm = this;
      let addItem = {
        pathInPod: "",
        pathInPv: "",
        pvc: "",
      };
      if (vm.addComponentForm.deploySpecStatic.deployVolumes === null) {
        vm.addComponentForm.deploySpecStatic.deployVolumes = [];
        vm.addComponentForm.deploySpecStatic.deployVolumes.push(addItem);
      } else {
        vm.addComponentForm.deploySpecStatic.deployVolumes.push(addItem);
      }
    },
    copyDeployVolumes(j) {
      const vm = this;
      let copyItem = JSON.parse(
        JSON.stringify(vm.addComponentForm.deploySpecStatic.deployVolumes[j])
      );
      vm.addComponentForm.deploySpecStatic.deployVolumes.push(copyItem);
    },
    deleteDeployVolumes(j) {
      const vm = this;
      vm.addComponentForm.deploySpecStatic.deployVolumes.splice(j, 1);
    },
    addHttpHeaders() {
      const vm = this;
      let addItem = {
        name: "",
        value: "",
      };
      if (
        vm.addComponentForm.deploySpecStatic.deployHealthCheck.httpGet.httpHeaders ===
        null
      ) {
        vm.addComponentForm.deploySpecStatic.deployHealthCheck.httpGet.httpHeaders = [];
        vm.addComponentForm.deploySpecStatic.deployHealthCheck.httpGet.httpHeaders.push(
          addItem
        );
      } else {
        vm.addComponentForm.deploySpecStatic.deployHealthCheck.httpGet.httpHeaders.push(
          addItem
        );
      }
    },
    copyHttpHeaders(j) {
      const vm = this;
      let copyItem = JSON.parse(
        JSON.stringify(
          vm.addComponentForm.deploySpecStatic.deployHealthCheck.httpGet.httpHeaders[j]
        )
      );
      vm.addComponentForm.deploySpecStatic.deployHealthCheck.httpGet.httpHeaders.push(
        copyItem
      );
    },
    deleteHttpHeaders(j) {
      const vm = this;
      vm.addComponentForm.deploySpecStatic.deployHealthCheck.httpGet.httpHeaders.splice(
        j,
        1
      );
    },
    addDependServices() {
      const vm = this;
      let addItem = {
        dependName: "",
        dependPort: null,
        dependType: "TCP",
      };
      if (vm.addComponentForm.deploySpecStatic.dependServices === null) {
        vm.addComponentForm.deploySpecStatic.dependServices = [];
        vm.addComponentForm.deploySpecStatic.dependServices.push(addItem);
      } else {
        vm.addComponentForm.deploySpecStatic.dependServices.push(addItem);
      }
    },
    copyDependServices(j) {
      const vm = this;
      let copyItem = JSON.parse(
        JSON.stringify(vm.addComponentForm.deploySpecStatic.dependServices[j])
      );
      vm.addComponentForm.deploySpecStatic.dependServices.push(copyItem);
    },
    deleteDependServices(j) {
      const vm = this;
      vm.addComponentForm.deploySpecStatic.dependServices.splice(j, 1);
    },
    addHostAliases() {
      const vm = this;
      let addItem = {
        ip: "",
        hostnames: [],
      };
      if (vm.addComponentForm.deploySpecStatic.hostAliases === null) {
        vm.addComponentForm.deploySpecStatic.hostAliases = [];
        vm.addComponentForm.deploySpecStatic.hostAliases.push(addItem);
      } else {
        vm.addComponentForm.deploySpecStatic.hostAliases.push(addItem);
      }
    },
    copyHostAliases(j) {
      const vm = this;
      let copyItem = JSON.parse(
        JSON.stringify(vm.addComponentForm.deploySpecStatic.hostAliases[j])
      );
      vm.addComponentForm.deploySpecStatic.hostAliases.push(copyItem);
    },
    deleteHostAliases(j) {
      const vm = this;
      vm.addComponentForm.deploySpecStatic.hostAliases.splice(j, 1);
    },
    addComponent () {
      const vm = this
      if(vm.$refs.addComponentRef.validate()){
        var copyData = JSON.parse(JSON.stringify(vm.addComponentForm.deploySpecStatic))
        var componentDesc = JSON.parse(JSON.stringify(vm.addComponentForm.componentTemplateDesc))
        if (copyData.deploySessionAffinityTimeoutSeconds !== null && copyData.deploySessionAffinityTimeoutSeconds !== 0) {
          copyData.deploySessionAffinityTimeoutSeconds = Number(copyData.deploySessionAffinityTimeoutSeconds);
        }else{
          delete copyData.deploySessionAffinityTimeoutSeconds
        }
        if (copyData.deployLocalPorts !== null) {
          copyData.deployLocalPorts.map((item) => {
            item.port = Number(item.port);
          });
        }
        if (copyData.deployNodePorts !== null) {
          copyData.deployNodePorts.map((item) => {
            item.port = Number(item.port);
          });
        }
        if (copyData.dependServices !== null) {
          copyData.dependServices.map((item) => {
            item.dependPort = Number(item.dependPort);
          });
        }
        copyData.deployHealthCheck.checkPort = Number(copyData.deployHealthCheck.checkPort);
        copyData.deployHealthCheck.livenessDelaySeconds = Number(copyData.deployHealthCheck.livenessDelaySeconds);
        copyData.deployHealthCheck.livenessPeriodSeconds = Number(copyData.deployHealthCheck.livenessPeriodSeconds);
        copyData.deployHealthCheck.readinessDelaySeconds = Number(copyData.deployHealthCheck.readinessDelaySeconds);
        copyData.deployHealthCheck.readinessPeriodSeconds = Number(copyData.deployHealthCheck.readinessPeriodSeconds);
        copyData.deployHealthCheck.httpGet.port = Number(copyData.deployHealthCheck.httpGet.port);
        copyData.securityContext.runAsUser = Number(copyData.securityContext.runAsUser);
        copyData.securityContext.runAsGroup = Number(copyData.securityContext.runAsGroup);
        copyData.deployReplicas = Number(copyData.deployReplicas);
        if (copyData.deployEnvs !== null && copyData.deployEnvs.length > 0) {
          copyData.deployEnvs.map((row, rowIndex) => {
            row = row.join("=");
            copyData.deployEnvs[rowIndex] = row;
          });
        }
        Object.keys(copyData).forEach(item => {
          if(copyData[item] !== null){
            if(copyData[item] instanceof Array && copyData[item].length <= 0){
              delete copyData[item]
            }else if(copyData[item] instanceof Object && JSON.stringify(copyData[item]) == "{}"){
              delete copyData[item]
            }else if(copyData[item] === ''){
              delete copyData[item]
            }else if(copyData[item] instanceof Object){
              if(item === 'deployResources'){
                if(copyData.deployResources.cpuLimit === '' && copyData.deployResources.cpuRequest === '' && copyData.deployResources.memoryLimit === '' && copyData.deployResources.memoryRequest === ''){
                  delete copyData.deployResources
                }else{
                  vm.sortData(copyData.deployResources)
                }
              }else if(item === 'deployHealthCheck'){
                if(copyData.deployHealthCheck.checkPort === 0 && copyData.deployHealthCheck.livenessDelaySeconds === 0 && copyData.deployHealthCheck.livenessPeriodSeconds === 0 && copyData.deployHealthCheck.readinessDelaySeconds === 0 && copyData.deployHealthCheck.readinessPeriodSeconds === 0 && copyData.deployHealthCheck.httpGet.port === 0 && copyData.deployHealthCheck.httpGet.httpHeaders === null && copyData.deployHealthCheck.httpGet.path === ''){
                  delete copyData.deployHealthCheck
                }else{
                  vm.sortData(copyData.deployHealthCheck.httpGet)
                  vm.sortData(copyData.deployHealthCheck)
                }
              }else if(item === 'securityContext'){
                if(copyData.securityContext.runAsGroup === 0 && copyData.securityContext.runAsUser === 0){
                  delete copyData.securityContext
                }else{
                  vm.sortData(copyData.securityContext)
                }
              }else if(item === 'deployVolumes'){
                if(copyData.deployVolumes && copyData.deployVolumes !== null && copyData.deployVolumes.length > 0){
                  copyData.deployVolumes.forEach(row => {
                    vm.sortData(row)
                  })
                }
              }else if(item === 'deployLocalPorts'){
                if(copyData.deployLocalPorts && copyData.deployLocalPorts !== null && copyData.deployLocalPorts.length > 0){
                  copyData.deployLocalPorts.forEach(row => {
                    vm.sortData(row)
                  })
                }
              }
            }
          }else{
            delete copyData[item]
          }
        })
        var componentYaml = YAML.stringify(copyData, 4);
        request.post(`/admin/project/${vm.targetProjectName}/envComponentUpdate`, {
          envName: vm.targetEnvName,
          componentDesc: componentDesc,
          componentYaml: componentYaml
        }).then(response => {
          vm.addComponentDialog = false
          vm.updateComponentDialog = false
          vm.successTip(true,response.msg)
          vm.showLog(response)
        }).catch(error => {
          vm.errorTip(true, error.response.data.msg)
        })
      }else{
        vm.warnTip(true, '请填写完整内容')
      }
    },
    openUpdateComponent (envName, componentName) {
      const vm = this
      vm.dialogLoading = true
      vm.targetEnvName = envName
      vm.targetIndex = envName+componentName
      vm.updateComponentDialog = true
      request.get(`/admin/project/${vm.targetProjectName}`).then(response => {
        vm.project = response.data.project
        response.data.project.projectAvailableEnvs.forEach(item => {
          if(item.envName == envName){
            vm.pvs = item.pvs
            item.components.forEach(i => {
              if(i.componentName == componentName){
                vm.addComponentForm.componentTemplateDesc = i.componentDesc
                vm.addComponentForm.deploySpecStatic = i.deploySpecStatic
              }
            })
          }
        })
        vm.dialogLoading = false
        Object.keys(vm.addComponentForm.deploySpecStatic).forEach(i => {
          if(vm.addComponentForm.deploySpecStatic[i] !== null){
            if(vm.addComponentForm.deploySpecStatic[i] instanceof Array && vm.addComponentForm.deploySpecStatic[i].length <= 0){
              vm.addComponentForm.deploySpecStatic[i] = null
            }else if(vm.addComponentForm.deploySpecStatic[i] instanceof Object && JSON.stringify(vm.addComponentForm.deploySpecStatic[i]) == "{}"){
              vm.addComponentForm.deploySpecStatic[i] = null
            }
          }
        })
        if (vm.addComponentForm.deploySpecStatic.deployEnvs !== null) {
          vm.addComponentForm.deploySpecStatic.deployEnvs.forEach((row, rowIndex) => {
            row = row.split("=");
            vm.addComponentForm.deploySpecStatic.deployEnvs[rowIndex] = row;
          });
        }
      }).catch(error => {
        vm.errorTip(true,error.response.data.msg)
      })
    },
    openDeleteComponent (envName, componentName) {
      const vm = this
      vm.deleteComponentForm.envName = envName
      vm.deleteComponentForm.componentName = componentName
      vm.deleteComponentDialog = true
    },
    deleteComponent () {
      const vm = this
      if(vm.$refs.deleteComponentRef.validate() && vm.deleteComponentName == vm.deleteComponentForm.componentName){
        request.post(`/admin/project/${vm.targetProjectName}/envComponentDelete`, vm.deleteComponentForm).then(response => {
          vm.deleteComponentDialog = false
          vm.successTip(true,response.msg)
          vm.showLog(response)
        }).catch(error => {
          vm.errorTip(true, error.response.data.msg)
        })
      }else{
        vm.warnTip(true, '请输入正确的组件名')
      }
    },
    addInputBox () {
      const vm = this
      vm.variableList.push([ '', '' ])
    },
    deleteInputBox (index) {
      const vm = this
      vm.variableList.splice(index,1)
    },
    projectChange (projectName) {
      const vm = this
      vm.dbJoinForm.envName = ''
      vm.hostJoinForm.envName = ''
      vm.projectEnvList.forEach(item => {
        if(projectName == item.value){
          vm.projectEnvListChildren = item.children
        }
      })
    },
    openTriggerAdd (branchName) {
      const vm = this
      vm.addTriggerDialog = true
      vm.triggerAddForm.branchName = branchName
    },
    triggerAdd () {
      const vm = this
      if(vm.$refs.triggerAddRef.validate()){
        request.post(`/admin/project/${vm.targetProjectName}/pipelineTriggerOp`, vm.triggerAddForm).then(response => {
          vm.addTriggerDialog = false
          vm.successTip(true,response.msg)
          vm.refreshList()
          vm.$refs.triggerAddRef.reset()
        }).catch(error => {
          vm.errorTip(true, error.response.data.msg)
        })
      }
    },
    openTriggerUpdate (branchName, stepAction) {
      const vm = this
      vm.updateTriggerDialog = true
      vm.dialogLoading = true
      request.get(`/admin/project/${vm.targetProjectName}`).then(response => {
        response.data.project.pipelines.forEach(row => {
          if(row.branchName === branchName){
            row.pipelineTriggers.forEach(item => {
              if(item.stepAction === stepAction){
                vm.triggerUpdateForm = {
                  branchName: branchName,
                  stepAction: stepAction,
                  statusResults: item.statusResults,
                  enable: item.enable,
                  webhookUrl: item.webhookUrl,
                  webhookToken: item.webhookToken,
                  committeeMail: item.committeeMail,
                  mails: item.mails || [],
                  usernames: item.usernames
                }
              }
              vm.dialogLoading = false
            })
          }
        })
      }).catch(error => {
        vm.errorTip(true, error.response.data.msg)
        vm.dialogLoading = false
      })
    },
    triggerUpdate () {
      const vm = this
      if(vm.$refs.triggerUpdateRef.validate()){
        request.post(`/admin/project/${vm.targetProjectName}/pipelineTriggerOp`, vm.triggerUpdateForm).then(response => {
          vm.updateTriggerDialog = false
          vm.successTip(true,response.msg)
          vm.refreshList()
          vm.$refs.triggerUpdateRef.reset()
        }).catch(error => {
          vm.errorTip(true, error.response.data.msg)
        })
      }
    },
    openTriggerDelete (branchName, stepAction) {
      const vm = this
      vm.triggerDeleteForm = {
        branchName: branchName,
        stepAction: stepAction
      }
      vm.deleteTriggerDialog = true
    },
    triggerDelete () {
      const vm = this
      request.post(`/admin/project/${vm.targetProjectName}/pipelineTriggerDelete`, vm.triggerDeleteForm).then(response => {
        vm.deleteTriggerDialog = false
        vm.successTip(true,response.msg)
        vm.refreshList()
      }).catch(error => {
        vm.errorTip(true, error.response.data.msg)
      })
    },
    sortData(data) {
      Object.keys(data).forEach(item => {
        if(data[item] !== null){
          if(data[item] instanceof Array && data[item].length <= 0){
            delete data[item]
          }else if(data[item] instanceof Object && JSON.stringify(data[item]) == "{}"){
            delete data[item]
          }else if( typeof data[item] === 'number' && data[item] === 0){
            delete data[item]
          }else if(data[item] === ''){
            delete data[item]
          }else if(data[item] === false){
            delete data[item]
          }
        }else{
          delete data[item]
        }
      })
    }
  },
  filters: {
    changeColor: function (value) {
      if(value == 'FAIL'){
        return {color: 'red'}
      }else if(value == 'INFO'){
        return {color: 'green'}
      }else{
        return null
      }
    },
    filterAll: function (val) {
      if(val === -1){
        return '全部'
      }else{
        return val
      }
    },
    stepActionFilter: function (val) {
      var stepActionList = [
        { text: '流水线结束', value: '' },
        { text: '编译构建结束', value: 'build' },
        { text: '代码扫描结束', value: 'scanCode' },
        { text: '镜像打包结束', value: 'packageImage' },
        { text: '镜像扫描结束', value: 'scanImage' },
        { text: '容器发布结束', value: 'deploy' },
        { text: '容器回滚结束', value: 'undo' },
        { text: '生产镜像同步结束', value: 'syncImage' },
        { text: '检查容器发布结束', value: 'checkDeploy' },
        { text: '制品打包结束', value: 'artifact' },
        { text: '制品发布结束', value: 'deployArtifact' },
        { text: '接口测试结束', value: 'testApi' },
        { text: '性能测试结束', value: 'testPerformance' },
        { text: '界面测试结束', value: 'testWebui' },
        { text: '数据库执行结束', value: 'databaseExec' },
        { text: '数据库回滚结束', value: 'databaseRollback' },
        { text: '服务网格部署结束', value: 'applyMesh' },
        { text: '调整服务网格结束', value: 'changeMesh' },
      ]
      stepActionList.map(item => {
        if(val == item.value){
          val = item.text
        }
      })
      return val
    }
  },
}
</script>

<style>
.info-table .v-data-table{
  border-radius: 0px !important;
  box-shadow: none !important;
}
</style>
<style scoped lang="scss">
.v-card__title {
  padding: 4px 16px;
  font-size: 1rem;
}
.modules-item {
  cursor: pointer;
}
.input-btn {
  cursor: pointer;
}
.limit-config tr{
  td {
    border-right: 1px solid #ccc;
    &:last-child {
      border-right: none;
    }
  }
  th {
    border-right: 1px solid #ccc;
    &:last-child {
      border-right: none;
    }
  }
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
.avatar-wrap {
  text-align: center;
}
.avatar-wrap img {
  margin: 4px 0;
}
</style>
