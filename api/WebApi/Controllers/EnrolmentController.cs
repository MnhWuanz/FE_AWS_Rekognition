using Microsoft.AspNetCore.Mvc;
using WebApi.Models;
using WebApi.Services.Interface;

namespace WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EnrolmentController(IEnrolmentRepository repo) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var enrolment = await repo.GetAllAsync();
        return Ok(enrolment);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var enrolment = await repo.GetByIdAsync(id);
        return enrolment == null ? NotFound() : Ok(enrolment);
    }

    [HttpPost]
    public async Task<IActionResult> Add(Enrolment enrolment)
    {
        var id = await repo.AddAsync(enrolment);
        return Ok(new { id });
    }

    [HttpPut]
    public async Task<IActionResult> Update(Enrolment enrolment)
    {
        var result = await repo.UpdateAsync(enrolment);
        return result > 0 ? Ok() : NotFound();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await repo.DeleteAsync(id);
        return result > 0 ? Ok() : NotFound();
    }
}