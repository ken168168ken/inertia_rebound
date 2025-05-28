from fastapi import FastAPI, Query
from fastapi.responses import JSONResponse
import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta

app = FastAPI()

@app.get("/rebound")
def rebound(
    symbol: str = Query('TSLA', description="股票代碼，例如TSLA"),
    years: int = 6
):
    interval_map = {'日K':'1d', '週K':'1wk', '月K':'1mo'}
    result = {}
    for label, interval in interval_map.items():
        end = datetime.today()
        start = end - timedelta(days=365*years)
        df = yf.download(symbol, start=start.strftime('%Y-%m-%d'), end=end.strftime('%Y-%m-%d'), interval=interval)
        if df.empty or len(df) < 50:
            result[label] = {'最佳均線': None, '勝率': "0.0%", '
