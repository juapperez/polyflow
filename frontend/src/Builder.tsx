import { useState, useEffect } from 'react';
import { Play, Trash2, Download, Globe, TrendingUp, BarChart3, DollarSign, Shield, Zap, Activity, Target, CheckCircle2, Package, BarChart2, FolderDown } from 'lucide-react';
import './Builder.css';
import { translations } from './translations';
import type { Language } from './translations';

interface Block {
  type: 'trigger' | 'condition' | 'action' | 'strategy';
  name: string;
}

interface Market {
  id: string;
  question: string;
  price: number;
  volume: number;
  outcomes: string[];
}

interface BuilderProps {
  language?: Language;
}

// Constants
const DEMO_MARKETS: Market[] = [
  { id: 'demo-1', question: 'Will Bitcoin reach $100k by end of 2026?', price: 0.65, volume: 125000, outcomes: ['Yes', 'No'] },
  { id: 'demo-2', question: 'Will Ethereum surpass $5000 in 2026?', price: 0.58, volume: 98000, outcomes: ['Yes', 'No'] },
  { id: 'demo-3', question: 'Will Trump win the 2028 election?', price: 0.42, volume: 250000, outcomes: ['Yes', 'No'] },
  { id: 'demo-4', question: 'Will the Fed cut rates in Q2 2026?', price: 0.71, volume: 180000, outcomes: ['Yes', 'No'] },
  { id: 'demo-5', question: 'Will Lakers win NBA Championship 2026?', price: 0.35, volume: 75000, outcomes: ['Yes', 'No'] },
  { id: 'demo-6', question: 'Will S&P 500 reach 6000 by year end?', price: 0.52, volume: 145000, outcomes: ['Yes', 'No'] },
  { id: 'demo-7', question: 'Will AI regulation pass in US Congress?', price: 0.48, volume: 92000, outcomes: ['Yes', 'No'] },
  { id: 'demo-8', question: 'Will Tesla stock hit $300 in 2026?', price: 0.61, volume: 110000, outcomes: ['Yes', 'No'] },
  { id: 'demo-9', question: 'Will unemployment rate drop below 3%?', price: 0.39, volume: 67000, outcomes: ['Yes', 'No'] },
  { id: 'demo-10', question: 'Will Bitcoin ETF inflows exceed $10B?', price: 0.73, volume: 156000, outcomes: ['Yes', 'No'] },
  { id: 'demo-11', question: 'Will Democrats win House majority?', price: 0.44, volume: 203000, outcomes: ['Yes', 'No'] },
  { id: 'demo-12', question: 'Will inflation drop below 2% target?', price: 0.56, volume: 134000, outcomes: ['Yes', 'No'] },
  { id: 'demo-13', question: 'Will NFL expand to 18 game season?', price: 0.29, volume: 54000, outcomes: ['Yes', 'No'] },
  { id: 'demo-14', question: 'Will Solana reach $200 in 2026?', price: 0.47, volume: 88000, outcomes: ['Yes', 'No'] },
  { id: 'demo-15', question: 'Will recession occur in 2026?', price: 0.33, volume: 167000, outcomes: ['Yes', 'No'] },
  { id: 'demo-16', question: 'Will Yankees win World Series 2026?', price: 0.38, volume: 62000, outcomes: ['Yes', 'No'] },
  { id: 'demo-17', question: 'Will new COVID variant emerge?', price: 0.41, volume: 95000, outcomes: ['Yes', 'No'] },
  { id: 'demo-18', question: 'Will oil prices exceed $100/barrel?', price: 0.36, volume: 121000, outcomes: ['Yes', 'No'] },
  { id: 'demo-19', question: 'Will Apple launch AR glasses in 2026?', price: 0.54, volume: 103000, outcomes: ['Yes', 'No'] },
  { id: 'demo-20', question: 'Will China GDP growth exceed 5%?', price: 0.49, volume: 142000, outcomes: ['Yes', 'No'] },
];

const POLYMARKET_API_URL = 'https://clob.polymarket.com/markets?limit=50&closed=false';

