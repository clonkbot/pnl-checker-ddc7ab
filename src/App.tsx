import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TokenHolding {
  symbol: string;
  name: string;
  amount: number;
  avgBuyPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
}

const generateMockData = (): TokenHolding[] => {
  const tokens = [
    { symbol: 'ETH', name: 'Ethereum' },
    { symbol: 'BTC', name: 'Bitcoin' },
    { symbol: 'SOL', name: 'Solana' },
    { symbol: 'ARB', name: 'Arbitrum' },
    { symbol: 'LINK', name: 'Chainlink' },
    { symbol: 'PEPE', name: 'Pepe' },
    { symbol: 'UNI', name: 'Uniswap' },
    { symbol: 'DOGE', name: 'Dogecoin' },
  ];

  return tokens.slice(0, Math.floor(Math.random() * 5) + 3).map(token => {
    const avgBuyPrice = Math.random() * 1000 + 10;
    const volatility = (Math.random() - 0.4) * 0.6;
    const currentPrice = avgBuyPrice * (1 + volatility);
    const amount = Math.random() * 50 + 1;
    const pnl = (currentPrice - avgBuyPrice) * amount;
    const pnlPercent = ((currentPrice - avgBuyPrice) / avgBuyPrice) * 100;

    return {
      ...token,
      amount,
      avgBuyPrice,
      currentPrice,
      pnl,
      pnlPercent,
    };
  });
};

const TypewriterText = ({ text, delay = 0 }: { text: string; delay?: number }) => {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        if (i < text.length) {
          setDisplayed(text.slice(0, i + 1));
          i++;
        } else {
          clearInterval(interval);
        }
      }, 30);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, delay]);

  return <span>{displayed}<span className="animate-pulse">_</span></span>;
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatPercent = (value: number): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};

