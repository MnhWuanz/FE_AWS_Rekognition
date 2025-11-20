using Microsoft.AspNetCore.Mvc;
using WebApi.Models;
using WebApi.Services.Interface;

namespace WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SessionController(ISessionsRepository repo) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var sessions = await repo.GetAllAsync();
        return Ok(sessions);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var session = await repo.GetByIdAsync(id);
        return session == null ? NotFound() : Ok(session);
    }

    [HttpPost]
    public async Task<IActionResult> Add(Session session)
    {
        var id = await repo.AddAsync(session);
        return Ok(new { id });
    }

    [HttpPut]
    public async Task<IActionResult> Update(Session session)
    {
        var result = await repo.UpdateAsync(session);
        return result > 0 ? Ok() : NotFound();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await repo.DeleteAsync(id);
        return result > 0 ? Ok() : NotFound();
    }
}