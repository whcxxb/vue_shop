<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/goods' }">商品列表</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <!-- 进度条区域 -->
      <el-steps :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- 面板区域 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        label-width="100px"
        label-position="top"
        ref="addFormRef"
      >
        <el-tabs
          v-model="activeIndex"
          :tab-position="'left'"
          :before-leave="beforeLeave"
          @tab-click="tabClick"
        >
          <el-tab-pane label="基本信息" name="1">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input type="number" v-model="addForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品类别" prop="goods_cat">
              <el-cascader
                clearable
                :options="cateList"
                :props="cascaderProps"
                v-model="addForm.goods_cat"
                @change="handleChange"
              >
              </el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="2">
            <el-form-item
              :label="item.attr_name"
              v-for="item in manyParams"
              :key="item.attr_id"
            >
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  border
                  :label="cb"
                  v-for="(cb, i) in item.attr_vals"
                  :key="i"
                  v-show="cb != []"
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="3">
            <el-form-item
              :label="item.attr_name"
              v-for="item in onlyParams"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="4">
            <el-upload
              :action="uploadUrl"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="uploadHeader"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="5">
            <quill-editor v-model="addForm.goods_introduce"> </quill-editor>
            <el-button type="primary" class="btncs" @click="addGoods"
              >添加商品</el-button
            >
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览 -->
    <el-dialog title="图片预览" :visible.sync="imgdialogVisible" width="50%">
      <img :src="imgPath" alt="" width="100%" />
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  data() {
    return {
      activeIndex: '1',
      addForm: {
        goods_name: '',
        goods_price: '0',
        goods_number: '0',
        goods_weight: '0',
        goods_cat: [],
        pics: [],
        goods_introduce: '',
        attrs: [],
      },
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' },
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' },
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' },
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' },
        ],
        goods_cat: [
          { required: true, message: '请选中商品类别', trigger: 'blur' },
        ],
      },

      //商品分类数据
      cateList: [],
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
      },
      //级联选择器选中的分类id
      editselectedKeys: [],
      //商品参数
      manyParams: [],
      //商品属性
      onlyParams: [],
      //上传图片的url地址
      uploadUrl: 'http://127.0.0.1:8888/api/private/v1/upload',
      uploadHeader: {
        Authorization: window.sessionStorage.getItem('token'),
      },
      imgPath: '',
      imgdialogVisible: false
    }
  },
  created() {
    this.getCateList()
  },

  //获取分类信息
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取失败')
      this.cateList = res.data
    },
    //级联选择器 选中触发
    handleChange() {
      console.log(this.addForm.goods_cat)
    },
    //标签页切换的前置钩子
    beforeLeave(activeName, oldActiveName) {
      if (oldActiveName === '1') {
        if (
          this.addForm.goods_cat.length !== 3 ||
          this.addForm.goods_name === ''
        ) {
          this.$message.error('请输入商品名称或选中商品分类')
          return false
        }
      }
    },
    async tabClick() {
      if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: 'many' },
          }
        )
        res.data.forEach((item) => {
          item.attr_vals = item.attr_vals.split(' ')
        })
        this.manyParams = res.data
      }
      if (this.activeIndex === '3') {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: 'only' },
          }
        )
        this.onlyParams = res.data
      }
    },
    //处理图片预览
    handlePreview(file) {
      this.imgPath = file.response.data.url
      this.imgdialogVisible = true
    },
    //处理图片删除
    handleRemove(file) {
      const filePath = file.response.data.tmp_path
      const fileIndex = this.addForm.pics.findIndex((x) => x.pic === filePath)
      this.addForm.pics.splice(fileIndex, 1)
    },
    //图片上传
    handleSuccess(res) {
      const picInfo = {
        pic: res.data.tmp_path
      }
      this.addForm.pics.push(picInfo)
      //console.log(this.addForm)
    },

    //添加商品
    addGoods() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) {
          return this.$message.error('请填写')
        }

        this.manyParams.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' '),
          }
          this.addForm.attrs.push(newInfo)
        })
        this.onlyParams.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals,
          }
          this.addForm.attrs.push(newInfo)
        })
        //深拷贝添加参数数据对象
        const form = _.cloneDeep(this.addForm)

        form.goods_cat = form.goods_cat.join(',')
        console.log(form)
        const { data: res } = await this.$http.post('goods', form)
        if (res.meta.status !== 201) return this.$message.error('添加失败')
        //console.log(form);
        this.$message.success('添加成功')
        this.$router.push('/goods')
      })
    },
  },
  computed: {
    //获取三级分类id
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }

      return null
    },
  },
}
</script>

<style lang="less">
.el-cascader {
  width: 260px;
}
.btncs {
  margin-top: 15px !important;
}
.el-checkbox {
  margin: 0 !important;
  margin-right: 10px !important;
}
</style>