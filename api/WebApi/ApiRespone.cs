using System.Net;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace WebApi;

public record ApiResponse<T>(
	bool Success,
	string Message,
	T? Data,
	IEnumerable<ApiError>? Errors)
{
	public static ApiResponse<T> Ok(T data, string message = "Success")
		=> new(true, message, data, null);

	public static ApiResponse<T> Fail(string message, IEnumerable<ApiError> errors)
		=> new(false, message, default, errors);

	public static ApiResponse<T> Fail(string message, ApiError error)
		=> new(false, message, default, [error]);
}

public record ApiError(
	[property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
	string? Field,
	string Message,
	string Code
)
{
	public ApiError(string Message, string Code)
		: this(null, Message, Code)
	{
	}
}

public class ApiExceptionMiddleware(RequestDelegate next)
{
	public async Task Invoke(HttpContext context)
	{
		try
		{
			await next(context);
		}
		catch (Exception ex)
		{
			await HandleExceptionAsync(context, ex);
		}
	}

	private static Task HandleExceptionAsync(HttpContext ctx, Exception ex)
	{
		ctx.Response.ContentType = "application/json";
		ctx.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

		var response = ApiResponse<string>.Fail(
			"Internal server error",
			new ApiError(ex.Message, "ERR_INTERNAL")
		);

		var json = JsonSerializer.Serialize(response,
			new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

		return ctx.Response.WriteAsync(json);
	}
}

public static class ModelStateExtensions
{
	public static List<ApiError> ToGoogleErrorList(this ModelStateDictionary modelState)
	{
		var list = new List<ApiError>();

		foreach (var kv in modelState)
		{
			foreach (var err in kv.Value.Errors)
			{
				var message = string.IsNullOrWhiteSpace(err.ErrorMessage)
					? err.Exception?.Message ?? "Invalid value"
					: err.ErrorMessage;

				list.Add(new ApiError(
					Field: kv.Key,
					Message: message,
					Code: "ERR_VALIDATION"
				));
			}
		}

		return list;
	}
}