import { Address } from "../address";
import { AddressData } from "./addresh.model";


export interface SelectAddressDialogData {
  addresses: AddressData[];
  selectedAddressId?: number;
}

export interface SelectAddressDialogResult {
  saved: boolean;
  address?: AddressData;
}