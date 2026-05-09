using FluentValidation;
using GearHub.Api.DTOs;

namespace GearHub.Api.Validators;

public sealed class BrandUpsertDtoValidator : AbstractValidator<BrandUpsertDto>
{
    public BrandUpsertDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(200);
    }
}
