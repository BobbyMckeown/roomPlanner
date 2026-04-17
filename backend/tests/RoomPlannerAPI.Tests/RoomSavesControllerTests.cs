using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Xunit;

namespace RoomPlannerAPI.Tests;

public class RoomSavesControllerTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;

    public RoomSavesControllerTests(TestWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    private async Task<int> CreateTestUser()
    {
        var unique = "roomuser_" + Guid.NewGuid().ToString("N")[..8];
        var response = await _client.PostAsJsonAsync("/api/auth/register",
            new { Username = unique, Password = "pass" });
        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        return body.GetProperty("id").GetInt32();
    }

    // ── Save ──

    [Fact]
    public async Task Save_ValidRoom_ReturnsOk()
    {
        var userId = await CreateTestUser();
        var roomData = JsonSerializer.Serialize(new { roomPoints = new[] { 0, 0, 100, 0, 100, 100 } });

        var response = await _client.PostAsJsonAsync("/api/roomsaves",
            new { UserId = userId, RoomName = "Living Room", RoomData = roomData });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal("Living Room", body.GetProperty("roomName").GetString());
        Assert.True(body.GetProperty("id").GetInt32() > 0);
    }

    // ── Get by User ──

    [Fact]
    public async Task GetByUser_ReturnsUserRooms()
    {
        var userId = await CreateTestUser();

        // Save two rooms
        await _client.PostAsJsonAsync("/api/roomsaves",
            new { UserId = userId, RoomName = "Room A", RoomData = "{}" });
        await _client.PostAsJsonAsync("/api/roomsaves",
            new { UserId = userId, RoomName = "Room B", RoomData = "{}" });

        var response = await _client.GetAsync($"/api/roomsaves/user/{userId}");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var rooms = await response.Content.ReadFromJsonAsync<JsonElement[]>();
        Assert.NotNull(rooms);
        Assert.Equal(2, rooms.Length);
    }

    [Fact]
    public async Task GetByUser_NoRooms_ReturnsEmptyArray()
    {
        var userId = await CreateTestUser();

        var response = await _client.GetAsync($"/api/roomsaves/user/{userId}");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var rooms = await response.Content.ReadFromJsonAsync<JsonElement[]>();
        Assert.NotNull(rooms);
        Assert.Empty(rooms);
    }

    // ── Delete ──

    [Fact]
    public async Task Delete_ExistingRoom_ReturnsOk()
    {
        var userId = await CreateTestUser();

        var saveResp = await _client.PostAsJsonAsync("/api/roomsaves",
            new { UserId = userId, RoomName = "Deletable", RoomData = "{}" });
        var saved = await saveResp.Content.ReadFromJsonAsync<JsonElement>();
        var roomId = saved.GetProperty("id").GetInt32();

        var deleteResp = await _client.DeleteAsync($"/api/roomsaves/{roomId}");
        Assert.Equal(HttpStatusCode.OK, deleteResp.StatusCode);

        // Verify it's gone
        var rooms = await _client.GetFromJsonAsync<JsonElement[]>($"/api/roomsaves/user/{userId}");
        Assert.NotNull(rooms);
        Assert.Empty(rooms);
    }

    [Fact]
    public async Task Delete_NonExistentRoom_ReturnsNotFound()
    {
        var response = await _client.DeleteAsync("/api/roomsaves/99999");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    // ── Isolation: users only see their own rooms ──

    [Fact]
    public async Task GetByUser_DoesNotReturnOtherUsersRooms()
    {
        var user1 = await CreateTestUser();
        var user2 = await CreateTestUser();

        await _client.PostAsJsonAsync("/api/roomsaves",
            new { UserId = user1, RoomName = "User1 Room", RoomData = "{}" });
        await _client.PostAsJsonAsync("/api/roomsaves",
            new { UserId = user2, RoomName = "User2 Room", RoomData = "{}" });

        var rooms1 = await _client.GetFromJsonAsync<JsonElement[]>($"/api/roomsaves/user/{user1}");
        Assert.NotNull(rooms1);
        Assert.Single(rooms1);
        Assert.Equal("User1 Room", rooms1[0].GetProperty("roomName").GetString());
    }
}
