<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-row
        ><el-col
          ><el-button type="primary" @click="showCateDialong"
            >添加分类</el-button
          ></el-col
        ></el-row
      >
      <!-- 表格 -->
      <tree-table
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        border
        :show-row-hover="false"
        class="treeTable"
      >
        <!-- 是否有效的模板 -->
        <template slot="isok" slot-scope="scope">
          <i
            v-if="scope.row.cat_deleted === false"
            style="color: pink; fontsize: 16px"
            class="el-icon-success"
          ></i>
          <i class="el-icon-error" style="color: red" v-else></i>
        </template>
        <!-- 排序的模板 -->
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0" size="mini">一级</el-tag>
          <el-tag
            type="success"
            size="mini"
            v-else-if="scope.row.cat_level === 1"
            >二级</el-tag
          >
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <!-- 编辑的模板 -->
        <template slot="opt" slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            icon="el-icon-edit"
            @click="editCate(scope.row)"
            >编辑</el-button
          >
          <el-button
            @click="removeCate(scope.row)"
            slot="reference"
            size="mini"
            type="danger"
            icon="el-icon-delete"
            >删除</el-button
          >
        </template>
      </tree-table>

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

    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
    >
      <el-form
        :model="cateForm"
        :rules="cateFormRules"
        ref="cateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="cateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="选中父类">
          <el-cascader
            clearable
            :options="parentCateList"
            :props="cascaderProps"
            v-model="selectedKeys"
            @change="handleChange"
          >
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑分类 -->
    <el-dialog
      title="编辑分类"
      :visible.sync="editCateDialogVisible"
      width="50%"
    >
      <el-form :model="editForm" ref="editFormRef" label-width="100px">
        <el-form-item label="分类名称">
          <el-input v-model="editForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="所属分类">
          <el-cascader
            disabled
            clearable
            :options="parentCateList"
            :props="cascaderProps"
            v-model="editselectedKeys"
            @change="handleChange"
          >
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editaddCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Categories',
  data() {
    return {
      queryInfo: {
        //当前页码值
        pagenum: 1,
        //每页显示多少条数据
        pagesize: 5,
      },
      //商品分类数据
      cateList: [],
      total: 0,
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name',
        },
        {
          label: '是否有效',
          //将当前列渲染成模板列
          type: 'template',
          template: 'isok',
        },
        {
          label: '排序',
          //将当前列渲染成模板列
          type: 'template',
          template: 'order',
        },
        {
          label: '编辑',
          //将当前列渲染成模板列
          type: 'template',
          template: 'opt',
        },
      ],
      //控制添加分类对话框是否显示
      addCateDialogVisible: false,
      //添加分类数据
      cateForm: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0,
      },
      //添加分类规则
      cateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名', trigger: 'blur' },
        ],
      },
      //所有的父级分类列表
      parentCateList: [],
      //指定级联选择器的配置对象
      cascaderProps: {
        checkStrictly: true,
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
      },
      //选中的父级分类的id
      selectedKeys: [],
      //编辑分类父级分类展示
      editselectedKeys: [],
      editForm: {
        cat_name: '',
        cat_id: 0,
      },
      //
      editCateDialogVisible: false,
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo,
      })
      //console.log(res)
      if (res.meta.status !== 200) return this.$message.error('获取失败')
      this.cateList = res.data.result
      this.total = res.data.total
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum
      this.getCateList()
    },
    //点击添加分类显示对话框
    showCateDialong() {
      this.getPrentCate()
      this.cateForm.cat_name = ''
      this.addCateDialogVisible = true
    },
    //获取父级分类
    async getPrentCate() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 },
      })
      if (res.meta.status !== 200) return this.$message.error('获取失败')
      this.parentCateList = res.data
    },
    //选择器发生改变调用
    handleChange() {
      console.log(this.selectedKeys)
    },
    //点击确定添加分类
    async addCate() {
      console.log(this.selectedKeys)
      let pid = 0
      let level = 0
      if (this.selectedKeys.length === 1) {
        pid = this.selectedKeys[0]
        level = 1
      } else if (this.selectedKeys.length === 2) {
        pid = this.selectedKeys[1]
        level = 2
      } else {
        pid = 0
        level = 0
      }
      const { data: res } = await this.$http.post('categories', {
        cat_pid: pid,
        cat_name: this.cateForm.cat_name,
        cat_level: level,
      })
      this.$message.success('添加成功')
      this.getCateList()
      this.addCateDialogVisible = false
    },
    //编辑分类
    editCate(cateInfo) {
      this.getPrentCate()
      this.editCateDialogVisible = true
      this.editForm.cat_name = cateInfo.cat_name
      this.editForm.cat_id = cateInfo.cat_id
      this.editselectedKeys = cateInfo.cat_id
    },
    //编辑分类提交
    async editaddCate() {
      const { data: res } = await this.$http.put(
        `categories/${this.editForm.cat_id}`,
        { cat_name: this.editForm.cat_name }
      )
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success('修改成功')
      this.getCateList()
      this.editCateDialogVisible = false
    },
    //删除分类
    async removeCate(cateInfo) {
      this.editForm.cat_id = cateInfo.cat_id
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
        `categories/${this.editForm.cat_id}`
      )
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$notify({
        title: '提示',
        message: '删除成功',
        type: 'success',
      })
      this.getCateList()
    },
  },
}
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>>