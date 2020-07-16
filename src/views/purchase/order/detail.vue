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
    <div class="detail-title">
      <h3>采购明细</h3>
    </div>
    <el-table v-loading="loading" :data="logList">
      <el-table-column label="商品名称" prop="dept_name" width="150" />
      <el-table-column label="采购数量" prop="created_by_name" width="150" />
      <el-table-column label="单价" prop="remark" width="250" />
      <el-table-column label="总金额" prop="statusName" width="100" />
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
                     @click="handleSingleReject"
          >补充合同</el-button>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
  import { getPurchaseControlItem ,getPurchaseControlProduct} from '@/api/purchase/purchaseControl'
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
      handleSingleAudit(){
        this.$confirm('是否确认审批通过 ?', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          updateStatus(this.purchaseRequestId, { requests_status: 3 }).then(response => {
            if (response.code === 200) {
              this.msgSuccess('操作成功')
              this.open = false
              this.getList()
            } else {
              this.msgError(response.msg)
            }
          })
        })

      },
      handleSingleReject(){
        this.$confirm('是否确认取消采购 ?', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          updateStatus(this.purchaseRequestId, { requests_status: 4 }).then(response => {
            if (response.code === 200) {
              this.msgSuccess('操作成功')
              this.open = false
              this.getList()
            } else {
              this.msgError(response.msg)
            }
          })
        })
      },
    }
  }
</script>

<style scoped>

</style>
