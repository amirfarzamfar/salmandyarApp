using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System.Text;
using System.Text.Json;
using Salmandyar.Application.Services.Medications;

namespace Salmandyar.Infrastructure.BackgroundServices;

public class MedicationBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<MedicationBackgroundService> _logger;

    // #region debug-point C:medication-service
    private static async Task ReportDebugAsync(string hypothesisId, string msg, object? data = null, string location = "MedicationBackgroundService.cs")
    {
        try
        {
            var envPath = Path.Combine(Directory.GetCurrentDirectory(), ".dbg", "backend-postgres-startup.env");
            var url = "http://127.0.0.1:7777/event";
            var sessionId = "backend-postgres-startup";
            if (File.Exists(envPath))
            {
                foreach (var line in await File.ReadAllLinesAsync(envPath))
                {
                    if (line.StartsWith("DEBUG_SERVER_URL=", StringComparison.Ordinal))
                        url = line["DEBUG_SERVER_URL=".Length..].Trim();
                    else if (line.StartsWith("DEBUG_SESSION_ID=", StringComparison.Ordinal))
                        sessionId = line["DEBUG_SESSION_ID=".Length..].Trim();
                }
            }

            using var client = new HttpClient();
            using var content = new StringContent(
                JsonSerializer.Serialize(new
                {
                    sessionId,
                    runId = "pre-fix",
                    hypothesisId,
                    location,
                    msg = $"[DEBUG] {msg}",
                    data,
                    ts = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
                }),
                Encoding.UTF8,
                "application/json");
            await client.PostAsync(url, content);
        }
        catch
        {
        }
    }
    // #endregion

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
                    // #region debug-point C:medication-loop
                    await ReportDebugAsync("C", "medication background loop started");
                    // #endregion
                    await medicationService.SendRemindersAsync();
                    await medicationService.CheckMissedDosesAndEscalateAsync();
                    // #region debug-point C:medication-loop-done
                    await ReportDebugAsync("C", "medication background loop completed");
                    // #endregion
                }
            }
            catch (Exception ex)
            {
                // #region debug-point C:medication-error
                await ReportDebugAsync("C", "medication background loop failed", new
                {
                    exceptionType = ex.GetType().FullName,
                    ex.Message,
                    inner = ex.InnerException?.Message
                });
                // #endregion
                _logger.LogError(ex, "Error occurred in MedicationBackgroundService.");
            }

            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
        }
    }
}
