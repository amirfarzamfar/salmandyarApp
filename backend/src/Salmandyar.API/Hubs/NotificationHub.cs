using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Salmandyar.Application.Services.Users;
using System.Security.Claims;

namespace Salmandyar.API.Hubs;

[Authorize]
public class NotificationHub : Hub
{
    private readonly IUserPresenceTracker _presenceTracker;

    public NotificationHub(IUserPresenceTracker presenceTracker)
    {
        _presenceTracker = presenceTracker;
    }

    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!string.IsNullOrWhiteSpace(userId))
        {
            _presenceTracker.MarkOnline(userId, Context.ConnectionId);
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        _presenceTracker.MarkOffline(Context.ConnectionId);
        await base.OnDisconnectedAsync(exception);
    }

    public async Task JoinMyGroup()
    {
        var userId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId)) return;
        await Groups.AddToGroupAsync(Context.ConnectionId, $"User_{userId}");
    }

    public async Task LeaveMyGroup()
    {
        var userId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId)) return;
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"User_{userId}");
    }
}
