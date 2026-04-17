using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using RoomPlannerAPI.Data;

namespace RoomPlannerAPI.Tests;

public class TestWebApplicationFactory : WebApplicationFactory<Program>
{
    private readonly string _dbName = "TestDb_" + Guid.NewGuid();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            // Remove ALL existing DbContext registrations
            var descriptors = services.Where(
                d => d.ServiceType == typeof(DbContextOptions<AppDbContext>)
                  || d.ServiceType == typeof(DbContextOptions)
                  || d.ServiceType == typeof(AppDbContext))
                .ToList();
            foreach (var d in descriptors)
                services.Remove(d);

            // Use in-memory database for tests
            services.AddDbContext<AppDbContext>(options =>
                options.UseInMemoryDatabase(_dbName));
        });
    }
}
