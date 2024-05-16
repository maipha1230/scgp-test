<template>
  <div class="w-full h-auto min-h-screen bg-sky-900 flex flex-col gap-3 py-3 px-[10%]">
    <div class="flex flex-row gap-2 items-center">
      <label class="text-md font-bold text-xl text-white">Material:</label>
      <el-input v-model="searchInput" placeholder='Search Material...' class="w-[380px] p-2 " />
    </div>
    <div class="flex flex-row justify-between items-center">
      <el-dropdown split-button plain v-model="tabIndex">
        {{ tabIndexMenu.find((item) => item.value == tabIndex).lable }}
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item v-for="tab in tabIndexMenu" :value="tab.value" @click="onTabIndexChange(tab.value)">{{
        tab.lable }}</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <el-button type="success" class="font-bold" @click="onAddDialogClicked">Add Material <el-icon
          class="ml-2 text-lg">
          <Plus />
        </el-icon></el-button>
    </div>
    <div class="w-full">
      <el-table
        :data="tableData.filter((item) => String(item.Material).toLowerCase().includes(searchInput.toLowerCase().trim()))"
        style="width: 100%; border-radius: 0.5rem; min-height: fit-content; max-height: 600px; overflow: auto;">
        <el-table-column prop="Material" label="Material" width="150px" />
        <el-table-column prop="ProductCode" label="Product Code" width="150px" />
        <el-table-column v-for="(header, index) in columnZone" :key="index" :prop="header.prop" :label="header.label"
          header-align="center">
          <template #default="scope">
            <div class="w-full flex items-center justify-center text-center">
              <el-input :tabindex="scope.row[header.prop].tabIndex" class="w-[100px] "
                v-model="scope.row[header.prop].qty" @keypress="onlyNumber"
                @input="onQtyChange(scope.row, scope.row[header.prop].qty)" />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="Sum" label="Summary" width="150px" header-align="center" align="center" />
      </el-table>
    </div>
    <div class="flex justify-end items-center">
      <el-button type="primary" class="font-bold" @click="onSaveClicked">Save<el-icon
          class="ml-2 text-lg">
          <DocumentAdd />
        </el-icon></el-button>
    </div>
  </div>

  <!-- Dialog Add Material -->
  <AddMaterialDialog @close-modal="onAddDialogClose" v-if="dialogStore.addMaterialDialog.isShowModal"
    :table-data="tableData" />
</template>
<script lang="ts" setup>
import { MaterialData } from '../src/constants/materialData'
import { MaterialListModel } from '../src/types/materialListModel'
import { MaterialFormModel } from '../src/types/materialFormModel'
import { onMounted, ref } from 'vue';
import { onlyNumber } from '../src/utils/regex'
import AddMaterialDialog from '../src/components/AddMaterialDialog.vue'
import { useDialogStore } from '../src/stores/DialogStore'
const searchInput = ref('')
const fetchData = ref<MaterialListModel[]>([])
const tableData = ref<any[]>([])
const columnZone = ref<{
  prop: string,
  label: string
}[]>([])
const tabIndex = ref('LTR')
const tabIndexMenu = ref([
  {
    lable: 'Left to Right',
    value: 'LTR'
  },
  {
    lable: 'Top to Bottom',
    value: 'TTB'
  }
])
const dialogStore = useDialogStore()

onMounted(() => {
  getMaterialData()
})

const getMaterialData = () => {
  fetchData.value = MaterialData
  columnZone.value = setColumnZone(fetchData.value)
  mappingTableData();
}

const mappingTableData = () => {
  tableData.value = groupMaterialData(fetchData.value)
  if (tabIndex.value === 'LTR') {
    setTabIndexLefToRight()
  } else if (tabIndex.value === 'TTB') {
    setTabIndexTopToBottom()
  }
}

const onQtyChange = (row: any, prop: string) => {
  row.Sum = Object.keys(row).filter(key => key !== 'Material' && key !== 'ProductCode' && key !== 'Sum')
    .reduce((acc: number, key: string) => Number(acc) + Number(row[key].qty), 0);
};

