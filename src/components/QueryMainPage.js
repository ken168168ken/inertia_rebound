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

export default function QueryMainPage({ username }) {
  const [stockCode, setStockCode] = useState("TSLA");
  const [selectedIndicators, setSelectedIndicators] = useState(["SMA", "MACD"]);
  const [params, setParams] = useState({
    SMA: { short: 5, long: 20 },
    MACD: { fast: 12, slow: 26, signal: 9 }
  });
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);

  // 查詢事件
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
        // 整理成 Recharts 能用的格式
        const data = result.dates.map((d, i) => ({
          date: d,
          close: result.closes[i]
        }));
        setChartData(data);
      }
    } catch (e) {
      alert("API 錯誤：" + e.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
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
  );
}
