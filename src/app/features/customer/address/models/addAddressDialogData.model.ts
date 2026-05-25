import { AddressData } from "./addresh.model";

export interface AddAddressDialogData {
  existingCount: number;
}

export interface AddAddressDialogResult {
  saved: boolean;
  address?: AddressData;
}