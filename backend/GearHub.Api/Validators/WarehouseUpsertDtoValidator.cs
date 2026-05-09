using FluentValidation;
using GearHub.Api.DTOs;

namespace GearHub.Api.Validators;

public sealed class WarehouseUpsertDtoValidator : AbstractValidator<WarehouseUpsertDto>
{
    public WarehouseUpsertDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(200);
        RuleFor(x => x.Location)
            .NotEmpty()
            .MaximumLength(500);
    }
}
