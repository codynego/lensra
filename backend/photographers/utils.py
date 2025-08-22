CURRENCY_SYMBOLS = {
    # Global majors
    "USD": "$",     # US Dollar
    "EUR": "€",     # Euro
    "GBP": "£",     # British Pound
    "JPY": "¥",     # Japanese Yen
    "CNY": "¥",     # Chinese Yuan
    "INR": "₹",     # Indian Rupee
    
    # Africa
    "NGN": "₦",     # Nigerian Naira
    "GHS": "₵",     # Ghanaian Cedi
    "ZAR": "R",     # South African Rand
    "KES": "KSh",   # Kenyan Shilling
    "UGX": "USh",   # Ugandan Shilling
    "TZS": "TSh",   # Tanzanian Shilling
    "RWF": "FRw",   # Rwandan Franc
    "BIF": "FBu",   # Burundian Franc
    "CDF": "FC",    # Congolese Franc (DRC)
    "XAF": "FCFA",  # Central African CFA Franc
    "XOF": "CFA",   # West African CFA Franc
    "XPF": "₣",     # CFP Franc (French territories, less common)
    "MAD": "د.م.", # Moroccan Dirham
    "DZD": "د.ج",  # Algerian Dinar
    "TND": "د.ت",  # Tunisian Dinar
    "LYD": "ل.د",  # Libyan Dinar
    "EGP": "£",     # Egyptian Pound
    "SDG": "ج.س.", # Sudanese Pound
    "SSP": "£",     # South Sudanese Pound
    "ETB": "Br",   # Ethiopian Birr
    "ERN": "Nfk",  # Eritrean Nakfa
    "MZN": "MT",   # Mozambican Metical
    "AOA": "Kz",   # Angolan Kwanza
    "ZMW": "ZK",   # Zambian Kwacha
    "MWK": "MK",   # Malawian Kwacha
    "LSL": "L",    # Lesotho Loti
    "SZL": "E",    # Eswatini Lilangeni
    "MUR": "₨",    # Mauritian Rupee
    "SCR": "₨",    # Seychellois Rupee
    "MRU": "UM",   # Mauritanian Ouguiya
    "GNF": "FG",   # Guinean Franc
    "SLL": "Le",   # Sierra Leonean Leone
    "LRD": "$",     # Liberian Dollar
    "BWP": "P",    # Botswana Pula
    "NAD": "N$",   # Namibian Dollar
    "MGA": "Ar",   # Malagasy Ariary
    "KMF": "CF",   # Comorian Franc
    "STN": "Db",   # São Tomé and Príncipe Dobra
    "SOS": "Sh",   # Somali Shilling
}


def get_currency_symbol(code):
    """Return the currency symbol for a given code."""
    return CURRENCY_SYMBOLS.get(code, code) 