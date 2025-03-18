<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="地区名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入地区名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="地区全名" prop="fullName">
        <el-input
          v-model="queryParams.fullName"
          placeholder="请输入地区全名"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="地区编码" prop="code">
        <el-input
          v-model="queryParams.code"
          placeholder="请输入地区编码"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="地区首字母" prop="initial">
        <el-input
          v-model="queryParams.initial"
          placeholder="请输入地区首字母"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="拼音" prop="spell">
        <el-input
          v-model="queryParams.spell"
          placeholder="请输入拼音"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="热门标识" prop="popularFlag">
        <el-select v-model="queryParams.popularFlag" placeholder="热门标识" style="width: 100px">
          <el-option v-for="item in popularFlag" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
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
          v-hasPermi="['train:region:add']"
        >新增</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="regionList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="id" />
      <el-table-column label="地区名称" align="center" prop="name" />
      <el-table-column label="地区全名" align="center" prop="fullName" />
      <el-table-column label="地区编码" align="center" prop="code" />
      <el-table-column label="地区首字母" align="center" prop="initial" />
      <el-table-column label="拼音" align="center" prop="spell" />
      <el-table-column label="热门标识" align="center" prop="popularFlag">
        <template #default="{ row }">
          {{ popularFlag.find(item => item.value === row.popularFlag)?.label || '未知' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['train:region:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['train:region:remove']">删除</el-button>
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

    <!-- 添加或修改地区对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="regionRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="地区名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入地区名称" />
        </el-form-item>
        <el-form-item label="地区全名" prop="fullName">
          <el-input v-model="form.fullName" placeholder="请输入地区全名" />
        </el-form-item>
        <el-form-item label="地区编码" prop="code">
          <el-input v-model="form.code" placeholder="请输入地区编码" />
        </el-form-item>
        <el-form-item label="地区首字母" prop="initial">
          <el-input v-model="form.initial" placeholder="请输入地区首字母" />
        </el-form-item>
        <el-form-item label="拼音" prop="spell">
          <el-input v-model="form.spell" placeholder="请输入拼音" />
        </el-form-item>
        <el-form-item label="热门标识" prop="popularFlag">
          <el-input v-model="form.popularFlag" placeholder="请输入热门标识" />
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

<script setup name="Region">
import { listRegion, getRegion, delRegion, addRegion, updateRegion } from "@/api/train/region";

const { proxy } = getCurrentInstance();

const regionList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const popularFlag = ref([
  { value: 0, label: '普通' },
  { value: 1, label: '热门' },
])

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: null,
    fullName: null,
    code: null,
    initial: null,
    spell: null,
    popularFlag: null,
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询地区列表 */
function getList() {
  loading.value = true;
  listRegion(queryParams.value).then(response => {
    regionList.value = response.rows;
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
    name: null,
    fullName: null,
    code: null,
    initial: null,
    spell: null,
    popularFlag: null,
    createTime: null,
    updateTime: null,
    delFlag: null
  };
  proxy.resetForm("regionRef");
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
  title.value = "添加地区";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getRegion(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改地区";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["regionRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateRegion(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addRegion(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除地区编号为"' + _ids + '"的数据项？').then(function() {
    return delRegion(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('train/region/export', {
    ...queryParams.value
  }, `region_${new Date().getTime()}.xlsx`)
}

getList();
</script>
