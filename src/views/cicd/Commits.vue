<template>
    <div>
      <PageCard name="commit提交记录列表页">
        <v-card flat>
          <v-card-title>
            <v-form ref="form">
              <v-container class="d-flex flex-wrap">
                <v-select
                  :items="projectItems"
                  label="项目名称"
                  class="mr-8"
                  dense
                  small-chips
                  multiple
                  v-model="commitsForm.projectNames"
                  @blur="commitsSearch()"
                ></v-select>
                <v-text-field
                  label="分支"
                  class="mr-8"
                  dense
                  v-model="commitsForm.branchName"
                  @keydown.enter="commitsSearch()"
                />
                <v-text-field
                  label="commit编号"
                  class="mr-8"
                  dense
                  v-model="commitsForm.commitHash"
                  @keydown.enter="commitsSearch()"
                />
                <v-text-field
                  label="提交者"
                  class="mr-8"
                  dense
                  v-model="commitsForm.committerName"
                  @keydown.enter="commitsSearch()"
                />
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
                      @change="dateRangeSubmit()"
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
                <v-text-field
                  label="运行名称"
                  class="mr-8"
                  dense
                  v-model="commitsForm.runName"
                  @keydown.enter="commitsSearch()"
                />
              </v-container>
            </v-form>
          </v-card-title>
          <v-card-text class="commits-table">
            <CommitsDataTable
              :commits="commitsData.commits"
              :items-per-page="commitsForm.perPage"
              :page="commitsForm.page"
              :server-items-length="commitsData.totalCount"
              class="elevation-1"
              dense
              :footer-props="{
                showCurrentPage: true,
                itemsPerPageOptions: [ 5, 10, 15, 20 ]
              }"
              show-expand
              :loading="tableLoading"
              loading-text="正在加载数据..."
              @update:options="changeOptions($event)"
            />
          </v-card-text>
        </v-card>
      </PageCard>
    </div>
</template>

<script>
import PageCard from '@/lib/ui-lib/page-templates/PageCard'
import COMMITS_API from '@/api/cicd/commits'
import PROJECTS_API from '@/api/cicd/projects'
import CommitsDataTable from "@/components/CommitsDataTable";
export default {
    inject: ['successTip', 'errorTip', 'warnTip'],
    props: [],
    components: {CommitsDataTable, PageCard },
    data() {
        return {
          projectItems: [],
          tableLoading: true,
          commitsForm: {
            projectNames: [],
            branchName: '',
            commitHash: '',
            committerName: '',
            createTimeRage: {
              startDate: '',
              endDate: ''
            },
            runName: '',
            page: 1,
            perPage: 10
          },
          dates:[],
          menu2: false,
          commitsData: {}
        }
    },
    created() {
      // COMMITS_API.getCommits(this.commitsForm).then(response => {
      //   // todo
      //   this.commitsData = response.data
      //   this.tableLoading = false
      //   console.log(response)
      // }).catch()
      PROJECTS_API.getProjectName().then(response => {
        this.projectItems = response.data.projectNames
      }).catch(error => {
        this.errorTip(true, error.response.data.msg)
      })
    },
    methods: {
      clearDates() {
        this.dates = []
        this.menu2 = false
        this.commitsSearch()
      },
      commitsSearch() {
        this.commitsForm.createTimeRage.startDate = this.dates[0]
        this.commitsForm.createTimeRage.endDate = this.dates[1]
        console.log(this.commitsForm)
        COMMITS_API.getCommits(this.commitsForm).then(response => {
          this.successTip(true, response.msg)
          response.data.commits.forEach((row, index) => {
            row.index = index
          })
          this.commitsData = response.data
          this.tableLoading = false
        }).catch(error => {
          this.errorTip(true, error.response.data.msg)
        })
      },
      dateRangeSubmit() {
        this.menu2 = false
        this.commitsSearch()
      },
      changeOptions(e) {
        this.commitsForm.PageCard = e.itemsPerPage
        this.commitsForm.page = e.page
        this.commitsForm.createTimeRage.startDate = this.dates[0]
        this.commitsForm.createTimeRage.endDate = this.dates[1]
        COMMITS_API.getCommits(this.commitsForm).then(response => {
          response.data.commits.forEach((row, index) => {
            row.index = index
          })
          this.commitsData = response.data
          this.tableLoading = false
        }).catch(error => {
          this.errorTip(true, error.response.data.msg)
        })
      }
    },
    computed: {
      dateRangeText () {
        return this.dates.join(' ~ ')
      }
    }
}
</script>

<style>
.commits-table .CodeMirror {
  height: auto;
}
.commits-table .CodeMirror-scroll {
  height: auto;
  overflow-y: hidden;
  overflow-x: auto;
}
</style>
