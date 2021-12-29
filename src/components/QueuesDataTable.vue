<template>
  <v-data-table
    :headers="headers"
    :items="queuesData.runs"
    :items-per-page="perPage"
    :page="page"
    class="elevation-1"
    :server-items-length="queuesData.totalCount"
    :footer-props="{
      showCurrentPage: true,
      itemsPerPageOptions: [ 5, 10, 15, 20 ]
    }"
    dense
    :loading="tableLoading"
    @update:options="changeOptions($event)"
  >
    <template v-slot:item.runName="config">
      <router-link v-if="config.item.runName !== '-'" :to="{ name: 'CicdRun', params: { 'runName': config.item.runName }}">{{ config.item.runName }}</router-link>
      <div v-else>{{ config.item.runName }}</div>
    </template>
    <template v-slot:item.projectName="{ item }">
      <div v-if="item.runName !== '-'">
        <router-link :to="{ name: 'CicdProject', params: { projectName: item.projectName }}">{{ item.projectName }}</router-link>/
        <router-link :to="{ name: 'CicdPipeline', params: { pipelineName: item.pipelineName }}">{{ item.pipelineName }}</router-link>
      </div>
      <div v-else>
        <span>{{ item.projectName }}</span>/
        <span>{{ item.pipelineName }}</span>
      </div>
    </template>
    <template v-slot:item.startTime="{ item }">
      {{ item.status.startTime }}
    </template>
    <template v-slot:item.handle="{ item }">
      <v-btn class="my-2" color="primary" small v-if="item.runName !== '-'" @click="runTop(item.runName)">队列置顶</v-btn>
    </template>
  </v-data-table>
</template>

<script>
export default {
  name: 'QueuesDataTable',
  props: {
    page: Number,
    perPage: Number,
    queuesData: Object,
    tableLoading: Boolean
  },
  data () {
    return {
      headers: [
        { text: '运行名称', sortable: false, value: 'runName' },
        { text: '项目/流水线名称', value: 'projectName', sortable: false },
        { text: '标签名字', value: 'tagName', sortable: false },
        { text: '启动用户', value: 'startUser', sortable: false },
        { text: '终止用户', value: 'abortUser', sortable: false },
        { text: '启动时间', value: 'startTime', sortable: false },
        { text: '操作', value: 'handle', sortable: false }
      ]
    }
  },
  created () {},
  methods: {
    changeOptions(e) {
      this.$emit('getpage', {page: e.page, perPage: e.itemsPerPage})
    },
    runTop(runName) {
      this.$emit('runTop', {runName: runName})
    }
  },
  watch: {
   queuesData: function(n,o) {
     this.queuesData = n
   }
  }
}
</script>

<style scoped>

</style>
