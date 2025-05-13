using Models.Common;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace EventPlannerApi.Middlewares
{
    public class CommonResponseMiddlware
    {
        private readonly RequestDelegate _next;

        public CommonResponseMiddlware(RequestDelegate next)
        {
            this._next = next;
        }


        public async Task InvokeAsync(HttpContext context)
        {

            var originalStream = context.Response.Body;

            using (var memoryStream = new MemoryStream())
            {

                context.Response.Body = memoryStream;

                try
                {
                    await _next(context);

                    if(context.Response.ContentType != null 
                        && context.Response.ContentType.Contains("application/json"))
                    {
                        memoryStream.Seek(0, SeekOrigin.Begin); // start reading memory stream

                        var responseBody = await new StreamReader(memoryStream).ReadToEndAsync();

                        var responseObj = new ApiResponseModel<object>(
                                success: context.Response.StatusCode >= 200 && context.Response.StatusCode <= 300,
                                data : JsonSerializer.Deserialize<object>(responseBody)!,
                                message: "Request completed successfully!!!"
                              );

                        var jsonResponse = JsonSerializer.Serialize(responseObj);
                        context.Response.Body = originalStream;

                        await context.Response.WriteAsync(jsonResponse);
                    }
                }
                catch (Exception)
                {
                    throw;
                }

            }
        }

    }
}
