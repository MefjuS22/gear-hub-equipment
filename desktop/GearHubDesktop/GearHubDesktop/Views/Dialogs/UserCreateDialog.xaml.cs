using System.Windows;

namespace GearHubDesktop.Views.Dialogs;

public partial class UserCreateDialog : Window
{
    public UserCreateDialog()
    {
        InitializeComponent();
        DialogWindowHelper.Configure(this);
        EmailInput.Focus();
    }

    public string Email => EmailInput.Text.Trim();

    public string Password => PasswordInput.Password;

    public string DisplayName => DisplayNameInput.Text.Trim();

    public bool AssignAdmin => AdminRoleCheck.IsChecked == true;

    public bool AssignUser => UserRoleCheck.IsChecked == true;

    private void Ok_Click(object sender, RoutedEventArgs e)
    {
        ErrorText.Text = string.Empty;
        if (string.IsNullOrWhiteSpace(EmailInput.Text) || string.IsNullOrWhiteSpace(PasswordInput.Password))
        {
            ErrorText.Text = "Email and password are required.";
            return;
        }

        if (string.IsNullOrWhiteSpace(DisplayNameInput.Text))
        {
            ErrorText.Text = "Display name is required.";
            return;
        }

        if (AdminRoleCheck.IsChecked != true && UserRoleCheck.IsChecked != true)
        {
            ErrorText.Text = "Select at least one role.";
            return;
        }

        DialogResult = true;
    }

    private void Cancel_Click(object sender, RoutedEventArgs e) => DialogResult = false;
}
