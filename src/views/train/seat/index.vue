<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="列车ID" prop="trainId">
        <el-input
          v-model="queryParams.trainId"
          placeholder="请输入列车ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="车厢号" prop="carriageNumber">
        <el-input
          v-model="queryParams.carriageNumber"
          placeholder="请输入车厢号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="座位号" prop="seatNumber">
        <el-input
          v-model="queryParams.seatNumber"
          placeholder="请输入座位号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="起始站" prop="startStation">
        <el-input
          v-model="queryParams.startStation"
          placeholder="请输入起始站"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="终点站" prop="endStation">
        <el-input
          v-model="queryParams.endStation"
          placeholder="请输入终点站"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="车票价格" prop="price">
        <el-input
          v-model="queryParams.price"
          placeholder="请输入车票价格"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['train:seat:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['train:seat:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['train:seat:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['train:seat:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="seatList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="id" />
      <el-table-column label="列车ID" align="center" prop="trainId" />
      <el-table-column label="车厢号" align="center" prop="carriageNumber" />
      <el-table-column label="座位号" align="center" prop="seatNumber" />
      <el-table-column label="座位类型" align="center" prop="seatType" />
      <el-table-column label="起始站" align="center" prop="startStation" />
      <el-table-column label="终点站" align="center" prop="endStation" />
      <el-table-column label="车票价格" align="center" prop="price" />
      <el-table-column label="座位状态" align="center" prop="seatStatus" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['train:seat:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['train:seat:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改座位对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="seatRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="列车ID" prop="trainId">
          <el-input v-model="form.trainId" placeholder="请输入列车ID" />
        </el-form-item>
        <el-form-item label="车厢号" prop="carriageNumber">
          <el-input v-model="form.carriageNumber" placeholder="请输入车厢号" />
        </el-form-item>
        <el-form-item label="座位号" prop="seatNumber">
          <el-input v-model="form.seatNumber" placeholder="请输入座位号" />
        </el-form-item>
        <el-form-item label="起始站" prop="startStation">
          <el-input v-model="form.startStation" placeholder="请输入起始站" />
        </el-form-item>
        <el-form-item label="终点站" prop="endStation">
          <el-input v-model="form.endStation" placeholder="请输入终点站" />
        </el-form-item>
        <el-form-item label="车票价格" prop="price">
          <el-input v-model="form.price" placeholder="请输入车票价格" />
        </el-form-item>
        <el-form-item label="删除标识" prop="delFlag">
          <el-input v-model="form.delFlag" placeholder="请输入删除标识" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Seat">
import { listSeat, getSeat, delSeat, addSeat, updateSeat } from "@/api/train/seat";

const { proxy } = getCurrentInstance();

const seatList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    trainId: null,
    carriageNumber: null,
    seatNumber: null,
    seatType: null,
    startStation: null,
    endStation: null,
    price: null,
    seatStatus: null,
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询座位列表 */
function getList() {
  loading.value = true;
  listSeat(queryParams.value).then(response => {
    seatList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    trainId: null,
    carriageNumber: null,
    seatNumber: null,
    seatType: null,
    startStation: null,
    endStation: null,
    price: null,
    seatStatus: null,
    createTime: null,
    updateTime: null,
    delFlag: null
  };
  proxy.resetForm("seatRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加座位";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getSeat(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改座位";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["seatRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateSeat(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addSeat(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除座位编号为"' + _ids + '"的数据项？').then(function() {
    return delSeat(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('train/seat/export', {
    ...queryParams.value
  }, `seat_${new Date().getTime()}.xlsx`)
}

getList();
</script>
