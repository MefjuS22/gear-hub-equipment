using FluentValidation;
using GearHub.Api.Authorization;
using GearHub.Api.DTOs;

namespace GearHub.Api.Validators;

public class SetUserRolesDtoValidator : AbstractValidator<SetUserRolesDto>
{
    public SetUserRolesDtoValidator()
    {
        RuleFor(x => x.Roles).NotEmpty().WithMessage("Select at least one role.");

        RuleForEach(x => x.Roles)
            .Must(r => AppRoles.All.Any(a => string.Equals(a, r, StringComparison.OrdinalIgnoreCase)))
            .WithMessage("Role must be Admin or User.");
    }
}
