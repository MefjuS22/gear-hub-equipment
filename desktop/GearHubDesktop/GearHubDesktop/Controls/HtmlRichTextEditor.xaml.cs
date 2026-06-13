using System.IO;
using System.Text.Json;
using System.Windows;
using System.Windows.Controls;
using GearHubDesktop.Helpers;
using GearHubDesktop.Views.Dialogs;
using Microsoft.Web.WebView2.Core;

namespace GearHubDesktop.Controls;

public partial class HtmlRichTextEditor : UserControl
{
    private bool _ready;
    private bool _initializing;
    private string _cachedHtml = string.Empty;
    private string _pendingHtml = string.Empty;

    public HtmlRichTextEditor()
    {
        InitializeComponent();
        Loaded += OnLoaded;
    }

    public event EventHandler? HtmlChanged;

    public Func<Task<string?>>? ResolveImageUrlAsync { get; set; }

    public string Html
    {
        get => HtmlEditorHelper.NormalizeOutput(_cachedHtml);
        set => SetHtml(value);
    }

    public void SetHtml(string? html)
    {
        var normalized = HtmlEditorHelper.ToEditorHtml(html);
        _cachedHtml = HtmlEditorHelper.NormalizeOutput(normalized);

        if (_ready)
        {
            PostToEditor("setHtml", _cachedHtml);
        }
        else
        {
            _pendingHtml = _cachedHtml;
        }
    }

    public string GetHtml() => Html;

    private async void OnLoaded(object sender, RoutedEventArgs e)
    {
        Loaded -= OnLoaded;
        if (_initializing)
        {
            return;
        }

        _initializing = true;
        try
        {
            await InitializeEditorAsync();
        }
        catch (Exception ex)
        {
            MessageBox.Show(
                $"Rich text editor failed to start. Install Microsoft Edge WebView2 Runtime.\n\n{ex.Message}",
                "Editor error",
                MessageBoxButton.OK,
                MessageBoxImage.Warning);
        }
    }

    private async Task InitializeEditorAsync()
    {
        await EditorWebView.EnsureCoreWebView2Async();
        EditorWebView.CoreWebView2.WebMessageReceived += OnWebMessageReceived;

        var editorPath = Path.Combine(AppContext.BaseDirectory, "Assets", "QuillEditor", "index.html");
        if (!File.Exists(editorPath))
        {
            throw new FileNotFoundException("Editor page not found.", editorPath);
        }

        EditorWebView.Source = new Uri(editorPath);
    }

    private void OnWebMessageReceived(object? sender, CoreWebView2WebMessageReceivedEventArgs e)
    {
        var json = e.TryGetWebMessageAsString();
        if (string.IsNullOrWhiteSpace(json))
        {
            return;
        }

        EditorMessage? message;
        try
        {
            message = JsonSerializer.Deserialize<EditorMessage>(json);
        }
        catch
        {
            return;
        }

        if (message?.Type is null)
        {
            return;
        }

        Dispatcher.Invoke(() => HandleEditorMessage(message));
    }

    private void HandleEditorMessage(EditorMessage message)
    {
        switch (message.Type)
        {
            case "ready":
                _ready = true;
                if (!string.IsNullOrEmpty(_pendingHtml) || !string.IsNullOrEmpty(_cachedHtml))
                {
                    PostToEditor("setHtml", string.IsNullOrEmpty(_pendingHtml) ? _cachedHtml : _pendingHtml);
                    _pendingHtml = string.Empty;
                }

                break;

            case "htmlChanged":
                _cachedHtml = message.Html ?? string.Empty;
                HtmlChanged?.Invoke(this, EventArgs.Empty);
                break;

            case "requestImage":
                _ = HandleImageRequestAsync();
                break;
        }
    }

    private async Task HandleImageRequestAsync()
    {
        string? url = null;
        if (ResolveImageUrlAsync is not null)
        {
            url = await ResolveImageUrlAsync();
        }
        else
        {
            var dialog = new TextInputDialog("Insert image", "Image URL");
            if (DialogWindowHelper.Show(dialog, 420, null) == true)
            {
                url = dialog.Value.Trim();
            }
        }

        if (string.IsNullOrWhiteSpace(url))
        {
            return;
        }

        PostToEditor("insertImage", url: url);
    }

    private void PostToEditor(string type, string? html = null, string? url = null)
    {
        if (!_ready || EditorWebView.CoreWebView2 is null)
        {
            return;
        }

        var payload = JsonSerializer.Serialize(new EditorMessage
        {
            Type = type,
            Html = html,
            Url = url,
        });

        EditorWebView.CoreWebView2.PostWebMessageAsJson(payload);
    }

    private sealed class EditorMessage
    {
        public string? Type { get; set; }

        public string? Html { get; set; }

        public string? Url { get; set; }
    }
}
