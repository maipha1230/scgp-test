export const onlyNumber = ($event) => {
   let keyCode = ($event.keyCode ? $event.keyCode : $event.which);
   if ((keyCode < 48 || keyCode > 57)) {
      $event.preventDefault();
   }
}