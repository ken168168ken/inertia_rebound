from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import yfinance as yf

app = FastAPI()

# 加上 CORS middleware，允許任何網域呼叫這個 API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    symbol: str
    indicators: list[str]
    params: dict

@app.post("/api/analyze")
async def analyze(req: AnalyzeRequest):
    try:
        data = yf.download(req.symbol, period="5d", interval="1d")
        closes_obj = data["Close"]
        if not hasattr(closes_obj, "tolist"):
            closes_series = closes_obj.iloc[:, 0]
        else:
            closes_series = closes_obj
        closes = closes_series.tolist()

        dates_index = data.index
        dates = dates_index.strftime("%Y-%m-%d").tolist()

        return {
            "symbol": req.symbol,
            "dates": dates,
            "closes": closes,
            "indicators": req.indicators,
            "params": req.params
        }
    except Exception as e:
        return {
            "error": True,
            "message": str(e)
        }
