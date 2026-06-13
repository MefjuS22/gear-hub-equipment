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

        var window = CreateFormWindow(
            equipmentId is null ? "New equipment" : $"Edit equipment #{equipmentId}",
            form,
            780,
            720);

        return ShowForm(window, form);
    }

    public static async Task<bool> ShowCmsPostAsync(IServiceProvider services, Guid? postId)
    {
        var form = services.GetRequiredService<CmsPostFormView>();
        form.ConfigureAsDialog();
        await form.LoadAsync(postId);

        var window = CreateFormWindow(
            postId is null ? "New post" : "Edit post",
            form,
            800,
            760);

        return ShowForm(window, form);
    }

    public static async Task<bool> ShowPortalTextAsync(IServiceProvider services, string key)
    {
        var form = services.GetRequiredService<PortalTextFormView>();
        form.ConfigureAsDialog();
        await form.LoadAsync(key);

        var window = CreateFormWindow("Edit portal text", form, 720, 560);

        return ShowForm(window, form);
    }

    private static Window CreateFormWindow(string title, UIElement content, double width, double height)
    {
        var window = new Window
        {
            Title = title,
            Content = content,
            Width = width,
            Height = height,
            MinWidth = 620,
            MinHeight = 480,
            ResizeMode = ResizeMode.CanResize,
        };

        DialogWindowHelper.Configure(window);
        return window;
    }

    private static bool ShowForm(Window window, INotifyDialogFinished form)
    {
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

public interface INotifyDialogFinished
{
    event EventHandler<bool>? DialogFinished;
}
