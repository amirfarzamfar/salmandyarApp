using System.Threading.Tasks;
using Salmandyar.Application.DTOs.PatientProfile;

namespace Salmandyar.Application.Common.Interfaces;

public interface IPatientProfileService
{
    Task<PatientProfileDto?> GetProfileByUserIdAsync(string userId);
    Task<PatientProfileDto> UpdateProfileAsync(string userId, UpdatePatientProfileDto dto);
    Task<PatientProfileDto> CompleteProfileAsync(string userId);
    Task<bool> HasIncompleteProfileAsync(string userId);
}
