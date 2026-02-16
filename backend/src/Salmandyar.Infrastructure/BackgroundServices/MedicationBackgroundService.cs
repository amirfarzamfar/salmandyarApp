using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Salmandyar.Application.Services.Medications;

namespace Salmandyar.Infrastructure.BackgroundServices;

public class MedicationBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<MedicationBackgroundService> _logger;

    public MedicationBackgroundService(IServiceProvider serviceProvider, ILogger<MedicationBackgroundService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("MedicationBackgroundService started.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using (var scope = _serviceProvider.CreateScope())
                {
                    var medicationService = scope.ServiceProvider.GetRequiredService<IMedicationService>();
                    
                    await medicationService.SendRemindersAsync();
                    await medicationService.CheckMissedDosesAndEscalateAsync();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred in MedicationBackgroundService.");
            }

            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
        }
    }
}
