<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input
            placeholder="请输入内容"
            class="inputs"
            v-model="queryInfo.query"
            clearable
            @clear="getGoodsList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getGoodsList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addGoods">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- 表格区域 -->
      <el-table :data="goodsList" style="width: 100%" size="small">
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column
          prop="goods_name"
          label="商品名称"
          width="200px"
        ></el-table-column>
        <el-table-column prop="goods_price" label="商品价格"></el-table-column>
        <el-table-column prop="goods_number" label="商品数量"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量"></el-table-column>
        <el-table-column label="热销商品">
          <template slot-scope="scope">
            <i v-if="scope.row.hot_mumber === 0" class="el-icon-close"></i>
          </template>
        </el-table-column>
        <el-table-column prop="add_time" label="创建时间">
          <template slot-scope="scope">
            {{ scope.row.add_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editgoods(scope.row)"
            ></el-button>
            <el-button
              @click="delGoods(scope.row.goods_id)"
              type="danger"
              icon="el-icon-delete"
              size="mini"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 编辑商品 -->
    <el-dialog @close="dialogClose" title="编辑商品" :visible.sync="editdialogVisible" width="50%">
      <el-form
        :model="editForm"
        label-width="90px"
        label-position="left"
        ref="editFormRef"
      >
        <el-form-item label="商品名称">
          <el-input v-model="editForm.goods_name"></el-input>
        </el-form-item>
        <el-form-item label="商品价格">
          <el-input type="number" v-model="editForm.goods_price"></el-input>
        </el-form-item>
        <el-form-item label="商品数量">
          <el-input v-model="editForm.goods_number"></el-input>
        </el-form-item>
        <el-form-item label="商品重量">
          <el-input v-model="editForm.goods_weight"></el-input>
        </el-form-item>
      </el-form>
      <p>商品图片:</p>
      <img :src="imgUrl" alt=""  width="100%" />
      <el-upload
        action="http://127.0.0.1:8888/api/private/v1/upload"
        :on-preview="handlePreview"
        :on-remove="handleRemove"
        :on-success="handleSuccess"
        :headers="uploadHeader"
        list-type="picture"
        ref="uploadRef"
      >
        <el-button size="small" type="primary">更换图片</el-button>
      </el-upload>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveEditGoods">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10,
      },
      //商品列表数据
      goodsList: [],
      //总数量
      total: 0,
      editdialogVisible: false,
      editForm: {
        goods_name: '',
        goods_price: '0',
        goods_number: '0',
        goods_weight: '0',
        pics: [],
        goods_introduce: '',
        attrs: [],
        goods_cat: '',
      },
      //商品id
      goodsId: null,
      //商品图片地址
      imgUrl: '',
      //上传图片的头部
      uploadHeader: {
        Authorization: window.sessionStorage.getItem('token'),
      },
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    async getGoodsList() {
      const { data: res } = await this.$http.get(`goods`, {
        params: this.queryInfo,
      })
      if (res.meta.status !== 200) return this.$message.error('获取失败')
      this.goodsList = res.data.goods
      this.total = res.data.total
      //console.log(res)
    },
    //每页显示多少条数据发生改变时调用
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    //翻页时调用
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum
      this.getGoodsList()
    },
    //点击按钮跳转添加商品组件
    addGoods() {
      this.$router.push('/goods/new')
    },
    async delGoods(id) {
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
      const { data: res } = await this.$http.delete(`goods/${id}`)
      this.$message.success('删除成功')
      this.getGoodsList()
    },
    editgoods(row) {
      // this.$router.push('/goods/editgoods')
      this.editdialogVisible = true
      this.editForm.goods_name = row.goods_name
      this.editForm.goods_number = row.goods_number
      this.editForm.goods_price = row.goods_price
      this.editForm.goods_weight = row.goods_weight
      this.goodsId = row.goods_id
      this.getGoodsId()
      console.log(this.editForm)
    },
    async saveEditGoods() {
      const { data: res } = await this.$http.put(
        `goods/${this.goodsId}`,
        this.editForm
      )
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success('编辑成功')
      this.getGoodsList()
      this.editdialogVisible = false
    },
    //获取当前商品的分类id
    async getGoodsId() {
      const { data: res } = await this.$http.get(`goods/${this.goodsId}`)
      console.log(res)
      this.editForm.goods_cat = res.data.goods_cat
      this.imgUrl = res.data.pics[0].pics_big_url
    },
    handlePreview() {},
    handleRemove() {},
    handleSuccess(res) {
      const picInfo = {
        pic: res.data.tmp_path,
      }
      this.editForm.pics.push(picInfo) 

      console.log(this.editForm);
    },
    clearFiles(){
       this.$refs['uploadRef'].clearFiles();
    },
    dialogClose(){
      this.clearFiles()
    }
  },
}
</script>

<style lang="less" scoped>
.el-pagination {
  margin-top: 15px;
}
.el-icon-close {
  color: red;
  font-size: 20px;
}
</style>