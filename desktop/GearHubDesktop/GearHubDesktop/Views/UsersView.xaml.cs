using System.Collections.ObjectModel;
using GearHubDesktop.Authorization;
using GearHubDesktop.DTOs;
using GearHubDesktop.Services;
using GearHubDesktop.Shell;
using GearHubDesktop.Views.Dialogs;

namespace GearHubDesktop.Views;

public partial class UsersView : ViewControllerBase, ILoadableView
{
    private readonly GearHubApiClient _api;
    private readonly IAuthSession _session;
    private UserRow? _selectedUser;

    public UsersView(GearHubApiClient api, IAuthSession session)
    {
        _api = api;
        _session = session;
        InitializeComponent();
        DataContext = this;
    }

    public ObservableCollection<UserRow> Users { get; } = [];

    public UserRow? SelectedUser
    {
        get => _selectedUser;
        set
        {
            if (Equals(_selectedUser, value))
            {
                return;
            }

            _selectedUser = value;
            RaisePropertyChanged();
            RaisePropertyChanged(nameof(CanDeleteSelectedUser));
            RaisePropertyChanged(nameof(CanEditRoles));
        }
    }

    public bool CanDeleteSelectedUser =>
        SelectedUser is not null && SelectedUser.Id != _session.User?.Id;

    public bool CanEditRoles => SelectedUser is not null;

    public async Task LoadAsync() => await ReloadAsync();

    private async void AddUser_Click(object sender, System.Windows.RoutedEventArgs e)
    {
        var dialog = new UserCreateDialog();
        if (DialogWindowHelper.Show(dialog, 460, null) != true)
        {
            return;
        }

        var roles = BuildRoles(dialog.AssignAdmin, dialog.AssignUser);

        await RunAsync(async () =>
        {
            await _api.CreateUserAsync(new CreateUserAdminDto
            {
                Email = dialog.Email,
                Password = dialog.Password,
                DisplayName = dialog.DisplayName,
                Roles = roles,
            });

            StatusMessage = "User created.";
            await ReloadCoreAsync();
        });
    }

    private async void EditRoles_Click(object sender, System.Windows.RoutedEventArgs e)
    {
        if (SelectedUser is null)
        {
            ErrorMessage = "Select a user to edit roles.";
            return;
        }

        var dialog = new UserRolesDialog(SelectedUser.Email, SelectedUser.HasAdminRole, SelectedUser.HasUserRole);
        if (DialogWindowHelper.Show(dialog, 400, null) != true)
        {
            return;
        }

        await RunAsync(async () =>
        {
            await _api.SetUserRolesAsync(
                SelectedUser.Id,
                new SetUserRolesDto { Roles = BuildRoles(dialog.AssignAdmin, dialog.AssignUser) });
            StatusMessage = $"Roles updated for {SelectedUser.Email}.";
            await ReloadCoreAsync();
        });
    }

    private async void DeleteUser_Click(object sender, System.Windows.RoutedEventArgs e)
    {
        if (SelectedUser is null)
        {
            ErrorMessage = "Select a user to delete.";
            return;
        }

        if (SelectedUser.Id == _session.User?.Id)
        {
            ErrorMessage = "You cannot delete your own account.";
            return;
        }

        if (System.Windows.MessageBox.Show(
                $"Delete {SelectedUser.Email}? This cannot be undone.",
                "Confirm delete",
                System.Windows.MessageBoxButton.YesNo,
                System.Windows.MessageBoxImage.Warning) != System.Windows.MessageBoxResult.Yes)
        {
            return;
        }

        await RunAsync(async () =>
        {
            await _api.DeleteUserAsync(SelectedUser.Id);
            SelectedUser = null;
            StatusMessage = "User deleted.";
            await ReloadCoreAsync();
        });
    }

    private async void Refresh_Click(object sender, System.Windows.RoutedEventArgs e) =>
        await ReloadAsync();

    private async Task ReloadAsync() => await RunAsync(ReloadCoreAsync);

    private async Task ReloadCoreAsync()
    {
        StatusMessage = null;
        var result = await _api.GetUsersAsync(1, 200);
        Users.Clear();
        foreach (var user in result.Items)
        {
            Users.Add(new UserRow(user));
        }

        StatusMessage = $"{result.TotalCount} user(s) loaded.";
    }

    private static List<string> BuildRoles(bool admin, bool user)
    {
        var roles = new List<string>();
        if (admin)
        {
            roles.Add(AppRoles.Admin);
        }

        if (user)
        {
            roles.Add(AppRoles.User);
        }

        return roles;
    }

    public sealed class UserRow
    {
        public UserRow(UserAdminListDto user)
        {
            Id = user.Id;
            Email = user.Email;
            DisplayName = user.DisplayName;
            RolesDisplay = string.Join(", ", user.Roles);
            HasAdminRole = user.Roles.Any(role =>
                string.Equals(role, AppRoles.Admin, StringComparison.OrdinalIgnoreCase));
            HasUserRole = user.Roles.Any(role =>
                string.Equals(role, AppRoles.User, StringComparison.OrdinalIgnoreCase));
        }

        public int Id { get; }
        public string Email { get; }
        public string DisplayName { get; }
        public string RolesDisplay { get; }
        public bool HasAdminRole { get; }
        public bool HasUserRole { get; }
    }
}
