namespace RoomPlannerAPI.Models;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class RoomSave
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string RoomName { get; set; } = string.Empty;
    public string RoomData { get; set; } = string.Empty;
    public DateTime SavedAt { get; set; } = DateTime.UtcNow;
}
