using System.Drawing;
using System.Windows;
using System.Windows.Controls;
using GearHubDesktop.Helpers;
using Microsoft.Web.WebView2.Core;

namespace GearHubDesktop.Controls;

public partial class HtmlContentViewer : UserControl
{
    private bool _ready;
    private bool _initializing;
    private bool _hasPendingRender;

    public HtmlContentViewer()
    {
        InitializeComponent();
        ContentWebView.DefaultBackgroundColor = Color.White;
        Loaded += OnLoaded;
    }

    public static readonly DependencyProperty BaseUrlProperty =
        DependencyProperty.Register(
            nameof(BaseUrl),
            typeof(string),
            typeof(HtmlContentViewer),
            new PropertyMetadata("http://localhost:5000", OnDisplayPropertyChanged));

    public static readonly DependencyProperty HtmlProperty =
        DependencyProperty.Register(
            nameof(Html),
            typeof(string),
            typeof(HtmlContentViewer),
            new PropertyMetadata(string.Empty, OnDisplayPropertyChanged));

    public string BaseUrl
    {
        get => (string)GetValue(BaseUrlProperty);
        set => SetValue(BaseUrlProperty, value);
    }

    public string Html
    {
        get => (string)GetValue(HtmlProperty);
        set => SetValue(HtmlProperty, value);
    }

    public void SetHtml(string? html) => Html = html ?? string.Empty;

    private static void OnDisplayPropertyChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
    {
        if (d is HtmlContentViewer viewer)
        {
            viewer.QueueRender();
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
            await ContentWebView.EnsureCoreWebView2Async();
            if (ContentWebView.CoreWebView2 is not null)
            {
                ContentWebView.CoreWebView2.Profile.PreferredColorScheme =
                    CoreWebView2PreferredColorScheme.Light;
            }

            _ready = true;
            RenderHtmlIfPending();
        }
        catch
        {
            // Viewer is optional; parent views can still render other content.
        }
    }

    private void QueueRender()
    {
        if (_ready)
        {
            RenderHtml();
        }
        else
        {
            _hasPendingRender = true;
        }
    }

    private void RenderHtmlIfPending()
    {
        if (_hasPendingRender || !string.IsNullOrEmpty(Html))
        {
            RenderHtml();
        }
    }

    private void RenderHtml()
    {
        _hasPendingRender = false;
        if (!_ready || ContentWebView.CoreWebView2 is null)
        {
            _hasPendingRender = true;
            return;
        }

        var content = Html;
        var document = CmsHtmlHelper.BuildDisplayDocument(
            string.IsNullOrWhiteSpace(content) ? "<p></p>" : content,
            BaseUrl);
        ContentWebView.NavigateToString(document);
    }
}
