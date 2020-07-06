<template>
  <div class="app-container">
    <div class="detail-title">
      <h3>基本信息</h3>
    </div>
    <el-form :inline="true" label-width="100px" :label-position="right">
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
      <el-table-column label="税后价格" prop="price_unit" width="250" />
      <el-table-column label="税率" prop="tax_rate" width="100" />
      <el-table-column label="是否默认" prop="is_default" width="120" />
      <el-table-column label="备注" prop="remark" width="120" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="210">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleDetail(scope.row)"
          >设为默认</el-button>
          <el-button
            size="mini"
            type="text"
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
      @pagination="getListData"
    />

    <el-dialog :title="title" :visible.sync="open" width="500px">
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="供应商名称" prop="supplier_id">
          <el-input v-model="form.supplier_id" placeholder="请输入供应商名称" />
        </el-form-item>
        <el-form-item label="产品价格" prop="product_price_withouttax">
          <el-input v-model="form.product_price_withouttax" placeholder="请输入供应商地址" />
        </el-form-item>
        <el-form-item label="税后价格" prop="price_unit">
          <el-input v-model="form.price_unit" placeholder="请输入联系人姓名" />
        </el-form-item>
        <el-form-item label="税率" prop="tax_rate">
          <el-input v-model="form.tax_rate" placeholder="请输入联系人手机" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入联系人QQ" />
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
    export default {
        name: "detail",
      data(){
          return {
            product:{},
            productList:[],
            supplier:[],
            supplierPriceList:[],
            title:'',
            open:false,
            form: {},
            queryParams:{
              id:'',
              pageIndex: 1,
              pageSize: 10
            },
            total:0,
          }
      },
      created() {

      },
      beforeCreate() {
          const {productId} = this.$route.query;
          if(productId){
            getProduct({id:productId}).then(result=>{
              this.product = result.data
            });
            this.queryParams.id = productId;
            this.getSupplierPricePage();

          }
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
          })
        }
      },
    }
</script>

<style scoped>

</style>
