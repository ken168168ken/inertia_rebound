# backend/main.py

from fastapi import FastAPI
from pydantic import BaseModel
import yfinance as yf

app = FastAPI()

class AnalyzeRequest(BaseModel):
    symbol: str
    indicators: list[str]
    params: dict

@app.post("/api/analyze")
async def analyze(req: AnalyzeRequest):
    # 1. 從 Yahoo Finance 下載最近 5 個交易日的股價
    data = yf.download(req.symbol, period="5d", interval="1d")

    # 2. 把收盤價提取到 list（一定要用 .tolist() 而不能拼錯）
    closes = data["Close"].tolist()

    # 3. 把日期（DataFrame index）轉成字串後，再轉成 list
    dates = data.index.strftime("%Y-%m-%d").tolist()

    # 4. 回傳 JSON
    return {
        "symbol": req.symbol,
        "dates": dates,
        "closes": closes,
        "indicators": req.indicators,
        "params": req.params
    }
