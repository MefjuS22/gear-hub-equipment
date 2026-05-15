using FluentValidation;
using GearHub.Api.DTOs;

namespace GearHub.Api.Validators;

public class OrderCreateDtoValidator : AbstractValidator<OrderCreateDto>
{
    public OrderCreateDtoValidator()
    {
        RuleFor(order => order.CustomerId)
            .GreaterThan(0);

        RuleFor(order => order.RentalStartDate)
            .NotEmpty();

        RuleFor(order => order.RentalEndDate)
            .GreaterThan(order => order.RentalStartDate)
            .WithMessage("Rental end date must be greater than rental start date.");

        RuleFor(order => order.Items)
            .NotEmpty();

        RuleForEach(order => order.Items)
            .SetValidator(new OrderItemDtoValidator());
    }
}
