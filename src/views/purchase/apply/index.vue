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

      <el-form-item label="产品类别">
        <el-select
          v-model="queryParams.product_type"
          placeholder="产品类别"
          clearable
          size="small"
          style="width: 240px"
          @change="changeProductName"
        >
          <el-option
            v-for="dict in productTypeList"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictLabel"
          />
        </el-select>
      </el-form-item>
        <el-form-item label="产品名称">
          <el-select
            v-model="queryParams.product_name"
            placeholder="产品名称"
            clearable
            filterable
            size="small"
            style="width: 240px"
          >
            <el-option
              v-for="product in selectProductList"
              :key="product.id"
              :label="product.product_name"
              :value="product.product_name"
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
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="multiple"
          @click="handleApplyOrder"
        >提交</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="purchaserequestsList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />

      <el-table-column label="申请时间" prop="created_at" width="200" >
        <template slot-scope="scope">
          <span>{{parseTime(scope.row.created_at)}}</span>
        </template>
      </el-table-column>
      <el-table-column label="申请人" prop="create_by_name" width="120" />
      <el-table-column label="状态" prop="requests_status" width="120">
        <template slot-scope="scope">
          <span>{{scope.row.statusName}}</span>
        </template>
      </el-table-column>
      <el-table-column label="产品类别" prop="product_type" width="250"/>
      <el-table-column label="产品名称" prop="product_name"  width="250"/>
      <el-table-column label="申请数量" prop="requests_quantity" width="100"/>
      <el-table-column label="规格" prop="product_specifications" width="150"/>
      <el-table-column label="单位" prop="product_units"  width="150"/>
      <el-table-column label="备注" prop="remark"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="360">
        <template slot-scope="scope">
          <el-button v-if="scope.row.requests_status===1"
            size="small"
            type="primary"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            size="small"
            type="success"
            icon="el-icon-view"
            @click="handleDetail(scope.row)"
          >详情</el-button>
          <el-button v-if="scope.row.requests_status===1"
            size="small"
            type="warning"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >删除</el-button>
          <el-button v-if="scope.row.requests_status===1"
            size="small"
            type="success"
            icon="el-icon-upload"
            @click="handleApplyItem(scope.row)"
          >提交</el-button>
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

    <!-- 添加或修改对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" :close-on-click-modal="false">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="产品名称" prop="product_id"  >
          <el-select
            v-model="form.product_id"
            placeholder="请选择产品"
            clearable
            filterable
            size="small"
            style="width: 360px"
          >
            <el-option
              v-for="product in productList"
              :key="product.id"
              :label="product.product_name"
              :value="product.product_id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="申请数量" prop="requests_quantity"  >
          <el-input-number :min="0" :step="1" v-model="form.requests_quantity" placeholder="采购申请数量"  style="width: 360px"/>
        </el-form-item>
        <el-form-item label="备注" prop="remark"  >
          <el-input v-model="form.remark" placeholder="请填写备注"  style="width: 360px"/>
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
  import {getpage,create,deleteItem,updateItem,updateStatus} from '@/api/purchase/apply';
  import { getDicts } from '@/api/system/dict/data';
  import {getAll} from '@/api/basic/product'
