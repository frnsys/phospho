import requests
import lxml.html
import pandas as pd
import fbprophet
import matplotlib.pyplot as plt

BASE_URL = 'https://www.indexmundi.com/commodities/'


def get_prices(commodities, months=360):
    params = {
        'months': months,
        'commodity': commodities
    }
    resp = requests.get(BASE_URL, params=params)
    html = lxml.html.fromstring(resp.content)
    if len(params['commodity']) == 2:
        correlation = html.cssselect('#lblPct')[0].text.split(': ')[-1]
        correlation = float(correlation)
    table = html.cssselect('#gvPrices')[0]
    headers = [e.text for e in table.cssselect('th')]

    # skip first row (header)
    rows = [[try_float(t.text) for t in e.cssselect('td')] for e in table.cssselect('tr')[1:]]
    return pd.DataFrame(columns=headers, data=rows)


def train_model(df, y_col, dt_col='Month', extra_cols=None):
    extra_cols = extra_cols or []
    df['ds'] = pd.to_datetime(df[dt_col])
    df['y'] = df[y_col]

    model = fbprophet.Prophet(weekly_seasonality=False, daily_seasonality=False, yearly_seasonality=False)
    for col in extra_cols:
        model.add_regressor(col)
    model.fit(df)
    return model


def try_float(v):
    """try converting a string
    value to a float. will try to
    handle percentage strings too.
    if the value can't be converted to a float,
    just return the original value."""
    v = v.strip()
    if v.endswith('%'):
        return float(v[:-1])/100
    try:
        return float(v)
    except ValueError:
        return v


if __name__ == '__main__':
    commodities = [
        'corn',
        'beef',
        'wheat',
        'oranges',
        'cheese'
    ]
    df = get_prices(['rock-phosphate'])
    model = train_model(df, 'Price')

    # df = get_prices(['rock-phosphate', 'beef'])
    # beef = 'Beef Price (US Dollars per Kilogram)'
    # phos = 'Rock Phosphate Price (US Dollars per Metric Ton)'
    # model = train_model(df, beef, extra_cols=[phos])

    # plt.plot(df['ds'], df['y'])
    # plt.show()

    future = model.make_future_dataframe(periods=365, freq='M')
    # import ipdb; ipdb.set_trace()
    forecast = model.predict(future)
    model.plot(forecast)
    plt.show()