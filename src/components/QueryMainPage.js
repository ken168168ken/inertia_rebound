// src/components/QueryMainPage.js
import React, { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from "recharts";

export default function QueryMainPage() {
  // ====== (前端狀態一樣保留) ======
  const [stockCode, setStockCode] = useState("TSLA");
  const [selectedIndicators, setSelectedIndicators] = useState(["SMA", "MACD"]);
  const [params, setParams] = useState({
    SMA: { short: 5, long: 20 },
    MACD: { fast: 12, slow: 26, signal: 9 },
    KDJ: { K: 9, D: 3, J: 3 },
    Bollinger: { period: 20, stdDev: 2 },
    W: { lookback: 30 },      // 假設 W 底需要 lookback 參數
    M: { lookback: 30 }
  });
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);

  // ====== (以下的 handleQuery, fetch 與折線圖邏輯同上一版) ======
  const handleQuery = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://inertia-rebound-backend.onrender.com/api/analyze",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            symbol: stockCode,
            indicators: selectedIndicators,
            params: params
          })
        }
      );
      const result = await response.json();
      if (result.error) {
        alert("查詢失敗：" + result.message);
        setChartData(null);
      } else {
        const data = result.dates.map((d, i) => ({
          date: d,
          close: result.closes[i]
        }));
        setChartData(data);
      }
    } catch (e) {
      alert("API 錯誤：Load failed 或 無法連線");
      setChartData(null);
    }
    setLoading(false);
  };

  return (
    <div>
      {/* ===== 一、Logo + 使用者名稱區塊 ===== */}
      <header className="site-header">
        <div className="site-logo">
          {/* 如果你是放到 public/logo.jpg，就用 /logo.jpg */}
          <img
            src="https://github.com/ken168168ken/inertia_rebound/blob/main/public/assets/logo.jpg?raw=true"
            alt="K技術分析站"
            className="h-10 inline-block mr-2"
          />
          K技術分析站
        </div>
        <div className="user-name">登入者：KenLee</div>
      </header>

      <div className="p-4 md:p-8">
        {/* ===== 二、股票代碼 + 查詢按鈕 ===== */}
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-6">
          <input
            type="text"
            placeholder="輸入股票代號 (例: TSLA, 2330.TW)"
            className="flex-1 border border-gray-300 rounded px-4 py-2"
            value={stockCode}
            onChange={(e) => setStockCode(e.target.value.toUpperCase())}
          />
          <button
            onClick={handleQuery}
            className="mt-3 md:mt-0 bg-indigo-600 text-white px-6 py-2 rounded-2xl hover:bg-indigo-700 transition"
            disabled={loading}
          >
            {loading ? "查詢中..." : "查詢"}
          </button>
        </div>

        {/* ===== 三、指標多選區塊 ===== */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-6">
          {/* 每個 checkbox 的 onChange 都要去更新 selectedIndicators 陣列 */}
          {["SMA", "MACD", "KDJ", "Bollinger", "W", "M"].map((ind) => (
            <label key={ind} className="flex items-center space-x-1">
              <input
                type="checkbox"
                checked={selectedIndicators.includes(ind)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedIndicators((prev) => [...prev, ind]);
                  } else {
                    setSelectedIndicators((prev) =>
                      prev.filter((x) => x !== ind)
                    );
                  }
                }}
              />
              <span>{ind === "Bollinger" ? "布林通道" : ind}</span>
            </label>
          ))}
        </div>

        {/* ===== 四、動態參數區塊：只顯示被勾選指標的參數 ===== */}
        <div className="space-y-6 mb-6">
          {/* 1. SMA 參數區 */}
          {selectedIndicators.includes("SMA") && (
            <div className="bg-white border border-gray-200 rounded p-4">
              <h3 className="font-medium mb-2">均線 (SMA) 參數</h3>
              <div className="flex items-center space-x-4">
                <div>
                  <label className="block text-sm">Short</label>
                  <input
                    type="number"
                    className="border border-gray-300 rounded px-2 py-1 w-20"
                    value={params.SMA.short}
                    onChange={(e) =>
                      setParams((prev) => ({
                        ...prev,
                        SMA: {
                          ...prev.SMA,
                          short: Number(e.target.value)
                        }
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm">Long</label>
                  <input
                    type="number"
                    className="border border-gray-300 rounded px-2 py-1 w-20"
                    value={params.SMA.long}
                    onChange={(e) =>
                      setParams((prev) => ({
                        ...prev,
                        SMA: {
                          ...prev.SMA,
                          long: Number(e.target.value)
                        }
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* 2. MACD 參數區 */}
          {selectedIndicators.includes("MACD") && (
            <div className="bg-white border border-gray-200 rounded p-4">
              <h3 className="font-medium mb-2">MACD 參數</h3>
              <div className="flex items-center space-x-4">
                {["fast", "slow", "signal"].map((key) => (
                  <div key={key}>
                    <label className="block text-sm">{key}</label>
                    <input
                      type="number"
                      className="border border-gray-300 rounded px-2 py-1 w-20"
                      value={params.MACD[key]}
                      onChange={(e) =>
                        setParams((prev) => ({
                          ...prev,
                          MACD: {
                            ...prev.MACD,
                            [key]: Number(e.target.value)
                          }
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. KDJ 參數區 */}
          {selectedIndicators.includes("KDJ") && (
            <div className="bg-white border border-gray-200 rounded p-4">
              <h3 className="font-medium mb-2">KDJ 參數</h3>
              <div className="flex items-center space-x-4">
                {["K", "D", "J"].map((key) => (
                  <div key={key}>
                    <label className="block text-sm">{key}</label>
                    <input
                      type="number"
                      className="border border-gray-300 rounded px-2 py-1 w-20"
                      value={params.KDJ[key]}
                      onChange={(e) =>
                        setParams((prev) => ({
                          ...prev,
                          KDJ: {
                            ...prev.KDJ,
                            [key]: Number(e.target.value)
                          }
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. 布林通道 (Bollinger) 參數區 */}
          {selectedIndicators.includes("Bollinger") && (
            <div className="bg-white border border-gray-200 rounded p-4">
              <h3 className="font-medium mb-2">布林通道參數</h3>
              <div className="flex items-center space-x-4">
                <div>
                  <label className="block text-sm">period</label>
                  <input
                    type="number"
                    className="border border-gray-300 rounded px-2 py-1 w-20"
                    value={params.Bollinger.period}
                    onChange={(e) =>
                      setParams((prev) => ({
                        ...prev,
                        Bollinger: {
                          ...prev.Bollinger,
                          period: Number(e.target.value)
                        }
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm">stdDev</label>
                  <input
                    type="number"
                    className="border border-gray-300 rounded px-2 py-1 w-20"
                    value={params.Bollinger.stdDev}
                    onChange={(e) =>
                      setParams((prev) => ({
                        ...prev,
                        Bollinger: {
                          ...prev.Bollinger,
                          stdDev: Number(e.target.value)
                        }
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* 5. W 底 參數區（只示範 lookback） */}
          {selectedIndicators.includes("W") && (
            <div className="bg-white border border-gray-200 rounded p-4">
              <h3 className="font-medium mb-2">W 底 參數</h3>
              <div className="flex items-center space-x-4">
                <div>
                  <label className="block text-sm">Lookback</label>
                  <input
                    type="number"
                    className="border border-gray-300 rounded px-2 py-1 w-20"
                    value={params.W.lookback}
                    onChange={(e) =>
                      setParams((prev) => ({
                        ...prev,
                        W: {
                          ...prev.W,
                          lookback: Number(e.target.value)
                        }
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* 6. M 頭 參數區（同 W 底） */}
          {selectedIndicators.includes("M") && (
            <div className="bg-white border border-gray-200 rounded p-4">
              <h3 className="font-medium mb-2">M 頭 參數</h3>
              <div className="flex items-center space-x-4">
                <div>
                  <label className="block text-sm">Lookback</label>
                  <input
                    type="number"
                    className="border border-gray-300 rounded px-2 py-1 w-20"
                    value={params.M.lookback}
                    onChange={(e) =>
                      setParams((prev) => ({
                        ...prev,
                        M: {
                          ...prev.M,
                          lookback: Number(e.target.value)
                        }
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ===== 五、折線圖 / 分析結果區 ===== */}
        <div className="mt-8">
          <h2 className="text-gray-700 font-medium mb-2">K 線圖與分析結果</h2>
          {chartData ? (
            <div className="h-96 bg-white border border-gray-200 rounded shadow-inner p-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid stroke="#f5f5f5" />
                  <XAxis dataKey="date" />
                  <YAxis domain={["auto", "auto"]} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="close"
                    stroke="#8884d8"
                    dot={false}
                    name="收盤價"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-96 bg-white border border-gray-200 rounded shadow-inner flex items-center justify-center text-gray-400">
              {loading ? "查詢中..." : "圖表區 / 分析結果區 (尚未查詢)"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
