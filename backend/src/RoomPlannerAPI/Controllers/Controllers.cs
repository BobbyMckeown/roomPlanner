using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RoomPlannerAPI.Data;
using RoomPlannerAPI.Models;

namespace RoomPlannerAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    public AuthController(AppDbContext db) => _db = db;

    public record AuthRequest(string Username, string Password);

    [HttpPost("register")]
    public async Task<IActionResult> Register(AuthRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Username) || string.IsNullOrWhiteSpace(req.Password))
            return BadRequest(new { error = "Username and password are required." });

        if (await _db.Users.AnyAsync(u => u.Username == req.Username))
            return Conflict(new { error = "Username taken." });

        var user = new User { Username = req.Username, Password = req.Password };
        _db.Users.Add(user);
        await _db.SaveChangesAsync();
        return Ok(new { user.Id, user.Username });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(AuthRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Username) || string.IsNullOrWhiteSpace(req.Password))
            return BadRequest(new { error = "Username and password are required." });

        var user = await _db.Users.FirstOrDefaultAsync(u =>
            u.Username == req.Username && u.Password == req.Password);

        if (user == null) return Unauthorized(new { error = "Invalid credentials." });
        return Ok(new { user.Id, user.Username });
    }
}

[ApiController]
[Route("api/[controller]")]
public class RoomSavesController : ControllerBase
{
    private readonly AppDbContext _db;
    public RoomSavesController(AppDbContext db) => _db = db;

    public record SaveRequest(int UserId, string RoomName, string RoomData);

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetByUser(int userId) =>
        Ok(await _db.RoomSaves.Where(r => r.UserId == userId).ToListAsync());

    [HttpPost]
    public async Task<IActionResult> Save(SaveRequest req)
    {
        var room = new RoomSave
        {
            UserId = req.UserId,
            RoomName = req.RoomName,
            RoomData = req.RoomData
        };
        _db.RoomSaves.Add(room);
        await _db.SaveChangesAsync();
        return Ok(new { room.Id, room.RoomName });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var room = await _db.RoomSaves.FindAsync(id);
        if (room == null) return NotFound();
        _db.RoomSaves.Remove(room);
        await _db.SaveChangesAsync();
        return Ok();
    }
}
