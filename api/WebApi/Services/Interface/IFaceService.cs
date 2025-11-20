namespace WebApi.Services.Interface;

public interface IFaceService
{
	Task InitializeResources();
	Task<DynamoStudent> RegisterStudentFace(string studentId, string name, byte[] imageBytes);
	Task<DynamoStudent?> IdentifyStudent(byte[] imageBytes);
	Task<List<DynamoStudent>> ListStudents();
	Task<DynamoStudent> DeleteStudent(string studentId);
}