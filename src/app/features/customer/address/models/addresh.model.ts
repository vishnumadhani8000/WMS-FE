export interface AddressData {
  addressId: number;
  stateName: string;
  cityName: string;
  stateId: number;
  cityId: number;
  addressLine: string;
  landmark: string;
  pincode: string;
}


export interface StateOption {
  label: string;
  value: number;
}

export interface CityOption {
  label: string;
  value: number;
}

export interface StateResponse {
  id: number;
  name: string;
}

export interface CityResponse {
  id: number;
  name: string;
}
