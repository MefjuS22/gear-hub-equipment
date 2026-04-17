using FluentValidation;
using GearHub.Api.DTOs;

namespace GearHub.Api.Validators;

public class OrderItemDtoValidator : AbstractValidator<OrderItemDto>
{
    public OrderItemDtoValidator()
    {
        RuleFor(item => item.EquipmentId)
            .GreaterThan(0);

        RuleFor(item => item.Quantity)
            .GreaterThan(0);
    }
}
