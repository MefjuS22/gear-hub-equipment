using FluentValidation;
using GearHub.Api.DTOs;

namespace GearHub.Api.Validators;

public sealed class CmsPostUpsertDtoValidator : AbstractValidator<CmsPostUpsertDto>
{
    public CmsPostUpsertDtoValidator()
    {
        RuleFor(x => x.Slug).MaximumLength(200);
        RuleFor(x => x.Title).NotEmpty().MaximumLength(300);
        RuleFor(x => x.Excerpt).MaximumLength(2000);
        RuleFor(x => x.BodyHtml).MaximumLength(512_000);
    }
}
