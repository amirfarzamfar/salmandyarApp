namespace Salmandyar.Domain.Enums;

public enum ContractStatus : byte
{
    Draft = 0,
    PendingCompletion = 1,
    PendingReview = 2,
    Signed = 3,
    Expired = 4,
    Terminated = 5
}

public enum ContractFieldType : byte
{
    Text = 0,
    Number = 1,
    Date = 2,
    Select = 3,
    TextArea = 4
}

public enum ContractAuditActionType : byte
{
    Signed = 1,
    AdminTerminated = 2,
    AdminReopened = 3,
    DraftUpdated = 4
}
