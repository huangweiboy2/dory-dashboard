<script>
const moduleTypeKeyNameMap = {
  artifact: '制品打包模块',
  build: '构建模块',
  deploy: '容器发布模块',
  deployArtifact: '制品发布模块',
  package: '镜像打包模块'
}
export default {
  name: 'ModuleInfos',
  functional: true,
  props: ['modules', 'projectName'],
  render (createElement, context) {
    const keysSorted = [ 'build', 'package', 'deploy', 'artifact', 'deployArtifact' ]
    var newD = {}
    if(Object.entries(context.props.modules).length > 0){
      let keyArr = Object.keys(context.props.modules)
      let newArr = []
      for (let i = 0; i < keysSorted.length; i++) {
        for (let j = 0; j < keyArr.length; j++) {
          if(keyArr[j] === keysSorted[i]){
              newArr.push(keyArr[j]);
          }
        }
      }
      for(let i=0;i<newArr.length;i++){
        newD[newArr[i]]=context.props.modules[newArr[i]];
      }
    }else{
      newD = {}
    }
    const modules = Object.assign(newD, context.props.modules) || {}
    const projectName = context.props.projectName
    if(Object.entries(modules).length > 0){
      return createElement('div', Object.entries(modules).map(([key, value]) => {
        if(modules[key].length > 0){
          return <div class="d-flex my-2">
            <div class="mr-4 font-weight-bold">
              { key } :
            </div>
            { value.map(item => {
              if(item.isLatest == undefined){
                if(item.moduleEnable == undefined){
                  return <div>
                    <VChip color='primary' small class="mr-2" to={{name: 'CicdModule', params: { projectName: projectName,moduleName: item.moduleName || item, moduleType: key }}}>
                      {item.moduleName || item}
                    </VChip>
                  </div>
                }else{
                  return <div>
                    <VChip color={(item.moduleEnable)?'primary':'gray'} small class="mr-2" to={{name: 'CicdModule', params: { projectName: projectName,moduleName: item.moduleName || item, moduleType: key }}}>
                      {item.moduleName || item}
                    </VChip>
                  </div>
                }
              }else{
              return <div>
                <VChip color={(item.isLatest)?'primary':'gray'} small class="mr-2" to={{name: 'CicdModule', params: { projectName: projectName,moduleName: item.moduleName || item, moduleType: key }}}>
                  {item.moduleName || item}
                </VChip>
              </div>
              }
            })}
          </div>
        }
      }))
    }else{
      return createElement('div', {style:{
        display: 'flex',
        justifyContent: 'space-between'
      }}, '')
    }
  }
}
</script>

<style scoped>

</style>
