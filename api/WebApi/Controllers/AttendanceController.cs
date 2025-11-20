using Microsoft.AspNetCore.Mvc;
using WebApi.Models;
using WebApi.Services.Interface;

namespace WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AttendanceController(IAttendanceRepository repo) : ControllerBase
{

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var attendances = await repo.GetAllAsync();
        return Ok(attendances);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var attendance = await repo.GetByIdAsync(id);
        return attendance == null ? NotFound() : Ok(attendance);
    }

    [HttpPost]
    public async Task<IActionResult> Add(Attendance attendance)
    {
        var id = await repo.AddAsync(attendance);
        return Ok(new { id });
    }

    [HttpPut]
    public async Task<IActionResult> Update(Attendance attendance)
    {
        var result = await repo.UpdateAsync(attendance);
        return result > 0 ? Ok() : NotFound();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await repo.DeleteAsync(id);
        return result > 0 ? Ok() : NotFound();
    }
}