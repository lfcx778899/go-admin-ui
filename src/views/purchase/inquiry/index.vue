<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="100px">
      <el-form-item label="供应商名称">
        <el-select
          v-model="queryParams.supplier_id"
          clearable
          style="width: 240px"
        >
          <el-option
            v-for="dict in inUseSupplier"
            :key="dict.id"
            :label="dict.supplier_name"
            :value="dict.supplier_name"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="purchaserequestsList" @selection-change="handleSelectionChange">
      <el-table-column label="供应商名称" prop="requests_quantity" width="120" />
      <el-table-column label="产品明细" prop="product_name" width="120" />
      <el-table-column label="创建时间" prop="created_at" width="200" >
        <template slot-scope="scope">
          <span>{{parseTime(scope.row.created_at)}}</span>
        </template>
      </el-table-column>

      <el-table-column label="报价单" prop="dept_name" width="120" >
        <template slot-scope="scope">
          <el-button
            size="small"
            type="success"
            icon="el-icon-view"
            @click="handleDetail(scope.row)"
          >上传</el-button>
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="requests_status" width="120" >
        <template slot-scope="scope">
          <span>{{scope.row.statusName}}</span>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageIndex"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script>
import { getInUseSupplier } from '@/api/basic/supplier';

export default {
  name: 'Index',
  data() {
    return {
      // 遮罩层
      loading: false,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      isEdit: false,
      // 类型数据字典
      typeOptions: [],
      productList:[],
      selectProductList:[],
      purchaserequestsList:[],
      productTypeList:[],
      // 查询参数
      queryParams: {
        supplier_id:'',
        pageIndex: 1,
        pageSize: 10,
      },
      statusList:[],
      orderStatusList:[],
      rules: {},
      selectRows:[],
      inUseSupplier:[],
      deptOptions: undefined,
    }
  },
  created() {
    getInUseSupplier().then(resp=>{
      this.inUseSupplier = resp.data.items;
    });
    this.getList();
  },
  methods:{
    getList(){

    },
    resetQuery() {
      this.queryParams = {
        pageIndex: 1,
        pageSize: 10
      }
      this.resetForm('queryForm')
      this.handleQuery()
    },
    handleQuery(){
      this.queryParams.pageIndex = 1
      this.getList()
    },
  }
}
</script>

<style scoped>

</style>
