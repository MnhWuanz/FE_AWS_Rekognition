using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.Model;
using Amazon.Rekognition;
using Amazon.Rekognition.Model;
using WebApi.Services.Interface;

namespace WebApi.Services;

public class FaceService(
	IAmazonRekognition rekognition,
	IAmazonDynamoDB dynamo,
	IDynamoDBContext context)
	: IFaceService
{
	private const string CollectionId = "students_collection";

	private const string StudentsTable = "Students";
	private const string AttendanceTable = "AttendanceLogs";

	public async Task InitializeResources()
	{
		// Create collection
		var existing = await rekognition.ListCollectionsAsync(new ListCollectionsRequest());
		if (!existing.CollectionIds.Contains(CollectionId))
		{
			await rekognition.CreateCollectionAsync(new CreateCollectionRequest
			{
				CollectionId = CollectionId
			});
		}

		// Create Dynamo tables
		var tables = await dynamo.ListTablesAsync();

		if (!tables.TableNames.Contains(StudentsTable))
		{
			await dynamo.CreateTableAsync(new CreateTableRequest
			{
				TableName = StudentsTable,
				AttributeDefinitions = [new AttributeDefinition("StudentId", ScalarAttributeType.S)],
				KeySchema = [new KeySchemaElement("StudentId", KeyType.HASH)],
				BillingMode = BillingMode.PAY_PER_REQUEST
			});
		}

		if (!tables.TableNames.Contains(AttendanceTable))
		{
			await dynamo.CreateTableAsync(new CreateTableRequest
			{
				TableName = AttendanceTable,
				AttributeDefinitions = [new AttributeDefinition("LogId", ScalarAttributeType.S)],
				KeySchema = [new KeySchemaElement("LogId", KeyType.HASH)],
				BillingMode = BillingMode.PAY_PER_REQUEST
			});
		}
	}

	public async Task<DynamoStudent> RegisterStudentFace(string studentId, string name, byte[] imageBytes)
	{
		var indexResponse = await rekognition.IndexFacesAsync(new IndexFacesRequest
		{
			CollectionId = CollectionId,
			ExternalImageId = studentId,
			Image = new Image { Bytes = new MemoryStream(imageBytes) }
		});

		if (indexResponse.FaceRecords.Count == 0)
			throw new Exception("No face detected.");

		var face = indexResponse.FaceRecords[0].Face;

		var student = new DynamoStudent
		{
			StudentId = studentId,
			Name = name,
			FaceId = face.FaceId,
			ExternalImageId = face.ExternalImageId,
			CreatedAt = DateTime.UtcNow.ToString("o")
		};

		await context.SaveAsync(student);
		return student;
	}

	public async Task<List<DynamoStudent>> ListStudents()
	{
		return await context.ScanAsync<DynamoStudent>(new List<ScanCondition>())
			.GetRemainingAsync();
	}

	public async Task<DynamoStudent> DeleteStudent(string studentId)
	{
		var student = await context.LoadAsync<DynamoStudent>(studentId);
		if (student == null) throw new Exception("Student does not exist");

		await rekognition.DeleteFacesAsync(new DeleteFacesRequest
		{
			CollectionId = CollectionId,
			FaceIds = [student.FaceId]
		});

		await context.DeleteAsync(student);

		return student;
	}

	public async Task<DynamoStudent?> IdentifyStudent(byte[] imageBytes)
	{
		var searchResponse = await rekognition.SearchFacesByImageAsync(
			new SearchFacesByImageRequest
			{
				CollectionId = CollectionId,
				Image = new Image { Bytes = new MemoryStream(imageBytes) },
				FaceMatchThreshold = 90f,
				MaxFaces = 1
			});

		if (searchResponse.FaceMatches.Count == 0)
			return null;

		var foundId = searchResponse.FaceMatches.First().Face.ExternalImageId;

		return await context.LoadAsync<DynamoStudent>(foundId);
	}
}