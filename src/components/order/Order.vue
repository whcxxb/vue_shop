<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="querInfo.query" clearable>
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getOrderList"
            ></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 表格区域 -->
      <el-table :data="orderList" style="width: 100%">
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="order_number" label="订单编号" width="200px">
        </el-table-column>
        <el-table-column prop="order_price" label="订单价格"> </el-table-column>
        <el-table-column label="是否付款">
          <template slot-scope="scope">
            <el-tag type="warning" v-if="scope.row.order_pay === '0'"
              >未付款</el-tag
            >
            <el-tag v-else>已付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货"></el-table-column>
        <el-table-column label="下单时间">
          <template slot-scope="scope">
            {{ scope.row.create_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showDialog"
            ></el-button>
            <el-button
              type="success"
              icon="el-icon-position"
              size="mini"
              @click="showprogress"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="querInfo.pagenum"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="querInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 对话框区域 -->
    <el-dialog title="修改地址" :visible.sync="addrdialogVisible" width="50%">
      <el-form
        :model="addrForm"
        ref="addrForm"
        :rules="addrRules"
        label-width="100px"
      >
        <el-form-item label="选择" prop="addrss1">
          <el-cascader
            :props="{ expandTrigger: 'hover' }"
            :options="citydata"
            v-model="addrForm.addrss1"
            clearable
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="addrss2">
          <el-input v-model="addrForm.addrss2" class="addrInput"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addrdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addrdialogVisible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>

    <!-- 物流对话框 -->
    <el-dialog
      title="物流信息"
      :visible.sync="progressdialogVisible"
      width="50%"
    >
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in progressInfo"
          :key="index"
          :timestamp="activity.time"
        >
          {{ activity.context }}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import citydata from './citydata.js'
export default {
  data() {
    return {
      querInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10,
      },
      //订单列表数据
      orderList: [],
      total: 0,
      addrdialogVisible: false,
      addrForm: {
        addrss1: [],
        addrss2: '',
      },
      addrRules: {
        addrss1: [{ required: true, message: '请输入', trigger: 'blur' }],
        addrss2: [{ required: true, message: '请输入', trigger: 'blur' }],
      },
      //城市数据
      citydata,
      progressdialogVisible: false,
      progressInfo:[]
    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
    async getOrderList() {
      console.log(this.querInfo)
      const { data: res } = await this.$http.get(`orders`, {
        params: this.querInfo,
      })
      this.orderList = res.data.goods
      this.total = res.data.total
      console.log(res)
    },
    handleSizeChange(newSize) {
      this.querInfo.pagesize = newSize
      this.getOrderList()
    },
    handleCurrentChange(pageNum) {
      this.querInfo.pagenum = pageNum
      this.getOrderList()
    },
    showDialog() {
      this.addrdialogVisible = true
    },
    //显示快递进度对话框
    async showprogress() {
      this.progressdialogVisible = true

      const { data: res } = await this.$http.get(`/kuaidi/1106975712662`)
      if (res.meta.status !== 200) return this.$message.error('获取失败')
      this.progressInfo = res.data
      console.log(res)
    },
  },
}
</script>

<style lang="less">
.addrInput {
  width: 260px !important;
}
</style>>