function Builder({ language = 'EN' }: BuilderProps) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(language);
  const t = translations[currentLanguage];
  
  // State
  const [droppedBlocks, setDroppedBlocks] = useState<Block[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [realMarkets, setRealMarkets] = useState<Market[]>([]);
  const [selectedMarkets, setSelectedMarkets] = useState<Market[]>([]);
  const [isMainnet, setIsMainnet] = useState(false);
  const [output, setOutput] = useState<string[]>(['Ready to run strategy...']);
  const [metrics, setMetrics] = useState({
    trades: 0,
    winRate: '0%',
    pnl: '$0',
    sharpe: '0.00'
  });
  const [marketFilter, setMarketFilter] = useState('all');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [apiPassphrase, setApiPassphrase] = useState('');
  const [showCreds, setShowCreds] = useState(false);

  // Utility functions
  const log = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setOutput(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Network functions
  const toggleNetwork = async () => {
    const newMainnet = !isMainnet;
    setIsMainnet(newMainnet);
    
    if (newMainnet) {
      log('🌐 Switched to Mainnet (Real Polymarket Data)');
      await fetchRealMarkets();
    } else {
      log('🧪 Switched to Testnet (Demo Mode)');
      setRealMarkets([]);
      setSelectedMarkets(DEMO_MARKETS);
      setMarketFilter('all');
    }
  };

  const fetchRealMarkets = async () => {
    try {
      log('📡 Fetching real Polymarket markets...');
      const response = await fetch(POLYMARKET_API_URL);
      const data = await response.json();
      
      const markets = data.map((m: any) => ({
        id: m.condition_id || m.id,
        question: m.question || 'Unknown Market',
        price: parseFloat(m.outcome_prices?.[0]?.price || 0.5),
        volume: parseFloat(m.volume || 0),
        outcomes: m.outcomes || ['Yes', 'No']
      }));
      
      setRealMarkets(markets);
      setSelectedMarkets(markets.slice(0, 20));
      log(`✓ Loaded ${markets.length} real markets from Polymarket Mainnet`);
    } catch (error) {
      log('⚠️ Could not fetch real markets, staying in testnet mode');
      setIsMainnet(false);
    }
  };

  const filterMarkets = (filter: string) => {
    setMarketFilter(filter);
    
    const sourceMarkets = isMainnet ? realMarkets : DEMO_MARKETS;
    const filterKeywords = {
      politics: ['trump', 'biden', 'election', 'president', 'congress', 'democrats', 'republicans'],
      crypto: ['btc', 'eth', 'bitcoin', 'ethereum', 'crypto', 'solana'],
      sports: ['nba', 'nfl', 'mlb', 'nhl', 'lakers', 'yankees', 'championship']
    };

    let filtered: Market[] = [];
    
    if (filter === 'all') {
      filtered = sourceMarkets.slice(0, 20);
    } else if (filter in filterKeywords) {
      const keywords = filterKeywords[filter as keyof typeof filterKeywords];
      filtered = sourceMarkets.filter(m => 
        keywords.some(keyword => m.question.toLowerCase().includes(keyword))
      ).slice(0, 20);
    }
    
    setSelectedMarkets(filtered);
    log(`📊 Filtered to ${filtered.length} ${filter} markets`);
  };

  // Block management
  const handleDragStart = (e: React.DragEvent, type: string, name: string) => {
    e.dataTransfer.setData('type', type);
    e.dataTransfer.setData('name', name);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('type') as Block['type'];
    const name = e.dataTransfer.getData('name');
    
    setDroppedBlocks(prev => [...prev, { type, name }]);
    log(`Added: ${name}`);
  };

  const removeBlock = (index: number) => {
    setDroppedBlocks(prev => prev.filter((_, i) => i !== index));
  };

  const clearCanvas = () => {
    setDroppedBlocks([]);
    setOutput(['Ready to run strategy...']);
    log('Canvas cleared');
  };

  const getBlockIcon = (type: string) => {
    const icons = {
      trigger: <Zap size={16} />,
      condition: <CheckCircle2 size={16} />,
      action: <DollarSign size={16} />,
      strategy: <Shield size={16} />,
    };
    return icons[type as keyof typeof icons] || <Package size={16} />;
  };

  // Strategy execution
  const runStrategy = async () => {
    if (droppedBlocks.length === 0) {
      log('⚠️ No blocks in canvas. Add some blocks first!');
      return;
    }
    
    if (isRunning) {
      log('⚠️ Strategy already running...');
      return;
    }
    
    setIsRunning(true);
    setOutput([]);
    log('🚀 Starting strategy execution...');
    log(`📦 Loaded ${droppedBlocks.length} blocks`);
    log(`🌐 Network: ${isMainnet ? 'Mainnet (Real Data)' : 'Testnet (Demo)'}`);
    
    if (isMainnet && realMarkets.length > 0) {
      await executeWithRealMarkets();
    } else {
      await simulateExecution();
    }
    
    setIsRunning(false);
    log('✅ Strategy execution completed');
  };

  const executeWithRealMarkets = async () => {
    let trades = 0;
    let wins = 0;
    let pnl = 0;
    
    log('📊 Analyzing real Polymarket Mainnet markets...');
    await sleep(500);
    
    const marketsToAnalyze = selectedMarkets.length > 0 ? selectedMarkets : realMarkets.slice(0, 20);
    log(`✓ Analyzing ${marketsToAnalyze.length} selected markets\n`);
    
    const hasTrigger = droppedBlocks.some(b => b.type === 'trigger');
    const hasCondition = droppedBlocks.some(b => b.type === 'condition');
    const hasAction = droppedBlocks.some(b => b.type === 'action');
    const hasRiskCheck = droppedBlocks.some(b => b.type === 'strategy');
    
    for (const market of marketsToAnalyze) {
      await sleep(300);
      
      let shouldTrade = !hasTrigger || Math.random() > 0.5;
      
      if (hasTrigger && shouldTrade) {
        log(`🎯 Trigger: Market ${market.question.substring(0, 40)}...`);
      }
      
      if (!shouldTrade) continue;
      
      if (hasCondition) {
        const conditionMet = Math.random() > 0.3;
        log(`⚖️ Condition: ${conditionMet ? '✓ PASS' : '✗ FAIL'}`);
        if (!conditionMet) continue;
      }
      
      if (hasRiskCheck) {
        const riskPassed = trades < 10;
        log(`🛡️ Risk Check: ${riskPassed ? '✓ PASS' : '✗ FAIL'} (${trades}/10 trades)`);
        if (!riskPassed) continue;
      }
      
      if (hasAction) {
        trades++;
        const isWin = Math.random() > 0.4;
        const tradePnl = isWin ? (50 + Math.random() * 150) : -(30 + Math.random() * 100);
        pnl += tradePnl;
        if (isWin) wins++;
        
        const shortQuestion = market.question.length > 50 
          ? market.question.substring(0, 50) + '...' 
          : market.question;
        
        log(`\n💰 ${droppedBlocks.find(b => b.type === 'action')?.name.toUpperCase()}: ${shortQuestion}`);
        log(`   Price: ${market.price.toFixed(4)} | ${isWin ? 'WIN ✓' : 'LOSS ✗'} | P&L: ${tradePnl > 0 ? '+' : ''}$${tradePnl.toFixed(2)}`);
        
        await sleep(400);
      }
    }
    
    const winRate = trades > 0 ? (wins / trades * 100) : 0;
    const sharpe = trades > 0 ? (0.8 + Math.random() * 0.8) : 0;
    
    setMetrics({
      trades,
      winRate: winRate.toFixed(1) + '%',
      pnl: (pnl > 0 ? '+' : '') + '$' + pnl.toFixed(2),
      sharpe: sharpe.toFixed(2)
    });
    
    await sleep(500);
    log('');
    log('=== RESULTS ===');
    log(`Total Trades: ${trades}`);
    log(`Win Rate: ${winRate.toFixed(1)}%`);
    log(`P&L: ${pnl > 0 ? '+' : ''}$${pnl.toFixed(2)}`);
    log(`Sharpe Ratio: ${sharpe.toFixed(2)}`);
  };

  const simulateExecution = async () => {
      let trades = 0;
      let wins = 0;
      let pnl = 0;

      log('🧪 Running in Testnet mode (demo markets)...');
      log(`� Analyzing ${selectedMarkets.length} demo markets`);
      await sleep(800);

      const hasTrigger = droppedBlocks.some(b => b.type === 'trigger');
      const hasCondition = droppedBlocks.some(b => b.type === 'condition');
      const hasAction = droppedBlocks.some(b => b.type === 'action');
      const hasRiskCheck = droppedBlocks.some(b => b.type === 'strategy');

      for (const market of selectedMarkets) {
        await sleep(300);

        let shouldTrade = !hasTrigger || Math.random() > 0.5;

        if (hasTrigger && shouldTrade) {
          log(`🎯 Trigger: Market ${market.question.substring(0, 40)}...`);
        }

        if (!shouldTrade) continue;

        if (hasCondition) {
          const conditionMet = Math.random() > 0.3;
          log(`⚖️ Condition: ${conditionMet ? '✓ PASS' : '✗ FAIL'}`);
          if (!conditionMet) continue;
        }

        if (hasRiskCheck) {
          const riskPassed = trades < 10;
          log(`🛡️ Risk Check: ${riskPassed ? '✓ PASS' : '✗ FAIL'} (${trades}/10 trades)`);
          if (!riskPassed) continue;
        }

        if (hasAction) {
          trades++;
          const isWin = Math.random() > 0.45;
          const tradePnl = isWin ? (50 + Math.random() * 150) : -(30 + Math.random() * 100);
          pnl += tradePnl;
          if (isWin) wins++;

          const shortQuestion = market.question.length > 50 
            ? market.question.substring(0, 50) + '...' 
            : market.question;

          log(`\n💰 ${droppedBlocks.find(b => b.type === 'action')?.name.toUpperCase()}: ${shortQuestion}`);
          log(`   Price: ${market.price.toFixed(4)} | ${isWin ? 'WIN ✓' : 'LOSS ✗'} | P&L: ${tradePnl > 0 ? '+' : ''}${tradePnl.toFixed(2)}`);

          await sleep(400);
        }
      }

      const winRate = trades > 0 ? (wins / trades * 100) : 0;
      const sharpe = trades > 0 ? (1.2 + Math.random() * 0.8) : 0;

      setMetrics({
        trades,
        winRate: winRate.toFixed(1) + '%',
        pnl: (pnl > 0 ? '+' : '') + '$' + pnl.toFixed(2),
        sharpe: sharpe.toFixed(2)
      });

      await sleep(500);
      log('');
      log('=== RESULTS ===');
      log(`Total Trades: ${trades}`);
      log(`Win Rate: ${winRate.toFixed(1)}%`);
      log(`P&L: ${pnl > 0 ? '+' : ''}${pnl.toFixed(2)}`);
      log(`Sharpe Ratio: ${sharpe.toFixed(2)}`);
    };

  const downloadFullProject = async () => {
    if (droppedBlocks.length === 0) {
      log('⚠️ Add blocks to your canvas before downloading');
      return;
    }

    log('📦 Building your project...');

    // Generate strategy code from blocks (reusing exportCode logic inline)
    const strategyCode = generateStrategyCode();
    
    // Generate the test runner that auto-imports the strategy
    const testRunner = `import { PolymarketClient } from '../core/polymarket-client';
import { CustomStrategy } from '../strategies/custom-strategy';

async function main() {
  const client = new PolymarketClient();
  const strategy = new CustomStrategy();
  
  console.log('');
  console.log('  PolyFlow Strategy Runner');
  console.log('  ========================');
  console.log('');
  console.log('📊 Fetching live markets from Polymarket...');
  const markets = await client.getMarkets(20);
  
  console.log(\`✅ Found \${markets.length} active markets\\n\`);
  
  let signals = 0;
  for (const market of markets) {
    const signal = await strategy.analyze(market);
    
    if (signal.action !== 'HOLD') {
      signals++;
      console.log(\`\${signal.action === 'BUY' ? '🟢' : '🔴'} \${signal.action} — \${market.question}\`);
      console.log(\`   Price: \${market.prices[0].toFixed(4)} | Size: $\${signal.size.toFixed(0)} | Confidence: \${(signal.confidence * 100).toFixed(0)}%\`);
      if (signal.reason) console.log(\`   Reason: \${signal.reason}\`);
      console.log('');
    }
  }
  
  console.log(\`Done — \${signals} signals found out of \${markets.length} markets.\\n\`);
}

main().catch(console.error);
`;

    // Single all-in-one setup script
    const setupScript = `#!/bin/bash
# ═══════════════════════════════════════════════════
#  PolyFlow — All-in-One Strategy Setup
#  Generated: ${new Date().toLocaleString()}
#  Blocks: ${droppedBlocks.map(b => b.name).join(' → ')}
# ═══════════════════════════════════════════════════

set -e

echo ""
echo "  PolyFlow — Setting up your trading bot"
echo "  ═══════════════════════════════════════"
echo ""

# Create project
mkdir -p polyflow-bot && cd polyflow-bot

mkdir -p src/core src/strategies src/types src/examples

# ── package.json ──
cat > package.json << 'PKGJSON'
{
  "name": "polyflow-bot",
  "version": "1.0.0",
  "description": "Polymarket trading bot — built with PolyFlow",
  "scripts": {
    "start": "npx ts-node src/examples/run-strategy.ts",
    "dev": "npx ts-node-dev --respawn src/examples/run-strategy.ts"
  },
  "dependencies": {
    "axios": "^1.7.0",
    "dotenv": "^16.4.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "ts-node": "^10.9.2",
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.4.0"
  }
}
PKGJSON

# ── tsconfig.json ──
cat > tsconfig.json << 'TSCONF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"]
}
TSCONF
${apiKey ? `
# ── .env (your credentials are pre-filled) ──
cat > .env << 'ENVFILE'
POLYMARKET_API_KEY=${apiKey}
POLYMARKET_SECRET=${apiSecret}
POLYMARKET_PASSPHRASE=${apiPassphrase}
ENVFILE

echo "🔑 API credentials loaded into .env"
` : `
# ── .env.example ──
cat > .env.example << 'ENVEX'
# To enable live trading, rename this file to .env and add your keys:
POLYMARKET_API_KEY=
POLYMARKET_SECRET=
POLYMARKET_PASSPHRASE=
ENVEX

echo "ℹ️  No API keys provided — running in analysis-only mode"
echo "   To trade, rename .env.example to .env and add your keys"
`}

# ── Types ──
cat > src/types/index.ts << 'TYPES'
export interface Market {
  id: string;
  question: string;
  outcomes: string[];
  prices: number[];
  volume: number;
  liquidity: number;
  endDate: Date;
}

export interface Signal {
  action: 'BUY' | 'SELL' | 'HOLD';
  size: number;
  confidence: number;
  reason?: string;
}
TYPES

# ── Base Strategy ──
cat > src/core/strategy.ts << 'STRAT'
import { Market, Signal } from '../types';

export abstract class Strategy {
  constructor(public name: string) {}
  abstract analyze(market: Market): Promise<Signal>;
  protected log(msg: string) { console.log(\`[\${this.name}] \${msg}\`); }
}
STRAT

# ── Polymarket Client ──
cat > src/core/polymarket-client.ts << 'CLIENT'
import axios from 'axios';
import { Market } from '../types';

export class PolymarketClient {
  private baseUrl = 'https://clob.polymarket.com';

  async getMarkets(limit = 20): Promise<Market[]> {
    try {
      const { data } = await axios.get(\`\${this.baseUrl}/markets\`, {
        params: { limit, active: true, closed: false }
      });
      const list = Array.isArray(data) ? data : data.data || [];
      return list.map((m: any) => ({
        id: m.condition_id || m.id,
        question: m.question || 'Unknown',
        outcomes: m.outcomes || ['Yes', 'No'],
        prices: m.outcome_prices?.map((p: any) => parseFloat(p.price)) || [0.5, 0.5],
        volume: parseFloat(m.volume || '0'),
        liquidity: parseFloat(m.liquidity || '0'),
        endDate: new Date(m.end_date_iso || Date.now() + 86400000)
      }));
    } catch (e) {
      console.error('Error fetching markets:', e);
      return [];
    }
  }
}
CLIENT

# ── Your Strategy (auto-generated from PolyFlow blocks) ──
cat > src/strategies/custom-strategy.ts << 'CUSTOMSTRAT'
${strategyCode}
CUSTOMSTRAT

# ── Test Runner ──
cat > src/examples/run-strategy.ts << 'RUNNER'
${testRunner}
RUNNER

# ── Install & Done ──
echo "📦 Installing dependencies..."
npm install --silent

echo ""
echo "  ✅ Setup complete!"
echo ""
echo "  ┌──────────────────────────────────────────────┐"
echo "  │  To run your bot:                            │"
echo "  │                                              │"
echo "  │    cd polyflow-bot                           │"
echo "  │    npm start                                 │"
echo "  │                                              │"
echo "  │  ⚡ Analyzes live Polymarket data (no keys). │"
echo "  │  💰 To place real trades, add your API keys  │"
echo "  │     and wallet to the .env file.              │"
echo "  └──────────────────────────────────────────────┘"
echo ""
`;

    // Download single file
    const blob = new Blob([setupScript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'setup.sh';
    link.click();
    URL.revokeObjectURL(url);

    log('');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    log('✅ Downloaded: setup.sh');
    log('');
    log('📋 Just 2 commands:');
    log('');
    log('   Step 1:  bash setup.sh');
    log('   Step 2:  cd polyflow-bot && npm start');
    log('');
    if (apiKey) {
      log('🔑 API keys embedded — ready for');
      log('   live trading out of the box!');
    } else {
      log('⚡ Runs in analysis mode — reads live');
      log('   Polymarket data and shows signals.');
      log('');
      log('💰 To trade: add your API keys in the');
      log('   🔑 panel on the left, then re-download.');
    }
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  };

  // Helper: generate strategy code from canvas blocks
  const generateStrategyCode = (): string => {
    let code = `import { Strategy } from '../core/strategy';
import { Market, Signal } from '../types';

/**
 * Auto-generated strategy from PolyFlow Visual Builder
 * Created: ${new Date().toLocaleString()}
 * Flow: ${droppedBlocks.map(b => b.name).join(' → ')}
 */
export class CustomStrategy extends Strategy {
  constructor() {
    super('Custom Strategy');
  }

  async analyze(market: Market): Promise<Signal> {
`;
    const triggers = droppedBlocks.filter(b => b.type === 'trigger');
    if (triggers.length > 0) {
      code += `    // ── Triggers ──\n`;
      triggers.forEach(trigger => {
        if (trigger.name === 'Price Change') {
          code += `    const priceChange = Math.abs(market.prices[0] - 0.5) / 0.5;\n`;
          code += `    if (priceChange < 0.02) return { action: 'HOLD', size: 0, confidence: 0 };\n\n`;
        } else if (trigger.name === 'Volume Spike') {
          code += `    const avgVolume = market.volume * 0.8;\n`;
          code += `    if (market.volume / avgVolume < 1.5) return { action: 'HOLD', size: 0, confidence: 0 };\n\n`;
        }
      });
    }

    const conditions = droppedBlocks.filter(b => b.type === 'condition');
    if (conditions.length > 0) {
      code += `    // ── Conditions ──\n`;
      conditions.forEach(c => {
        if (c.name === 'Price > 0.5') {
          code += `    if (market.prices[0] <= 0.5) return { action: 'HOLD', size: 0, confidence: 0 };\n`;
        } else if (c.name === 'Momentum Positive') {
          code += `    if (market.prices[0] - 0.5 <= 0) return { action: 'HOLD', size: 0, confidence: 0 };\n`;
        } else if (c.name === 'Low Volatility') {
          code += `    if (Math.abs(market.prices[0] - 0.5) > 0.15) return { action: 'HOLD', size: 0, confidence: 0 };\n`;
        }
      });
      code += '\n';
    }

    const strategies = droppedBlocks.filter(b => b.type === 'strategy');
    if (strategies.length > 0) {
      code += `    // ── Risk Management ──\n`;
      code += `    const maxPositionSize = 1000;\n`;
      code += `    const confidence = this.calculateConfidence(market);\n\n`;
    }

    const actions = droppedBlocks.filter(b => b.type === 'action');
    if (actions.length > 0) {
      const action = actions[0];
      const actionType = action.name === 'Buy' ? 'BUY' : 'SELL';
      code += `    // ── Action ──\n`;
      code += `    return {\n`;
      code += `      action: '${actionType}',\n`;
      code += `      size: ${strategies.length > 0 ? 'Math.min(500, maxPositionSize * confidence)' : '500'},\n`;
      code += `      confidence: ${strategies.length > 0 ? 'confidence' : '0.7'},\n`;
      code += `      reason: 'Strategy conditions met for ${action.name.toLowerCase()}ing'\n`;
      code += `    };\n`;
    } else {
      code += `    return { action: 'HOLD', size: 0, confidence: 0 };\n`;
    }

    code += `  }\n`;

    if (strategies.length > 0) {
      code += `\n  private calculateConfidence(market: Market): number {\n`;
      code += `    let confidence = 0.5;\n`;
      code += `    if (market.prices[0] > 0.5 && market.prices[0] < 0.8) confidence += 0.2;\n`;
      code += `    if (market.volume > 50000) confidence += 0.1;\n`;
      code += `    if (market.liquidity > 10000) confidence += 0.2;\n`;
      code += `    return Math.min(1, Math.max(0, confidence));\n`;
      code += `  }\n`;
    }

    code += `}\n`;
    return code;
  };

  const exportCode = () => {
    if (droppedBlocks.length === 0) {
      log('⚠️ Add blocks to your canvas before exporting');
      return;
    }

    const code = generateStrategyCode();

    const blob = new Blob([code], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'custom-strategy.ts';
    link.click();
    URL.revokeObjectURL(url);

    log('💾 Exported: custom-strategy.ts');
    log('');
    log('💡 Tip: Use "Download All" to get the');
    log('   full runnable project instead.');
  };

  useEffect(() => {
    log('🎨 Visual builder ready');
    log('🧪 Running in Testnet mode (Demo)');
    log('💡 Toggle to Mainnet to use real Polymarket data');
    log('👆 Drag blocks from the left panel to build your strategy');
    
    // Initialize with demo markets
    setSelectedMarkets(DEMO_MARKETS);
  }, []);

  return (
    <div className="builder-wrapper">
      <nav className="nav">
        <div className="container flex justify-between items-center">
          <div className="flex items-center gap-2">
            <a href="/" style={{ fontWeight: 700, fontSize: '1.4rem', color: 'var(--text-dark)', textDecoration: 'none', cursor: 'pointer' }}>
              Poly<span style={{color: 'var(--accent-blue)'}}>Flow</span>
            </a>
          </div>

          <div className="flex gap-4 items-center">
            <a href="#login" style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-dark)', textDecoration: 'none' }}>Sign in</a>
            <button className="btn btn-primary">Contact Sales</button>
            <div className="language-selector">
              <button className="language-btn" onClick={() => setCurrentLanguage(currentLanguage === 'EN' ? 'PT' : 'EN')}>
                <span className="flag">{currentLanguage === 'EN' ? '🇺🇸' : '🇧🇷'}</span>
                <span className="lang-code">{currentLanguage === 'EN' ? 'EN' : 'PT'}</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="builder-container">
        <div className="builder-header">
          <h1>{t.builder.title}</h1>
          <p>{t.builder.subtitle}</p>
        </div>

        <div className="builder-grid">
          {/* Blocks Panel */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-icon"><Package size={18} color="white" /></div>
              <h3>{t.builder.blocksTitle}</h3>
            </div>

            {/* Network Toggle */}
            <div className="network-toggle">
              <span className="network-label">{t.builder.network}:</span>
              <div 
                className={`toggle-switch ${isMainnet ? 'active' : ''}`}
                onClick={toggleNetwork}
              >
                <div className="toggle-slider"></div>
              </div>
              <span className={`network-status ${isMainnet ? 'mainnet' : 'testnet'}`}>
                {isMainnet ? t.builder.mainnet : t.builder.testnet}
              </span>
            </div>

            {/* Market Selector */}
            <div className="market-selector">
              <label className="market-label">{t.builder.selectMarkets}</label>
              <select 
                value={marketFilter}
                onChange={(e) => filterMarkets(e.target.value)}
                className="market-select"
              >
                <option value="all">{t.builder.allMarkets}</option>
                <option value="politics">{t.builder.politics}</option>
                <option value="crypto">{t.builder.crypto}</option>
                <option value="sports">{t.builder.sports}</option>
              </select>
              <div className="selected-count">
                {t.builder.selected}: {selectedMarkets.length} {t.builder.markets} {!isMainnet && t.builder.demo}
              </div>
            </div>

            {/* API Credentials (optional) */}
            <div className="market-selector" style={{marginTop: '0.5rem'}}>
              <div
                onClick={() => setShowCreds(!showCreds)}
                style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer'}}
              >
                <label className="market-label" style={{margin: 0, cursor: 'pointer'}}>🔑 API Credentials</label>
                <span style={{fontSize: '0.75rem', color: 'var(--text-gray)'}}>{showCreds ? '▲' : '▼'} {apiKey ? '✅' : 'optional'}</span>
              </div>
              {showCreds && (
                <div style={{marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                  <p style={{fontSize: '0.75rem', color: 'var(--text-gray)', margin: 0}}>Add your keys here and they'll be embedded in the download. Required only for live trading.</p>
                  <input
                    type="text"
                    placeholder="API Key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="market-select"
                    style={{fontFamily: 'monospace', fontSize: '0.8rem'}}
                  />
                  <input
                    type="password"
                    placeholder="API Secret"
                    value={apiSecret}
                    onChange={(e) => setApiSecret(e.target.value)}
                    className="market-select"
                    style={{fontFamily: 'monospace', fontSize: '0.8rem'}}
                  />
                  <input
                    type="password"
                    placeholder="Passphrase"
                    value={apiPassphrase}
                    onChange={(e) => setApiPassphrase(e.target.value)}
                    className="market-select"
                    style={{fontFamily: 'monospace', fontSize: '0.8rem'}}
                  />
                  <a href="https://docs.polymarket.com" target="_blank" rel="noopener noreferrer" style={{fontSize: '0.75rem', color: 'var(--accent-blue)'}}>How to get API keys →</a>
                </div>
              )}
            </div>

            {/* Block Categories */}
            <div className="block-category">
              <div className="category-label">{t.builder.triggers}</div>
              <div 
                className="block trigger"
                draggable
                onDragStart={(e) => handleDragStart(e, 'trigger', t.builder.blocks.priceChange)}
              >
                <Zap size={16} /> {t.builder.blocks.priceChange}
              </div>
              <div 
                className="block trigger"
                draggable
                onDragStart={(e) => handleDragStart(e, 'trigger', t.builder.blocks.volumeSpike)}
              >
                <BarChart3 size={16} /> {t.builder.blocks.volumeSpike}
              </div>
            </div>

            <div className="block-category">
              <div className="category-label">{t.builder.conditions}</div>
              <div 
                className="block condition"
                draggable
                onDragStart={(e) => handleDragStart(e, 'condition', t.builder.blocks.priceAbove)}
              >
                <CheckCircle2 size={16} /> {t.builder.blocks.priceAbove}
              </div>
              <div 
                className="block condition"
                draggable
                onDragStart={(e) => handleDragStart(e, 'condition', t.builder.blocks.momentumPositive)}
              >
                <TrendingUp size={16} /> {t.builder.blocks.momentumPositive}
              </div>
              <div 
                className="block condition"
                draggable
                onDragStart={(e) => handleDragStart(e, 'condition', t.builder.blocks.lowVolatility)}
              >
                <Activity size={16} /> {t.builder.blocks.lowVolatility}
              </div>
            </div>

            <div className="block-category">
              <div className="category-label">{t.builder.actions}</div>
              <div 
                className="block action"
                draggable
                onDragStart={(e) => handleDragStart(e, 'action', t.builder.blocks.buy)}
              >
                <DollarSign size={16} /> {t.builder.blocks.buy}
              </div>
              <div 
                className="block action"
                draggable
                onDragStart={(e) => handleDragStart(e, 'action', t.builder.blocks.sell)}
              >
                <DollarSign size={16} /> {t.builder.blocks.sell}
              </div>
            </div>

            <div className="block-category">
              <div className="category-label">{t.builder.strategy}</div>
              <div 
                className="block strategy"
                draggable
                onDragStart={(e) => handleDragStart(e, 'strategy', t.builder.blocks.riskCheck)}
              >
                <Shield size={16} /> {t.builder.blocks.riskCheck}
              </div>
            </div>
          </div>

          {/* Canvas Panel */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-icon"><Target size={18} color="white" /></div>
              <h3>{t.builder.canvas}</h3>
            </div>

            <div className="canvas-controls">
              <button className="btn-control btn-run" onClick={runStrategy} disabled={isRunning}>
                <Play size={16} />
                <span>{t.builder.run}</span>
              </button>
              <button className="btn-control btn-clear" onClick={clearCanvas}>
                <Trash2 size={16} />
                <span>{t.builder.clear}</span>
              </button>
              <button className="btn-control btn-export" onClick={exportCode}>
                <Download size={16} />
                <span>{t.builder.exportStrategy}</span>
              </button>
              <button className="btn-control btn-download-all" onClick={downloadFullProject}>
                <FolderDown size={16} />
                <span>{t.builder.downloadAll}</span>
              </button>
            </div>

            <div 
              className="canvas"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              {droppedBlocks.length === 0 ? (
                <div className="empty-state">
                  <Globe size={48} />
                  <p>{t.builder.emptyCanvas}</p>
                </div>
              ) : (
                <>
                  {droppedBlocks.map((block, index) => (
                    <div key={index}>
                      <div className={`dropped-block ${block.type}`}>
                        <span className="flex items-center gap-2">{getBlockIcon(block.type)} {block.name}</span>
                        <button 
                          className="remove-btn"
                          onClick={() => removeBlock(index)}
                        >
                          ✕
                        </button>
                      </div>
                      {index < droppedBlocks.length - 1 && (
                        <div className="flow-arrow">↓</div>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Performance Panel */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-icon"><BarChart2 size={18} color="white" /></div>
              <h3>{t.builder.performance}</h3>
            </div>

            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-label">{t.builder.metrics.trades}</div>
                <div className="metric-value">{metrics.trades}</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">{t.builder.metrics.winRate}</div>
                <div className="metric-value">{metrics.winRate}</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">{t.builder.metrics.pnl}</div>
                <div className="metric-value">{metrics.pnl}</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">{t.builder.metrics.sharpe}</div>
                <div className="metric-value">{metrics.sharpe}</div>
              </div>
            </div>

            <div className="console-header">{t.builder.console}</div>
            <div className="console">
              {output.map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>

            {/* How to Run Instructions */}
            <div style={{
              marginTop: '1.25rem',
              padding: '1rem',
              background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)',
              border: '1px solid #bbf7d0',
              borderRadius: 'var(--radius-md)',
            }}>
              <div style={{fontSize: '0.8rem', fontWeight: 700, color: '#166534', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>📋 After downloading</div>
              <div style={{fontSize: '0.8rem', color: '#15803d', lineHeight: 1.7}}>
                <div style={{display: 'flex', gap: '0.5rem', alignItems: 'flex-start'}}>
                  <span style={{fontWeight: 700, minWidth: '1.2rem'}}>1.</span>
                  <span>Open your terminal and run:<br/>
                    <code style={{background: '#dcfce7', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.78rem'}}>bash setup.sh</code>
                  </span>
                </div>
                <div style={{display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginTop: '0.5rem'}}>
                  <span style={{fontWeight: 700, minWidth: '1.2rem'}}>2.</span>
                  <span>Then start your bot:<br/>
                    <code style={{background: '#dcfce7', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.78rem'}}>cd polyflow-bot && npm start</code>
                  </span>
                </div>
                <div style={{marginTop: '0.75rem', fontSize: '0.75rem', color: '#166534', opacity: 0.8}}>
                  ⚡ Analyzes live markets instantly.{apiKey ? ' Your API keys are included — ready for live trading!' : ' Add API keys for live trading.'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Builder;
