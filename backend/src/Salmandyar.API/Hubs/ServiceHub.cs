using Microsoft.AspNetCore.SignalR;

namespace Salmandyar.API.Hubs
{
    public class ServiceHub : Hub
    {
        public async Task JoinPatientGroup(string patientId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"Patient_{patientId}");
        }

        public async Task LeavePatientGroup(string patientId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Patient_{patientId}");
        }
    }
}
