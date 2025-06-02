# backend/main.py

from fastapi import FastAPI
from pydantic import BaseModel
import yfinance as yf

app = FastAPI()

# 定義前端會送來的請求格式
class AnalyzeRequest(BaseModel):
    symbol: str
    indicators: list[str]
    params: dict

@app.post("/api/analyze")
async def analyze(req: AnalyzeRequest):
    # 1. 從 Yahoo Finance 下載最近 5 個交易日的股價
    data = yf.download(req.symbol, period="5d", interval="1d")
    # 2. 把收盤價提取到一個 list
    closes = data["Close"].tolist()
    dates = data.index.strftime("%Y-%m-%d").tolist()
    # 3. 回傳 JSON 給前端
    return {
        "symbol": req.symbol,
        "dates": dates,
        "closes": closes,
        "indicators": req.indicators,
        "params": req.params
    }
