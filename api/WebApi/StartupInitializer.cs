using WebApi.Services.Interface;

namespace WebApi;

public class StartupInitializer(IServiceProvider services) : IHostedService
{
	public async Task StartAsync(CancellationToken cancellationToken)
	{
		using var scope = services.CreateScope();
		var faceService = scope.ServiceProvider.GetRequiredService<IFaceService>();

		Console.WriteLine("Running InitializeResources...");
		await faceService.InitializeResources();
		Console.WriteLine("Done.");
	}

	public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}