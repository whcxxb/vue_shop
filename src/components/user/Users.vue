<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getUserList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="dialogVisible = true"
            >添加用户</el-button
          >
        </el-col>
      </el-row>

      <el-table :data="userList" style="width: 100%" border stripe>
        <el-table-column
          type="index"
          label="序号"
          width="60px"
        ></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>

        <el-table-column label="状态">
          <!-- 使用具名插槽获取当前行的数据 -->
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              active-color="#13ce66"
              inactive-color="#ff4949"
              @change="userChange(scope.row)"
            >
            </el-switch>
          </template>
        </el-table-column>

        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editDialog(scope.row.id)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUser(scope.row.id)"
            ></el-button>
            <el-tooltip
              class="item"
              effect="dark"
              content="角色设置"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="setRoles(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 添加用户对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="dialogVisible"
      width="50%"
      @close="dialogClose"
    >
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户对话框 -->
    <el-dialog title="修改信息" :visible.sync="editDialogVisible" width="50%">
      <el-form
        :model="editFormUser"
        :rules="addFormRules"
        ref="editFormRef"
        label-width="70px"
        @close="dialogClose"
      >
        <el-form-item label="用户名">
          <el-input v-model="editFormUser.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editFormUser.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editFormUser.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser()">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色的对话框 -->
    <el-dialog title="分配权限" :visible.sync="setRolesDialog" width="50%">
      <p>用户名:{{ this.userInfo.username }}</p>
      <p>当前角色:{{ this.userInfo.role_name }}</p>
      设置角色:<el-select v-model="value" placeholder="请选择">
        <el-option
          v-for="item in this.rolesList"
          :key="item.id"
          :label="item.roleName"
          :value="item.id"
        >
        </el-option>
      </el-select>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRolesDialog = false">取 消</el-button>
        <el-button type="primary" @click="addRolesDialog">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'users',
  data() {
    //验证邮箱规则
    var checkEmail = (rule, value, cb) => {
      const regEmail =
        /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/
      if (regEmail.test(value)) {
        //验证通过
        return cb()
      }
      cb(new Error('请输入合法的邮箱'))
    }
    var checkPhone = (rule, value, cb) => {
      const regPhone = /^[1][3,4,5,7,8,9][0-9]{9}$/
      if (regPhone.test(value)) {
        //验证通过
        return cb()
      }
      cb(new Error('请输入合法的手机号'))
    }
    return {
      queryInfo: {
        query: '',
        //当前展示的第几页
        pagenum: 1,
        //每页显示多少条数据
        pagesize: 3,
      },
      userList: [],
      //用户总数量
      total: 0,
      //控制对话框是否显示
      dialogVisible: false,
      //修改用户的对话框是否显示
      editDialogVisible: false,
      //查询用户数据对象
      editFormUser: {},
      //添加用户的表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: '',
      },
      //添加用户的验证规则
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 2, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' },
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 6,
            max: 15,
            message: '长度在 6 到 15 个字符',
            trigger: 'blur',
          },
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' },
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkPhone, trigger: 'blur' },
        ],
      },

      //分配角色的对话框是否显示
      setRolesDialog: false,
      //用户信息
      userInfo: {},
      //所有角色列表
      rolesList: [],
      //当前选中的角色
      value: '',
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    //获取用户列表
    async getUserList() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo,
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户失败')
      }
      this.userList = res.data.users
      this.total = res.data.total
    },
    //监听最新的pagesize 改变的事件
    handleSizeChange(newPageSize) {
      this.queryInfo.pagesize = newPageSize
      this.getUserList()
    },
    //监听页码值改变的事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    //用户状态
    async userChange(userinfo) {
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      )
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$$message.error('更新用户状态失败')
      }
      this.$message.success('更新用户状态成功')
    },
    //清空 添加/修改 用户表单数据
    dialogClose() {
      this.$refs.addFormRef.resetFields()
    },
    //点击确定添加用户
    addUser() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return
        //添加用户的网络请求
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 200) {
          this.$message.error('添加用户失败')
        }
        this.$message.success(res.meta.msg)
        this.dialogVisible = false
        this.getUserList()
      })
    },
    async editDialog(userid) {
      const { data: res } = await this.$http.get('users/' + userid)
      if (res.meta.status !== 200) return this.$message.error('查询失败')
      this.editFormUser = res.data
      this.editDialogVisible = true
    },
    //点击确定修改用户并提交
    editUser() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return
        //发起修改用户的请求
        const { data: res } = await this.$http.put(
          'users/' + this.editFormUser.id,
          {
            email: this.editFormUser.email,
            mobile: this.editFormUser.mobile,
          }
        )
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        this.getUserList()
      })
      this.editDialogVisible = false
    },
    //根据id删除用户
    async removeUser(uid) {
      const result = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)
      if (result !== 'confirm') {
        return this.$message.info('取消删除操作')
      }
      const { data: res } = await this.$http.delete('users/' + uid)
      if (res.meta.status !== 200) return this.$message.error(this.meta.msg)
      this.$message.success('删除成功')
      this.getUserList()
    },

    //分配角色
    async setRoles(userInfo) {
      this.value = ''
      this.userInfo = userInfo
      this.setRolesDialog = true
      //获取所有角色
      const { data: res } = await this.$http.get('roles')
      this.rolesList = res.data
      console.log(this.rolesList)
    },

    //点击确定分配角色
    async addRolesDialog() {
      const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`,{rid: this.value,})
      if(res.meta.status !==200) return this.$message.error('更新失败')
      this.$message.success('角色更新成功')
      this.getUserList()
      this.setRolesDialog = false
    },
  },
}
</script>

<style>
</style>