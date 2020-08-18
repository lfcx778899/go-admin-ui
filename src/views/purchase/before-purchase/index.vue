<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="100px">
      <el-form-item label="状态">
        <el-select
          v-model="queryParams.requests_status"
          placeholder="状态"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in orderStatusList"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="归属部门" prop="deptId">
        <treeselect
          v-model="queryParams.dept_id"
          :options="deptOptions"
          :normalizer="normalizer"
          placeholder="请选择归属部门"
          style="width: 240px"
        />
      </el-form-item>
      <el-form-item label="产品类别">
        <el-select
          v-model="queryParams.product_type"
          placeholder="产品类别"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in productTypeList"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictLabel"
          />
        </el-select>
      </el-form-item>
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

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-check"
          size="small"
          @click="handleQuotation"
          :disabled="multiple"
        >创建询价单
        </el-button>
      </el-col>
      <!--<el-col :span="1.5">-->
        <!--<el-button-->
          <!--type="success"-->
          <!--icon="el-icon-d-arrow-right"-->
          <!--size="small"-->
          <!--@click="handleAllCreate"-->
        <!--&gt;全部询价-->
        <!--</el-button>-->
      <!--</el-col>-->
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-close"
          size="small"
          :disabled="multiple"
          @click="handleCreatePurchaseControl"
        >生成采购单
        </el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="purchaserequestsList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>

      <el-table-column label="申请时间" prop="created_at" width="200">
        <template slot-scope="scope">
          <span>{{parseTime(scope.row.created_at)}}</span>
        </template>
      </el-table-column>
      <el-table-column label="部门名称" prop="dept_name" width="120"/>
      <el-table-column label="产品类别" prop="product_type"  width="120"/>
      <el-table-column label="产品名称" prop="product_name"  width="200"/>
      <el-table-column label="申请数量" prop="requests_quantity" width="100"/>
      <el-table-column label="供应商" prop="supplier_names" width="200"/>
      <el-table-column label="状态" prop="requests_status" width="120">
        <template slot-scope="scope">
          <span>{{scope.row.statusName}}</span>
        </template>
      </el-table-column>
      <el-table-column label="库存数量" prop="inventory_quantity" width="120"/>
      <el-table-column label="规格" prop="product_specifications" width="150"/>
      <el-table-column label="单位" prop="product_units"  width="150"/>
      <el-table-column label="价格" prop="product_price_withouttax"  width="150"/>
      <el-table-column label="备注" prop="remark"/>
      <el-table-column label="操作" align="left" class-name="small-padding fixed-width" width="400">
        <template slot-scope="scope">
          <el-button v-if="scope.row.requests_status===3"
                     size="small"
                     type="warning"
                     icon="el-icon-close"
                     @click="handleSingleReject(scope.row)"
          >取消采购
          </el-button>
          <el-button v-if="scope.row.requests_status===3 || scope.row.requests_status===5"
                     size="small"
                     type="primary"
                     icon="el-icon-check"
                     @click="handleOneSupplier(scope.row)"
          >确认
          </el-button>
          <!--<el-button v-if="scope.row.requests_status===3"-->
                     <!--size="small"-->
                     <!--type="primary"-->
                     <!--icon="el-icon-check"-->
                     <!--@click="handleCheckSupplier(scope.row)"-->
          <!--&gt;确认-->
          <!--</el-button>-->
          <el-button v-if="scope.row.requests_status===3"
                     size="small"
                     type="primary"
                     icon="el-icon-s-data"
                     @click="handleMoreSupplier(scope.row)"
          >比价
          </el-button>
          <el-button
            size="small"
            type="success"
            icon="el-icon-view"
            @click="handleDetail(scope.row)"
          >详情</el-button>
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
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="供应商" v-if="!showPrice">
          <el-select
            v-model="form.ids"
            placeholder="请选择供应商"
            clearable
            filterable
            multiple
            size="small"
            style="width: 360px"
          >
            <el-option
              v-for="product in inUseSupplier"
              :key="product.id"
              :label="product.supplier_name"
              :value="product.supplier_id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="供应商" prop="supplier_id" v-if="showPrice">
          <el-select
            v-model="form.supplier_id"
            placeholder="请选择供应商"
            clearable
            filterable
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
        <el-form-item label="单价" prop="price"  v-if="showPrice">
          <el-input-number :min="0.00" :step="0.01" v-model="form.price" style="width: 360px"/>
        </el-form-item>
        <el-form-item label="价格单位" prop="price_unit" v-if="showPrice">
          <el-select
            v-model="form.price_unit"
            clearable
            style="width: 360px"
          >
            <el-option
              v-for="dict in moneyTypeList"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictLabel"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="税率" prop="tax_rate" v-if="showPrice">
          <el-input-number v-model="form.tax_rate" :min="0" :step="1" style="width: 340px"/> %
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
  import { getDeptList } from '@/api/system/dept'
  import { treeselect } from '@/api/system/dept'
  import Treeselect from '@riophae/vue-treeselect'
  import '@riophae/vue-treeselect/dist/vue-treeselect.css'
  import { getDicts } from '@/api/system/dict/data'
  import { getAll } from '@/api/basic/product'
  import { getApprovals, create, deleteItem, updateItem, updateStatus ,confirmSupplier} from '@/api/purchase/apply'
  import { getInUseSupplier } from '@/api/basic/supplier'
  import { createQuotationControl, createAll } from '@/api/purchase/quotationControl'
  import { createPurchaseControl } from '@/api/purchase/purchaseControl'
  import {updateItem as updateProductPrice,getProductSupplier,create as createProductPrice} from '@/api/basic/productPrice'
  export default {
    name: 'Index',
    components: { Treeselect },
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
        productList: [],
        selectProductList: [],
        purchaserequestsList: [],
        productTypeList: [],
        // 查询参数
        queryParams: {
          requests_statuss: '3,5,6',
          pageIndex: 1,
          pageSize: 10
        },
        statusList: [],
        orderStatusList: [
          {dictLabel: "已审批", dictValue: "3"},
          {dictLabel: "询价中", dictValue: "5"},
          {dictLabel: "已确认", dictValue: "6"}
        ],
        rules: {
          price:[{ required: true, message: '单价不能为空', trigger: 'blur' }],
          price_unit:[{ required: true, message: '价格单位不能为空', trigger: 'blur' }],
          tax_rate:[{ required: true, message: '税率不能为空', trigger: 'blur' }],
          supplier_id:[{ required: true, message: '税率不能为空', trigger: 'blur' }],
        },
        selectRows: [],
        inUseSupplier: [],
        deptOptions: undefined,
        showPrice :false,
        ProductSuppliers:[],
        checkList:[],
        moneyTypeList:[],
        form:{
          ids:[]
        },
      }
    },
    created() {
      this.getTreeselect()
      getDicts('goods_type').then(response => {
        this.productTypeList = response.data
      })
      getAll().then(response => {
        this.productList = response.data.items
        this.selectProductList = this.productList
      })
      // getDicts('purchase_status').then(response => {
      //   this.orderStatusList = response.data
      // })
      getInUseSupplier().then(resp => {
        this.inUseSupplier = resp.data.items
      })
      getDicts('money_type').then(response => {
        this.moneyTypeList = response.data
      })
      this.getList()
    },
    methods: {
      getTreeselect() {
        treeselect().then(response => {
          this.deptOptions = response.data
        })
      },
      changeProductName() {
        this.selectProductList = this.productList.filter(item => {
          return item.product_type === this.queryParams.product_type
        })
        this.queryParams.product_name = undefined
      },
      handleSelectionChange(selection) {
        this.selectRows = selection
        this.ids = selection.map(item => item.id)
        this.single = selection.length !== 1
        this.multiple = !selection.length
      },
      changeSupplier(){
        let price =0,price_unit='',tax_rate=0;
        this.ProductSuppliers.forEach(supplier=>{
          if(supplier.supplier_id === this.form.supplier_id){
            price = supplier.product_price_withouttax;
            price_unit = supplier.price_unit;
            tax_rate = supplier.tax_rate;
          }
        })
        this.form.price = price;
        this.form.price_unit = price_unit;
        this.form.tax_rate = tax_rate;
      },
      cancel(){
        this.title = "";
        this.open = false;
        this.form = {ids:[]};
        this.showPrice = false;
        this.purchaseRequestId='';
      },
      handleOneSupplier(row){
        this.title = "确认供应商";
        this.open = true;
        this.showPrice = true;
        this.purchaseRequestId = row.purchase_request_id;
        this.product_id = row.product_id;
        getProductSupplier({product_id :this.product_id}).then(resp=>{
          this.ProductSuppliers = resp.data.items;
        })
        let tempList =[];
        this.inUseSupplier.forEach(supplier=>{
          let selectList = row.supplier_ids.split(',');
          selectList.forEach(id=>{
            if(supplier.supplier_id === id){
              tempList.push(supplier);
            }
          })
        })
        if(tempList.length>0){
          this.checkList = tempList;
        }else{
          this.checkList = this.inUseSupplier;
        }
      },
      handleMoreSupplier(row){
        this.title = "选择供应商";
        this.open = true;
        this.purchaseRequestId = row.id;
        if(row.supplier_ids){
          this.form.ids = row.supplier_ids.split(',');
        }
      },
      submitForm(){
        //确认供应商
        if(this.showPrice){
          if(!this.form.supplier_id){
            this.msgError('没有选择供应商')
            return false;
          }
          if(Number(this.form.price)<=0){
            this.msgError('价格不符合要求')
            return false;
          }
          let confirmData = {
            purchase_request_id : this.purchaseRequestId,
            supplier_id:this.form.supplier_id,
            product_price_withouttax:Number(this.form.price),
            price_unit: this.form.price_unit,
          tax_rate : this.form.tax_rate,
          }
          confirmSupplier(confirmData).then(resp=>{
            if (resp.code === 200) {
              this.msgSuccess('操作成功')
              this.cancel()
              this.getList()
            } else {
              this.msgError(resp.msg)
            }
          })
          //
          //
          // let updateData = {
          //   supplier_ids: this.form.supplier_id
          // }
          // updateItem(this.purchaseRequestId,updateData).then(response=>{
          //   if (response.code === 200) {
          //     updateStatus(this.purchaseRequestId,{requests_status:6}).then(resp=>{
          //       if (response.code === 200) {
          //         let priceId ='';
          //         this.ProductSuppliers.forEach(supplier=>{
          //           if(supplier.supplier_id === this.form.supplier_id){
          //             priceId = supplier.id;
          //           }
          //         })
          //         if(priceId){
          //           updateProductPrice(priceId,{product_price_withouttax:Number(this.form.price)}).then(r=>{
          //             if (r.code === 200) {
          //               this.msgSuccess('操作成功')
          //               this.cancel()
          //               this.getList()
          //             } else {
          //               this.msgError(r.msg)
          //             }
          //           })
          //         }else{
          //           let createdData={
          //             supplier_id:this.form.supplier_id,
          //             product_id:this.product_id,
          //             product_price_withouttax:Number(this.form.price)
          //           }
          //           createProductPrice(createdData).then(r=>{
          //             if (r.code === 200) {
          //               this.msgSuccess('操作成功')
          //               this.cancel()
          //               this.getList()
          //             } else {
          //               this.msgError(r.msg)
          //             }
          //           })
          //         }
          //
          //       } else {
          //         this.msgError(resp.msg)
          //       }
          //     })
          //   } else {
          //     this.msgError(response.msg)
          //   }
          // })
        }else{
          //修改供应商
          let updateData = {
            supplier_ids: this.form.ids.join(',')
          }
          updateItem(this.purchaseRequestId,updateData).then(response=>{
            if (response.code === 200) {
              this.msgSuccess('操作成功')
              this.cancel()
              this.getList()
            } else {
              this.msgError(response.msg)
            }
          })
        }
      },
      normalizer(node) {
        if (node.children && !node.children.length) {
          delete node.children
        }
        return {
          id: node.deptId,
          label: node.deptName,
          children: node.children
        }
      },
      getList() {
        this.loading = true
        if(this.queryParams.requests_status){
          this.queryParams.requests_statuss=this.queryParams.requests_status;
        }else{
          this.queryParams.requests_statuss='3,5,6';
        }
        getApprovals(this.queryParams).then(response => {
            let tempList = []
            if (response.data && response.data.items && response.data.items.length > 0) {
              response.data.items.forEach(item => {
                this.orderStatusList.forEach(si => {
                  if (si.dictValue === String(item.requests_status)) {
                    tempList.push({ ...item, statusName: si.dictLabel })
                  }
                })
              })
            }
            this.purchaserequestsList = tempList
            this.total = response.data.total
            this.loading = false
          }
        )
      },
      handleQuery() {
        this.queryParams.pageIndex = 1
        this.getList()
      },
      resetQuery() {
        this.queryParams = {
          requests_statuss: '3,5,6',
          pageIndex: 1,
          pageSize: 10
        }
        this.resetForm('queryForm')
        this.handleQuery()
      },
      handleReject() {
        let ids = []
        this.selectRows.forEach(item => {
          if (item.requests_status === 2) {
            ids.push(item.id)
          }
        })
        if (ids.length > 0) {
          this.$confirm('是否确认取消' + ids.length + '条采购申请?', '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            let idStr = ids.join(',')
            updateStatus(idStr, { requests_status: 4 }).then(response => {
              if (response.code === 200) {
                this.msgSuccess('操作成功')
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          })
        } else {
          this.msgInfo('没有选择可以操作的数据')
        }
      },
      handleCheckSupplier(row) {
        let supplierIds = row.supplier_ids
        if (supplierIds.indexOf(',') > -1) {
          this.msgError('可选供应商超过一个，不能进行确认')
          return false
        }
        updateStatus(row.id, { requests_status: 6 }).then(response => {
          if (response.code === 200) {
            this.msgSuccess('操作成功')
            this.open = false
            this.getList()
          } else {
            this.msgError(response.msg)
          }
        })
      },
      handleSingleReject(row) {
        this.$confirm('是否确认取消采购 ?', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          updateStatus(row.id, { requests_status: 4 }).then(response => {
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
      handleDetail(row) {
        sessionStorage.setItem('purchaseRequestId', row.id)
        this.$router.push({ path: '/purchase/before-pur/detail' })
      },
      handleAllCreate() {
        this.$confirm('是否确认全部询价 ?', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          const createData = {
            remark: ''
          }
          createAll(createData).then(response => {
            if (response.code === 200) {
              this.msgSuccess('操作成功')
              this.getList()
            } else {
              this.msgError(response.msg)
            }
          })
        })
      },
      handleCreatePurchaseControl() {
        let ids = []
        this.selectRows.forEach(item => {
          if (item.requests_status === 6) {
            ids.push(item.purchase_request_id)
          }
        })
        if (ids.length > 0) {
          this.$confirm('是否确认生成采购单?', '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            createPurchaseControl({ purchase_request_ids: ids }).then(response => {
              if (response.code === 200) {
                this.msgSuccess('操作成功')
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          })
        } else {
          this.msgInfo('没有选择可以操作的数据')
        }
      },
      handleQuotation() {
        let ids = []
        this.selectRows.forEach(item => {
          if (item.requests_status === 3) {
            ids.push(item.purchase_request_id)
          }
        })
        if (ids.length > 0) {
          this.$confirm('是否确认生成询价单?', '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            createQuotationControl({ purchase_request_ids: ids }).then(response => {
              if (response.code === 200) {
                this.msgSuccess('操作成功')
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          })
        } else {
          this.msgInfo('没有选择可以操作的数据')
        }
      }
    }
  }
</script>

<style scoped>

</style>
