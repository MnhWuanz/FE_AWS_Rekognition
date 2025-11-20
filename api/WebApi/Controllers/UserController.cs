using Microsoft.AspNetCore.Mvc;
using WebApi.Models;
using WebApi.Services.Interface;

namespace WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController(IUsersRepository repo) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var users = await repo.GetAllAsync();
        return Ok(users);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var users = await repo.GetByIdAsync(id);
        return users == null ? NotFound() : Ok(users);
    }

    [HttpPost]
    public async Task<IActionResult> Add(User user)
    {
        var id = await repo.AddAsync(user);
        return Ok(new { id });
    }

    [HttpPut]
    public async Task<IActionResult> Update(User user)
    {
        var result = await repo.UpdateAsync(user);
        return result > 0 ? Ok() : NotFound();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await repo.DeleteAsync(id);
        return result > 0 ? Ok() : NotFound();
    }
}