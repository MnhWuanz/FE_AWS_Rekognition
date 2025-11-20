using Microsoft.AspNetCore.Mvc;
using WebApi.Models;
using WebApi.Services.Interface;

namespace WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LecturerController(ILecturerRepository repo) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var lecturers = await repo.GetAllAsync();
        return Ok(lecturers);
    }
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var lecturer = await repo.GetByIdAsync(id);
        return lecturer == null ? NotFound() : Ok(lecturer);
    }
    [HttpPost]
    public async Task<IActionResult> Add(Lecturer lecturer)
    {
        var id = await repo.AddAsync(lecturer);
        return Ok(new { id });
    }
    [HttpPut]
    public async Task<IActionResult> Update(Lecturer lecturer)
    { 
        var result = await repo.UpdateAsync(lecturer);
        return result > 0 ? Ok() : NotFound();
    }
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await repo.DeleteAsync(id);
        return result > 0 ? Ok() : NotFound();
    }
}