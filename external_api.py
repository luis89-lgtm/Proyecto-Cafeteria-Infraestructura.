import requests

def get_exchange_rate():
    try:
        # Usamos una API publica libre de tipo de cambio
        response = requests.get("https://api.exchangerate-api.com/v4/latest/USD")
        if response.status_code == 200:
            data = response.json()
            # Obtenemos la tasa de cambio USD a MXN (Pesos Mexicanos)
            return data["rates"].get("MXN", 18.0)
        return 18.0 # Fallback
    except Exception:
        return 18.0 # Fallback
