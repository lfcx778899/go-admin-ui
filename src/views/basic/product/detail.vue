<template>
  <div class="app-container">
    <div class="detail-title">
      <h3>基本信息</h3>
    </div>
    <el-form :inline="true" label-width="100px" label-position="right">
      <el-row>
        <el-col :span="6">
          <el-form-item label="产品编码">
            <span>{{product.product_id}}</span>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="产品类别" :span="6">
            <span>{{product.product_type}}</span>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="产品名称" :span="6">
            <span>{{product.product_name}}</span>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="英文名称" :span="6">
            <span>{{product.product_english_name}}</span>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
      <el-col :span="6">
        <el-form-item label="CASNO号">
          <span>{{product.product_casno}}</span>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="货号" :span="6">
          <span>{{product.product_item_number}}</span>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="品牌" :span="6">
          <span>{{product.product_brand_name}}</span>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="产品规格" :span="6">
          <span>{{product.product_specifications}}</span>
        </el-form-item>
      </el-col>
    </el-row>
      <el-row>
        <el-col :span="6">
          <el-form-item label="产品单位">
            <span>{{product.product_units}}</span>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="条形码" :span="6">
            <span>{{product.product_barcode}}</span>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="包装规格" :span="6">
            <span>{{product.package_size}}</span>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="备注" :span="6">
            <span>{{product.remark}}</span>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div class="detail-title">
      <h3>供应商明细</h3>
    </div>
    <div style="margin: 20px;">
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button
            type="primary"
            icon="el-icon-plus"
            size="mini"
            @click="handleAdd"
          >新增</el-button>
        </el-col>
      </el-row>
    </div>
    <el-table v-loading="loading" :data="supplierPriceList">
      <el-table-column label="供应商名称" prop="supplier_id" width="300" />
      <el-table-column label="产品价格" prop="product_price_withouttax" width="150" />
      <el-table-column label="价格单位" prop="price_unit" width="250" />
      <el-table-column label="税率" prop="tax_rate" width="100" />
      <el-table-column label="是否默认" prop="is_default" width="120" >
        <template slot-scope="scope">
          <span>{{scope.row.is_default===0?"否":"是"}}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" prop="remark"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="300">
        <template slot-scope="scope">
          <el-button
            size="small"
            type="primary"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button v-if="scope.row.is_default===0"
            size="small"
            type="success"
            icon="el-icon-s-home"
            @click="handleDefault(scope.row)"
          >设为默认</el-button>
          <el-button
            size="small"
            type="warning"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageIndex"
      :limit.sync="queryParams.pageSize"
      @pagination="getSupplierPricePage"
    />

    <el-dialog :title="title" :visible.sync="open" width="500px">
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="供应商名称" prop="supplier_id">
          <el-select
            v-model="form.supplier_id"
            clearable
            style="width: 300px"
          >
            <el-option
              v-for="dict in inUseSupplier"
              :key="dict.id"
              :label="dict.supplier_name"
              :value="dict.supplier_name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="产品价格" prop="product_price_withouttax">
          <el-input-number v-model="form.product_price_withouttax" :min="0.00" :step="0.01" style="width: 300px"/>
        </el-form-item>
        <el-form-item label="价格单位" prop="price_unit">
          <el-select
            v-model="form.price_unit"
            clearable
            style="width: 300px"
          >
            <el-option
              v-for="dict in moneyTypeList"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictLabel"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="税率" prop="tax_rate">
          <el-input-number v-model="form.tax_rate" :min="0.00" :step="0.01" style="width: 300px"/>
        </el-form-item>
        <el-form-item label="默认" prop="is_default">
          <el-radio-group v-model="form.is_default">
            <el-radio :label="1" >是</el-radio>
            <el-radio :label="0" >否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注" style="width: 300px"/>
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
  import {getProduct} from '@/api/basic/product';
  import {getPricePage,create,deleteItem,updateItem,changeStatus} from '@/api/basic/productPrice';
  import { getDicts } from '@/api/system/dict/data'
  import {getInUseSupplier} from '@/api/basic/supplier'
    export default {
        name: "detail",
      data(){
          return {
            productId:'',
            product:{},
            productList:[],
            supplier:[],
            supplierPriceList:[],
            title:'',
            open:false,
            loading:false,
            rules:{
              supplier_id: [{ required: true, message: '供应商名称不能为空', trigger: 'blur' }],
              product_price_withouttax: [{ required: true, message: '价格不能为空', trigger: 'blur' }],
              price_unit: [{ required: true, message: '价格单位不能为空', trigger: 'blur' }],
              tax_rate: [{ required: true, message: '税率不能为空', trigger: 'blur' }],
              is_default: [{ required: true, message: '是否默认不能为空', trigger: 'blur' }],
            },
            form: {},
            queryParams:{
              product_id:'',
              pageIndex: 1,
              pageSize: 10
            },
            total:0,
            inUseSupplier:[],
            moneyTypeList:[],

          }
      },
      mounted(){
        let productId = sessionStorage.getItem('productId');
        this.productId = productId;
        getProduct({id:productId}).then(response=>{
            this.product = response.data
          this.queryParams.product_id = response.data.product_id;
          this.getSupplierPricePage();
        });

        getDicts('money_type').then(response => {
          this.moneyTypeList = response.data
        })
        getInUseSupplier().then(resp=>{
          this.inUseSupplier = resp.data.items;
        })
      },
      methods:{
        handleAdd(){
          this.reset()
          this.open = true
        },
        reset(){
          this.form = {
            id: undefined,
            supplier_name: undefined,
            supplierName: undefined,
            supplierAdress: undefined,
            contactName: undefined,
            contactPhone: undefined,
            contactQq: undefined,
            contactEmail: undefined,
            supplierStatus: undefined,
            remark: undefined
          }
          this.resetForm('form')
        },
        getSupplierPricePage(){
          getPricePage({...this.queryParams}).then(response=>{
            this.supplierPriceList = response.data.items;
            this.total = response.data.total;
          })
        },
        getList(){
          this.getSupplierPricePage();
        },
        submitForm(){
          this.$refs['form'].validate(valid => {
            if (valid) {
              if (this.form.id !== undefined) {
                updateItem(this.form.id,{...this.form,product_id:String(this.product.product_id),is_default:Number(this.form.is_default)}).then(response => {
                  if (response.code === 200) {
                    this.msgSuccess('修改成功')
                    this.open = false
                    this.getList()
                  } else {
                    this.msgError(response.msg)
                  }
                })
              } else {
                create({...this.form,product_id:String(this.product.product_id),is_default:Number(this.form.is_default) }).then(response => {
                  if (response.code === 200) {
                    this.msgSuccess('新增成功')
                    this.open = false
                    this.getList()
                  } else {
                    this.msgError(response.msg)
                  }
                })
              }
            }
          })
        },
        cancel(){
          this.open = false
          this.reset()
        },
        handleUpdate(row){
          this.reset()
          this.form = row;
          this.title = '编辑商品'
          this.open = true
          this.isEdit = true
        },
        handleDelete(row) {
          this.$confirm('是否确认删除?', '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(()=> {
            deleteItem(row.id).then(resp=>{
              if (resp.code === 200) {
                this.msgSuccess('删除成功')
                this.getList()
              } else {
                this.msgError(resp.msg)
              }
            })

          })
        },
        handleDefault(row){
          this.$confirm('是否确认设置为默认供应商?', '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(()=> {
            changeStatus(row.id,{is_default:1}).then(resp=>{
              if (resp.code === 200) {
                this.msgSuccess('操作成功')
                this.getList()
              } else {
                this.msgError(resp.msg)
              }
            })

          })
        }
      },
    }
</script>

<style scoped>

</style>
