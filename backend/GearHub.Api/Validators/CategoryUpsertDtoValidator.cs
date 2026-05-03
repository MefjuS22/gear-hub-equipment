using FluentValidation;
using GearHub.Api.DTOs;

namespace GearHub.Api.Validators;

public sealed class CategoryUpsertDtoValidator : AbstractValidator<CategoryUpsertDto>
{
    public CategoryUpsertDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(200);
        RuleFor(x => x.Description)
            .NotNull()
            .MaximumLength(2000);
    }
}
