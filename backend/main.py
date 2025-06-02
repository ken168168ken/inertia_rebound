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
    try:
        # 1. 從 Yahoo Finance 下載最近 5 個交易日的股價
        data = yf.download(req.symbol, period="5d", interval="1d")

        # 2. 把收盤價取成 list
        closes = data["Close"].tolist()

        # 3. 把日期 (DataFrame index) 轉字串後，再轉成 list
        dates = data.index.strftime("%Y-%m-%d").tolist()

        # 4. 回傳 JSON
        return {
            "symbol": req.symbol,
            "dates": dates,
            "closes": closes,
            "indicators": req.indicators,
            "params": req.params
        }

    except Exception as e:
        # 將錯誤印到伺服器的 Log 裡
        print(f"Error in /api/analyze: {e}")
        # 同時也回傳錯誤訊息給前端
        # 這樣在 Swagger UI 裡就能看到真正拋出的例外文字
        return {
            "error": True,
            "message": str(e)
        }
