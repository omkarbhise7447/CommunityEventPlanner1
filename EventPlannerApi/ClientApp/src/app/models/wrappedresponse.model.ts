export interface WrappedResponse<T> {
    Success: boolean;
    Data: T;
    Message: string;
  }