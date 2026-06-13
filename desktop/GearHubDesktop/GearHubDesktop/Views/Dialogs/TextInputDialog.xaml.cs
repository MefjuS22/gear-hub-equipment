using System.Windows;

namespace GearHubDesktop.Views.Dialogs;

public partial class TextInputDialog : Window
{
    private readonly bool _required;

    public TextInputDialog(string title, string prompt, string? initialValue = null, bool required = true)
    {
        _required = required;
        Title = title;
        InitializeComponent();
        DialogWindowHelper.Configure(this);
        PromptText.Text = prompt;
        InputBox.Text = initialValue ?? string.Empty;
        InputBox.SelectAll();
        InputBox.Focus();
    }

    public string Value => InputBox.Text;

    private void Ok_Click(object sender, RoutedEventArgs e)
    {
        if (_required && string.IsNullOrWhiteSpace(InputBox.Text))
        {
            ErrorText.Text = "Value is required.";
            return;
        }

        DialogResult = true;
    }

    private void Cancel_Click(object sender, RoutedEventArgs e) => DialogResult = false;
}
