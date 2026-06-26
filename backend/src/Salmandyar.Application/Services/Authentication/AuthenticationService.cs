using System.Security.Cryptography;
using System.Text;
using Salmandyar.Application.Common.Interfaces.Authentication;
using Salmandyar.Application.Common.Interfaces.Identity;
using Salmandyar.Application.Services.Authentication.Dtos;
using Salmandyar.Application.Services.Notifications;
using Salmandyar.Application.Services.Patients;
using Salmandyar.Application.Services.Settings;
using Salmandyar.Domain.Constants;
using Salmandyar.Domain.Entities;

namespace Salmandyar.Application.Services.Authentication;

public class AuthenticationService : IAuthenticationService
{
    private const string SmsChannel = "sms";
    private const string EmailChannel = "email";

    private readonly IIdentityService _identityService;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly IPatientService _patientService;
    private readonly IOtpLoginChallengeStore _otpLoginChallengeStore;
    private readonly IOtpLoginSettingsService _otpLoginSettingsService;
    private readonly INotificationSettingsService _notificationSettingsService;
    private readonly INotificationService _notificationService;

    public AuthenticationService(
        IIdentityService identityService,
        IJwtTokenGenerator jwtTokenGenerator,
        IPatientService patientService,
        IOtpLoginChallengeStore otpLoginChallengeStore,
        IOtpLoginSettingsService otpLoginSettingsService,
        INotificationSettingsService notificationSettingsService,
        INotificationService notificationService)
    {
        _identityService = identityService;
        _jwtTokenGenerator = jwtTokenGenerator;
        _patientService = patientService;
        _otpLoginChallengeStore = otpLoginChallengeStore;
        _otpLoginSettingsService = otpLoginSettingsService;
        _notificationSettingsService = notificationSettingsService;
        _notificationService = notificationService;
    }

    public async Task<AuthenticationResponse> RegisterAsync(RegisterRequest request)
    {
        if (!string.IsNullOrEmpty(request.Email))
        {
            var existingUserByEmail = await _identityService.GetUserByEmailAsync(request.Email);
            if (existingUserByEmail != null)
            {
                throw new Exception("کاربری با این ایمیل قبلاً ثبت نام کرده است.");
            }
        }

        var existingUserByPhone = await _identityService.GetUserByIdentifierAsync(request.PhoneNumber);
        if (existingUserByPhone != null)
        {
            throw new Exception("کاربری با این شماره تلفن قبلاً ثبت نام کرده است.");
        }

        var user = new User
        {
            UserName = request.PhoneNumber, // Use phone number as username
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            PhoneNumber = request.PhoneNumber
        };

        var (success, errors) = await _identityService.CreateUserAsync(user, request.Password, request.Role);
        if (!success)
        {
            throw new Exception($"ثبت‌نام با خطا مواجه شد: {string.Join(", ", errors)}");
        }

        if (request.Role == Roles.Patient || request.Role == Roles.Elderly)
        {
            await _patientService.CreatePatientForUserAsync(user.Id, request.FirstName, request.LastName);
        }

        var token = _jwtTokenGenerator.GenerateToken(user, new[] { request.Role });

        return new AuthenticationResponse(
            user.Id,
            user.FirstName,
            user.LastName,
            user.Email ?? string.Empty,
            user.PhoneNumber ?? string.Empty,
            request.Role,
            token
        );
    }

    public async Task<AuthenticationResponse> LoginAsync(LoginRequest request)
    {
        var user = await _identityService.GetUserByIdentifierAsync(request.Identifier);
        if (user == null)
        {
            throw new Exception("نام کاربری یا رمز عبور اشتباه است.");
        }

        var isValidPassword = await _identityService.CheckPasswordAsync(user, request.Password);
        if (!isValidPassword)
        {
            throw new Exception("نام کاربری یا رمز عبور اشتباه است.");
        }

        return await BuildAuthenticationResponseAsync(user);
    }

