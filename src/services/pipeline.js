import Vue from 'vue'
export default class Pipeline {
  state = Vue.observable({
    pipelineTypeMap: { pipelineName: '名字', successCount: '成功次数', failCount: '失败次数', abortCount: '放弃次数', lastRunTime: '最新启动', lastRunDuration: '最新运行时长', subType: '流水线类型' }
  })

  // eslint-disable-next-line no-useless-constructor
  constructor () {

  }

  static getInstance () {
    if (!this.instance) {
      this.instance = new this()
    }
    return this.instance
  }
}
