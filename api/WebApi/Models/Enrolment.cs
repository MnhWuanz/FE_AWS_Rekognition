namespace WebApi.Models;

public class Enrolment
{
    public int Id { get; set; }
    public string? Status { get; set; }
    public int StudentId { get; set; }
    public int CourseId { get; set; }
}