using System.Windows;

namespace GearHubDesktop.Views.Dialogs;

public partial class TextInputDialog : Window
{
    public TextInputDialog(string title, string prompt, string? initialValue = null)
    {
        Title = title;
        InitializeComponent();
        PromptText.Text = prompt;
        InputBox.Text = initialValue ?? string.Empty;
        InputBox.SelectAll();
        InputBox.Focus();
    }

    public string Value => InputBox.Text;

    private void Ok_Click(object sender, RoutedEventArgs e)
    {
        if (string.IsNullOrWhiteSpace(InputBox.Text))
        {
            ErrorText.Text = "Value is required.";
            return;
        }

        DialogResult = true;
    }

    private void Cancel_Click(object sender, RoutedEventArgs e) => DialogResult = false;
}
