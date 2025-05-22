export interface ApiResponseModel<T> {
    Success: boolean;
    Data: T;
    Message: string;
  }