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
        # 1. 下載最近 5 天的股價資料
        data = yf.download(req.symbol, period="5d", interval="1d")

        # 2. 取出 "Close" 欄位，但 yfinance 有時會把它包成 DataFrame
        closes_obj = data["Close"]
        # 如果 closes_obj 不是 Series，就先把它當成 DataFrame，取第一列
        if not hasattr(closes_obj, "tolist"):
            # 例如 closes_obj 如果是 DataFrame，就用 iloc[:, 0] 拿第一個子欄位
            closes_series = closes_obj.iloc[:, 0]
        else:
            closes_series = closes_obj

        # 最終把 closes_series (Series) 轉成 list
        closes = closes_series.tolist()

        # 3. 處理日期索引 (DatetimeIndex) → 轉成字串以後再做 list
        dates_index = data.index
        dates = dates_index.strftime("%Y-%m-%d").tolist()

        # 4. 回傳 JSON
        return {
            "symbol": req.symbol,
            "dates": dates,
            "closes": closes,
            "indicators": req.indicators,
            "params": req.params
        }

    except Exception as e:
        # 若有任何例外，回傳包含錯誤訊息的格式
        return {
            "error": True,
            "message": str(e)
        }
