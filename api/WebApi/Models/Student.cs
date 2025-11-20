namespace WebApi.Models;

public class Student
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; }= string.Empty;
    public string Email {  get; set; } = string.Empty;
    public string? FaceId {  get; set; }
}