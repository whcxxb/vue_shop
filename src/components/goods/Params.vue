<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-row>
        <el-col>
          <span class="rowSpan">选择商品分类</span>
          <el-cascader
            clearable
            :options="CateList"
            :props="cascaderProps"
            v-model="selectedKeys"
            placeholder="请选择三级分类名称"
            size="small"
            @change="handleChange"
          >
          </el-cascader>
        </el-col>
      </el-row>
      <!-- 标签页区域 -->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtndisabled"
            @click="adddialogVisible = true"
            >添加参数</el-button
          >
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtndisabled"
            @click="adddialogVisible = true"
            >添加属性</el-button
          >
        </el-tab-pane>
      </el-tabs>

      <!-- 表格区域 -->
      <el-table :data="cateParams" style="width: 100%">
        <el-table-column type="index" label="#"> </el-table-column>
        <el-table-column prop="attr_name" label="参数名称"> </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editParams(scope.row)"
              >修改</el-button
            >
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="delParmas(scope.row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
        <el-table-column label="查看" type="expand">
          <template slot-scope="scope">
            <el-tag
              closable
              @close="handleClose(index, scope.row)"
              class="paramsTag"
              v-for="(item, index) in scope.row.attr_vals"
              :key="index"
              v-show="item !=[]"
              >{{ item }}</el-tag
            >
            <el-input
              class="input-new-tag"
              v-if="scope.row.inputVisible"
              v-model="scope.row.inputValue"
              ref="saveTagInput"
              size="small"
              @keyup.enter.native="handleInputConfirm(scope.row)"
              @blur="handleInputConfirm(scope.row)"
            >
            </el-input>
            <el-button
              v-else
              class="button-new-tag"
              size="small"
              @click="showInput(scope.row)"
              >+ New Tag</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加对话框 -->
    <el-dialog
      :title="'添加' + getDialogName"
      :visible.sync="adddialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
      >
        <el-form-item :label="getDialogName" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="adddialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCateParmas">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改对话框 -->
    <el-dialog
      :title="'修改' + getDialogName"
      :visible.sync="editdialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="100px"
      >
        <el-form-item :label="getDialogName" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editDialog">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'params',
  data() {
    return {
      //所有分类数据
      CateList: [],
      //级联选择器配置对象
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
      },
      //选中的分类项目
      selectedKeys: [],
      //标签页默认选中
      activeName: 'many',
      //分类参数信息
      cateParams: [],
      //控制添加对话框是否显示
      adddialogVisible: false,
      //添加对话框的数据
      addForm: {
        attr_name: '',
        attr_id: null,
      },
      //添加对话框的验证规则
      addFormRules: {
        attr_name: [{ required: true, message: '请输入', trigger: 'blur' }],
      },
      //控制修改对话是否显示
      editdialogVisible: false,
      //修改对话框信息
      editForm: {
        attr_name: '',
      },
      //修改对话框的验证规则
      editFormRules: {
        attr_name: [{ required: true, message: '请输入', trigger: 'blur' }],
      },
      dynamicTags: [],
    }
  },
  created() {
    this.getCateList()
  },
  computed: {
    //控制按钮禁用和启用
    isBtndisabled() {
      if (this.selectedKeys.length !== 3) {
        return true
      }
      return false
    },
    //分类id
    cateId() {
      if (this.selectedKeys.length === 3) {
        return this.selectedKeys[2]
      }
      return null
    },
    //获取添加参数和添加属性对话的名字
    getDialogName() {
      return this.activeName === 'many' ? '动态参数' : '静态属性'
    },
  },
  methods: {
    //获取所有分类信息
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      this.CateList = res.data
    },
    //级联选择器选中事件
    handleChange() {
      console.log(this.selectedKeys)
      this.getCateParmas()
    },
    //标签页切换事件
    handleClick() {
      this.getCateParmas()
    },
    //获取分类参数信息
    async getCateParmas() {
      if(this.selectedKeys.length !== 3){
        this.selectedKeys = []
        this.cateParams= []
        return
      }
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName },
        }
      )
      res.data.forEach((item) => {
        item.attr_vals = item.attr_vals.split(' ')
        //动态控制文本框的显示与隐藏
        this.$set(item, 'inputVisible', false)
        //文本框的输入
        this.$set(item, 'inputValue', '')
      })
      this.cateParams = res.data
    },
    //删除Tag事件
    handleTagClose() {},
    //点击添加标签触发事件
    showInput(sc) {
      sc.inputVisible = true
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    //离开添加标签input触发事件
    async handleInputConfirm(sc) {
      if (sc.inputValue) {
        sc.attr_vals.push(sc.inputValue)
      }
      sc.inputVisible = false
      sc.inputValue = ''

      //发起网络请求 添加参数
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${sc.attr_id}}`,
        {
          attr_name: sc.attr_name,
          attr_sel: sc.attr_sel,
          attr_vals: sc.attr_vals.join(' '),
        }
      )
      if (res.meta.status !== 200) return this.$message.error('添加失败')
      this.$message.success('添加成功')
    },
    //点击确定添加分类参数
    addCateParmas() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName,
          }
        )
        this.$message.success('添加成功')
        this.adddialogVisible = false
        this.getCateParmas()
      })
    },
    //添加对话框关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    //修改对话框关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    //点击修改打开对话框
    editParams(ps) {
      this.editdialogVisible = true
      //console.log(ps)
      this.editForm.attr_name = ps.attr_name
      this.editForm.attr_id = ps.attr_id
    },
    //点击确定修改分类名称
    editDialog() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName,
          }
        )

        this.$message.success('修改成功')
        this.editdialogVisible = false
        this.getCateParmas()
      })
    },
    //删除参数
    async delParmas(ps) {
      this.editForm.attr_id = ps.attr_id
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
        `categories/${this.cateId}/attributes/${this.editForm.attr_id}`
      )
      this.$message.success('删除成功')
      this.getCateParmas()
    },
    //删除标签参数
   async handleClose(i, sc) {
      sc.attr_vals.splice(i, 1)
      //发起网络请求 添加参数
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${sc.attr_id}}`,
        {
          attr_name: sc.attr_name,
          attr_sel: sc.attr_sel,
          attr_vals: sc.attr_vals.join(' '),
        }
      )
      if (res.meta.status !== 200) return this.$message.error('删除失败')
      this.$message.success('删除成功')
    },
  },
}
</script>

<style lang="less" scoped>
.rowSpan {
  margin-right: 10px;
  font-size: 13px;
}
.paramsTag {
  margin-right: 15px;
}

.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 100px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>