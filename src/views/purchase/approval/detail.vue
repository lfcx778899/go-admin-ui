<template>
  <div class="app-container">
    <div class="detail-title">
      <h3>基本信息</h3>
    </div>
    <el-form :inline="true" label-width="100px" label-position="right">
      <el-row>
        <el-col :span="6">
          <el-form-item label="申请单号">
            <span>{{purchaseOrder.purchase_request_id}}</span>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="申请时间" :span="6">
            <span>{{parseTime(purchaseOrder.created_at)}}</span>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="状态" :span="6">
            <span>{{purchaseOrder.statusName}}</span>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="申请部门" :span="6">
            <span>{{purchaseOrder.dept_name}}</span>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="6">
          <el-form-item label="申请人">
            <span>{{purchaseOrder.create_by_name}}</span>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="产品编号" :span="6">
            <span>{{purchaseOrder.product_id}}</span>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="产品名称" :span="6">
            <span>{{purchaseOrder.product_name}}</span>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="产品类别" :span="6">
            <span>{{purchaseOrder.product_type}}</span>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="6">
          <el-form-item label="申请数量">
            <span>{{purchaseOrder.requests_quantity}}</span>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="规格">
            <span>{{purchaseOrder.product_specifications}}</span>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="单位">
            <span>{{purchaseOrder.product_units}}</span>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="备注">
            <span>{{purchaseOrder.remark}}</span>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div class="detail-title">
      <h3>操作日志</h3>
    </div>
    <el-table v-loading="loading" :data="logList">
      <el-table-column label="操作时间" prop="created_at" width="300" >
        <template slot-scope="scope">
          <span>{{parseTime(scope.row.created_at)}}</span>
        </template>
      </el-table-column>
      <el-table-column label="部门名称" prop="dept_name"/>
      <el-table-column label="操作人" prop="created_by_name"/>
      <el-table-column label="操作步骤" prop="remark"/>
      <el-table-column label="处理状态" prop="statusName"/>
    </el-table>
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageIndex"
      :limit.sync="queryParams.pageSize"
      @pagination="getLogPage"
    />

    <div>
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button v-if="purchaseOrder.requests_status===2"
            type="primary"
            icon="el-icon-check"
            size="mini"
            @click="handleSingleAudit"
          >审批通过</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button v-if="purchaseOrder.requests_status===2"
            type="success"
            icon="el-icon-close"
            size="mini"
            @click="handleSingleReject"
          >取消采购</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="warning"
            icon="el-icon-s-promotion"
            size="mini"
            @click="backToList"
          >返回列表
          </el-button>
        </el-col>
      </el-row>
    </div>
  </div>


</template>

<script>
  import {getItem,updateStatus} from '@/api/purchase/apply'
  import { getDicts } from '@/api/system/dict/data'
  import {getPage} from '@/api/purchase/log'
  export default {
    name: 'detail',
    data(){
      return {
        purchaseOrder:{},
        queryParams:{
          purchase_request_id :'',
          pageIndex: 1,
          pageSize: 10
        },
        total:0,
        logList:[],
        loading:false,
      }
    },
    mounted(){
      this.purchaseRequestId = sessionStorage.getItem('purchaseRequestId');
      getDicts('purchase_status').then(response => {
        this.orderStatusList = response.data
      })
      this.getOrderInfo();
    },
    methods:{
      getOrderInfo(){
        getItem({id:this.purchaseRequestId}).then(response=>{
          if(response && response.data){
            let statusName = '';
            this.orderStatusList.forEach(si=>{
              if(si.dictValue===String(response.data.requests_status)){
                statusName = si.dictLabel;
              }
            })
            this.queryParams.purchase_request_id = response.data.purchase_request_id;
            this.purchaseOrder = {...response.data,statusName:statusName}
            this.getLogPage();
          }
        });
      },
      backToList(){
        this.$router.push({path:'/purchase/approval'})
      },
      getLogPage(){
        getPage(this.queryParams).then(response=>{
          if(response.code===200){
            let tempList = [];
            if(response.data&& response.data.items && response.data.items.length>0){
              response.data.items.forEach(logItem=>{
                this.orderStatusList.forEach(si=>{
                  if(si.dictValue===String(logItem.operate_status)){
                    tempList.push({...logItem,statusName:si.dictLabel});
                  }
                })
              })
            }
            this.logList = tempList;
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
              this.getOrderInfo()
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
              this.getOrderInfo()
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
