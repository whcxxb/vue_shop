<template>
  <div>
    <!-- 导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-row
        ><el-col
          ><el-button
            @click="addDialogVisible = true"
            dialogVisible="true"
            type="primary"
            >添加角色</el-button
          ></el-col
        ></el-row
      >
      <el-table :data="rolesList" border stripe>
        <!-- 角色展开的数据 -->
        <el-table-column type="expand" label="详情" width="60px">
          <template slot-scope="scope">
            <el-row
              :class="['bddbottom', index === 0 ? 'bddtop' : '', 'vcenter']"
              v-for="(item, index) in scope.row.children"
              :key="item.id"
            >
              <!-- 第一列是 一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRight(scope.row, item.id)">{{
                  item.authName
                }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 第二列是二级和三级权限 -->
              <el-col :span="19">
                <el-row
                  :class="[index2 === 0 ? '' : 'bddtop', 'vcenter']"
                  v-for="(item2, index2) in item.children"
                  :key="item2.id"
                >
                  <!-- 二级权限 -->
                  <el-col :span="6">
                    <el-tag
                      closable
                      type="success"
                      @close="removeRight(scope.row, item2.id)"
                      >{{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      closable
                      type="info"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      @close="removeRight(scope.row, item3.id)"
                      >{{ item3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column
          type="index"
          label="序号"
          width="60px"
        ></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="editRole(scope.row)"
              >编辑</el-button
            >
            <el-button
              @click="removeRoles(scope.row.id)"
              size="mini"
              type="danger"
              icon="el-icon-delete"
              >删除</el-button
            >
            <el-button
              @click="showRightDialog(scope.row)"
              size="mini"
              type="warning"
              icon="el-icon-setting"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addDialogVisible"
      @close="addDislogClosed"
    >
      <el-form
        :model="addRolesForm"
        :rules="addFormRules"
        ref="addRolesForm"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRolesUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色对话框 -->
    <el-dialog title="编辑角色" :visible.sync="editDialogVisible">
      <el-form
        :model="editRoleList"
        :rules="addFormRules"
        ref="editRolesForm"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRoleList.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRoleList.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRolesUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限对话框 -->
    <el-dialog title="提示" :visible.sync="dialogRight" width="30%">
      <el-tree
        :data="rightList"
        :props="rightProps"
        show-checkbox
        node-key="id"
        :default-expand-all="true"
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogRight = false">取 消</el-button>
        <el-button type="primary" @click="addRight">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'roles',
  data() {
    return {
      //所有角色
      rolesList: [],
      //控制是否显示添加角色对话框
      addDialogVisible: false,
      //编辑角色对话框
      editDialogVisible: false,
      //分配权限对话框显示
      dialogRight: false,
      //保存所有权限
      rightList: [],
      //默认选中的节点的id值数组
      defKeys: [],
      //树形控件属性的对象
      rightProps: {
        children: 'children',
        label: 'authName',
      },
      //编辑角色信息
      editRoleList: {},
      //添加角色信息对象
      addRolesForm: {
        roleName: '',
        roleDesc: '',
      },
      //要添加的角色权限id
      rolesId: '',
      //添加角色信息规则
      addFormRules: {
        rolesName: [
          { required: true, message: '请输入角色名', trigger: 'blur' },
          { min: 2, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' },
        ],
        rolesDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
        ],
      },
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    //获取所有角色
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      console.log(res)
      this.rolesList = res.data
    },
    //关闭添加角色对话框事件
    addDislogClosed() {
      this.$refs.addRolesForm.resetFields()
    },
    //添加角色
    addRolesUser() {
      this.$refs.addRolesForm.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post('roles', this.addRolesForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加角色失败!')
        }
        this.$message.success('添加角色成功!')
        this.getRolesList()
        this.addDialogVisible = false
      })
    },
    //根据id删除角色
    async removeRoles(rid) {
      //先提示用户删除操作
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
      //发送删除角色请求
      const { data: res } = await this.$http.delete('roles/' + rid)
      if (res.meta.status !== 200) return this.$message.error(this.meta.msg)
      this.$message.success('删除成功')
      this.getRolesList()
    },
    //根据角色id删除权限
    async removeRight(roles, rightId) {
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
      const { data: res } = await this.$http.delete(
        `roles/${roles.id}/rights/${rightId}`
      )
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success('删除成功')
      roles.children = res.data
    },
    //分配权限的对话框
    async showRightDialog(roles) {
      this.rolesId = roles.id
      const { data: res } = await this.$http.get('rights/tree')
      this.rightList = res.data
      console.log(this.rightList)

      this.defKeys = []
      //获取三级节点的id
      this.getLeafKeys(roles, this.defKeys)

      this.dialogRight = true
    },
    //获取所有三级节点的id保存到dfKeys数组中
    getLeafKeys(node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      //通过递归 循环所有权限节点
      node.children.forEach((item) => {
        this.getLeafKeys(item, arr)
      })
    },
    //点击确定 添加权限
    async addRight() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(
        `roles/${this.rolesId}/rights`,
        { rids: idStr }
      )
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
      this.getRolesList()
      this.dialogRight = false
    },
    //编辑角色
    editRole(roles) {
      console.log(roles)
      this.editRoleList = roles
      this.editDialogVisible = true
    },
    //编辑角色提交
    async editRolesUser() {
      const { data: res } = await this.$http.put(
        `roles/${this.editRoleList.id}`,
        {
          roleName: this.editRoleList.roleName,
          roleDesc: this.editRoleList.roleDesc,
        }
      )
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success('编辑角色成功')
      this.getRolesList()
      this.editDialogVisible = false
    },
  },
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bddtop {
  border-top: 1px solid #d1d8e0;
}
.bddbottom {
  border-bottom: 1px solid #d1d8e0;
}
.el-row {
  margin-left: 20px;
  margin-right: 20px;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>