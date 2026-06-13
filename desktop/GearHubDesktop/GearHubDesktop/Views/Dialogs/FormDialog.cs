using System.Windows;
using GearHubDesktop.Services;
using Microsoft.Extensions.DependencyInjection;

namespace GearHubDesktop.Views.Dialogs;

public static class FormDialog
{
    public static async Task<bool> ShowEquipmentAsync(IServiceProvider services, int? equipmentId)
    {
        var form = services.GetRequiredService<EquipmentFormView>();
        form.ConfigureAsDialog();
        await form.LoadAsync(equipmentId);

        var window = new Window
        {
            Title = equipmentId is null ? "New equipment" : $"Edit equipment #{equipmentId}",
            Content = form,
            Width = 760,
            Height = 640,
            MinWidth = 600,
            MinHeight = 480,
            ResizeMode = ResizeMode.CanResize,
        };

        var saved = false;
        form.DialogFinished += (_, ok) =>
        {
            saved = ok;
            window.DialogResult = ok;
            window.Close();
        };

        return DialogWindowHelper.Show(window) == true && saved;
    }

    public static async Task<bool> ShowCmsPostAsync(IServiceProvider services, Guid? postId)
    {
        var form = services.GetRequiredService<CmsPostFormView>();
        form.ConfigureAsDialog();
        await form.LoadAsync(postId);

        var window = new Window
        {
            Title = postId is null ? "New post" : "Edit post",
            Content = form,
            Width = 760,
            Height = 680,
            MinWidth = 600,
            MinHeight = 520,
            ResizeMode = ResizeMode.CanResize,
        };

        var saved = false;
        form.DialogFinished += (_, ok) =>
        {
            saved = ok;
            window.DialogResult = ok;
            window.Close();
        };

        return DialogWindowHelper.Show(window) == true && saved;
    }

    public static async Task<bool> ShowPortalTextAsync(IServiceProvider services, string key)
    {
        var form = services.GetRequiredService<PortalTextFormView>();
        form.ConfigureAsDialog();
        await form.LoadAsync(key);

        var window = new Window
        {
            Title = "Edit portal text",
            Content = form,
            Width = 640,
            Height = 480,
            MinWidth = 520,
            MinHeight = 400,
            ResizeMode = ResizeMode.CanResize,
        };

        var saved = false;
        form.DialogFinished += (_, ok) =>
        {
            saved = ok;
            window.DialogResult = ok;
            window.Close();
        };

        return DialogWindowHelper.Show(window) == true && saved;
    }
}
