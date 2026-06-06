using System.Collections.ObjectModel;
using System.Windows;
using System.Windows.Controls;
using GearHubDesktop.DTOs;
using GearHubDesktop.Helpers;
using GearHubDesktop.Services;
using GearHubDesktop.Shell;

namespace GearHubDesktop.Views;

public partial class CartView : ViewControllerBase, ILoadableView
{
    private readonly GearHubApiClient _api;
    private readonly ICartService _cart;
    private readonly IAuthSession _session;

    private CustomerCheckoutOptionDto? _selectedCompany;
    private string _companyName = string.Empty;
    private string _contactPerson = string.Empty;
    private DateTime? _rentalStartDate;
    private DateTime? _rentalEndDate;

    public CartView(GearHubApiClient api, ICartService cart, IAuthSession session)
    {
        _api = api;
        _cart = cart;
        _session = session;
        InitializeComponent();
        DataContext = this;
        Lines = _cart.Lines;
        SavedCompanies = [];
        _rentalStartDate = DateTime.Today;
        _rentalEndDate = DateTime.Today.AddDays(1);
        _cart.Changed += (_, _) => RaiseCartProperties();
    }

    public ObservableCollection<CartLine> Lines { get; }

    public ObservableCollection<CustomerCheckoutOptionDto> SavedCompanies { get; }

    public CustomerCheckoutOptionDto? SelectedCompany
    {
        get => _selectedCompany;
        set
        {
            SetProperty(ref _selectedCompany, value);
            if (value is not null)
            {
                CompanyName = value.CompanyName;
                ContactPerson = value.ContactPerson;
            }

            RaisePropertyChanged(nameof(CanPlaceOrder));
        }
    }

    public string CompanyName
    {
        get => _companyName;
        set
        {
            SetProperty(ref _companyName, value);
            RaisePropertyChanged(nameof(CanPlaceOrder));
        }
    }

    public string ContactPerson
    {
        get => _contactPerson;
        set
        {
            SetProperty(ref _contactPerson, value);
            RaisePropertyChanged(nameof(CanPlaceOrder));
        }
    }

    public DateTime? RentalStartDate
    {
        get => _rentalStartDate;
        set
        {
            SetProperty(ref _rentalStartDate, value);
            RaisePropertyChanged(nameof(SubtotalLabel));
            RaisePropertyChanged(nameof(CanPlaceOrder));
        }
    }

    public DateTime? RentalEndDate
    {
        get => _rentalEndDate;
        set
        {
            SetProperty(ref _rentalEndDate, value);
            RaisePropertyChanged(nameof(SubtotalLabel));
            RaisePropertyChanged(nameof(CanPlaceOrder));
        }
    }

    public bool IsCartEmpty => Lines.Count == 0;

    public bool ShowSignInHint => !_session.IsAuthenticated;

    public bool CanPlaceOrder =>
        _session.IsAuthenticated
        && !IsCartEmpty
        && !IsBusy
        && !string.IsNullOrWhiteSpace(CompanyName)
        && !string.IsNullOrWhiteSpace(ContactPerson)
        && RentalStartDate is not null
        && RentalEndDate is not null
        && RentalEndDate > RentalStartDate;

    public string SubtotalLabel
    {
        get
        {
            var days = RentalDays;
            var total = Lines.Sum(line => line.DailyRate * line.Quantity * days);
            return days <= 0
                ? "Select valid rental dates"
                : $"Estimated total ({days} days): {FormatCurrency.Format(total)}";
        }
    }

    private int RentalDays
    {
        get
        {
            if (RentalStartDate is not { } start || RentalEndDate is not { } end || end <= start)
            {
                return 0;
            }

            return (end.Date - start.Date).Days;
        }
    }

    public async Task LoadAsync()
    {
        await RunAsync(async () =>
        {
            await _cart.LoadAsync();
            RaiseCartProperties();

            if (!_session.IsAuthenticated)
            {
                SavedCompanies.Clear();
                return;
            }

            var companies = await _api.GetMyCustomersAsync();
            SavedCompanies.Clear();
            foreach (var company in companies)
            {
                SavedCompanies.Add(company);
            }
        });
    }

    private async void PlaceOrder_Click(object sender, RoutedEventArgs e)
    {
        await RunAsync(async () =>
        {
            if (!_session.IsAuthenticated)
            {
                throw new InvalidOperationException("Sign in to place an order.");
            }

            if (Lines.Count == 0)
            {
                throw new InvalidOperationException("Your cart is empty.");
            }

            if (RentalStartDate is not { } start || RentalEndDate is not { } end || end <= start)
            {
                throw new InvalidOperationException("Rental end date must be after the start date.");
            }

            var dto = new OrderCreateDto
            {
                CustomerId = SelectedCompany?.Id,
                CompanyName = CompanyName.Trim(),
                ContactPerson = ContactPerson.Trim(),
                RentalStartDate = start.Date,
                RentalEndDate = end.Date,
                Items = Lines
                    .Select(line => new OrderItemDto
                    {
                        EquipmentId = line.EquipmentId,
                        Quantity = line.Quantity,
                    })
                    .ToList(),
            };

            await _api.CreateOrderAsync(dto);
            _cart.Clear();
            await _cart.SaveAsync();
            StatusMessage = "Order placed successfully.";
            RaiseCartProperties();
        });
    }

    private async void IncreaseQuantity_Click(object sender, RoutedEventArgs e)
    {
        if (sender is not Button { DataContext: CartLine line })
        {
            return;
        }

        _cart.SetQuantity(line.EquipmentId, line.Quantity + 1);
        await _cart.SaveAsync();
        RaiseCartProperties();
    }

    private async void DecreaseQuantity_Click(object sender, RoutedEventArgs e)
    {
        if (sender is not Button { DataContext: CartLine line })
        {
            return;
        }

        if (line.Quantity <= 1)
        {
            _cart.Remove(line.EquipmentId);
        }
        else
        {
            _cart.SetQuantity(line.EquipmentId, line.Quantity - 1);
        }

        await _cart.SaveAsync();
        RaiseCartProperties();
    }

    private async void RemoveLine_Click(object sender, RoutedEventArgs e)
    {
        if (sender is not Button { DataContext: CartLine line })
        {
            return;
        }

        _cart.Remove(line.EquipmentId);
        await _cart.SaveAsync();
        RaiseCartProperties();
    }

    private void RaiseCartProperties()
    {
        RaisePropertyChanged(nameof(IsCartEmpty));
        RaisePropertyChanged(nameof(CanPlaceOrder));
        RaisePropertyChanged(nameof(SubtotalLabel));
    }
}
