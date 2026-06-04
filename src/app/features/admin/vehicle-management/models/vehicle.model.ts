import { FormControl } from "@angular/forms";

export interface Vehicle {
    id: number;
    name: string;
    plateNumber: string;
    capacityKg: number;
    isAvailable: boolean;
  }
  
  export interface VehicleFilter {
    page: number;
    pageSize: number;
    search?: string;
    sortBy?: string | null;
    ascending?: boolean | null;
  }
  
  export interface VehicleFormValue {
    name: string;
    plateNumber: string;
    capacityKg: number;
    isAvailable: boolean;
  }
  
  export interface VehicleDialogData {
    mode: 'add' | 'edit';
    vehicle?: Vehicle;
  }
  export interface VehicleForm {
    name: FormControl<string>;
    plateNumber: FormControl<string>;
    capacityKg: FormControl<number | null>;
    isAvailable: FormControl<boolean>;
  }