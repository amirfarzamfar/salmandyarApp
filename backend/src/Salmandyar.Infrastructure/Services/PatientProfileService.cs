using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Salmandyar.Application.Common.Interfaces;
using Salmandyar.Application.DTOs.PatientProfile;
using Salmandyar.Domain.Entities.PatientProfile;
using Salmandyar.Infrastructure.Persistence;

namespace Salmandyar.Infrastructure.Services;

public class PatientProfileService : IPatientProfileService
{
    private readonly ApplicationDbContext _context;

    public PatientProfileService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PatientProfileDto?> GetProfileByUserIdAsync(string userId)
    {
        var profile = await _context.PatientProfiles
            .Include(p => p.Address)
            .Include(p => p.EmergencyContact)
            .Include(p => p.MedicalHistory)
            .Include(p => p.ElderlyAssessment)
            .Include(p => p.Allergies)
            .Include(p => p.Documents)
            .FirstOrDefaultAsync(p => p.UserId == userId);

        if (profile == null) return null;

        return MapToDto(profile);
    }

    public async Task<bool> HasIncompleteProfileAsync(string userId)
    {
        var profile = await _context.PatientProfiles
            .FirstOrDefaultAsync(p => p.UserId == userId);
        
        return profile == null || !profile.IsCompleted;
    }

