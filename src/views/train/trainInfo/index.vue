<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="列车车次" prop="trainNumber">
        <el-input
            v-model="queryParams.trainNumber"
            placeholder="请输入列车车次"
            clearable
            @keyup.enter="handleQuery"
            style="width: 150px"
        />
      </el-form-item>
      <el-form-item label="起始站" prop="saleStartStation">
        <el-input v-model="queryParams.startStation" placeholder="请输入起始站"/>
      </el-form-item>
      <el-form-item label="到达站" prop="saleEndStation">
        <el-input v-model="queryParams.endStation" placeholder="请选择到达站"/>
      </el-form-item>
      <el-form-item label="销售时间" prop="saleTime">
        <el-date-picker
            clearable
            style="width: 150px"
            v-model="queryParams.saleTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择销售时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="出发时间" prop="departureTime">
        <el-date-picker
            clearable
            style="width: 150px"
            v-model="queryParams.departureTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择出发时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="到达时间" prop="arrivalTime">
        <el-date-picker
            clearable
            style="width: 150px"
            v-model="queryParams.arrivalTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择到达时间">
        </el-date-picker>
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
            v-hasPermi="['train:train:add']"
        >新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="success"
            plain
            icon="Edit"
            :disabled="single"
            @click="handleUpdate"
            v-hasPermi="['train:train:edit']"
        >修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['train:train:remove']"
        >删除
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="trainList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="ID" align="center" prop="id"/>
      <el-table-column label="列车车次" align="center" prop="trainNumber"/>
      <el-table-column label="列车类型" align="center" prop="trainType">
        <template #default="{ row }">
          {{ trainType.get(row.trainType) || '未知' }}
        </template>
      </el-table-column>
      <el-table-column label="列车标签" align="center" prop="trainTag" style="width: 100px">
        <template #default="{ row }">
          <el-tooltip effect="dark" :content="row.trainTag.split(',').map(tag => trainTag.get(tag) || '未知').join(' | ')" placement="top">
            <div class="ellipsis-text">
              {{ row.trainTag.split(',').map(tag => trainTag.get(tag) || '未知').join(' | ') }}
            </div>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="列车品牌" align="center" prop="trainBrand">
        <template #default="{ row }">
          <el-tooltip effect="dark" :content="row.trainBrand.split(',').map(tag => trainBrand.get(tag) || '未知').join(' | ')" placement="top">
            <div class="ellipsis-text">
              {{ row.trainBrand.split(',').map(tag => trainBrand.get(tag) || '未知').join(' | ') }}
            </div>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="起始站" align="center" prop="startStation"/>
      <el-table-column label="终点站" align="center" prop="endStation"/>
      <el-table-column label="起始城市" align="center" prop="startRegion"/>
      <el-table-column label="终点城市" align="center" prop="endRegion"/>
      <el-table-column label="销售时间" align="center" prop="saleTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.saleTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="销售状态" align="center" prop="saleStatus">
        <template #default="{ row }">
          {{ states.get(row.saleStatus) || '未知' }}
        </template>
      </el-table-column>
      <el-table-column label="出发时间" align="center" prop="departureTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.departureTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="到达时间" align="center" prop="arrivalTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.arrivalTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['train:train:edit']">
            修改
          </el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
                     v-hasPermi="['train:train:remove']">删除
          </el-button>
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

    <!-- 添加或修改列车对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="trainRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="列车车次" prop="trainNumber">
          <el-input v-model="form.trainNumber" placeholder="请输入列车车次"/>
        </el-form-item>
        <el-form-item label="列车类型">
<!--下拉选择-->
        </el-form-item>
        <el-form-item label="列车标签">
<!--多选-->
        </el-form-item>
        <el-form-item label="列车品牌">
<!--多选-->
        </el-form-item>
        <el-form-item label="起始站" prop="saleStartStation">
          <el-input v-model="form.startStation" placeholder="请选择起始站"/>
        </el-form-item>
        <el-form-item label="到达站" prop="saleEndStation">
          <el-input v-model="form.endStation" placeholder="请选择到达站"/>
        </el-form-item>
        <el-form-item label="起始城市" prop="saleStartStation">
          <el-input v-model="form.startRegion" placeholder="请选择起始城市"/>
        </el-form-item>
        <el-form-item label="到达城市" prop="saleEndStation">
          <el-input v-model="form.endRegion" placeholder="请选择到达城市"/>
        </el-form-item>
        <el-form-item label="销售时间" prop="saleTime">
          <el-date-picker
              clearable
              v-model="form.saleTime"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="请选择销售时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="出发时间" prop="departureTime">
          <el-date-picker
              clearable
              v-model="form.departureTime"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="请选择出发时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="到达时间" prop="arrivalTime">
          <el-date-picker
              clearable
              v-model="form.arrivalTime"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="请选择到达时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="销售状态">
<!--          下拉选择-->
        </el-form-item>
        <el-form-item label="删除标识" prop="delFlag">
          <el-input v-model="form.delFlag" placeholder="请输入删除标识"/>
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

<script setup name="Train">
import {listTrain, getTrain, delTrain, addTrain, updateTrain} from "@/api/train/train";
import {listStation} from '@/api/train/station'

const {proxy} = getCurrentInstance();

const trainList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const trainType = new Map([
  [0, '高铁'],
  [1, '动车'],
  [2, '普通车']
]);

const trainTag = new Map([
  ['0', '复兴号'],
  ['1', '智能动车组'],
  ['2', '静音车厢'],
  ['3', '支持选铺']
]);
const trainBrand = new Map([
  ['0', 'GC-高铁/城际'],
  ['1', 'D-动车'],
  ['2', 'Z-直达'],
  ['3', 'T-特快'],
  ['4', 'K-快速'],
  ['5', '其他'],
  ['6', '复兴号'],
  ['7', '智能动车组']
])

const states = new Map([
  [0, '可售'],
  [1, '不可售'],
  [2, '未知']
])

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    trainNumber: null,
    trainType: null,
    trainTag: null,
    trainBrand: null,
    startStation: null,
    endStation: null,
    startRegion: null,
    endRegion: null,
    saleTime: null,
    saleStatus: null,
    departureTime: null,
    arrivalTime: null,
  },
  rules: {}
});

const cityList = ref([{
  id: 1,
  name: "北京南",
  regionName: "北京",
}])

const {queryParams, form, rules} = toRefs(data);

/** 查询列车列表 */
function getList() {
  loading.value = true;
  listTrain(queryParams.value).then(response => {
    trainList.value = response.rows;
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
    trainNumber: null,
    trainType: null,
    trainTag: null,
    trainBrand: null,
    startStation: null,
    endStation: null,
    startRegion: null,
    endRegion: null,
    saleTime: null,
    saleStatus: null,
    departureTime: null,
    arrivalTime: null,
    createTime: null,
    updateTime: null,
    delFlag: null
  };
  proxy.resetForm("trainRef");
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
  title.value = "添加列车";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getTrain(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改列车";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["trainRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateTrain(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addTrain(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除列车编号为"' + _ids + '"的数据项？').then(function () {
    return delTrain(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {
  });
}

async function getCityStation() {
  const res = await listStation({})
  cityList.value = res.rows
}

getList();

onMounted(async () => {
  await getCityStation()
})
</script>

<style scoped>
.ellipsis-text {
  max-width: 150px; /* 限制最大宽度 */
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  display: inline-block;
  vertical-align: middle;
}
</style>
