using Microsoft.EntityFrameworkCore;
using RoomPlannerAPI.Data;

var builder = WebApplication.CreateBuilder(args);

var dbFolder = Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "..", "database");
Directory.CreateDirectory(dbFolder);
var dbPath = Path.GetFullPath(Path.Combine(dbFolder, "roomPlanner.db"));

builder.Services.AddDbContext<AppDbContext>(o =>
    o.UseSqlite($"Data Source={dbPath}"));
builder.Services.AddControllers();
builder.Services.AddCors(o => o.AddDefaultPolicy(p =>
    p.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));

var app = builder.Build();

using (var scope = app.Services.CreateScope())
    scope.ServiceProvider.GetRequiredService<AppDbContext>().Database.EnsureCreated();

app.UseCors();
app.MapControllers();
app.Run("http://localhost:5000");