    public async Task<PatientProfileDto> UpdateProfileAsync(string userId, UpdatePatientProfileDto dto)
    {
        var profile = await _context.PatientProfiles
            .Include(p => p.Address)
            .Include(p => p.EmergencyContact)
            .Include(p => p.MedicalHistory)
            .Include(p => p.ElderlyAssessment)
            .Include(p => p.Allergies)
            .Include(p => p.Documents)
            .FirstOrDefaultAsync(p => p.UserId == userId);

        if (profile == null)
        {
            profile = new PatientProfile { UserId = userId, CreatedAt = DateTime.UtcNow };
            _context.PatientProfiles.Add(profile);
        }

        // Common Fields
        if (dto.CurrentStep > profile.CurrentStep)
            profile.CurrentStep = dto.CurrentStep;

        if (dto.DynamicAnswersJson != null)
            profile.DynamicAnswersJson = dto.DynamicAnswersJson;

        // Calculate completion percentage based on CurrentStep (max 8 steps)
        profile.CompletionPercentage = (int)((profile.CurrentStep / 8.0) * 100);
        if (profile.CompletionPercentage > 100) profile.CompletionPercentage = 100;

        profile.LastUpdatedAt = DateTime.UtcNow;

        // Step 1
        if (dto.NationalCode != null) profile.NationalCode = dto.NationalCode;
        if (dto.Gender != null) profile.Gender = dto.Gender;
        if (dto.DateOfBirth != null) profile.DateOfBirth = dto.DateOfBirth;
        if (dto.FatherName != null) profile.FatherName = dto.FatherName;
        if (dto.MaritalStatus != null) profile.MaritalStatus = dto.MaritalStatus;
        if (dto.Nationality != null) profile.Nationality = dto.Nationality;
        if (dto.ProfileImageUrl != null) profile.ProfileImageUrl = dto.ProfileImageUrl;

        // Step 2
        if (dto.MobileNumber != null) profile.MobileNumber = dto.MobileNumber;

        if (dto.Address != null)
        {
            if (profile.Address == null) profile.Address = new Address();
            profile.Address.State = dto.Address.State;
            profile.Address.City = dto.Address.City;
            profile.Address.FullAddress = dto.Address.FullAddress;
            profile.Address.PostalCode = dto.Address.PostalCode;
            profile.Address.Latitude = dto.Address.Latitude;
            profile.Address.Longitude = dto.Address.Longitude;
        }

        if (dto.EmergencyContact != null)
        {
            if (profile.EmergencyContact == null) profile.EmergencyContact = new EmergencyContact();
            profile.EmergencyContact.Name = dto.EmergencyContact.Name;
            profile.EmergencyContact.PhoneNumber = dto.EmergencyContact.PhoneNumber;
            profile.EmergencyContact.Relationship = dto.EmergencyContact.Relationship;
        }

        // Step 3
        if (dto.Height != null) profile.Height = dto.Height;
        if (dto.Weight != null) profile.Weight = dto.Weight;
        if (dto.BloodGroup != null) profile.BloodGroup = dto.BloodGroup;
        if (dto.MobilityStatus != null) profile.MobilityStatus = dto.MobilityStatus;
        if (dto.UsesWheelchair.HasValue) profile.UsesWheelchair = dto.UsesWheelchair.Value;
        if (dto.UsesWalker.HasValue) profile.UsesWalker = dto.UsesWalker.Value;
        if (dto.WalkingAbility != null) profile.WalkingAbility = dto.WalkingAbility;

        // Step 4
        if (dto.MedicalHistory != null)
        {
            if (profile.MedicalHistory == null) profile.MedicalHistory = new MedicalHistory();
            profile.MedicalHistory.HasDiabetes = dto.MedicalHistory.HasDiabetes;
            profile.MedicalHistory.HasHypertension = dto.MedicalHistory.HasHypertension;
            profile.MedicalHistory.HasHeartDisease = dto.MedicalHistory.HasHeartDisease;
            profile.MedicalHistory.HasCOPD = dto.MedicalHistory.HasCOPD;
            profile.MedicalHistory.HasAsthma = dto.MedicalHistory.HasAsthma;
            profile.MedicalHistory.HasKidneyFailure = dto.MedicalHistory.HasKidneyFailure;
            profile.MedicalHistory.HasStroke = dto.MedicalHistory.HasStroke;
            profile.MedicalHistory.HasAlzheimers = dto.MedicalHistory.HasAlzheimers;
            profile.MedicalHistory.HasParkinsons = dto.MedicalHistory.HasParkinsons;
            profile.MedicalHistory.HasCancer = dto.MedicalHistory.HasCancer;
            profile.MedicalHistory.HasPsychiatricDisorders = dto.MedicalHistory.HasPsychiatricDisorders;
            profile.MedicalHistory.OtherDiseases = dto.MedicalHistory.OtherDiseases;
        }

        // Step 5
        if (dto.Allergies != null)
        {
            _context.Allergies.RemoveRange(profile.Allergies);
            foreach (var allergy in dto.Allergies)
            {
                profile.Allergies.Add(new Allergy
                {
                    AllergyType = allergy.AllergyType,
                    Description = allergy.Description
                });
            }
        }

        // Step 6
        if (dto.AttendingPhysician != null) profile.AttendingPhysician = dto.AttendingPhysician;
        if (dto.PhysicianPhone != null) profile.PhysicianPhone = dto.PhysicianPhone;
        if (dto.PreviousHospital != null) profile.PreviousHospital = dto.PreviousHospital;
        if (dto.HospitalizationHistory != null) profile.HospitalizationHistory = dto.HospitalizationHistory;
        if (dto.SurgeryHistory != null) profile.SurgeryHistory = dto.SurgeryHistory;
        if (dto.HasHomeOxygen.HasValue) profile.HasHomeOxygen = dto.HasHomeOxygen.Value;
        if (dto.HasVentilator.HasValue) profile.HasVentilator = dto.HasVentilator.Value;
        if (dto.HasTracheostomy.HasValue) profile.HasTracheostomy = dto.HasTracheostomy.Value;
        if (dto.HasPEG.HasValue) profile.HasPEG = dto.HasPEG.Value;
        if (dto.HasUrinaryCatheter.HasValue) profile.HasUrinaryCatheter = dto.HasUrinaryCatheter.Value;
        if (dto.HasBedsore.HasValue) profile.HasBedsore = dto.HasBedsore.Value;

        // Step 7
        if (dto.ElderlyAssessment != null)
        {
            if (profile.ElderlyAssessment == null) profile.ElderlyAssessment = new ElderlyAssessment();
            profile.ElderlyAssessment.ConsciousnessLevel = dto.ElderlyAssessment.ConsciousnessLevel;
            profile.ElderlyAssessment.DailyActivityAbility = dto.ElderlyAssessment.DailyActivityAbility;
            profile.ElderlyAssessment.FallRisk = dto.ElderlyAssessment.FallRisk;
            profile.ElderlyAssessment.SwallowingDisorder = dto.ElderlyAssessment.SwallowingDisorder;
            profile.ElderlyAssessment.NutritionStatus = dto.ElderlyAssessment.NutritionStatus;
            profile.ElderlyAssessment.HasUrinaryIncontinence = dto.ElderlyAssessment.HasUrinaryIncontinence;
            profile.ElderlyAssessment.HasFecalIncontinence = dto.ElderlyAssessment.HasFecalIncontinence;
        }

        // Step 8
        if (dto.Documents != null)
        {
            foreach (var doc in dto.Documents)
            {
                if (!profile.Documents.Any(d => d.FileUrl == doc.FileUrl))
                {
                    profile.Documents.Add(new UploadedDocument
                    {
                        DocumentType = doc.DocumentType,
                        FileUrl = doc.FileUrl,
                        UploadDate = DateTime.UtcNow
                    });
                }
            }
        }

        await _context.SaveChangesAsync();
        return MapToDto(profile);
    }

    public async Task<PatientProfileDto> CompleteProfileAsync(string userId)
    {
        var profile = await _context.PatientProfiles
            .Include(p => p.Address)
            .Include(p => p.EmergencyContact)
            .Include(p => p.MedicalHistory)
            .Include(p => p.ElderlyAssessment)
            .Include(p => p.Allergies)
            .Include(p => p.Documents)
            .FirstOrDefaultAsync(p => p.UserId == userId);

        if (profile == null) throw new Exception("Profile not found");

        profile.IsCompleted = true;
        profile.CompletionPercentage = 100;
        await _context.SaveChangesAsync();

        return MapToDto(profile);
    }

