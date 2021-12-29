<template>
  <PageCard name="用户管理列表">
    <v-card class="mb-4">
      <v-card-title>
        <v-form>
          <v-container class="d-flex flex-wrap">
            <v-select
              :items="userNames"
              label="用户名"
              class="mr-8"
              clearable
              dense
              v-model="usersForm.username"
              @change="getUser()"
              @click:clear="getUser()"
            ></v-select>
            <v-text-field
              label="显示名字"
              class="mr-8"
              dense
              v-model="usersForm.name"
              @keydown.enter="getUser()"
            />
            <v-text-field
              label="邮箱"
              class="mr-8"
              dense
              v-model="usersForm.mail"
              @keydown.enter="getUser()"
            />
            <v-select
              :items="isAdmin"
              label="是否是管理员"
              class="mr-8"
              clearable
              dense
              v-model="usersForm.admin"
              @change="getUser()"
              @click:clear="getUser()"
            ></v-select>
            <v-select
              :items="isActive"
              label="是否激活"
              class="mr-8"
              clearable
              dense
              v-model="usersForm.active"
              @change="getUser()"
              @click:clear="getUser()"
            ></v-select>
            <v-select
              :items="[
                { value: 'username', text: '用户名顺序' },
                { value: 'name', text: '名字顺序' },
                { value: 'createTimeDesc', text: '创建时间倒序' },
                { value: 'createTimeAsc', text: '创建时间顺序' },
                { value: 'lastLoginDesc', text: '登录时间倒序' },
                { value: 'lastLoginAsc', text: '登录时间顺序' },
              ]"
              label="排序方式"
              class="mr-8"
              clearable
              dense
              v-model="usersForm.sortMode"
              @change="getUser()"
              @click:clear="getUser()"
            ></v-select>
            <v-btn color="primary" @click.stop="addUserDialog = true">新增用户</v-btn>
          </v-container>
        </v-form>
      </v-card-title>
      <v-card-text>
        <v-data-table
          :headers="pipelineHeaders"
          :items="usersData.users"
          :single-expand="false"
          :page="usersForm.page"
          :items-per-page="usersForm.perPage"
          :server-items-length="usersData.totalCount"
          item-key="username"
          show-expand
          :footer-props="{
            showCurrentPage: true,
            itemsPerPageOptions: [ 5, 10, 15, 20 ]
          }"
          :loading="tableLoading"
          @update:options="changeOptions($event)"
          >
          <template v-slot:item.userName="{ item }">
            <div class="d-flex align-center my-1">
              <v-avatar class="mr-2">
                <img
                  :src="item.avatarUrl"
                  alt=""
                >
              </v-avatar>
              <div>
                <div>{{ item.username }}</div>
                <div>{{ item.name }}</div>
              </div>
            </div>
          </template>
          <template v-slot:item.isAdmin="{ item }">
            <v-switch
              v-model="item.isAdmin"
              dense
              inset
              @change="changeAdmin(item.username,item.isAdmin)"
            ></v-switch>
          </template>
          <template v-slot:item.isActive="{ item }">
            <v-switch
              v-model="item.isActive"
              dense
              inset
              @change="changeActive(item.username,item.isActive)"
            ></v-switch>
          </template>
          <template v-slot:item.createTime="{ item }">
            <div>{{item.createTime }}</div>
            <div>{{ item.lastLogin }}</div>
          </template>
          <template v-slot:item.handle="{ item }">
            <Operations
              :operations="[
                { text: '修改资料', onClick: () => {modifyUser(item.username)} },
                { text: '修改密码', onClick: () => {modifyPassword(item.username)} },
                { text: '删除', onClick: () => {openDeleteUser(item.username)} }
              ]"
            />
          </template>
          <template v-slot:expanded-item="{ headers, item }">
            <td :colspan="headers.length" class="pa-1">
              <v-card class="rounded-0">
                <v-card-title>
                  项目权限列表
                  <v-spacer></v-spacer>
                  <v-btn color="primary" @click="addProject(item.username)">分配权限</v-btn>
                </v-card-title>
                <v-card-text v-if="item.projects">
                  <v-simple-table>
                    <template v-slot:default>
                      <thead>
                        <tr>
                          <th class="text-left">项目名</th>
                          <th class="text-left">用户角色</th>
                          <th class="text-left">修改时间</th>
                          <th class="text-left">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="(i,j) in item.projects"
                          :key="j"
                          v-if="item.projects.length > 0"
                        >
                          <td>{{ i.projectName }}</td>
                          <td>{{ i.accessLevel }}</td>
                          <td>{{ i.updateTime }}</td>
                          <td>
                            <template>
                              <Operations
                                :operations="[
                                  { text: '回收权限', onClick: () => {recyclingPower(i.projectName,item.username)} },
                                  { text: '修改权限', onClick: () => {modifyPower(i.projectName,item.username)} }
                                ]"
                              />
                            </template>
                          </td>
                        </tr>
                        <tr v-if="item.projects.length <= 0">
                          <td colspan="4" class="text-center">暂无项目</td>
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
      v-model="addUserDialog"
      max-width="600px"
      persistent
    >
      <v-card>
        <v-card-title>
          <span class="headline">新增用户</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="addUserRef">
            <v-alert icon="mdi-alert-circle" prominent text type="info">
              <small>新增用户将会自动在gitlab中创建对应的用户账号，创建用户后需要为用户设置相关项目权限后，用户才有操作项目流水线的权限。</small>
            </v-alert>
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    label="用户名（username）*"
                    required
                    dense
                    v-model="addUserForm.username"
                    :rules="[v => !!v || '用户名为必填项']"
                    hint="用户的登录账号名字，务必正确填写，创建后不能修改。格式例如：test-user01"
                    persistent-hint
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    label="用户名（username）*"
                    required
                    dense
                    v-model="addUserForm.name"
                    :rules="[v => !!v || '显示名字为必填项']"
                    hint="用户的显示名字。格式例如：测试-用户01"
                    persistent-hint
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    label="登录邮箱（mail）*"
                    required
                    dense
                    v-model="addUserForm.mail"
                    :rules="[
                      v => !!v || '邮箱为必填项',
                      v => /.+@.+\..+/.test(v) || '请输入正确格式',
                    ]"
                    hint="用户用于登录以及接收修改密码邮件的邮箱，务必正确填写，创建后不能修改。格式例如：test-user01@qq.com"
                    persistent-hint
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    label="手机号码（mobile）*"
                    required
                    dense
                    v-model="addUserForm.mobile"
                    :rules="[v => !!v || '手机为必填项']"
                    hint="用户的手机号码。格式例如：13812341234"
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
            @click="cancelAddUser()"
          >
            取消
          </v-btn>
          <v-btn
            color="blue darken-1"
            text
            @click="addUser()"
          >
            确认
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="modifyUserDialog"
      max-width="600px"
      @input="getUserProfile()"
      persistent
    >
      <v-card>
        <v-card-title>
          <span class="headline">修改资料</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="updateProfileRef">
            <v-alert icon="mdi-alert-circle" prominent text type="info">
              <small>修改用户资料</small>
            </v-alert>
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    label="用户名（username）*"
                    required
                    dense
                    :rules="[v => !!v || '显示名字为必填项']"
                    v-model="updateProfileForm.name"
                    hint="用户的显示名字。格式例如：测试-用户01"
                    persistent-hint
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    label="手机号码（mobile）*"
                    required
                    dense
                    :rules="[v => !!v || '手机为必填项']"
                    v-model="updateProfileForm.mobile"
                    hint="用户的手机号码。格式例如：13812341234"
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
              this.modifyUserDialog = false
              this.$refs.updateProfileRef.reset()
            }"
          >
            取消
          </v-btn>
          <v-btn
            color="blue darken-1"
            text
            @click="updateProfile()"
          >
            确认
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="changePasswordDialog"
      max-width="600px"
      persistent
    >
      <v-card>
        <v-card-title>
          <span class="headline">修改密码</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="updatePasswordRef">
            <small></small>
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    label="新密码（newPassword）*"
                    required
                    dense
                    :rules="[v => !!v || '新密码为必填项']"
                    :type="newPasswordDisplay ? 'text' : 'password'"
                    v-model="passwordForm.newPassword"
                    :append-icon="newPasswordDisplay ? 'mdi-eye' : 'mdi-eye-off'"
                    @click:append="newPasswordDisplay = !newPasswordDisplay"
                    hint="密码长度不能小于8位，必须包含大小写英文数字和特殊字符"
                    persistent-hint
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    label="确认密码（confirmPassword）*"
                    required
                    dense
                    :type="confirmPasswordDisplay ? 'text' : 'password'"
                    v-model="passwordForm.confirmPassword"
                    :append-icon="confirmPasswordDisplay ? 'mdi-eye' : 'mdi-eye-off'"
                    @click:append="confirmPasswordDisplay = !confirmPasswordDisplay"
                    :rules="[v => !!v || '确认密码为必填项']"
                    hint="必须跟新密码保持一致"
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
              this.changePasswordDialog = false
              this.$refs.updatePasswordRef.reset()
            }"
          >
            取消
          </v-btn>
          <v-btn
            color="blue darken-1"
            text
            @click="updatePassword()"
          >
            确认
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="deleteUserDialog"
      max-width="600px"
    >
      <v-card>
        <v-card-title>
          <span class="headline">删除用户</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="deleteUserRef">
            <v-alert icon="mdi-alert-circle" prominent text type="error">
              <small>人员离职情况下，可以从gitlab删除该用户账号。<v-chip small color="red">危险操作，请输入用户名。</v-chip></small>
            </v-alert>
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    label="用户名（username）*"
                    required
                    dense
                    :rules="[v => !!v || '用户名称为必填项']"
                    v-model="deleteUsername"
                    :hint="`确认要删除账号${targetUsername}吗？`"
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
              this.deleteUserDialog = false
              this.$refs.deleteUserRef.reset()
            }"
          >
            取消
          </v-btn>
          <v-btn
            color="blue darken-1"
            text
            @click="deleteUser()"
          >
            确认
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="projectPowerDialog"
      max-width="600px"
      persistent
    >
      <v-card>
        <v-card-title>
          <span class="headline">分配权限</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="projectAddRef">
            <v-alert icon="mdi-alert-circle" prominent text type="info">
              <small>给该用户分配项目权限</small>
            </v-alert>
            <v-container>
              <v-row>
                <v-col cols="12" class="pb-0">
                  <v-select
                    :items="projectNames"
                    label="项目名称（projectName）*"
                    dense
                    :rules="[v => !!v || '项目为必选项']"
                    v-model="projectAddForm.projectName"
                  ></v-select>
                </v-col>
                <v-col cols="12" class="pb-0">
                  <v-select
                    :items="[ 'developer', 'maintainer' ]"
                    label="用户角色（accessLevel）*"
                    dense
                    :rules="[v => !!v || '角色为必选项']"
                    v-model="projectAddForm.accessLevel"
                    :messages="[ 'developer：git代码仓库的默认分支的修改权限，可以执行流水线', 'maintainer：git代码仓库的维护者权限，可以修改所有分支，可以执行流水线，可以通过个人控制台对项目进行设置。']"
                  >
                    <template v-slot:message>
                      <div>developer：git代码仓库的默认分支的修改权限，可以执行流水线</div>
                      <div>maintainer：git代码仓库的维护者权限，可以修改所有分支，可以执行流水线，可以通过个人控制台对项目进行设置。</div>
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
              this.projectPowerDialog = false
              this.$refs.projectAddRef.reset()
            }"
          >
            取消
          </v-btn>
          <v-btn
            color="blue darken-1"
            text
            @click="projectAdd()"
          >
            确认
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="modifyPowerDialog"
      max-width="600px"
      persistent
    >
      <v-card>
        <v-card-title>
          <span class="headline">修改权限</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="accessLevelRef">
            <v-alert icon="mdi-alert-circle" prominent text type="info">
              <small>变更用户{{targetUsername}}的项目{{targetProjectName}}权限</small>
            </v-alert>
            <v-container>
              <v-row>
                <v-col cols="12" class="pb-0">
                  <v-select
                    :items="[ 'developer', 'maintainer' ]"
                    label="用户角色（accessLevel）*"
                    dense
                    v-model="targetAccessLevel"
                    :rules="[v => !!v || '角色为必选项']"
                    :messages="['developer：git代码仓库的默认分支的修改权限，可以执行流水线', 'maintainer：git代码仓库的维护者权限，可以修改所有分支，可以执行流水线，可以通过个人控制台对项目进行设置。']"
                  >
                    <template v-slot:message>
                      <div>developer：git代码仓库的默认分支的修改权限，可以执行流水线</div>
                      <div>maintainer：git代码仓库的维护者权限，可以修改所有分支，可以执行流水线，可以通过个人控制台对项目进行设置。</div>
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
              this.modifyPowerDialog = false
              this.$refs.accessLevelRef.reset()
            }"
          >
            取消
          </v-btn>
          <v-btn
            color="blue darken-1"
            text
            @click="updateAccessLevel()"
          >
            确认
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="recyclingPowerDialog"
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
            @click="recyclingPowerDialog = false"
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
      v-model="auditDialog"
      max-width="800px"
    >
      <v-card>
        <v-card-title>
          <span class="headline">查看详情</span>
        </v-card-title>
        <v-card-text id='log-container' style="overflow-x: scroll; background: #151515; color: #e0e0e0; position: relative; height: 500px;">
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
            @click="() => {
              this.auditDialog = false
              this.refreshList()
            }"
          >
            确认
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </PageCard>
</template>

