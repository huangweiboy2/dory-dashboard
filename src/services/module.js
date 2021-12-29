import Vue from 'vue'
export default class Module {
  state = Vue.observable({
    moduleTypeMap: {
      build: '构建模块',
      package: '容器镜像模块',
      deploy: '容器发布模块',
      artifact: '制品模块',
      deployArtifact: '制品发布模块'
    }
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
