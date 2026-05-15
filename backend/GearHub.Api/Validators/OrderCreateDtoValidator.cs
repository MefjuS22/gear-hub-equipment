using FluentValidation;
using GearHub.Api.DTOs;

namespace GearHub.Api.Validators;

public class OrderCreateDtoValidator : AbstractValidator<OrderCreateDto>
{
    public OrderCreateDtoValidator()
    {
        RuleFor(order => order)
            .Must(d =>
                (d.CustomerId.HasValue && d.CustomerId.Value > 0)
                || (!string.IsNullOrWhiteSpace(d.CompanyName) && !string.IsNullOrWhiteSpace(d.ContactPerson)))
            .WithMessage("Select an existing customer, or enter company name and contact person.");

        RuleFor(order => order.CompanyName)
            .MaximumLength(500)
            .When(order => !order.CustomerId.HasValue || order.CustomerId.Value <= 0);

        RuleFor(order => order.ContactPerson)
            .MaximumLength(500)
            .When(order => !order.CustomerId.HasValue || order.CustomerId.Value <= 0);

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
