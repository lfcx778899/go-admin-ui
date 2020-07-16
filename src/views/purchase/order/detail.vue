<template>
  <div class="app-container">
    <div class="detail-title">
      <h3>基本信息</h3>
    </div>
    <el-form :inline="true" label-width="100px" label-position="right">
      <el-row>
        <el-col :span="6">
          <el-form-item label="采购单号">
            <span>{{purchaseControlOrder.purchase_control_id}}</span>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="采购时间" :span="6">
            <span>{{parseTime(purchaseControlOrder.purchase_order_time)}}</span>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="状态" :span="6">
            <span>{{getStatusName(purchaseControlOrder.purchase_status)}}</span>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="供应商" :span="6">
            <span>{{purchaseControlOrder.supplier_name}}</span>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="6">
          <el-form-item label="采购总数量">
            <span>{{purchaseControlOrder.totalpruchase_quantity}}</span>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="已入库数量" :span="6">
            <span>{{purchaseControlOrder.storaged_total_quantity}}</span>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="采购总金额" :span="6">
            <span>{{purchaseControlOrder.totalamount_without_tax}}</span>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="已入库金额" :span="6">
            <span>{{purchaseControlOrder.storaged_amount_without_tax}}</span>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <div class="detail-title" v-if="purchaseControlOrder.contract_adress">
      <h3>采购合同</h3>
    </div>
    <div style="margin-top: 20px;margin-bottom: 20px" v-if="purchaseControlOrder.contract_adress">
      <el-button size="mini" type="primary" @click="downLoadContract">下载合同</el-button>
    </div>

    <div class="detail-title">
      <h3>采购明细</h3>
    </div>
    <el-table v-loading="loading" :data="logList">
      <el-table-column label="类型名称" prop="product_type" width="150" />
      <el-table-column label="商品名称" prop="product_name" width="150" />
      <el-table-column label="采购数量" prop="pruchase_quantity" width="150" />
      <el-table-column label="单价" prop="unitprice_without_tax" width="250" />
      <el-table-column label="总金额" prop="amount_without_tax"/>
    </el-table>
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageIndex"
      :limit.sync="queryParams.pageSize"
      @pagination="getProductPage"
    />

    <div style="margin-top: 20px">
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button v-if="purchaseControlOrder.purchase_status===0"
                     type="primary"
                     icon="el-icon-check"
                     size="mini"
                     @click="handleSingleAudit"
          >确认采购</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button v-if="purchaseControlOrder.purchase_status===1 && !purchaseControlOrder.contract_adress"
                     type="success"
                     icon="el-icon-close"
                     size="mini"
                     @click="handleSingleAudit"
          >补充合同</el-button>
        </el-col>
      </el-row>
    </div>

    <el-dialog title="上传合同" :visible.sync="open" width="500px">
      <el-form ref="form" label-width="100px">
        <el-form-item label="上传合同" prop="remark">
          <el-upload
            :limit=1
            :auto-upload="false"
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
  import { getPurchaseControlItem ,getPurchaseControlProduct,uploadContract} from '@/api/purchase/purchaseControl'
  import {downLoadZip} from "@/utils/zipdownload";
  export default {
    name: 'detail',
    data(){
      return {
        purchaseControlOrder:{},
        queryParams:{
          purchase_control_id :'',
          pageIndex: 1,
          pageSize: 10
        },
        total:0,
        logList:[],
        loading:false,
        fileList:[],
        open:false,
      }
    },
    mounted(){
      this.purchaseControlId = sessionStorage.getItem('purchaseControlId');
      this.queryParams.purchase_control_id = this.purchaseControlId;
      this.getOrderInfo();
      this.getProductPage();
    },
    methods:{
      getOrderInfo(){
        getPurchaseControlItem({purchase_control_id:this.purchaseControlId}).then(response=>{
          this.purchaseControlOrder = response.data;
        });
      },
      UploadUrl(){
        return "";
      },
      getStatusName(statusId){
        if(statusId ===0){
          return "新建"
        }
        if(statusId ===1){
          return "确认采购"
        }
        if(statusId ===2){
          return "已入库"
        }
        if(statusId ===3){
          return "待付款"
        }
        if(statusId ===4){
          return "已付款"
        }
        return ""
      },
      getProductPage(){
        getPurchaseControlProduct(this.queryParams).then(response=>{
          if(response.code===200){
            this.logList = response.data.items;
            this.total = response.data.total;
          }
        })
      },
      downLoadContract(){
        let filePath = this.purchaseControlOrder.contract_adress.split('/');
        downLoadZip(this.purchaseControlOrder.contract_adress,filePath[filePath.length-1]);
      },
      handleSingleAudit(){
        this.open = true;
      },
      cancel(){
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
        let uploadresult = false;
        if(this.fileList.length===1){
          let form = new FormData();
          form.append('file', this.fileList[0]);
          uploadContract(this.purchaseControlId,form).then(resp=>{
            if (resp.code === 200){
              uploadresult = true;
              this.open = false;
            }else{
              this.msgError(resp.msg)
            }
          })
        }
        if(this.fileList.length===0 || uploadresult){

        }
      }
    }
  }
</script>

<style scoped>

</style>
