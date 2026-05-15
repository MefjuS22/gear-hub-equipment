using FluentValidation;
using GearHub.Api.Authorization;
using GearHub.Api.DTOs;

namespace GearHub.Api.Validators;

public class RegisterUserRequestDtoValidator : AbstractValidator<RegisterUserRequestDto>
{
    public RegisterUserRequestDtoValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty().MinimumLength(8);
        RuleFor(x => x.DisplayName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Role)
            .NotEmpty()
            .Must(role => role == AppRoles.Admin || role == AppRoles.User)
            .WithMessage($"Role must be '{AppRoles.Admin}' or '{AppRoles.User}'.");
    }
}
