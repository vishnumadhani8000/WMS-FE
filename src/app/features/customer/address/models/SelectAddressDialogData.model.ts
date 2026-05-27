import { AddressData } from './addresh.model';

export interface SelectAddressDialogData {
  addresses: AddressData[];
  selectedAddressId?: number | null;
}

export interface SelectAddressDialogResult {
  saved?: boolean;
  address?: AddressData;
  action?: 'add-new';
}