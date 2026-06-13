using System.IO;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Threading;
using GearHubDesktop.Helpers;
using GearHubDesktop.Views.Dialogs;
using Microsoft.Web.WebView2.Core;

namespace GearHubDesktop.Controls;

public partial class HtmlRichTextEditor : UserControl
{
    private static readonly JsonSerializerOptions EditorJson = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    };

    private bool _ready;
    private bool _initializing;
    private string _cachedHtml = string.Empty;
    private string _pendingHtml = string.Empty;

    public HtmlRichTextEditor()
    {
        InitializeComponent();
        Loaded += OnLoaded;
    }

    private static void OnHasErrorChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
    {
        if (d is HtmlRichTextEditor editor)
        {
            editor.UpdateErrorState();
        }
    }

    private void UpdateErrorState()
    {
        if (EditorBorder is null)
        {
            return;
        }

        if (HasError)
        {
            EditorBorder.BorderBrush = TryFindResource("ErrorBrush") as System.Windows.Media.Brush
                ?? System.Windows.Media.Brushes.IndianRed;
            EditorBorder.Background = TryFindResource("ErrorInputBackgroundBrush") as System.Windows.Media.Brush
                ?? System.Windows.Media.Brushes.MistyRose;
            return;
        }

        EditorBorder.BorderBrush = TryFindResource("BorderBrush") as System.Windows.Media.Brush
            ?? System.Windows.Media.Brushes.LightGray;
        EditorBorder.Background = TryFindResource("SurfaceBrush") as System.Windows.Media.Brush
            ?? System.Windows.Media.Brushes.White;
    }

    public event EventHandler? HtmlChanged;

    public Func<Task<string?>>? ResolveImageUrlAsync { get; set; }

    public static readonly DependencyProperty HasErrorProperty = DependencyProperty.Register(
        nameof(HasError),
        typeof(bool),
        typeof(HtmlRichTextEditor),
        new PropertyMetadata(false, OnHasErrorChanged));

    public bool HasError
    {
        get => (bool)GetValue(HasErrorProperty);
        set => SetValue(HasErrorProperty, value);
    }

    public string Html
    {
        get => HtmlEditorHelper.NormalizeOutput(_cachedHtml);
        set => SetHtml(value);
    }

    public void SetHtml(string? html)
    {
        var normalized = HtmlEditorHelper.ToEditorHtml(html);
        var content = HtmlEditorHelper.NormalizeOutput(normalized);

        void Apply()
        {
            _cachedHtml = content;
            if (_ready)
            {
                _ = SetEditorHtmlAsync(content);
            }
            else
            {
                _pendingHtml = content;
            }
        }

        if (Dispatcher.CheckAccess())
        {
            Apply();
        }
        else
        {
            Dispatcher.Invoke(Apply);
        }
    }

    public string GetHtml() => Html;

    public async Task<string> GetHtmlAsync()
    {
        await WaitForReadyAsync();

        if (!_ready || EditorWebView.CoreWebView2 is null)
        {
            return GetHtml();
        }

        try
        {
            var html = await InvokeOnUiAsync(ReadHtmlFromEditorAsync);
            _cachedHtml = html;
            return HtmlEditorHelper.NormalizeOutput(html);
        }
        catch
        {
            return GetHtml();
        }
    }

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
                Window.GetWindow(this),
                $"Rich text editor failed to start. Install Microsoft Edge WebView2 Runtime.\n\n{ex.Message}",
                "Editor error",
                MessageBoxButton.OK,
                MessageBoxImage.Warning);
        }
    }

    private async Task InitializeEditorAsync()
    {
        await InvokeOnUiAsync(async () =>
        {
            await EditorWebView.EnsureCoreWebView2Async();
            if (EditorWebView.CoreWebView2 is not null)
            {
                EditorWebView.CoreWebView2.Profile.PreferredColorScheme =
                    CoreWebView2PreferredColorScheme.Light;
                EditorWebView.DefaultBackgroundColor = System.Drawing.Color.White;
            }
        });

        EditorWebView.CoreWebView2!.WebMessageReceived += OnWebMessageReceived;

        var editorPath = Path.Combine(AppContext.BaseDirectory, "Assets", "QuillEditor", "index.html");
        if (!File.Exists(editorPath))
        {
            throw new FileNotFoundException("Editor page not found.", editorPath);
        }

        await InvokeOnUiAsync(() =>
        {
            EditorWebView.Source = new Uri(editorPath);
            return Task.CompletedTask;
        });
    }

    private void OnWebMessageReceived(object? sender, CoreWebView2WebMessageReceivedEventArgs e)
    {
        var json = e.WebMessageAsJson;
        if (string.IsNullOrWhiteSpace(json))
        {
            json = e.TryGetWebMessageAsString();
        }

        if (string.IsNullOrWhiteSpace(json))
        {
            return;
        }

        EditorMessage? message;
        try
        {
            message = JsonSerializer.Deserialize<EditorMessage>(json, EditorJson);
        }
        catch
        {
            return;
        }

        if (message?.Type is null)
        {
            return;
        }

        Dispatcher.BeginInvoke(() => HandleEditorMessage(message), DispatcherPriority.Normal);
    }

    private void HandleEditorMessage(EditorMessage message)
    {
        switch (message.Type)
        {
            case "ready":
                _ready = true;
                if (!string.IsNullOrEmpty(_pendingHtml) || !string.IsNullOrEmpty(_cachedHtml))
                {
                    var html = string.IsNullOrEmpty(_pendingHtml) ? _cachedHtml : _pendingHtml;
                    _pendingHtml = string.Empty;
                    _ = SetEditorHtmlAsync(html);
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
        try
        {
            if (ResolveImageUrlAsync is not null)
            {
                url = await ResolveImageUrlAsync().ConfigureAwait(true);
            }
            else
            {
                url = await InvokeOnUiAsync(ShowImageUrlDialogAsync);
            }
        }
        catch
        {
            return;
        }

        if (string.IsNullOrWhiteSpace(url))
        {
            return;
        }

        await InsertImageAsync(url);
    }

    private Task<string?> ShowImageUrlDialogAsync()
    {
        var dialog = new TextInputDialog("Insert image", "Image URL");
        return Task.FromResult(
            DialogWindowHelper.Show(dialog, 420, null) == true
                ? dialog.Value.Trim()
                : null);
    }

    private async Task SetEditorHtmlAsync(string? html)
    {
        await WaitForReadyAsync();
        if (!_ready || EditorWebView.CoreWebView2 is null)
        {
            _pendingHtml = html ?? string.Empty;
            return;
        }

        var script = $"window.setEditorHtml({JsonSerializer.Serialize(html ?? string.Empty, EditorJson)})";
        await InvokeOnUiAsync(async () =>
        {
            await EditorWebView.ExecuteScriptAsync(script);
        });
    }

    private async Task InsertImageAsync(string url)
    {
        await WaitForReadyAsync();
        if (!_ready || EditorWebView.CoreWebView2 is null)
        {
            return;
        }

        var script = $"window.insertImage({JsonSerializer.Serialize(url, EditorJson)})";
        await InvokeOnUiAsync(async () =>
        {
            await EditorWebView.ExecuteScriptAsync(script);
        });
    }

    private async Task<string> ReadHtmlFromEditorAsync()
    {
        var json = await EditorWebView.ExecuteScriptAsync("window.getEditorHtml()");
        return JsonSerializer.Deserialize<string>(json, EditorJson) ?? string.Empty;
    }

    private async Task WaitForReadyAsync()
    {
        for (var attempt = 0; attempt < 200 && !_ready; attempt++)
        {
            await Dispatcher.Yield(DispatcherPriority.Background);
        }
    }

    private async Task<T> InvokeOnUiAsync<T>(Func<Task<T>> action)
    {
        if (Dispatcher.CheckAccess())
        {
            return await action();
        }

        return await Dispatcher.Invoke(action);
    }

    private async Task InvokeOnUiAsync(Func<Task> action)
    {
        if (Dispatcher.CheckAccess())
        {
            await action();
            return;
        }

        await Dispatcher.Invoke(action);
    }

    private sealed class EditorMessage
    {
        public string? Type { get; set; }

        public string? Html { get; set; }

        public string? Url { get; set; }
    }
}
