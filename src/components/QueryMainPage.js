// src/components/QueryMainPage.js
import React, { useState } from 'react';

export default function QueryMainPage({ username }) {
  // 可用的技術指標列表
  const indicatorList = [
    { key: 'SMA', label: '均線 (SMA)' },
    { key: 'MACD', label: 'MACD' },
    { key: 'KDJ', label: 'KDJ' },
    { key: 'BB', label: '布林通道' },
    { key: 'W', label: 'W 底' },
    { key: 'M', label: 'M 頭' }
  ];

  // 每個指標的預設參數
  const defaultParams = {
    SMA: { short: 5, long: 20 },
    MACD: { fast: 12, slow: 26, signal: 9 },
    KDJ: { k: 9, d: 3, j: 3 },
    BB: { period: 20, stdDev: 2 },
    W: { lookback: 30 },
    M: { lookback: 30 }
  };

  // React 內部狀態：股號、選中指標、對應參數
  const [stockCode, setStockCode] = useState('');
  const [selectedIndicators, setSelectedIndicators] = useState([]);
  const [params, setParams] = useState(defaultParams);

  // 切換指標是否被選中
  const toggleIndicator = (key) => {
    setSelectedIndicators((prev) =>
      prev.includes(key)
        ? prev.filter((item) => item !== key)
        : [...prev, key]
    );
  };

  // 當使用者改參數欄位時更新狀態
  const handleParamChange = (indicatorKey, field, value) => {
    setParams((prev) => ({
      ...prev,
      [indicatorKey]: {
        ...prev[indicatorKey],
        [field]: value
      }
    }));
  };

  // 按下「查詢」按鈕的事件（目前只是印到 console，後面要串後端）
  const handleQuery = () => {
    console.log('查詢', stockCode, selectedIndicators, params);
    // TODO: 這邊改為呼叫後端 API，然後把結果畫到圖表區
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <img
            src="/assets/logo.jpg"
            alt="Logo"
            className="h-10 w-10 rounded-full"
          />
          <h1 className="ml-3 text-xl font-semibold text-gray-800">K技術分析站</h1>
        </div>
        <div className="text-gray-600">登入者：{username}</div>
      </header>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow p-6">
        {/* 查詢輸入區 */}
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-6">
          <input
            type="text"
            placeholder="輸入股票代碼 (例: 2330.TW, TSLA)"
            className="flex-1 border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={stockCode}
            onChange={(e) => setStockCode(e.target.value.toUpperCase())}
          />
          <button
            onClick={handleQuery}
            className="mt-3 md:mt-0 bg-indigo-600 text-white px-6 py-2 rounded-2xl hover:bg-indigo-700 transition"
          >
            查詢
          </button>
        </div>

        {/* 指標選擇區 */}
        <div className="mb-6">
          <h2 className="text-gray-700 font-medium mb-2">選擇技術指標</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {indicatorList.map(({ key, label }) => (
              <label key={key} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedIndicators.includes(key)}
                  onChange={() => toggleIndicator(key)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="text-gray-600">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 參數設定區 */}
        <div>
          {selectedIndicators.map((indicatorKey) => (
            <div
              key={indicatorKey}
              className="mb-4 border border-gray-200 rounded p-4 bg-gray-50"
            >
              <h3 className="text-gray-700 font-medium mb-2">
                {indicatorList.find((item) => item.key === indicatorKey).label} 參數
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(defaultParams[indicatorKey]).map(
                  ([field, defaultValue]) => (
                    <div key={field} className="flex flex-col">
                      <label className="text-gray-600 mb-1 capitalize">
                        {field}
                      </label>
                      <input
                        type="number"
                        value={params[indicatorKey][field]}
                        onChange={(e) =>
                          handleParamChange(
                            indicatorKey,
                            field,
                            Number(e.target.value)
                          )
                        }
                        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      />
                    </div>
                  )
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 圖表與結果區（Placeholder） */}
        <div className="mt-8">
          <h2 className="text-gray-700 font-medium mb-2">
            K 線圖與分析結果
          </h2>
          <div className="h-96 bg-white border border-gray-200 rounded shadow-inner flex items-center justify-center text-gray-400">
            圖表區 / 分析結果區 (開發中...)
          </div>
        </div>
      </div>
    </div>
  );
}
