using Amazon.Lambda.AspNetCoreServer;

namespace WebApi;

// ReSharper disable once UnusedType.Global
public class LambdaEntryPoint : APIGatewayProxyFunction
{
	protected override void Init(IWebHostBuilder webBuilder)
	{
		webBuilder.UseStartup<Startup>();
	}
}