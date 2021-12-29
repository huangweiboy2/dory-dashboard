import Vue from 'vue'
import Vuetify, {
  VForm, VTextField, VCol, VRow, VCardTitle, VSimpleTable, VDivider,
  VListItemContent, VListGroup, VBtnToggle, VStepperItems, VTextarea,
  VContainer, VTabs, VTab, VTabsItems, VTabItem, VPagination,
  VStepper, VStepperHeader, VStepperStep, VListItemGroup, VStepperContent,
  VCard, VCardText, VList, VListItem, VBtn, VAppBar, VToolbarTitle,
  VChip, VDataTable, VListItemTitle, VListItemIcon, VListItemAvatar,
  VApp, VSpacer, VMain, VNavigationDrawer, VDataIterator, VSelect,
  VDialog, VCardActions, VMenu, VIcon, VToolbarItems, VImg, VTooltip,
  VAlert, VToolbar, VSnackbar, VExpansionPanels, VExpansionPanel,
  VExpansionPanelContent, VExpansionPanelHeader, VSlideXReverseTransition,
  VAvatar, VDatePicker, VSwitch, VFileInput, ClickOutside, VAutocomplete, VTreeview, VCombobox, VSimpleCheckbox, VCheckbox, VProgressLinear, VBreadcrumbs, VBreadcrumbsItem
} from 'vuetify/lib'
import '@mdi/font/css/materialdesignicons.min.css'
import 'typeface-roboto/index.css'
import zhHans from 'vuetify/es5/locale/zh-Hans'

Vue.use(Vuetify, {
  components: {
    VForm,
    VTextField,
    VCol,
    VRow,
    VCardTitle,
    VSimpleTable,
    VDivider,
    VListItemContent,
    VContainer,
    VTabs,
    VTab,
    VTabsItems,
    VTabItem,
    VPagination,
    VStepper,
    VStepperHeader,
    VStepperStep,
    VCard,
    VCardText,
    VList,
    VListItem,
    VBtn,
    VAppBar,
    VToolbarTitle,
    VChip,
    VDataTable,
    VApp,
    VSpacer,
    VMain,
    VNavigationDrawer,
    VDataIterator,
    VMenu,
    VSelect,
    VDialog,
    VCardActions,
    VListItemTitle,
    VIcon,
    VListGroup,
    VAlert,
    VToolbar,
    VSnackbar,
    VExpansionPanels,
    VExpansionPanel,
    VExpansionPanelContent,
    VExpansionPanelHeader,
    VBtnToggle,
    VListItemGroup,
    VListItemIcon,
    VToolbarItems,
    VSlideXReverseTransition,
    VStepperItems,
    VStepperContent,
    VAvatar,
    VDatePicker,
    VListItemAvatar,
    VImg,
    VTooltip,
    VSwitch,
    VFileInput,
    VAutocomplete,
    VTreeview,
    VTextarea,
    VCombobox,
    VSimpleCheckbox,
    VCheckbox,
    VProgressLinear,
    VBreadcrumbs,
    VBreadcrumbsItem
  },
  directives: {
    ClickOutside
  }
})

export default new Vuetify({
  lang: {
    locales: { zhHans },
    current: 'zhHans'
  },
  icons: {
    iconfont: 'mdiSvg'
  }
})
