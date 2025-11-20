using Amazon.DynamoDBv2.DataModel;

namespace WebApi;


[DynamoDBTable("Students")]
public class DynamoStudent
{
	[DynamoDBHashKey] public string StudentId { get; set; }
	[DynamoDBProperty] public string Name { get; set; }
	[DynamoDBProperty] public string FaceId { get; set; }
	[DynamoDBProperty] public string ExternalImageId { get; set; }
	[DynamoDBProperty] public string CreatedAt { get; set; }
}

[DynamoDBTable("AttendanceLogs")]
public class DynamoAttendanceLog
{
	[DynamoDBHashKey] public string LogId { get; set; }
	[DynamoDBProperty] public string StudentId { get; set; }
	[DynamoDBProperty] public float Similarity { get; set; }
	[DynamoDBProperty] public string Timestamp { get; set; }
}