import { defineStore } from "pinia";
import { ElMessageBox } from "element-plus";

export const useDialogStore = defineStore("dialogStore", {
  state: () => ({
    addMaterialDialog: {
      isShowModal: false,
    },
  }),
  actions: {
    async showWarningDialog(msg: string) {
      return ElMessageBox.confirm(msg, {
        showCancelButton: false,
        confirmButtonText: "CLOSE",
        confirmButtonClass: "bg-yellow-500",
        type: "warning",
        title: 'Warning',
        center: true,
      });
    },
    async showSuccessDialog(msg: string) {
      return ElMessageBox.confirm(msg, {
        showCancelButton: false,
        confirmButtonText: "OK",
        type: "success",
        center: true,
        confirmButtonClass: "bg-green-500",
        title: 'Success'
      });
    },
  },
});
