import { AddressDto } from "./address.model";

export interface LocationDto {
    name: string;
    address: AddressDto;
    latitude: number;
    longitude: number;
  }