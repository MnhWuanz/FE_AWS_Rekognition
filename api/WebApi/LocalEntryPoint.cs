namespace WebApi;

// ReSharper disable once UnusedType.Global
public class LocalEntryPoint
{
	public static void Main(string[] args)
	{
		CreateHostBuilder(args).Build().Run();
	}

	private static IHostBuilder CreateHostBuilder(string[] args) =>
		Host.CreateDefaultBuilder(args)
			.ConfigureWebHostDefaults(webBuilder =>
			{
				webBuilder.ConfigureAppConfiguration((context, builder) =>
				{
					var env = context.HostingEnvironment;
					builder.AddJsonFile("appsettings.json");

					builder.AddEnvironmentVariables();
					if (env.IsDevelopment()) builder.AddJsonFile("appsettings.local.json");

					if (args != null) builder.AddCommandLine(args);
				});

				webBuilder.UseStartup<Startup>();
				webBuilder.ConfigureKestrel(options => options.AllowSynchronousIO = true);
			});
}