<template>
    <el-dialog v-model="dialogStore.addMaterialDialog.isShowModal" title="Material" width="500" destroy-on-close>
        <el-form ref="ruleFormRef" :model="materialForm" :rules="rules">
            <el-form-item label="Material:" :label-width="'120px'" prop="material">
                <el-input v-model="materialForm.material" autocomplete="off" />
            </el-form-item>
            <el-form-item label="Product Code:" :label-width="'120px'" prop="productCode">
                <el-input v-model="materialForm.productCode" autocomplete="off" />
            </el-form-item>
            <el-form-item label="Description:" :label-width="'120px'" prop="description">
                <el-input v-model="materialForm.description" autocomplete="off" />
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="dialog-footer flex justify-center items-center gap-2">
                <el-button type="success" @click="onCloseClicked(true, $event, ruleFormRef)" :disabled="!isFormValid">
                    Add
                </el-button>
                <el-button @click="onCloseClicked(false, $event, ruleFormRef)">Cancel</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { defineProps, reactive, ref, defineEmits, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessageBox } from 'element-plus'
import { useDialogStore } from '../stores/DialogStore';
import { MaterialListModel } from '../types/materialListModel';
const dialogStore = useDialogStore()
const emit = defineEmits(['closeModal'])
const props = defineProps({
    tableData: Array<MaterialListModel>
})
interface RuleForm {
    material: string,
    productCode: string,
    description: string
}
const ruleFormRef = ref<FormInstance>()
const rules = reactive<FormRules<RuleForm>>({
    material: [{ required: true, message: 'Please input Material', trigger: 'blur' }],
    productCode: [{ required: true, message: 'Please input Product Code', trigger: 'blur' }],
    description: [{ required: true, message: 'Please input Description', trigger: 'blur' }],
})

let materialForm = reactive<RuleForm>({
    material: '',
    productCode: '',
    description: ''
})

const isFormValid = ref(false)

const checkFormValidity = async () => {
    if (ruleFormRef.value) {
        ruleFormRef.value.validate((valid) => {
            isFormValid.value = valid
        })
    }
}

watch(() => materialForm, checkFormValidity, { deep: true })

const onCloseClicked = (isSubmit: boolean, event: Event, formEl: FormInstance | undefined) => {
    event.preventDefault()
    if (!isSubmit) {
        emit('closeModal', { isSubmit: false, data: null })
        dialogStore.addMaterialDialog.isShowModal = false
        return
    }
    if (!formEl) return
    formEl.validate((valid) => {
        if (valid) {
            const duplicate = props.tableData.some((item) => item.Material.toLowerCase() === materialForm.material.toLowerCase() && item.ProductCode.toLowerCase() === materialForm.productCode.toLowerCase())
            if (duplicate) {
                dialogStore.showWarningDialog(`Material: ${materialForm.material} and Product Code: ${materialForm.productCode} already exist`)
                return
            }
            emit('closeModal', { isSubmit: true, data: materialForm })
            dialogStore.addMaterialDialog.isShowModal = false
            return
        }
    })
}


</script>