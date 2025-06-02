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
        # 1. 从 Yahoo Finance 下载最近 5 个交易日的股价
        data = yf.download(req.symbol, period="5d", interval="1d")

        # 在服务器日志里打印 data 本身、data["Close"] 以及它们的类型
        print(f"DEBUG: type(data) = {type(data)}")
        # 如果 data 没有 'Close' 这一列，data['Close'] 会抛 KeyError
        if "Close" not in data.columns:
            print(f"DEBUG: columns = {data.columns.tolist()}")
        else:
            print(f"DEBUG: type(data['Close']) = {type(data['Close'])}")

        # 2. 把收盘价取成 list（本来想用 .tolist()）
        #    先不急着调用 .tolist()，先看类型
        closes_series = data["Close"]
        print(f"DEBUG: closes_series.head() =\n{closes_series.head()}")

        # 如果 closes_series 不是 pandas.Series，就转一下
        if not hasattr(closes_series, "tolist"):
            # 例如，closes_series 竟然是个 DataFrame，就取第一列
            # （仅供排查时调试用，后面会改成更严谨的写法）
            print("DEBUG: closes_series 不是 Series，先把它取第一列：")
            # data["Close"] 如果返回 DataFrame，就把第一列拿出来
            closes_series = closes_series.iloc[:, 0]
            print(f"DEBUG: after iloc, type(closes_series) = {type(closes_series)}")

        closes = closes_series.tolist()

        # 3. 处理 index（日期）：
        dates_index = data.index
        print(f"DEBUG: type(dates_index) = {type(dates_index)}")
        # 转成字符串后再取 list
        dates = dates_index.strftime("%Y-%m-%d").tolist()

        # 4. 回传 JSON
        return {
            "symbol": req.symbol,
            "dates": dates,
            "closes": closes,
            "indicators": req.indicators,
            "params": req.params
        }

    except Exception as e:
        # 打印最原始的错误信息，方便我们直接看到是哪一行出问题
        print(f"Error in /api/analyze: {e}")
        # 同时回传给前端一个结构化的错误
        return {
            "error": True,
            "message": str(e)
        }
