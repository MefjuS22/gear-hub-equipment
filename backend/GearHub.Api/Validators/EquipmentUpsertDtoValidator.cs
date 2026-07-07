using FluentValidation;
using GearHub.Api.DTOs;

namespace GearHub.Api.Validators;

public class EquipmentUpsertDtoValidator : AbstractValidator<EquipmentUpsertDto>
{
    public EquipmentUpsertDtoValidator()
    {
        RuleFor(equipment => equipment.Name)
            .NotEmpty()
            .MinimumLength(3)
            .MaximumLength(200);

        RuleFor(equipment => equipment.CategoryId)
            .GreaterThan(0);

        RuleFor(equipment => equipment.BrandId)
            .GreaterThan(0);

        RuleFor(equipment => equipment.WarehouseId)
            .GreaterThan(0);

        RuleFor(equipment => equipment.DailyRate)
            .GreaterThan(0);

        RuleFor(equipment => equipment.ImageUrl)
            .MaximumLength(2000)
            .When(e => !string.IsNullOrEmpty(e.ImageUrl));

        RuleFor(equipment => equipment.DescriptionHtml)
            .MaximumLength(64_000)
            .When(e => !string.IsNullOrEmpty(e.DescriptionHtml));
    }
}
