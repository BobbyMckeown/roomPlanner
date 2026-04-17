using Microsoft.EntityFrameworkCore;
using RoomPlannerAPI.Data;
using RoomPlannerAPI.Models;
using Xunit;

namespace RoomPlannerAPI.Tests;

public class ModelTests
{
    private AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase("ModelTests_" + Guid.NewGuid())
            .Options;
        var ctx = new AppDbContext(options);
        ctx.Database.EnsureCreated();
        return ctx;
    }

    [Fact]
    public void User_DefaultValues_AreCorrect()
    {
        var user = new User();
        Assert.Equal(0, user.Id);
        Assert.Equal(string.Empty, user.Username);
        Assert.Equal(string.Empty, user.Password);
    }

    [Fact]
    public void RoomSave_DefaultValues_AreCorrect()
    {
        var room = new RoomSave();
        Assert.Equal(0, room.Id);
        Assert.Equal(0, room.UserId);
        Assert.Equal(string.Empty, room.RoomName);
        Assert.Equal(string.Empty, room.RoomData);
        Assert.True(room.SavedAt <= DateTime.UtcNow);
        Assert.True(room.SavedAt > DateTime.UtcNow.AddMinutes(-1));
    }

    [Fact]
    public async Task AppDbContext_CanAddAndRetrieveUser()
    {
        using var ctx = CreateContext();
        ctx.Users.Add(new User { Username = "alice", Password = "pw" });
        await ctx.SaveChangesAsync();

        var user = await ctx.Users.FirstOrDefaultAsync(u => u.Username == "alice");
        Assert.NotNull(user);
        Assert.Equal("alice", user.Username);
    }

    [Fact]
    public async Task AppDbContext_CanAddAndRetrieveRoomSave()
    {
        using var ctx = CreateContext();
        ctx.RoomSaves.Add(new RoomSave
        {
            UserId = 1,
            RoomName = "Kitchen",
            RoomData = "{\"roomPoints\":[0,0,50,50]}"
        });
        await ctx.SaveChangesAsync();

        var room = await ctx.RoomSaves.FirstOrDefaultAsync(r => r.RoomName == "Kitchen");
        Assert.NotNull(room);
        Assert.Equal(1, room.UserId);
        Assert.Contains("roomPoints", room.RoomData);
    }

    [Fact]
    public async Task AppDbContext_AutoGeneratesId()
    {
        using var ctx = CreateContext();
        var user = new User { Username = "bob", Password = "pw" };
        ctx.Users.Add(user);
        await ctx.SaveChangesAsync();

        Assert.True(user.Id > 0);
    }
}
