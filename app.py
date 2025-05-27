from fastapi import FastAPI, Query
from fastapi.responses import JSONResponse
import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta

app = FastAPI()

@app.get("/rebound")
def rebound(
    symbol: str = Query('TSLA', description="股票代碼，例如TSLA"),
    years: int = 5
):
    interval_map = {'日K':'1d', '週K':'1wk', '月K':'1mo'}
    result = {}
    for label, interval in interval_map.items():
        end = datetime.today()
        start = end - timedelta(days=365*years)
        df = yf.download(symbol, start=start.strftime('%Y-%m-%d'), end=end.strftime('%Y-%m-%d'), interval=interval)
        if df.empty:
            result[label] = {'error': 'No data found'}
            continue
        ma_list = [5,10,13,20,30,60,120,240]
        best_ma, best_rate, rebound_cnt, win_cnt = None, 0, 0, 0
        for ma in ma_list:
            ma_col = f"MA{ma}"
            df[ma_col] = df['Close'].rolling(window=ma).mean()
            rc, wc = 0, 0
            for i in range(ma, len(df)-5):
                prev_close = float(df['Close'].iloc[i-1])
                prev_ma = float(df[ma_col].iloc[i-1])
                this_close = float(df['Close'].iloc[i])
                this_ma = float(df[ma_col].iloc[i])
                # 跳過NaN
                if any(pd.isna([prev_close, prev_ma, this_close, this_ma])):
                    continue
                if (prev_close > prev_ma) and (this_close <= this_ma):
                    rc += 1
                    future_close = df['Close'].iloc[i+1:i+6]
                    base = this_close
                    if (future_close > base*1.03).any():
                        wc += 1
            if rc > 0 and wc/rc > best_rate:
                best_ma, best_rate, rebound_cnt, win_cnt = ma, wc/rc, rc, wc
        result[label] = {
            '最佳均線': best_ma,
            '勝率': f"{best_rate*100:.1f}%",
            '回調次數': rebound_cnt,
            '成功次數': win_cnt
        }
    return JSONResponse(content=result)
