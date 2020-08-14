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
          <el-form-item label="供应商">
            <span>{{purchaseOrder.supplier_names}}</span>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="供应价格">
            <span>{{purchaseOrder.product_price_withouttax}}</span>
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
          <el-button v-if="purchaseOrder.requests_status===3"
            type="primary"
            icon="el-icon-s-data"
            size="mini"
            @click="handleChangeSupplier"
          >比价</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button v-if="purchaseOrder.requests_status===3 ||purchaseOrder.requests_status===5"
                     type="primary"
                     icon="el-icon-check"
                     size="mini"
                     @click="handleCheckSupplier"
          >确认</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button v-if="purchaseOrder.requests_status===3"
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

    <el-dialog :title="title" :visible.sync="open" width="500px" :close-on-click-modal="false">
      <el-form ref="form" :model="form" label-width="80px">
        <el-form-item label="供应商" prop="supplier_id"  v-if="!showPrice">
        <el-select
          v-model="form.ids"
          placeholder="请选择供应商"
          clearable
          multiple
          size="small"
          style="width: 360px"
        >
          <el-option
            v-for="product in suppliers"
            :key="product.id"
            :label="product.supplier_name"
            :value="product.supplier_id"
          />
        </el-select>
      </el-form-item>
        <el-form-item label="供应商" prop="supplier_id"  v-if="showPrice">
          <el-select
            v-model="form.supplier_id"
            placeholder="请选择供应商"
            clearable
            size="small"
            style="width: 360px"
            @change="changeSupplier"
          >
            <el-option
              v-for="product in checkList"
              :key="product.id"
              :label="product.supplier_name"
              :value="product.supplier_id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="单价" prop="product_id"  v-if="showPrice">
            <el-input-number :min="0.00" :step="0.01" v-model="form.price" style="width: 360px"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
  import {getItem,updateStatus,updateItem} from '@/api/purchase/apply'
  import { getDicts } from '@/api/system/dict/data'
  import {getPage} from '@/api/purchase/log'
  import {getInUseSupplier} from '@/api/basic/supplier'
  import {updateItem as updateProductPrice,getProductSupplier,create as createProductPrice} from '@/api/basic/productPrice'
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
        title: '',
        open: false,
        form:{
          ids:[]
        },
        suppliers:[],
        showPrice :false,
        ProductSuppliers:[],
        checkList:[],
      }
    },
    mounted(){
      this.purchaseRequestId = sessionStorage.getItem('purchaseRequestId');
      getDicts('purchase_status').then(response => {
        this.orderStatusList = response.data
      });
      getInUseSupplier().then(response=>{
        this.suppliers = response.data.items;
      });

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
            this.purchaseOrder = {...response.data,statusName:statusName};
            this.product_id = response.data.product_id;
            this.getProductSuppliers();
            this.getLogPage();
          }
        });
      },
      backToList(){
        this.$router.push({path:'/purchase/before-pur'})
      },
      getProductSuppliers(){
        getProductSupplier({product_id :this.product_id}).then(resp=>{
          this.ProductSuppliers = resp.data.items;
        })
      },
      changeSupplier(){
        this.ProductSuppliers.forEach(supplier=>{
          if(supplier.supplier_id === this.form.supplier_id){
            this.form.price = supplier.product_price_withouttax
          }
        })
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
      handleChangeSupplier(){
        this.title = "选择供应商";
        this.open = true;
        if(this.purchaseOrder.supplier_ids){
          this.form.ids = this.purchaseOrder.supplier_ids.split(',');
        }
      },
      handleCheckSupplier(){
        this.title = "确认供应商";
        this.open = true;
        this.showPrice = true;
        let tempList =[];
        this.suppliers.forEach(supplier=>{
          let selectList = this.purchaseOrder.supplier_ids.split(',');
          selectList.forEach(id=>{
            if(supplier.supplier_id === id){
              tempList.push(supplier);
            }
          })
        })
        if(tempList.length>0){
          this.checkList = tempList;
        }else{
          this.checkList = this.suppliers;
        }
      },
      cancel(){
        this.title = "";
        this.form = {};
        this.open = false;
        this.showPrice = false;
      },
      submitForm(){
        //确认供应商
        if(this.showPrice){
          let updateData = {
            supplier_ids: this.form.supplier_id
          }
          updateItem(this.purchaseRequestId,updateData).then(response=>{
            if (response.code === 200) {
              updateStatus(this.purchaseRequestId,{requests_status:6}).then(resp=>{
                if (response.code === 200) {
                  let priceId ='';
                  this.ProductSuppliers.forEach(supplier=>{
                    if(supplier.supplier_id === this.form.supplier_id){
                      priceId = supplier.id;
                    }
                  })
                  if(priceId){
                    updateProductPrice(priceId,{product_price_withouttax:Number(this.form.price)}).then(r=>{
                      if (r.code === 200) {
                        this.msgSuccess('操作成功')
                        this.cancel()
                        this.getOrderInfo()
                      } else {
                        this.msgError(r.msg)
                      }
                    })
                  }else{
                    let createdData={
                      supplier_id:this.form.supplier_id,
                      product_id:this.product_id,
                      product_price_withouttax:Number(this.form.price)
                    }
                    createProductPrice(createdData).then(r=>{
                      if (r.code === 200) {
                        this.msgSuccess('操作成功')
                        this.cancel()
                        this.getList()
                      } else {
                        this.msgError(r.msg)
                      }
                    })
                  }
                } else {
                  this.msgError(resp.msg)
                }
              })
            } else {
              this.msgError(response.msg)
            }
          })
        }else{
          //修改供应商
        let updateData = {
          supplier_ids: this.form.ids.join(',')
        }
          updateItem(this.purchaseRequestId,updateData).then(response=>{
            if (response.code === 200) {
              this.msgSuccess('操作成功')
              this.cancel()
              this.getOrderInfo()
            } else {
              this.msgError(response.msg)
            }
          })
        }
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