    public async Task RequestOtpLoginAsync(RequestOtpLoginRequest request)
    {
        var otpSettings = await _otpLoginSettingsService.GetSettingsEntityAsync();
        EnsureOtpLoginEnabled(otpSettings);

        var channel = NormalizeChannel(request.Channel);
        EnsureSupportedChannel(channel, otpSettings);

        var identifier = NormalizeIdentifier(request.Identifier);
        var user = await _identityService.GetUserByIdentifierAsync(identifier);
        if (user == null || !user.IsActive)
        {
            return;
        }

        var notificationSettings = await _notificationSettingsService.GetSettingsEntityAsync();
        if (!IsDeliveryConfigured(channel, notificationSettings))
        {
            return;
        }

        var destination = GetDestination(user, channel);
        if (string.IsNullOrWhiteSpace(destination))
        {
            return;
        }

        var nowUtc = DateTime.UtcNow;
        var cooldownThresholdUtc = nowUtc.AddSeconds(-otpSettings.ResendCooldownSeconds);
        var hasRecentChallenge = await _otpLoginChallengeStore.HasRecentActiveChallengeAsync(user.Id, channel, cooldownThresholdUtc);
        if (hasRecentChallenge)
        {
            return;
        }

        var code = GenerateNumericCode(otpSettings.CodeLength);
        var codeHash = HashCode(code);

        await _otpLoginChallengeStore.UpsertChallengeAsync(
            user.Id,
            identifier,
            channel,
            codeHash,
            otpSettings.MaxVerifyAttempts,
            nowUtc,
            nowUtc.AddMinutes(otpSettings.CodeExpiryMinutes));

        await SendOtpAsync(channel, destination, code, otpSettings.CodeExpiryMinutes);
    }

    public async Task<AuthenticationResponse> VerifyOtpLoginAsync(VerifyOtpLoginRequest request)
    {
        var otpSettings = await _otpLoginSettingsService.GetSettingsEntityAsync();
        EnsureOtpLoginEnabled(otpSettings);

        var channel = NormalizeChannel(request.Channel);
        EnsureSupportedChannel(channel, otpSettings);

        var identifier = NormalizeIdentifier(request.Identifier);
        var user = await _identityService.GetUserByIdentifierAsync(identifier);
        if (user == null || !user.IsActive)
        {
            throw new Exception("کد ورود نامعتبر یا منقضی است.");
        }

        var destination = GetDestination(user, channel);
        if (string.IsNullOrWhiteSpace(destination))
        {
            throw new Exception("کد ورود نامعتبر یا منقضی است.");
        }

        var isValid = await _otpLoginChallengeStore.VerifyChallengeAsync(
            user.Id,
            identifier,
            channel,
            HashCode(request.Code.Trim()),
            DateTime.UtcNow);

        if (!isValid)
        {
            throw new Exception("کد ورود نامعتبر یا منقضی است.");
        }

        return await BuildAuthenticationResponseAsync(user);
    }

    public async Task ChangePasswordAsync(ChangePasswordRequest request)
    {
        var user = await _identityService.GetUserByIdAsync(request.UserId);
        if (user == null)
        {
            throw new Exception("کاربر یافت نشد.");
        }

        var (success, errors) = await _identityService.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
        if (!success)
        {
            throw new Exception($"تغییر رمز عبور با خطا مواجه شد: {string.Join(", ", errors)}");
        }
    }

    public async Task<string> ForgotPasswordAsync(ForgotPasswordRequest request)
    {
        var identifier = NormalizeIdentifier(request.Identifier);
        var user = await _identityService.GetUserByIdentifierAsync(identifier);
        if (user == null)
        {
            return string.Empty;
        }

        var token = await _identityService.GeneratePasswordResetTokenAsync(user);
        if (!string.IsNullOrWhiteSpace(user.Email) &&
            (identifier.Contains('@') || string.Equals(identifier, user.Email, StringComparison.OrdinalIgnoreCase)))
        {
            await _notificationService.SendEmailAsync(
                user.Email,
                "کد بازیابی رمز عبور سالمندیار",
                $"کد بازیابی شما: {token}",
                new NotificationSendContext
                {
                    EventKey = NotificationEventKeys.PasswordReset,
                    EventDisplayName = "بازیابی رمز عبور"
                });
        }
        else if (!string.IsNullOrWhiteSpace(user.PhoneNumber))
        {
            await _notificationService.SendSmsAsync(user.PhoneNumber, $"کد بازیابی سالمندیار: {token}", new NotificationSendContext
            {
                EventKey = NotificationEventKeys.PasswordReset,
                EventDisplayName = "بازیابی رمز عبور"
            });
        }

        return string.Empty;
    }

