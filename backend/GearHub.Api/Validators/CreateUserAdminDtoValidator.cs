using FluentValidation;
using GearHub.Api.Authorization;
using GearHub.Api.DTOs;

namespace GearHub.Api.Validators;

public class CreateUserAdminDtoValidator : AbstractValidator<CreateUserAdminDto>
{
    public CreateUserAdminDtoValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();

        RuleFor(x => x.Password)
            .MinimumLength(8)
            .WithMessage("Password must be at least 8 characters.")
            .Matches("[A-Z]").WithMessage("Password must have at least one uppercase letter.")
            .Matches("[a-z]").WithMessage("Password must have at least one lowercase letter.")
            .Matches("[0-9]").WithMessage("Password must have at least one digit.");

        RuleFor(x => x.DisplayName).NotEmpty().MaximumLength(200);

        RuleFor(x => x.Roles).NotEmpty().WithMessage("Select at least one role.");

        RuleForEach(x => x.Roles)
            .Must(r => AppRoles.All.Any(a => string.Equals(a, r, StringComparison.OrdinalIgnoreCase)))
            .WithMessage("Role must be Admin or User.");
    }
}
