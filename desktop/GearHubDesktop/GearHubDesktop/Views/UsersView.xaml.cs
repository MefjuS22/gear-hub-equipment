using System.Collections.ObjectModel;
using GearHubDesktop.DTOs;
using GearHubDesktop.Services;
using GearHubDesktop.Shell;

namespace GearHubDesktop.Views;

public partial class UsersView : ViewControllerBase, ILoadableView
{
    private readonly GearHubApiClient _api;

    public UsersView(GearHubApiClient api)
    {
        _api = api;
        InitializeComponent();
        DataContext = this;
    }

    public ObservableCollection<UserRow> Users { get; } = [];

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