    public async Task ResetPasswordAsync(ResetPasswordRequest request)
    {
        var user = await _identityService.GetUserByIdentifierAsync(request.Identifier);
        if (user == null)
        {
            throw new Exception("کاربر یافت نشد.");
        }

        var (success, errors) = await _identityService.ResetPasswordAsync(user, request.Token, request.NewPassword);
        if (!success)
        {
            throw new Exception($"بازیابی رمز عبور با خطا مواجه شد: {string.Join(", ", errors)}");
        }
    }

    private async Task<AuthenticationResponse> BuildAuthenticationResponseAsync(User user)
    {
        var roles = await _identityService.GetUserRolesAsync(user);
        var token = _jwtTokenGenerator.GenerateToken(user, roles);

        return new AuthenticationResponse(
            user.Id,
            user.FirstName,
            user.LastName,
            user.Email ?? string.Empty,
            user.PhoneNumber ?? string.Empty,
            roles.FirstOrDefault() ?? string.Empty,
            token
        );
    }

    private static void EnsureOtpLoginEnabled(OtpLoginSettings settings)
    {
        if (!settings.IsEnabled)
        {
            throw new Exception("ورود با رمز یکبار مصرف در حال حاضر غیرفعال است.");
        }
    }

    private static void EnsureSupportedChannel(string channel, OtpLoginSettings settings)
    {
        var isSupportedChannel = channel is SmsChannel or EmailChannel;
        var isAllowed = channel == SmsChannel ? settings.AllowSms : settings.AllowEmail;

        if (!isSupportedChannel || !isAllowed)
        {
            throw new Exception("کانال انتخابی برای ورود با رمز یکبار مصرف فعال نیست.");
        }
    }

    private static string NormalizeIdentifier(string identifier)
    {
        return identifier.Trim();
    }

    private static string NormalizeChannel(string channel)
    {
        return channel.Trim().ToLowerInvariant();
    }

    private static string? GetDestination(User user, string channel)
    {
        return channel switch
        {
            SmsChannel => user.PhoneNumber,
            EmailChannel => user.Email,
            _ => null
        };
    }

    private static string GenerateNumericCode(int length)
    {
        var digits = new char[length];
        Span<byte> buffer = stackalloc byte[length];
        RandomNumberGenerator.Fill(buffer);

        for (var i = 0; i < length; i++)
        {
            digits[i] = (char)('0' + (buffer[i] % 10));
        }

        return new string(digits);
    }

    private static string HashCode(string code)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(code));
        return Convert.ToHexString(bytes);
    }

    private static bool IsDeliveryConfigured(string channel, NotificationSettings settings)
    {
        return channel switch
        {
            SmsChannel => settings.SmsEnabled,
            EmailChannel => settings.EmailEnabled,
            _ => false
        };
    }

    private Task SendOtpAsync(string channel, string destination, string code, int expiryMinutes)
    {
        if (channel == SmsChannel)
        {
            return _notificationService.SendSmsAsync(destination, $"کد ورود سالمندیار: {code} - این کد تا {expiryMinutes} دقیقه معتبر است.", new NotificationSendContext
            {
                EventKey = NotificationEventKeys.OtpLogin,
                EventDisplayName = "ورود با رمز یکبار مصرف"
            });
        }

        return _notificationService.SendEmailAsync(
            destination,
            "کد ورود سالمندیار",
            $"کد ورود شما: {code}\nاین کد تا {expiryMinutes} دقیقه معتبر است.",
            new NotificationSendContext
            {
                EventKey = NotificationEventKeys.OtpLogin,
                EventDisplayName = "ورود با رمز یکبار مصرف"
            });
    }
}
