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
    interval_map = {'day':'1d', 'week':'1wk', 'month':'1mo'}
    result = {}
    for label, interval in interval_map.items():
        end = datetime.today()
        start = end - timedelta(days=365*years)
        df = yf.download(symbol, start=start.strftime('%Y-%m-%d'), end=end.strftime('%Y-%m-%d'), interval=interval)
        if df.empty or len(df) < 50:
            result[label] = {'錯誤': '查無資料或資料筆數不足', '資料筆數': len(df)}
            continue
        ma_list = [5,10,13,20,30,60,120,240]
        best_ma, best_rate, rebound_cnt, win_cnt = None, 0, 0, 0
        for ma in ma_list:
            ma_col = f"MA{ma}"
            df[ma_col] = df['Close'].rolling(window=ma).mean()
            rc, wc = 0, 0
            for i in range(ma, len(df)-5):
                try:
                    prev_close = df['Close'].iloc[i-1]
                    prev_ma = df[ma_col].iloc[i-1]
                    this_close = df['Close'].iloc[i]
                    this_ma = df[ma_col].iloc[i]
                    if pd.isna(prev_close) or pd.isna(prev_ma) or pd.isna(this_close) or pd.isna(this_ma):
                        continue
                    if (prev_close > prev_ma) and (this_close <= this_ma):
                        rc += 1
                        future_close = df['Close'].iloc[i+1:i+6]
                        base = this_close
                        if pd.isna(base) or future_close.isna().all():
                            continue
                        if (future_close > base*1.03).any():
                            wc += 1
                except Exception as e:
                    continue
            if rc > 0 and wc/rc > best_rate:
                best_ma, best_rate, rebound_cnt, win_cnt = ma, wc/rc, rc, wc
        result[label] = {
            '最佳均線': best_ma,
            '勝率': f"{best_rate*100:.1f}%",
            '回調次數': rebound_cnt,
            '成功次數': win_cnt,
            '資料筆數': len(df)
        }
    return JSONResponse(content=result)
