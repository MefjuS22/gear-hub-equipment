using FluentValidation;
using GearHub.Api.DTOs;

namespace GearHub.Api.Validators;

public sealed class MaintenanceUpsertDtoValidator : AbstractValidator<MaintenanceUpsertDto>
{
    public MaintenanceUpsertDtoValidator()
    {
        RuleFor(x => x.EquipmentId).GreaterThan(0);
        RuleFor(x => x.Description).NotEmpty().MinimumLength(3).MaximumLength(2000);
        RuleFor(x => x.Date).NotEmpty();
    }
}
