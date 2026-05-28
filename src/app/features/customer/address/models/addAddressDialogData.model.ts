import { AddressData } from "./addresh.model";

export interface AddAddressDialogData {

}

export interface AddAddressDialogResult {
  saved: boolean;
  address?: AddressData;
}