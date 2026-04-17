using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Xunit;

namespace RoomPlannerAPI.Tests;

public class AuthControllerTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly JsonSerializerOptions _jsonOpts = new() { PropertyNameCaseInsensitive = true };

    public AuthControllerTests(TestWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    // ── Register ──

    [Fact]
    public async Task Register_ValidCredentials_ReturnsOk()
    {
        var response = await _client.PostAsJsonAsync("/api/auth/register",
            new { Username = "testuser", Password = "pass123" });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal("testuser", body.GetProperty("username").GetString());
        Assert.True(body.GetProperty("id").GetInt32() > 0);
    }

    [Fact]
    public async Task Register_DuplicateUsername_ReturnsConflict()
    {
        var unique = "dupuser_" + Guid.NewGuid().ToString("N")[..8];
        await _client.PostAsJsonAsync("/api/auth/register",
            new { Username = unique, Password = "pass123" });

        var response = await _client.PostAsJsonAsync("/api/auth/register",
            new { Username = unique, Password = "other" });

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Theory]
    [InlineData("", "pass")]
    [InlineData("user", "")]
    [InlineData("", "")]
    [InlineData("   ", "pass")]
    public async Task Register_MissingCredentials_ReturnsBadRequest(string user, string pass)
    {
        var response = await _client.PostAsJsonAsync("/api/auth/register",
            new { Username = user, Password = pass });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    // ── Login ──

    [Fact]
    public async Task Login_ValidCredentials_ReturnsOk()
    {
        var unique = "loginuser_" + Guid.NewGuid().ToString("N")[..8];
        await _client.PostAsJsonAsync("/api/auth/register",
            new { Username = unique, Password = "secret" });

        var response = await _client.PostAsJsonAsync("/api/auth/login",
            new { Username = unique, Password = "secret" });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal(unique, body.GetProperty("username").GetString());
    }

    [Fact]
    public async Task Login_WrongPassword_ReturnsUnauthorized()
    {
        var unique = "wrongpw_" + Guid.NewGuid().ToString("N")[..8];
        await _client.PostAsJsonAsync("/api/auth/register",
            new { Username = unique, Password = "correct" });

        var response = await _client.PostAsJsonAsync("/api/auth/login",
            new { Username = unique, Password = "wrong" });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Login_NonExistentUser_ReturnsUnauthorized()
    {
        var response = await _client.PostAsJsonAsync("/api/auth/login",
            new { Username = "nobody_exists", Password = "pass" });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Theory]
    [InlineData("", "pass")]
    [InlineData("user", "")]
    public async Task Login_MissingCredentials_ReturnsBadRequest(string user, string pass)
    {
        var response = await _client.PostAsJsonAsync("/api/auth/login",
            new { Username = user, Password = pass });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