    private PatientProfileDto MapToDto(PatientProfile profile)
    {
        return new PatientProfileDto
        {
            Id = profile.Id,
            UserId = profile.UserId,
            NationalCode = profile.NationalCode,
            Gender = profile.Gender,
            DateOfBirth = profile.DateOfBirth,
            FatherName = profile.FatherName,
            MaritalStatus = profile.MaritalStatus,
            Nationality = profile.Nationality,
            ProfileImageUrl = profile.ProfileImageUrl,
            MobileNumber = profile.MobileNumber,
            Height = profile.Height,
            Weight = profile.Weight,
            BloodGroup = profile.BloodGroup,
            MobilityStatus = profile.MobilityStatus,
            UsesWheelchair = profile.UsesWheelchair,
            UsesWalker = profile.UsesWalker,
            WalkingAbility = profile.WalkingAbility,
            AttendingPhysician = profile.AttendingPhysician,
            PhysicianPhone = profile.PhysicianPhone,
            PreviousHospital = profile.PreviousHospital,
            HospitalizationHistory = profile.HospitalizationHistory,
            SurgeryHistory = profile.SurgeryHistory,
            HasHomeOxygen = profile.HasHomeOxygen,
            HasVentilator = profile.HasVentilator,
            HasTracheostomy = profile.HasTracheostomy,
            HasPEG = profile.HasPEG,
            HasUrinaryCatheter = profile.HasUrinaryCatheter,
            HasBedsore = profile.HasBedsore,
            DynamicAnswersJson = profile.DynamicAnswersJson,
            CompletionPercentage = profile.CompletionPercentage,
            CurrentStep = profile.CurrentStep,
            IsCompleted = profile.IsCompleted,
            LastUpdatedAt = profile.LastUpdatedAt,
            Address = profile.Address == null ? null : new AddressDto
            {
                Id = profile.Address.Id,
                State = profile.Address.State,
                City = profile.Address.City,
                FullAddress = profile.Address.FullAddress,
                PostalCode = profile.Address.PostalCode,
                Latitude = profile.Address.Latitude,
                Longitude = profile.Address.Longitude
            },
            EmergencyContact = profile.EmergencyContact == null ? null : new EmergencyContactDto
            {
                Id = profile.EmergencyContact.Id,
                Name = profile.EmergencyContact.Name,
                PhoneNumber = profile.EmergencyContact.PhoneNumber,
                Relationship = profile.EmergencyContact.Relationship
            },
            MedicalHistory = profile.MedicalHistory == null ? null : new MedicalHistoryDto
            {
                Id = profile.MedicalHistory.Id,
                HasDiabetes = profile.MedicalHistory.HasDiabetes,
                HasHypertension = profile.MedicalHistory.HasHypertension,
                HasHeartDisease = profile.MedicalHistory.HasHeartDisease,
                HasCOPD = profile.MedicalHistory.HasCOPD,
                HasAsthma = profile.MedicalHistory.HasAsthma,
                HasKidneyFailure = profile.MedicalHistory.HasKidneyFailure,
                HasStroke = profile.MedicalHistory.HasStroke,
                HasAlzheimers = profile.MedicalHistory.HasAlzheimers,
                HasParkinsons = profile.MedicalHistory.HasParkinsons,
                HasCancer = profile.MedicalHistory.HasCancer,
                HasPsychiatricDisorders = profile.MedicalHistory.HasPsychiatricDisorders,
                OtherDiseases = profile.MedicalHistory.OtherDiseases
            },
            ElderlyAssessment = profile.ElderlyAssessment == null ? null : new ElderlyAssessmentDto
            {
                Id = profile.ElderlyAssessment.Id,
                ConsciousnessLevel = profile.ElderlyAssessment.ConsciousnessLevel,
                DailyActivityAbility = profile.ElderlyAssessment.DailyActivityAbility,
                FallRisk = profile.ElderlyAssessment.FallRisk,
                SwallowingDisorder = profile.ElderlyAssessment.SwallowingDisorder,
                NutritionStatus = profile.ElderlyAssessment.NutritionStatus,
                HasUrinaryIncontinence = profile.ElderlyAssessment.HasUrinaryIncontinence,
                HasFecalIncontinence = profile.ElderlyAssessment.HasFecalIncontinence
            },
            Allergies = profile.Allergies.Select(a => new AllergyDto
            {
                Id = a.Id,
                AllergyType = a.AllergyType,
                Description = a.Description
            }).ToList(),
            Documents = profile.Documents.Select(d => new UploadedDocumentDto
            {
                Id = d.Id,
                DocumentType = d.DocumentType,
                FileUrl = d.FileUrl,
                UploadDate = d.UploadDate
            }).ToList()
        };
    }
}
