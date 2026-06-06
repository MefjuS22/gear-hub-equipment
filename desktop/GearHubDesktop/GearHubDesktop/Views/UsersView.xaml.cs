using System.Collections.ObjectModel;
using GearHubDesktop.Authorization;
using GearHubDesktop.DTOs;
using GearHubDesktop.Services;
using GearHubDesktop.Shell;

namespace GearHubDesktop.Views;

public partial class UsersView : ViewControllerBase, ILoadableView
{
    private readonly GearHubApiClient _api;

    private string _newEmail = string.Empty;
    private string _newDisplayName = string.Empty;
    private bool _assignAdminRole;
    private bool _assignUserRole = true;

    public UsersView(GearHubApiClient api)
    {
        _api = api;
        InitializeComponent();
        DataContext = this;
    }

    public ObservableCollection<UserRow> Users { get; } = [];

    public string NewEmail
    {
        get => _newEmail;
        set => SetProperty(ref _newEmail, value);
    }

    public string NewDisplayName
    {
        get => _newDisplayName;
        set => SetProperty(ref _newDisplayName, value);
    }

    public bool AssignAdminRole
    {
        get => _assignAdminRole;
        set => SetProperty(ref _assignAdminRole, value);
    }

    public bool AssignUserRole
    {
        get => _assignUserRole;
        set => SetProperty(ref _assignUserRole, value);
    }

    public async Task LoadAsync()
    {
        await RunAsync(async () =>
        {
            StatusMessage = null;
            var result = await _api.GetUsersAsync(1, 200);
            Users.Clear();
            foreach (var user in result.Items)
            {
                Users.Add(new UserRow(user));
            }

            StatusMessage = $"{result.TotalCount} user(s) loaded.";
        });
    }

    private async void CreateUser_Click(object sender, System.Windows.RoutedEventArgs e)
    {
        if (string.IsNullOrWhiteSpace(NewEmail) || string.IsNullOrWhiteSpace(NewPasswordInput.Password))
        {
            ErrorMessage = "Email and password are required.";
            return;
        }

        var roles = new List<string>();
        if (AssignAdminRole)
        {
            roles.Add(AppRoles.Admin);
        }

        if (AssignUserRole)
        {
            roles.Add(AppRoles.User);
        }

        if (roles.Count == 0)
        {
            ErrorMessage = "Select at least one role.";
            return;
        }

        await RunAsync(async () =>
        {
            await _api.CreateUserAsync(new CreateUserAdminDto
            {
                Email = NewEmail.Trim(),
                Password = NewPasswordInput.Password,
                DisplayName = NewDisplayName.Trim(),
                Roles = roles,
            });

            NewEmail = string.Empty;
            NewPasswordInput.Password = string.Empty;
            NewDisplayName = string.Empty;
            StatusMessage = "User created.";
            await LoadAsync();
        });
    }

    public sealed class UserRow
    {
        public UserRow(UserAdminListDto user)
        {
            Id = user.Id;
            Email = user.Email;
            DisplayName = user.DisplayName;
            RolesDisplay = string.Join(", ", user.Roles);
        }

        public int Id { get; }
        public string Email { get; }
        public string DisplayName { get; }
        public string RolesDisplay { get; }
    }
}
