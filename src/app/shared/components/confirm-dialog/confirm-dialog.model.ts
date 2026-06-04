export interface ConfirmDialogData {

    title: string;
  
    message: string;
  
    confirmText?: string;
  
    cancelText?: string;
  
    type?: 'danger' | 'warning' | 'info';
  }