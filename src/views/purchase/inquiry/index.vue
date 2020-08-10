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
            :value="dict.supplier_id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="showList">
      <el-table-column label="供应商名称" prop="supplier_name"/>
      <el-table-column label="询价产品明细">
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

      <el-table-column label="报价单" prop="dept_name">
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
                     @click="downLoadBJD(scope.row)"
          >下载报价单</el-button>
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="requests_status">
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


    <el-dialog :title="title" :visible.sync="open" width="500px" :close-on-click-modal="false">
      <el-form ref="form" label-width="100px">
        <el-form-item label="选择文件" prop="remark">
          <el-upload
                     :limit=1
                     :auto-upload="false"
                     accept=".xlsx"
                     :action="UploadUrl()"
                     :before-upload="beforeUploadFile"
                     :on-change="fileChange"
                     :on-exceed="exceedFile"
                     :on-success="handleSuccess"
                     :on-error="handleError"
                     :file-list="fileList">
            <el-button size="small" type="primary">点击上传</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="uploadFile">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>



  </div>
</template>

<script>
import { getInUseSupplier } from '@/api/basic/supplier';
import {getQuotationControlPage,uploadXlsx} from '@/api/purchase/quotationControl';
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
      fileList:[],
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
      let filePath = row.purchase_requests_detail_adress.split('/');
      downLoadXls(row.purchase_requests_detail_adress,filePath[filePath.length-1]);
    },
    downLoadBJD(row){
      let filePath = row.quotation_adress.split('/');
      downLoadXls(row.quotation_adress,filePath[filePath.length-1]);
    },
    handleUpLoad(row){
      this.title = "上传报价单";
      this.id = row.id;
      this.open = true;
    },
    UploadUrl(){
      return "";
    },
    cancel(){
      this.title = "";
      this.open = false;
    },
    exceedFile(files, fileList) {
      this.msgError("选择多个文件");
    },
    fileChange(file, fileList) {
      this.fileList.push(file.raw) ;
    },
    beforeUploadFile(file) {
      let extension = file.name.substring(file.name.lastIndexOf('.')+1);
      let size = file.size / 1024 / 1024;
      if(extension !== 'xlsx') {
        this.msgError("只能上传后缀是.xlsx的文件");
      }
      if(size > 4) {
        this.msgError("文件大小不得超过4M");
      }
    },
    // 文件上传成功时的钩子
    handleSuccess(res, file, fileList) {
      this.msgSuccess('文件上传成功')
    },
    // 文件上传失败时的钩子
    handleError(err, file, fileList) {
      this.msgError("文件上传失败");
    },
    uploadFile() {
      if (this.fileList.length === 0){
        this.msgError("请上传文件");
      } else {
        let form = new FormData();
        form.append('file', this.fileList[0]);

        uploadXlsx(this.id,form).then(resp=>{
          if (resp.code === 200) {
            this.msgSuccess('操作成功')
            this.open = false
            this.getList()
          } else {
            this.msgError(resp.msg)
          }
        })
      }
    }
  }
}
</script>

<style scoped>

</style>
