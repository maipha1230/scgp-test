import { defineStore } from "pinia";

export const useDialogStore = defineStore("dialogStore", {
  state: () => ({
    addMaterialDialog: {
      isShowModal: false,
    }
  }),
});
