export interface State {
    id: number;
    name: string;

  }
  
  export interface City {
    id: number;
    name: string;
    stateId: number;
  }
  

  export interface StateFilter {
    page: number;
    pageSize: number;
    search?: string;
    sortBy?: string;
    ascending?: boolean;
  }
  
  export interface CityFilter {
    stateId: number;
    page: number;
    pageSize: number;
    search?: string;
    sortBy?: string;
    ascending?: boolean;
  }
  
  export interface StateFormValue {
    name: string;
  }
  
  export interface CityFormValue {
    name: string;
    stateId: number;
  }
  
  export interface StateDialogData {
    mode: 'add' | 'edit';
    state?: State;
  }
  
  export interface CityDialogData {
    mode: 'add' | 'edit';
    stateId: number;
    stateName: string;
    city?: City;
  }