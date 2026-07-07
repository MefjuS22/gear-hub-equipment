using System.Windows;
using GearHubDesktop.DTOs;

namespace GearHubDesktop.Views.Dialogs;

public partial class MaintenanceDialog : Window
{
    public MaintenanceDialog(IReadOnlyList<EquipmentDto> equipment)
    {
        InitializeComponent();
        DialogWindowHelper.Configure(this);
        EquipmentCombo.ItemsSource = equipment;
        EquipmentCombo.SelectedIndex = equipment.Count > 0 ? 0 : -1;
        DateInput.SelectedDate = DateTime.Today;
        DescriptionInput.Focus();
    }

    public int EquipmentId => EquipmentCombo.SelectedValue is int id ? id : 0;

    public DateTime Date =>
        DateTime.SpecifyKind((DateInput.SelectedDate ?? DateTime.Today).Date, DateTimeKind.Utc);

    public string Description => DescriptionInput.Text.Trim();

    private void Ok_Click(object sender, RoutedEventArgs e)
    {
        ErrorText.Text = string.Empty;
        if (EquipmentId <= 0)
        {
            ErrorText.Text = "Select equipment.";
            return;
        }

        if (DateInput.SelectedDate is null)
        {
            ErrorText.Text = "Date is required.";
            return;
        }

        if (string.IsNullOrWhiteSpace(DescriptionInput.Text))
        {
            ErrorText.Text = "Description is required.";
            return;
        }

        if (DescriptionInput.Text.Trim().Length < 3)
        {
            ErrorText.Text = "Description must be at least 3 characters.";
            return;
        }

        DialogResult = true;
    }

    private void Cancel_Click(object sender, RoutedEventArgs e) => DialogResult = false;
}
