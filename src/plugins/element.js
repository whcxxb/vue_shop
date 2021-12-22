import Vue from 'vue'
import {
   Button, Form,
   FormItem, Input, 
   Message, Container,
   Header, Aside, Main,
   Menu, Submenu,
   MenuItemGroup,MenuItem,
   Breadcrumb, BreadcrumbItem,
   Card, Row,
   Col, Table, 
   TableColumn, Switch,
   Pagination, Dialog, 
   MessageBox,Tooltip,
   Tag,Tree,
   Select,Option,
   Result,Cascader,
   Notification,Popconfirm,
   Popover,Alert,Tabs,TabPane
} from 'element-ui';
Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.use(Container)
Vue.use(Header)
Vue.use(Aside)
Vue.use(Main)
Vue.use(Menu)
Vue.use(Submenu)
Vue.use(MenuItemGroup)
Vue.use(MenuItem)
Vue.use(Breadcrumb)
Vue.use(BreadcrumbItem)
Vue.use(Card)
Vue.use(Row)
Vue.use(Col)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Switch)
Vue.use(Pagination)
Vue.use(Dialog)
Vue.use(Tooltip)
Vue.use(Tag)
Vue.use(Tree)
Vue.use(Select)
Vue.use(Option)
Vue.use(Result)
Vue.use(Cascader)
Vue.use(Popconfirm)
Vue.use(Popover)
Vue.use(Alert)
Vue.use(Tabs)
Vue.use(TabPane)


//全局消息提示
Vue.prototype.$message = Message

Vue.prototype.$notify = Notification

//消息弹出
Vue.prototype.$confirm = MessageBox.confirm


