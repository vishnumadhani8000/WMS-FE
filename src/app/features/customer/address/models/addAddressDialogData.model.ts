import { FormControl } from "@angular/forms";
import { AddressData } from "./addresh.model";

export interface AddAddressDialogData {

}

export interface AddAddressDialogResult {
  saved: boolean;
  address?: AddressData;
}

export interface AddressForm {
  addressLine: FormControl<string>;
  landmark: FormControl<string>;
  stateId: FormControl<number | null>;
  cityId: FormControl<number | null>;
  pincode: FormControl<string>;
}