using FluentValidation;
using GearHub.Api.DTOs;

namespace GearHub.Api.Validators;

public class PortalTextUpsertDtoValidator : AbstractValidator<PortalTextUpsertDto>
{
    public PortalTextUpsertDtoValidator()
    {
        RuleFor(text => text.Title)
            .NotEmpty()
            .MaximumLength(300);

        RuleFor(text => text.BodyHtml)
            .NotEmpty()
            .MaximumLength(64_000);
    }
}