export default {
  name: 'Index',
  data() {
    const checkQuantity = (rule, value, callback) => {
      setTimeout(() => {
        if (!Number.isInteger(value)) {
          callback(new Error('请输入数字值'));
        } else {
          if (value <= 0) {
            callback(new Error('申请数量不能小于或等于0'));
          } else {
            callback();
          }
        }
      }, 1000);
    };
    return {
      // 遮罩层
      loading: true,
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
      purchaserequestsList:[],
      productTypeList:[],
      // 查询参数
      queryParams: {
        requests_status:undefined,
        product_name:'',
        product_type:'',
        pageIndex: 1,
        pageSize: 10,
      },
      statusList:[
        {dictLabel:'新建',dictValue:'0'},
        {dictLabel:'已提交',dictValue:'1'},
      ],
      orderStatusList:[],

      // 表单参数
      form: {
      },
      // 表单校验
      rules: {
        product_id:[{ required: true, message: '产品名称不能为空', trigger: 'blur' }],
        requests_quantity:[{validator: checkQuantity, trigger: 'blur'}]
      },
      selectRows:[],
    }
  },
  created() {
    getDicts('goods_type').then(response => {
      this.productTypeList = response.data
    })
    getDicts('purchase_status').then(response => {
      this.orderStatusList = response.data
    })
    getAll().then(response=>{
      this.productList = response.data.items;
      this.selectProductList = this.productList;
    })
    this.getList()
  },
  methods: {
    /** 查询参数列表 */
    getList() {
      this.loading = true
      getpage(this.queryParams).then(response => {
        let tempList =[];
        if(response.data&&response.data.items&&response.data.items.length>0){
          response.data.items.forEach(item=>{
            this.orderStatusList.forEach(si=>{
              if(si.dictValue===String(item.requests_status)){
                tempList.push({...item,statusName:si.dictLabel});
              }
            })
          })
        }
        this.purchaserequestsList = tempList;
        this.total = response.data.total;
        this.loading = false
        }
      )
    },
    statusName(statusId){
      console.log(statusId);
      return this.orderStatusList.forEach(item=>{
        if(item.dictValue===String(statusId)){
          console.log(item.dictLabel)
          return item.dictLabel
        }
      })
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.form = {}
    },
    changeProductName(){
      this.selectProductList = this.productList.filter(item=>{
        return item.product_type ===this.queryParams.product_type;
      })
      this.queryParams.product_name = undefined;
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        purchaseRequestId: undefined,
        productId: undefined,
        requestsQuantity: undefined,
        requestsStatus: undefined,
        supplierIds: undefined,
        remark: undefined,
      }
      this.resetForm('form')
    },


    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageIndex = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.queryParams = {pageIndex: 1,pageSize: 10,};
      this.resetForm('queryForm')
      this.handleQuery()
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '新建采购申请'
      this.isEdit = false
    },
    handleApplyOrder(){
      let ids =[];
      this.selectRows.forEach(item=>{
        if(item.requests_status === 1){
          ids.push(item.id)
        }
      })
      if(ids.length>0){
        this.$confirm('是否确认提交' + ids.length + '条申请?', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let idStr = ids.join(',');
          updateStatus(idStr, { requests_status: 2 }).then(response => {
            if (response.code === 200) {
              this.msgSuccess('操作成功')
              this.open = false
              this.getList()
            } else {
              this.msgError(response.msg)
            }
          })
        })
      }else{
        this.msgInfo('没有选择可以操作的数据')
      }
    },
    handleApplyItem(row){
      this.$confirm('是否确认提交申请?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(()=>{
        updateStatus(row.id,{requests_status:2}).then(response=>{
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
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.selectRows = selection;
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids
      this.form = row;
      this.open = true
      this.title = '修改采购申请'
      this.isEdit = true
    },
    handleDetail(row){
      sessionStorage.setItem("purchaseRequestId",row.id);
      this.$router.push({path:'/purchase/apply/detail'})
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.id !== undefined) {
            updateItem(this.form.id,{...this.form,product_id:String(this.form.product_id)}).then(response => {
              if (response.code === 200) {
                this.msgSuccess('修改成功')
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            create({...this.form,product_id:String(this.form.product_id)}).then(response => {
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
    /** 删除按钮操作 */
    handleDelete(row) {
      const Ids = row.id || this.ids
      this.$confirm('是否确认删除?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(()=> {
        deleteItem(Ids).then(resp=>{
          if (resp.code === 200) {
            this.msgSuccess('删除成功')
            this.getList()
          } else {
            this.msgError(resp.msg)
          }
        })
      }).then(() => {
        this.getList()
        this.msgSuccess('删除成功')
      }).catch(function() {})
    }
  }
}
</script>

<style scoped>

</style>
