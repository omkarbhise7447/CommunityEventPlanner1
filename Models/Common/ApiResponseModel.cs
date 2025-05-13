namespace Models.Common
{
    public class ApiResponseModel<T>
    {

        public bool Success { get; set; }

        public T Data { get; set; }

        public string Message { get; set; }

        public ApiResponseModel(bool success, T data, string message)
        {
            Success = success;
            Data = data;
            Message = message;
        }
    }
}
