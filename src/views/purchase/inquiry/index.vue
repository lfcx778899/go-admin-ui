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

    <el-table v-loading="loading" :data="showList">
      <el-table-column label="供应商名称" prop="supplier_name" width="120" />
      <el-table-column label="询价产品明细" width="120" >
        <template slot-scope="scope">
          <el-button
            size="small"
            type="primary"
            icon="el-icon-download"
            @click="downLoadProducts(scope.row)"
          >下载产品明细</el-button>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="created_at" width="200" >
        <template slot-scope="scope">
          <span>{{parseTime(scope.row.created_at)}}</span>
        </template>
      </el-table-column>

      <el-table-column label="报价单" prop="dept_name" width="120" >
        <template slot-scope="scope">
          <el-button v-if="scope.row.quotation_status===0"
            size="small"
            type="success"
            icon="el-icon-view"
            @click="handleUpLoad(scope.row)"
          >上传</el-button>
          <el-button v-else
                     size="small"
                     type="primary"
                     icon="el-icon-download"
                     @click="handleUpLoad(scope.row)"
          >下载报价单</el-button>
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="requests_status" width="120" >
        <template slot-scope="scope">
          <span>{{scope.row.quotation_status===0? "待报价":"已报价"}}</span>
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


    <!--<el-dialog :title="title" :visible.sync="open" width="500px">-->
      <!--<el-form ref="form" :model="form" :rules="rules" label-width="100px">-->
        <!--<el-form-item label="备注" prop="remark">-->
          <!--<el-input v-model="form.remark" placeholder="备注" />-->
        <!--</el-form-item>-->
        <!--<el-form-item label="备注" prop="remark">-->
          <!--<el-input v-model="form.remark" placeholder="备注" />-->
        <!--</el-form-item>-->
      <!--</el-form>-->
      <!--<div slot="footer" class="dialog-footer">-->
        <!--<el-button type="primary" @click="submitForm">确 定</el-button>-->
        <!--<el-button @click="cancel">取 消</el-button>-->
      <!--</div>-->
    <!--</el-dialog>-->



  </div>
</template>

<script>
import { getInUseSupplier } from '@/api/basic/supplier';
import {getQuotationControlPage} from '@/api/purchase/quotationControl';
import {downLoadXls} from '@/utils/zipdownload'

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
      showList:[],
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
      getQuotationControlPage(this.queryParams).then(response=>{
        this.showList = response.data.items;
        this.total =  response.data.total;
      })
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
    downLoadProducts(row){
      downLoadXls(row.purchase_requests_detail_adress,'111.xlsx');
    }
  }
}
</script>

<style scoped>

</style>
