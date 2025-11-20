using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using WebApi.Services.Interface;

namespace WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FaceController(IFaceService faceService) : ControllerBase
{
	[HttpPost("register")]
	public async Task<IActionResult> RegisterFace([FromForm] RegisterFaceRequest request)
	{
		if (!ModelState.IsValid)
		{
			var errors = ModelState.ToGoogleErrorList();
			return BadRequest(ApiResponse<string>.Fail("Validation failed", errors));
		}

		using var ms = new MemoryStream();
		await request.File.CopyToAsync(ms);

		var student = await faceService.RegisterStudentFace(
			request.StudentId,
			request.Name,
			ms.ToArray()
		);

		return Ok(ApiResponse<DynamoStudent>.Ok(student));
	}

	[HttpGet("list")]
	public async Task<IActionResult> ListFaces()
	{
		var students = await faceService.ListStudents();

		return Ok(ApiResponse<List<DynamoStudent>>.Ok(students));
	}

	[HttpDelete("{studentId}")]
	public async Task<IActionResult> DeleteFace(string studentId)
	{
		var student = await faceService.DeleteStudent(studentId);

		return Ok(ApiResponse<DynamoStudent>.Ok(student, $"Student {student.Name} has been deleted successfully."));
	}

	[HttpPost("identify")]
	public async Task<IActionResult> Identify(IFormFile file)
	{
		if (file == null)
		{
			var errorFile = new ApiError("file", "File is required.", "ERR_VALIDATION");

			return BadRequest(ApiResponse<string>.Fail("Validation failed", errorFile));
		}

		using var ms = new MemoryStream();
		await file.CopyToAsync(ms);

		var student = await faceService.IdentifyStudent(ms.ToArray());

		if (student != null) return Ok(ApiResponse<DynamoStudent>.Ok(student));

		var error = new ApiError("No matching face.", "ERR_NOT_FOUND");
		return BadRequest(ApiResponse<string>.Fail("Face not found", error));
	}

	public record RegisterFaceRequest
	{
		[Required(ErrorMessage = "Không để trống.")]
		public string StudentId { get; init; }

		[Required(ErrorMessage = "Không để trống.")]
		public string Name { get; init; }

		[Required] public IFormFile File { get; init; }
	}
}