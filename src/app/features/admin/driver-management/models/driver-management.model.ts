export interface Driver {
    id: number;
    name: string;
    phone: string;
    licenceNo: string;
    isAvailable: boolean;
  }
  
  export interface DriverFilter {
    page: number;
    pageSize: number;
    search?: string;
    sortBy?: string;
    ascending?: boolean;
  }
  
  export interface DriverFormValue {
    name: string;
    phone: string;
    licenceNo: string;
    isAvailable: boolean;
  }
  
  export interface DriverDialogData {
    mode: 'add' | 'edit';
    driver?: Driver;
  }