namespace WebApi.Models;

public class Attendance
{
    public int Id { get; set; }
    public DateTime Date { get; set; }
    public int SessionId { get; set; }
    public int EnrolmentId { get; set; }
}