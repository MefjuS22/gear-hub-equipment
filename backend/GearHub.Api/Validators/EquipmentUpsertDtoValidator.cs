using FluentValidation;
using GearHub.Api.DTOs;

namespace GearHub.Api.Validators;

public class EquipmentUpsertDtoValidator : AbstractValidator<EquipmentUpsertDto>
{
    public EquipmentUpsertDtoValidator()
    {
        RuleFor(equipment => equipment.Name)
            .NotEmpty()
            .MaximumLength(200);

        RuleFor(equipment => equipment.CategoryId)
            .GreaterThan(0);

        RuleFor(equipment => equipment.BrandId)
            .GreaterThan(0);

        RuleFor(equipment => equipment.WarehouseId)
            .GreaterThan(0);

        RuleFor(equipment => equipment.DailyRate)
            .GreaterThan(0);
    }
}