const groupMaterialData = (materialData: MaterialListModel[]): any[] => {
  const allLocations = [...new Set(materialData.map(item => item.Location))];

  const groupedData: { [key: string]: any } = materialData.reduce((acc, item) => {
    const { Material, ProductCode, Location, QTY } = item;
    const key = `${Material}-${ProductCode}`;

    if (!acc[key]) {
      acc[key] = {
        Material,
        ProductCode,
        Sum: 0,
      };
      allLocations.forEach(loc => {
        acc[key][loc] = { tabIndex: 0, qty: 0 };
      });
    }

    acc[key][Location].qty = QTY;
    acc[key].Sum += acc[key][Location].qty;
    return acc;
  }, {});

  const result = Object.values(groupedData);

  return result;
}

const setColumnZone = (data: MaterialListModel[]) => {
  let temp: string[] = data.map((item: any) =>
    item = item.Location
  )
  temp.sort()
  let tempColumn: {
    prop: string,
    label: string
  }[] = []
  temp.forEach((item: string) => {
    if (!tempColumn.find((element) => item == element.label)) {
      tempColumn.push({
        prop: item,
        label: item
      })
    }
  })
  return tempColumn;
}

const setTabIndexLefToRight = () => {
  const locationKeys = Object.keys(tableData.value[0]).filter(
    key => key !== 'Material' && key !== 'ProductCode' && key !== 'Sum'
  );
  locationKeys.sort();

  const updatedData = tableData.value.map((row, index) => {
    const updatedRow = { ...row };
    locationKeys.forEach((key, j) => {
      row[key].tabIndex = index * locationKeys.length + j + 1;
    });
    return updatedRow;
  });
  tableData.value = updatedData;
}

const setTabIndexTopToBottom = () => {
  const locationKeys = Object.keys(tableData.value[0]).filter(
    key => key !== 'Material' && key !== 'ProductCode' && key !== 'Sum'
  );
  locationKeys.sort();
  const updatedData = tableData.value.map((row, index) => {
    const updatedRow = { ...row };
    locationKeys.forEach((key, j) => {
      row[key].tabIndex = index + 1 + j * tableData.value.length
    });
    return updatedRow;
  });
  tableData.value = updatedData;
}

const onTabIndexChange = (value: string) => {
  if (value === 'LTR') {
    tabIndex.value = value
    setTabIndexLefToRight()
  } else if (value === 'TTB') {
    tabIndex.value = value
    setTabIndexTopToBottom()
  }
}

const onAddDialogClicked = () => {
  dialogStore.addMaterialDialog.isShowModal = true
}

const onAddDialogClose = (result: { isSubmit: boolean, data: MaterialFormModel }) => {
  dialogStore.addMaterialDialog.isShowModal = false
  if (!result.isSubmit) return

  let newDataList: MaterialListModel[] = []
  for (let location of columnZone.value) {
    let newData: MaterialListModel = {
      Material: result.data.material,
      ProductCode: result.data.productCode,
      Location: location.label,
      QTY: 0
    }
    newDataList.push(newData)
  }

  let oldData: MaterialListModel[] = []
  tableData.value.forEach((item) => {
    columnZone.value.forEach((header) => {
      oldData.push({
        Material: item.Material,
        ProductCode: item.ProductCode,
        Location: header.prop,
        QTY: Number(item[header.prop].qty)
      })
    })
  })

  fetchData.value = [...oldData, ...newDataList]
  mappingTableData()
  console.log('ADDED: ', newDataList)
  dialogStore.showSuccessDialog(`${result.data.material} has been added`)
  return
}

const onSaveClicked = () => {
  let data: MaterialListModel[] = []
  tableData.value.forEach((item) => {
    columnZone.value.forEach((header) => {
      data.push({
        Material: item.Material,
        ProductCode: item.ProductCode,
        Location: header.prop,
        QTY: Number(item[header.prop].qty)
      })
    })
  })
  data = data.filter((item) => Number(item.QTY) > 0)
  console.log('Save: ', data)
}



</script>
