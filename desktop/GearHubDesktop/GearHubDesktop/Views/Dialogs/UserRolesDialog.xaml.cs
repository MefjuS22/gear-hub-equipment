using System.Windows;

namespace GearHubDesktop.Views.Dialogs;

public partial class UserRolesDialog : Window
{
    public UserRolesDialog(string email, bool admin, bool user)
    {
        InitializeComponent();
        UserLabel.Text = email;
        AdminRoleCheck.IsChecked = admin;
        UserRoleCheck.IsChecked = user;
    }

    public bool AssignAdmin => AdminRoleCheck.IsChecked == true;

    public bool AssignUser => UserRoleCheck.IsChecked == true;

    private void Ok_Click(object sender, RoutedEventArgs e)
    {
        ErrorText.Text = string.Empty;
        if (AdminRoleCheck.IsChecked != true && UserRoleCheck.IsChecked != true)
        {
            ErrorText.Text = "Select at least one role.";
            return;
        }

        DialogResult = true;
    }

    private void Cancel_Click(object sender, RoutedEventArgs e) => DialogResult = false;
}
