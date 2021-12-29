
<script>
/*
  slots: {
    default: 一组formEls
    buttons: 一组buttons
  }
* */
export default {
  name: 'SearchForm',
  functional: true,
  props: {
    formEls: {
      type: Array,
      required: false,
      default () {
        return null
      }
    },
    buttons: {
      type: Array,
      required: false,
      default () {
        return null
      }
    }
  },
  render (createElement, context) {
    const formEls = context.props.formEls || []
    formEls.push(...(context.slots().default || []))
    const buttons = context.props.buttons || []
    buttons.push(...(context.slots().buttons || []))
    const VNode = createElement('span', {}).constructor
    return <VForm>
      <VContainer fluid>
        <VRow class="flex-wrap">
          { formEls.map(el => {
            return <VCol
              cols="3"
              vShow={el.key !== 'hidden'}
            >
              { (() => {
                if (typeof el === 'string') {
                  return context.scopedSlots[el]()
                } else if (typeof el === 'function') {
                  return el(createElement)
                } else if (el instanceof VNode) {
                  return el
                } else if (typeof el === 'object') {
                  return createElement(el.tag, el.data, el.children)
                } else {
                  return null
                }
              })() }
            </VCol>
          }) }
          <VCol
          >
            { context.listeners.query ? <VBtn vOn:click_stop={ context.listeners.query }>查询</VBtn> : null }
            { buttons.map(el => {
              return (() => {
                if (typeof el === 'string') {
                  return context.scopedSlots[el]()
                } else if (typeof el === 'function') {
                  return el(createElement)
                } else if (el instanceof VNode) {
                  return el
                } else if (typeof el === 'object') {
                  return createElement(el.tag, el.data, el.children)
                } else {
                  return null
                }
              })()
            }) }
          </VCol>
        </VRow>
      </VContainer>
    </VForm>
  }
}
</script>

<style scoped>

</style>
