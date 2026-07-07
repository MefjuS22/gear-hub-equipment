using System.Windows;

namespace GearHubDesktop.Views.Dialogs;

public partial class WarehouseDialog : Window
{
    public WarehouseDialog()
    {
        InitializeComponent();
        DialogWindowHelper.Configure(this);
        NameInput.Focus();
    }

    public string WarehouseName => NameInput.Text.Trim();

    public string Location => LocationInput.Text.Trim();

    private void Ok_Click(object sender, RoutedEventArgs e)
    {
        ErrorText.Text = string.Empty;
        if (string.IsNullOrWhiteSpace(NameInput.Text))
        {
            ErrorText.Text = "Name is required.";
            return;
        }

        if (string.IsNullOrWhiteSpace(LocationInput.Text))
        {
            ErrorText.Text = "Location is required.";
            return;
        }

        if (NameInput.Text.Trim().Length < 2)
        {
            ErrorText.Text = "Name must be at least 2 characters.";
            return;
        }

        DialogResult = true;
    }

    private void Cancel_Click(object sender, RoutedEventArgs e) => DialogResult = false;
}