<script>
import Operations from '@/lib/ui-lib/components/Operations'
import PageCard from '@/lib/ui-lib/page-templates/PageCard'
import request from '@/utils/request'
export default {
  inject: ['successTip', 'errorTip', 'warnTip'],
  name: 'Users',
  components: {
    Operations,
    PageCard
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
    }
  },
  data () {
    return {
      hint: <div>
        developer：可以执行流水线<br />
        maintainer：可以执行流水线，可以通过个人控制台对项目进行设置。
      </div>,
      usersForm: {
        username: '',
        name: '',
        mail: '',
        active: '',
        admin: '',
        sortMode: 'username',
        page: 1,
        perPage: 10
      },
      usersData: {},
      tableLoading: true,
      addUserForm:{
        username: '',
        name: '',
        mail: '',
        mobile: '',
      },
      isAdmin: [ 'yes', 'no' ],
      isActive: [ 'yes', 'no' ],
      userNames: [],
      addUserDialog: false,
      modifyUserDialog: false,
      changePasswordDialog: false,
      projectForm: '',
      deleteUserDialog: false,
      projectPowerDialog: false,
      modifyPowerDialog: false,
      recyclingPowerDialog: false,
      pipelineHeaders: [
        { text: '用户名', value: 'userName', sortable: false },
        { text: '邮箱', value: 'mail', sortable: false },
        { text: '手机', value: 'mobile', sortable: false },
        { text: '创建/登录时间', value: 'createTime', sortable: false },
        { text: '是否管理员', value: 'isAdmin', sortable: false },
        { text: '屏蔽/激活', value: 'isActive', sortable: false },
        { text: '操作', value: 'handle', sortable: false },
      ],
      targetUsername: '',
      targetProjectName: '',
      targetAccessLevel: '',
      auditDialog: false,
      logList: [],
      userToken: '',
      deleteUsername: '',
      updateProfileForm: {
        name: '',
        mobile: ''
      },
      passwordForm: {
        newPassword: '',
        confirmPassword: ''
      },
      newPasswordDisplay: false,
      confirmPasswordDisplay: false,
      projectNames: [],
      projectAddForm: {
        projectName: '',
        accessLevel: ''
      }
    }
  },
  created () {
    this.userToken = JSON.parse(localStorage.getItem('userObj')).userToken
    request.post('/admin/users', this.usersForm).then(response => {
      this.usersData = response.data
      this.tableLoading = false
    }).catch(error => {
      this.tableLoading = false
      this.errorTip(true, error.response.data.msg)
    })
    request.get('/admin/userNames').then(response => {
      response.data.users.map((item) => {
        this.userNames.push(item.username)
      })
    }).catch(error => {
      this.errorTip(true, error.response.data.msg)
    })
    request.get('/cicd/projectNames').then(response => {
      this.projectNames = response.data.projectNames
    }).catch(error => {
      this.errorTip(true, error.response.data.msg)
    })
  },
  methods: {
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
    },
    getUser () {
      this.tableLoading = true
      request.post('/admin/users', this.usersForm).then(response => {
        this.usersData = response.data
        this.tableLoading = false
        this.successTip(true, response.msg)
      }).catch(error => {
        this.tableLoading = false
        this.errorTip(true, error.response.data.msg)
      })
    },
    changeOptions (data) {
      this.tableLoading  = true
      this.usersForm.page = data.page
      this.usersForm.perPage = data.itemsPerPage
      request.post('/admin/users', this.usersForm).then(response => {
        this.usersData = response.data
        this.tableLoading = false
      }).catch(error => {
        this.tableLoading = false
        this.errorTip(true, error.response.data.msg)
      })
    },
    refreshList () {
      this.tableLoading = true
      request.post('/admin/users', this.usersForm).then(response => {
        this.usersData = response.data
        this.tableLoading = false
      }).catch(error => {
        this.tableLoading = false
        this.errorTip(true, error.response.data.msg)
      })
    },
    cancelAddUser () {
      this.addUserDialog = false
      this.$refs.addUserRef.reset()
    },
    addUser () {
      const vm = this
      if(vm.$refs.addUserRef.validate()){
        request.post('/admin/user', vm.addUserForm).then(response => {
          vm.addUserDialog = false
          vm.$refs.addUserRef.reset()
          vm.showLog(response)
          vm.successTip(true, response.msg)
          vm.refreshList()
        }).catch(error => {
          vm.errorTip(true, error.response.data.msg)
        })
      }
    },
    addProject (data) {
      this.targetUsername = data
      this.projectPowerDialog = true
    },
    projectAdd () {
      const vm = this
      if(vm.$refs.projectAddRef.validate()){
        request.post(`/admin/user/${vm.targetUsername}/projectAdd`, vm.projectAddForm).then(response => {
          vm.projectPowerDialog = false
          vm.successTip(true, response.msg)
          vm.$refs.projectAddRef.reset()
          vm.refreshList()
        }).catch(error => {
          vm.errorTip(true, error.response.data.msg)
        })
      }
    },
    modifyUser (data) {
      this.targetUsername = data
      request.get(`/admin/user/${this.targetUsername}/profile`).then(response => {
        this.modifyUserDialog = true
        this.updateProfileForm.name = response.data.user.name
        this.updateProfileForm.mobile = response.data.user.mobile
      }).catch(error => {
        this.errorTip(true, error.response.data.msg)
      })
    },
    getUserProfile () {
      request.get(`/admin/user/${this.targetUsername}/profile`).then(response => {
        this.updateProfileForm.name = response.data.user.name
        this.updateProfileForm.mobile = response.data.user.mobile
      }).catch(error => {
        this.errorTip(true, error.response.data.msg)
      })
    },
    // 修改资料
    updateProfile () {
      request.post(`/admin/user/${this.targetUsername}/profileUpdate`, this.updateProfileForm).then(response => {
        this.modifyUserDialog = false
        this.successTip(true, response.msg)
        this.refreshList()
      }).catch(error => {
        this.errorTip(true, error.response.data.msg)
      })
    },
    modifyPassword(data) {
      this.changePasswordDialog = true
      this.targetUsername = data
    },
    // 修改密码
    updatePassword () {
      if(this.$refs.updatePasswordRef.validate()){
        if(this.passwordForm.newPassword === this.passwordForm.confirmPassword){
          request.post(`/admin/user/${this.targetUsername}/passwordUpdate`, this.passwordForm).then(response => {
            this.successTip(true, response.msg)
            this.changePasswordDialog = false
          }).catch(error => {
            this.errorTip(true, error.response.data.msg)
          })
        }else{
          this.warnTip(true, '请输入正确的确认密码')
        }
      }
    },
    openDeleteUser (data) {
      this.deleteUserDialog = true
      this.targetUsername = data
    },
    // 删除用户
    deleteUser () {
      const vm = this
      if(vm.$refs.deleteUserRef.validate() && (vm.targetUsername === vm.deleteUsername)){
        request.delete(`/admin/user/${vm.targetUsername}`).then(response => {
          vm.successTip(true, response.msg)
          vm.deleteUserDialog = false
          vm.$refs.deleteUserRef.reset()
          vm.showLog(response)
          vm.refreshList()
        }).catch(error => {
          this.errorTip(true, error.response.data.msg)
        })
      }else{
        vm.warnTip(true, '请输入正确用户名称')
      }
    },
    changeAdmin (data,status) {
      request.post(`/admin/user/${data}/adminUpdate`, {isAdmin: status}).then(response => {
        this.successTip(true, response.msg)
        this.refreshList()
      }).catch(error => {
        this.errorTip(true, error.response.data.msg)
        this.refreshList()
      })
    },
    changeActive (data,status) {
      request.post(`/admin/user/${data}/activeUpdate `, {isActive: status}).then(response => {
       this.successTip(true, response.msg)
        this.refreshList()
      }).catch(error => {
        this.errorTip(true, error.response.data.msg)
        this.refreshList()
      })
    },
    recyclingPower (projectName,username) {
      this.recyclingPowerDialog = true
      this.targetUsername = username
      this.targetProjectName = projectName
    },
    deleteProject () {
      request.post(`/admin/user/${this.targetUsername}/projectDelete`,{projectName: this.targetProjectName}).then(response => {
        this.successTip(true, response.msg)
        this.refreshList()
      }).catch(error => {
        this.errorTip(true, error.response.data.msg)
      })
    },
    modifyPower (projectName,username) {
      this.modifyPowerDialog = true
      this.targetUsername = username
      this.targetProjectName = projectName
    },
    updateAccessLevel () {
      const vm =this
      if(vm.$refs.accessLevelRef.validate()){
        request.post(`/admin/user/${vm.targetUsername}/projectUpdate`,{
          projectName: vm.targetProjectName,
          accessLevel: vm.targetAccessLevel
        }).then(response => {
          vm.successTip(true, response.msg)
          vm.modifyPowerDialog = false
          vm.refreshList()
        }).catch(error => {
          vm.errorTip(true, error.response.data.msg)
        })
      }
    }
  }
}
</script>

<style scoped>
.v-card__title {
  padding: 4px 16px;
  font-size: 1rem;
}
</style>
