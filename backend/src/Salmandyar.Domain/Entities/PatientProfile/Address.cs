namespace Salmandyar.Domain.Entities.PatientProfile;

public class Address
{
    public int Id { get; set; }
    public int PatientProfileId { get; set; }
    public virtual PatientProfile PatientProfile { get; set; } = null!;

    public string? State { get; set; }
    public string? City { get; set; }
    public string? FullAddress { get; set; }
    public string? PostalCode { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
}