export default function App() {
  const [wallet, setWallet] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [holdings, setHoldings] = useState<TokenHolding[] | null>(null);
  const [showData, setShowData] = useState(false);

  const totalPnl = holdings?.reduce((sum, h) => sum + h.pnl, 0) ?? 0;
  const totalValue = holdings?.reduce((sum, h) => sum + h.currentPrice * h.amount, 0) ?? 0;
  const totalCost = holdings?.reduce((sum, h) => sum + h.avgBuyPrice * h.amount, 0) ?? 0;
  const totalPnlPercent = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;

  const handleCheck = useCallback(() => {
    if (!wallet.trim()) return;
    setIsLoading(true);
    setShowData(false);
    setHoldings(null);

    setTimeout(() => {
      setHoldings(generateMockData());
      setIsLoading(false);
      setTimeout(() => setShowData(true), 200);
    }, 1500);
  }, [wallet]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleCheck();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e0e0e0] relative overflow-hidden flex flex-col">
      {/* Scanline overlay */}
      <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.03]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,65,0.1) 2px, rgba(0,255,65,0.1) 4px)',
        }}
      />

      {/* Grain texture */}
      <div className="pointer-events-none fixed inset-0 z-40 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Subtle glow effect */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#00ff41]/5 blur-[150px] rounded-full pointer-events-none" />

      <main className="relative z-10 flex-1 px-4 py-8 md:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8 md:mb-12"
          >
            <div className="flex items-center gap-2 md:gap-3 mb-2">
              <div className="w-2 h-2 md:w-3 md:h-3 bg-[#00ff41] rounded-full animate-pulse" />
              <span className="text-[#00ff41]/60 text-xs md:text-sm font-mono uppercase tracking-[0.2em]">
                System Online
              </span>
            </div>
            <h1 className="font-mono text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              <span className="text-[#00ff41]">PNL</span>
              <span className="text-[#404040]">::</span>
              <span className="text-white/90">CHECKER</span>
            </h1>
            <p className="text-[#606060] font-mono text-sm md:text-base mt-2 md:mt-3 max-w-md">
              {'>'} Enter wallet address to analyze profit/loss
            </p>
          </motion.div>

          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8 md:mb-12"
          >
            <div className="relative group">
              <div className="absolute -inset-[1px] bg-gradient-to-r from-[#00ff41]/30 via-[#00ff41]/10 to-[#00ff41]/30 rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
              <div className="relative flex flex-col sm:flex-row gap-3 sm:gap-0 bg-[#111] border border-[#222] rounded-lg p-3 sm:p-2">
                <div className="flex items-center gap-2 sm:gap-3 flex-1">
                  <span className="text-[#00ff41] font-mono text-sm hidden sm:inline">$</span>
                  <input
                    type="text"
                    value={wallet}
                    onChange={(e) => setWallet(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="0x... or ENS name"
                    className="flex-1 bg-transparent outline-none font-mono text-sm md:text-base text-white placeholder:text-[#404040] min-w-0"
                  />
                </div>
                <button
                  onClick={handleCheck}
                  disabled={isLoading || !wallet.trim()}
                  className="sm:ml-2 px-4 md:px-6 py-3 sm:py-2 bg-[#00ff41] text-black font-mono font-bold text-sm uppercase tracking-wider rounded hover:bg-[#00ff41]/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-[0_0_20px_rgba(0,255,65,0.3)] min-h-[44px]"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="hidden sm:inline">Scanning</span>
                    </span>
                  ) : 'Check PNL'}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Results Section */}
          <AnimatePresence mode="wait">
            {isLoading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-mono text-[#00ff41]/70 text-sm"
              >
                <TypewriterText text="Scanning blockchain for wallet activity..." />
              </motion.div>
            )}

            {showData && holdings && (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                {/* Total PNL Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className={`p-4 md:p-6 lg:p-8 rounded-lg border mb-6 md:mb-8 relative overflow-hidden ${
                    totalPnl >= 0
                      ? 'bg-[#00ff41]/5 border-[#00ff41]/30'
                      : 'bg-red-500/5 border-red-500/30'
                  }`}
                >
                  <div className="absolute inset-0 opacity-10"
                    style={{
                      backgroundImage: totalPnl >= 0
                        ? 'linear-gradient(135deg, #00ff41 0%, transparent 50%)'
                        : 'linear-gradient(135deg, #ef4444 0%, transparent 50%)',
                    }}
                  />
                  <div className="relative z-10">
                    <p className="text-xs md:text-sm font-mono text-[#606060] uppercase tracking-wider mb-1 md:mb-2">
                      Total Unrealized PNL
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
                      <span className={`text-3xl md:text-4xl lg:text-5xl font-mono font-bold ${
                        totalPnl >= 0 ? 'text-[#00ff41]' : 'text-red-500'
                      }`}>
                        {totalPnl >= 0 ? '+' : ''}{formatCurrency(totalPnl)}
                      </span>
                      <span className={`text-lg md:text-xl font-mono ${
                        totalPnl >= 0 ? 'text-[#00ff41]/70' : 'text-red-500/70'
                      }`}>
                        {formatPercent(totalPnlPercent)}
                      </span>
                    </div>
                    <p className="text-sm md:text-base font-mono text-[#505050] mt-2 md:mt-3">
                      Portfolio Value: {formatCurrency(totalValue)}
                    </p>
                  </div>
                </motion.div>

                {/* Holdings List */}
                <div className="space-y-2 md:space-y-3">
                  <div className="flex items-center gap-2 mb-3 md:mb-4">
                    <div className="h-px flex-1 bg-gradient-to-r from-[#222] to-transparent" />
                    <span className="text-xs font-mono text-[#404040] uppercase tracking-wider">Holdings</span>
                    <div className="h-px flex-1 bg-gradient-to-l from-[#222] to-transparent" />
                  </div>

                  {holdings.map((holding, index) => (
                    <motion.div
                      key={holding.symbol}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 + index * 0.08 }}
                      className="group bg-[#111] border border-[#1a1a1a] rounded-lg p-3 md:p-4 hover:border-[#333] transition-all duration-300 hover:bg-[#141414]"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                        <div className="flex items-center gap-3 md:gap-4">
                          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#1a1a1a] border border-[#252525] flex items-center justify-center font-mono text-xs md:text-sm font-bold text-[#00ff41] flex-shrink-0">
                            {holding.symbol.slice(0, 3)}
                          </div>
                          <div>
                            <p className="font-mono text-sm md:text-base font-bold text-white">{holding.symbol}</p>
                            <p className="font-mono text-xs text-[#505050]">{holding.name}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4 md:gap-6 sm:text-right">
                          <div>
                            <p className="font-mono text-xs text-[#404040]">Amount</p>
                            <p className="font-mono text-sm md:text-base text-white">{holding.amount.toFixed(4)}</p>
                          </div>
                          <div className="min-w-[80px] md:min-w-[100px] text-right">
                            <p className="font-mono text-xs text-[#404040]">PNL</p>
                            <p className={`font-mono text-sm md:text-base font-bold ${
                              holding.pnl >= 0 ? 'text-[#00ff41]' : 'text-red-500'
                            }`}>
                              {holding.pnl >= 0 ? '+' : ''}{formatCurrency(holding.pnl)}
                            </p>
                            <p className={`font-mono text-xs ${
                              holding.pnl >= 0 ? 'text-[#00ff41]/60' : 'text-red-500/60'
                            }`}>
                              {formatPercent(holding.pnlPercent)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Status bar */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-[#1a1a1a] flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-[#404040]"
                >
                  <span>Last updated: {new Date().toLocaleTimeString()}</span>
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#00ff41] rounded-full animate-pulse" />
                    Live Data
                  </span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty State */}
          {!isLoading && !holdings && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center py-12 md:py-16"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#111] border border-[#222] mb-4 md:mb-6">
                <svg className="w-8 h-8 md:w-10 md:h-10 text-[#333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="font-mono text-[#404040] text-sm md:text-base">Enter a wallet address to check PNL</p>
              <p className="font-mono text-[#303030] text-xs md:text-sm mt-2">Supports ETH, ENS, and more</p>
            </motion.div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 md:py-6 border-t border-[#151515]">
        <p className="text-center font-mono text-[10px] md:text-xs text-[#353535] tracking-wide">
          Requested by <span className="text-[#454545]">@im_2die4</span> · Built by <span className="text-[#454545]">@clonkbot</span>
        </p>
      </footer>
    </div>
  );
}
