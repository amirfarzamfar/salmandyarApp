using Microsoft.AspNetCore.Identity;

namespace Salmandyar.Infrastructure.Identity;

public class PersianIdentityErrorDescriber : IdentityErrorDescriber
{
    public override IdentityError DefaultError()
    {
        return new IdentityError
        {
            Code = nameof(DefaultError),
            Description = "یک خطای ناشناخته رخ داده است."
        };
    }

    public override IdentityError ConcurrencyFailure()
    {
        return new IdentityError
        {
            Code = nameof(ConcurrencyFailure),
            Description = "رکورد مورد نظر توسط شخص دیگری ویرایش شده است."
        };
    }

    public override IdentityError PasswordMismatch()
    {
        return new IdentityError
        {
            Code = nameof(PasswordMismatch),
            Description = "رمز عبور نادرست است."
        };
    }

    public override IdentityError InvalidToken()
    {
        return new IdentityError
        {
            Code = nameof(InvalidToken),
            Description = "توکن نامعتبر است."
        };
    }

    public override IdentityError LoginAlreadyAssociated()
    {
        return new IdentityError
        {
            Code = nameof(LoginAlreadyAssociated),
            Description = "این کاربر قبلاً متصل شده است."
        };
    }

    public override IdentityError InvalidUserName(string userName)
    {
        return new IdentityError
        {
            Code = nameof(InvalidUserName),
            Description = $"نام کاربری '{userName}' نامعتبر است. فقط حروف و اعداد مجاز هستند."
        };
    }

    public override IdentityError InvalidEmail(string email)
    {
        return new IdentityError
        {
            Code = nameof(InvalidEmail),
            Description = $"ایمیل '{email}' نامعتبر است."
        };
    }

    public override IdentityError DuplicateUserName(string userName)
    {
        return new IdentityError
        {
            Code = nameof(DuplicateUserName),
            Description = $"نام کاربری '{userName}' قبلاً ثبت شده است."
        };
    }

    public override IdentityError DuplicateEmail(string email)
    {
        return new IdentityError
        {
            Code = nameof(DuplicateEmail),
            Description = $"ایمیل '{email}' قبلاً ثبت شده است."
        };
    }

    public override IdentityError InvalidRoleName(string role)
    {
        return new IdentityError
        {
            Code = nameof(InvalidRoleName),
            Description = $"نقش '{role}' نامعتبر است."
        };
    }

    public override IdentityError DuplicateRoleName(string role)
    {
        return new IdentityError
        {
            Code = nameof(DuplicateRoleName),
            Description = $"نقش '{role}' قبلاً ثبت شده است."
        };
    }

    public override IdentityError UserAlreadyHasPassword()
    {
        return new IdentityError
        {
            Code = nameof(UserAlreadyHasPassword),
            Description = "کاربر قبلاً رمز عبور تنظیم کرده است."
        };
    }

    public override IdentityError UserLockoutNotEnabled()
    {
        return new IdentityError
        {
            Code = nameof(UserLockoutNotEnabled),
            Description = "قفل شدن برای این کاربر فعال نیست."
        };
    }

    public override IdentityError UserAlreadyInRole(string role)
    {
        return new IdentityError
        {
            Code = nameof(UserAlreadyInRole),
            Description = $"کاربر قبلاً در نقش '{role}' عضو است."
        };
    }

    public override IdentityError UserNotInRole(string role)
    {
        return new IdentityError
        {
            Code = nameof(UserNotInRole),
            Description = $"کاربر در نقش '{role}' عضو نیست."
        };
    }

    public override IdentityError PasswordTooShort(int length)
    {
        return new IdentityError
        {
            Code = nameof(PasswordTooShort),
            Description = $"رمز عبور باید حداقل {length} کاراکتر باشد."
        };
    }

    public override IdentityError PasswordRequiresNonAlphanumeric()
    {
        return new IdentityError
        {
            Code = nameof(PasswordRequiresNonAlphanumeric),
            Description = "رمز عبور باید شامل حداقل یک کاراکتر غیر حرفی (مانند ! @ #) باشد."
        };
    }

    public override IdentityError PasswordRequiresDigit()
    {
        return new IdentityError
        {
            Code = nameof(PasswordRequiresDigit),
            Description = "رمز عبور باید شامل حداقل یک عدد باشد."
        };
    }

    public override IdentityError PasswordRequiresLower()
    {
        return new IdentityError
        {
            Code = nameof(PasswordRequiresLower),
            Description = "رمز عبور باید شامل حداقل یک حرف کوچک انگلیسی باشد."
        };
    }

    public override IdentityError PasswordRequiresUpper()
    {
        return new IdentityError
        {
            Code = nameof(PasswordRequiresUpper),
            Description = "رمز عبور باید شامل حداقل یک حرف بزرگ انگلیسی باشد."
        };
    }
}
