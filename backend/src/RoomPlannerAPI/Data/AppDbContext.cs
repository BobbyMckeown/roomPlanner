using Microsoft.EntityFrameworkCore;
using RoomPlannerAPI.Models;

namespace RoomPlannerAPI.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<RoomSave> RoomSaves => Set<RoomSave>();
}
