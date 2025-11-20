using Amazon;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DataModel;
using Amazon.Rekognition;
using Dapper;
using Npgsql;

namespace WebApi;

public class Startup(IConfiguration configuration)
{
	public void ConfigureServices(IServiceCollection services)
	{
		var awsSection = configuration.GetSection("AWS");
		var region = RegionEndpoint.GetBySystemName(awsSection["Region"] ?? "ap-southeast-1");

		var awsAccessKey = awsSection["AccessKey"] ?? "AKIA37O6GDP32MDOPG5C";
		var awsSecretKey = awsSection["SecretKey"] ?? "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";

		services.AddControllers();
		services.AddEndpointsApiExplorer();
		services.AddSwaggerGen();

		// AWS Clients
		services.AddSingleton<IAmazonRekognition>(_ =>
			string.IsNullOrEmpty(awsAccessKey)
				? new AmazonRekognitionClient(region)
				: new AmazonRekognitionClient(awsAccessKey, awsSecretKey, region));

		services.AddSingleton<IAmazonDynamoDB>(_ =>
			string.IsNullOrEmpty(awsAccessKey)
				? new AmazonDynamoDBClient(region)
				: new AmazonDynamoDBClient(awsAccessKey, awsSecretKey, region));

		services.AddSingleton<IDynamoDBContext, DynamoDBContext>();

		// Dapper + Postgres
		DefaultTypeMap.MatchNamesWithUnderscores = true;
		var connectionString = configuration.GetConnectionString("DefaultConnection");
		services.AddSingleton(_ =>
		{
			var dsBuilder = new NpgsqlDataSourceBuilder(connectionString);
			dsBuilder.EnableUnmappedTypes();
			return dsBuilder.Build();
		});

		services.AddCors(options =>
		{
			options.AddPolicy("AllowLocalhost", policy =>
				policy.WithOrigins("http://localhost:3001")
					.AllowAnyHeader()
					.AllowAnyMethod());
		});

		services.Configure<RouteOptions>(opt =>
		{
			opt.LowercaseUrls = true;
			opt.LowercaseQueryStrings = true;
		});

		services.AddInfrastructure();
	}

	public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
	{
		app.UseMiddleware<ApiExceptionMiddleware>();

		if (env.IsDevelopment())
		{
			app.UseSwagger();
			app.UseSwaggerUI();
		}

		var allowedOrigins = (configuration["Cors:AllowedOrigins"] ?? "").Replace(";", ",")
			.Split(',', StringSplitOptions.RemoveEmptyEntries)
			.Select(x => x.Trim())
			.ToArray();

		app.UseCors(builder => builder
			.SetIsOriginAllowedToAllowWildcardSubdomains()
			.WithOrigins(allowedOrigins).AllowAnyHeader()
			.AllowAnyMethod().AllowCredentials());

		app.UseRouting();
		app.UseAuthorization();
		app.UseEndpoints(endpoints => { endpoints.MapControllers(); });
	}
}