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
      <h3>商品明细</h3>
    </div>
    <el-row :gutter="10" class="mb8" style="margin-top: 20px;margin-bottom: 20px">
      <el-col :span="1.5">
        <el-button v-if="purchaseControlOrder.totalpruchase_quantity>purchaseControlOrder.storaged_total_quantity"
          type="primary"
          icon="el-icon-arrow-right"
          size="mini"
          @click="handleIn"
        >入库</el-button>
      </el-col>
      <!--<el-col :span="1.5">-->
        <!--<el-button v-if="purchaseControlOrder.totalpruchase_quantity>purchaseControlOrder.storaged_total_quantity"-->
          <!--type="primary"-->
          <!--icon="el-icon-d-arrow-right"-->
          <!--size="mini"-->
          <!--@click="handleAllIn"-->
        <!--&gt;全部入库</el-button>-->
      <!--</el-col>-->
    </el-row>
    <el-table v-loading="loading" :data="logList">
      <el-table-column label="类型名称" prop="product_type" width="150" />
      <el-table-column label="商品名称" prop="product_name" width="150" />
      <el-table-column label="采购数量" prop="pruchase_quantity" width="150" />
      <el-table-column label="单价" prop="unitprice_without_tax" width="250" />
      <el-table-column label="总金额" prop="amount_without_tax"/>
      <el-table-column label="已入库数量" prop="storaged_quantity" width="150" />
      <el-table-column label="已入库金额" prop="storaged_amount_without_tax"/>
      <el-table-column label="规格" prop="product_specifications" width="150"/>
      <el-table-column label="单位" prop="product_units"  width="150"/>
      <el-table-column label="备注" prop="remark"/>
    </el-table>
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageIndex"
      :limit.sync="queryParams.pageSize"
      @pagination="getProductPage"
    />

    <div class="detail-title" style="margin-top: 20px;">
      <h3>入库明细</h3>
    </div>

    <el-table v-loading="loading" :data="inLogList">
      <el-table-column label="入库时间" prop="product_type">
        <template slot-scope="scope">
          <span>{{parseTime(scope.row.created_at)}}</span>
        </template>
      </el-table-column>
      <el-table-column label="类型名称" prop="product_type"/>
      <el-table-column label="商品名称" prop="product_name"/>
      <el-table-column label="入库数量" prop="storaged_quantity"/>
    </el-table>
    <pagination
      v-show="inTotal>0"
      :total="inTotal"
      :page.sync="inQueryParams.pageIndex"
      :limit.sync="inQueryParams.pageSize"
      @pagination="getInPage"
    />

    <el-row :gutter="10" class="mb8" style="margin-top: 20px">
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

    <el-dialog title="入库" :visible.sync="open" width="800px" :close-on-click-modal="false">
      <el-form>
        <el-form-item label="库位" width="150" >
          <el-select
            v-model="warehouse_id"
            placeholder="库位"
            clearable
            style="width: 360px"
          >
            <el-option
              v-for="dict in locationList"
              :key="dict.id"
              :label="dict.location_name"
              :value="dict.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <el-table :data="productList">
        <el-table-column label="类型名称" prop="product_type" width="150" />
        <el-table-column label="商品名称" prop="product_name" width="150" />
        <el-table-column label="采购数量" prop="pruchase_quantity" width="100" />
        <el-table-column label="单价" prop="unitprice_without_tax" width="100" />
        <el-table-column label="总金额" prop="amount_without_tax" width="100"/>
        <el-table-column label="已入库数量" prop="storaged_quantity" width="100" />
        <el-table-column label="入库数量" prop="inQty" width="100" >
          <template slot-scope="scope">
            <el-input-number v-model="scope.row.inQty" controls-position="right" :min="0" :step="1" :max="scope.row.pruchase_quantity" style="width: 100px" @change="changeInQty(scope.row)"/>
          </template>
        </el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
  import { getPurchaseControlItem ,getPurchaseControlProduct,uploadContract,updateStatus,wareHouse,wareHouseAll,getPurchaseControlProductDetail} from '@/api/purchase/purchaseControl'
  import {downLoadZip} from "@/utils/zipdownload";
  import {getInLogPage} from '@/api/purchase/log';
  import {getAll} from '@/api/basic/location';
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
        open:false,
        form:{},
        productList:[],
        inList:[],
        inQueryParams:{
          purchase_control_id :'',
          pageIndex: 1,
          pageSize: 10
        },
        inTotal:0,
        inLogList:[],
        locationList:[],
        warehouse_id:'',
      }
    },
    mounted(){
      this.purchaseControlId = sessionStorage.getItem('purchaseControlId');
      this.queryParams.purchase_control_id = this.purchaseControlId;
      this.inQueryParams.purchase_control_id = this.purchaseControlId;
      this.getOrderInfo();
      this.getProductPage();
      this.getInPage();
      this.getAllLocation();
    },
    methods:{
      getOrderInfo(){
        getPurchaseControlItem({purchase_control_id:this.purchaseControlId}).then(response=>{
          this.purchaseControlOrder = response.data;
        });
      },
      backToList(){
        this.$router.push({path:'/inventory/ininventory'})
      },
      getAllLocation(){
        getAll().then(response=>{
          this.locationList = response.data.items;
        })
      },
      getStatusName(statusId){
        if(statusId ===1){
          return "新建"
        }
        if(statusId ===2){
          return "确认采购"
        }
        if(statusId ===3){
          return "已入库"
        }
        if(statusId ===4){
          return "部分入库"
        }
        if(statusId ===5){
          return "待付款"
        }
        if(statusId ===6){
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
      getInPage(){
        getInLogPage(this.inQueryParams).then(response=>{
          if(response.code===200){
            this.inLogList = response.data.items;
            this.inTotal = response.data.total;
          }
        })
      },
      handleAllIn(){
        this.$confirm('是否确认全部入库?', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(()=>{
          wareHouseAll({purchase_control_id:this.purchaseControlId}).then(response=>{
            if (response.code === 200) {
              this.msgSuccess('操作成功');
              this.getOrderInfo();
              this.getProductPage();
            } else {
              this.msgError(response.msg)
            }
          })
        })
      },
      handleIn(){
        this.open = true;
        let queryData = {
          purchase_control_id:this.purchaseControlId
        }
        getPurchaseControlProductDetail(queryData).then(resp=>{
          if(resp.code===200){
            this.productList = resp.data.items;
          }else{
            this.msgError(resp.msg)
          }
        })
      },
      cancel(){
        this.open = false;
        this.productList =[];
        this.inList =[];
      },
      changeInQty(row){
        let tempList=[];
        this.inList.forEach(item=>{
          if(item.id !== row.id){
            tempList.push({...item})
          }
        });
        tempList.push({id:row.id,quantity:row.inQty});
        this.inList = tempList;
      },
      submitForm(){
        if(!this.warehouse_id){
          this.msgError("请选择库位");
          return false;
        }
        let submitData = {
          purchase_control_id : this.purchaseControlId,
          warehouse_detail:this.inList,
          warehouse_id:this.warehouse_id,
        }
        wareHouse(submitData).then(resp=>{
          this.cancel();
          if(resp.code===200){
            this.msgSuccess("入库成功");
            this.getOrderInfo();
            this.getProductPage();
            this.getInPage();
          }else{
            this.msgError(resp.msg)
          }
        })
      },
    }
  }
</script>

<style scoped>

</style>
