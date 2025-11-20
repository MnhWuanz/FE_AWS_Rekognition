using Microsoft.AspNetCore.Mvc;
using WebApi.Models;
using WebApi.Services.Interface;

namespace WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CourseController(ICourseRepository repo) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var course = await repo.GetAllAsync();
        return Ok(course);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var course = await repo.GetByIdAsync(id);
        return course == null ? NotFound() : Ok(course);
    }

    [HttpPost]
    public async Task<IActionResult> Add(Course course)
    {
        var id = await repo.AddAsync(course);
        return Ok(new { id });
    }

    [HttpPut]
    public async Task<IActionResult> Update(Course course)
    {
        var result = await repo.UpdateAsync(course);
        return result > 0 ? Ok() : NotFound();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await repo.DeleteAsync(id);
        return result > 0 ? Ok() : NotFound();
    }
}