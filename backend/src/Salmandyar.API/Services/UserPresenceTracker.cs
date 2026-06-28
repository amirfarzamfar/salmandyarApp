using System.Collections.Concurrent;
using Salmandyar.Application.Services.Users;

namespace Salmandyar.API.Services;

public class UserPresenceTracker : IUserPresenceTracker
{
    private readonly ConcurrentDictionary<string, HashSet<string>> _connectionsByUserId = new(StringComparer.OrdinalIgnoreCase);
    private readonly ConcurrentDictionary<string, string> _userIdByConnectionId = new(StringComparer.OrdinalIgnoreCase);
    private readonly object _sync = new();

    public void MarkOnline(string userId, string connectionId)
    {
        lock (_sync)
        {
            if (!_connectionsByUserId.TryGetValue(userId, out var connections))
            {
                connections = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
                _connectionsByUserId[userId] = connections;
            }

            connections.Add(connectionId);
            _userIdByConnectionId[connectionId] = userId;
        }
    }

    public void MarkOffline(string connectionId)
    {
        lock (_sync)
        {
            if (!_userIdByConnectionId.TryRemove(connectionId, out var userId))
            {
                return;
            }

            if (!_connectionsByUserId.TryGetValue(userId, out var connections))
            {
                return;
            }

            connections.Remove(connectionId);
            if (connections.Count == 0)
            {
                _connectionsByUserId.TryRemove(userId, out _);
            }
        }
    }

    public bool IsOnline(string userId)
    {
        lock (_sync)
        {
            return _connectionsByUserId.TryGetValue(userId, out var connections) && connections.Count > 0;
        }
    }
}
