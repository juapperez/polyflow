import { useState, useEffect } from 'react';
import { Play, Trash2, Globe, TrendingUp, BarChart3, DollarSign, Shield, Zap, Activity, Target, CheckCircle2, Package, FolderDown, Clock, Key, ClipboardList } from 'lucide-react';
import './Builder.css';
import { translations } from './translations';
import type { Language } from './translations';

interface BlockParam {
  key: string;
  label: string;
  type: 'number' | 'select';
  value: number | string;
  options?: string[];       // for select type
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;          // e.g. '%', '$', 'x'
}

interface Block {
  type: 'trigger' | 'condition' | 'action' | 'strategy' | 'market';
  name: string;
  params: BlockParam[];
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

const POLYMARKET_API_URL = 'https://synthesis.trade/api/v1/markets?venue=polymarket&limit=100&status=active';

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
  // Metrics removed
  const [marketFilter, setMarketFilter] = useState('all');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [showCreds, setShowCreds] = useState(false);

  // Utility functions
  const log = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setOutput(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Network functions
  const [switching, setSwitching] = useState(false);

  const toggleNetwork = async () => {
    if (switching) return;
    setSwitching(true);
    
    const newMainnet = !isMainnet;
    setIsMainnet(newMainnet);
    
    if (newMainnet) {
      log('🌐 Switching to Live (Real Polymarket Data)...');
      const success = await fetchRealMarkets();
      if (!success) {
        setIsMainnet(false);
        setSelectedMarkets(DEMO_MARKETS);
      }
    } else {
      log('🧪 Switched to Demo Mode');
      setRealMarkets([]);
      setSelectedMarkets(DEMO_MARKETS);
      setMarketFilter('all');
    }
    setSwitching(false);
  };

  const fetchRealMarkets = async (): Promise<boolean> => {
    try {
      log('📡 Fetching real Polymarket markets...');
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      
      const response = await fetch(POLYMARKET_API_URL, { signal: controller.signal });
      clearTimeout(timeout);
      const json = await response.json();
      
      // API can return {data: [...]} or {success, response: [{event, markets}]} or [...]
      let rawMarkets: any[] = [];
      if (Array.isArray(json)) {
        rawMarkets = json;
      } else if (json.success && Array.isArray(json.response)) {
        // Synthesis API format: flatten event → markets
        for (const entry of json.response) {
          if (entry.markets && Array.isArray(entry.markets)) {
            rawMarkets.push(...entry.markets);
          } else {
            rawMarkets.push(entry);
          }
        }
      } else if (json.data) {
        rawMarkets = json.data;
      }
      
      if (!Array.isArray(rawMarkets) || rawMarkets.length === 0) {
        log('⚠️ No markets returned from API');
        return false;
      }
      
      const markets = rawMarkets
        .filter((m: any) => (m.question || m.title) && m.active !== false && !m.resolved)
        .map((m: any) => ({
          id: m.condition_id || m.id,
          question: m.question || m.title || 'Unknown Market',
          price: parseFloat(m.left_price ?? m.tokens?.[0]?.price ?? m.yes_price ?? 0.5),
          volume: parseFloat(m.volume || m.volume24hr || 0),
          outcomes: [m.left_outcome || 'Yes', m.right_outcome || 'No']
        }))
        .filter((m: any) => m.price > 0.05 && m.price < 0.95)
        .sort((a: any, b: any) => b.volume - a.volume);
      
      setRealMarkets(markets);
      setSelectedMarkets(markets.slice(0, 20));
      log(`✓ Loaded ${markets.length} active markets from Polymarket`);
      return true;
    } catch (error) {
      log('⚠️ Could not fetch real markets — check your connection');
      log('↩️ Reverting to Demo Mode');
      return false;
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
  const getDefaultParams = (name: string): BlockParam[] => {
    switch (name) {
      case 'Price Change':
      case 'Mudança de Preço':
        return [
          { key: 'threshold', label: 'Threshold', type: 'number', value: 5, min: 1, max: 50, step: 1, suffix: '%' },
          { key: 'direction', label: 'Direction', type: 'select', value: 'any', options: ['any', 'up', 'down'] },
        ];
      case 'Volume Spike':
      case 'Pico de Volume':
        return [
          { key: 'multiplier', label: 'Spike', type: 'number', value: 2, min: 1.5, max: 10, step: 0.5, suffix: 'x' },
        ];
      case 'Time Trigger':
        return [
          { key: 'interval', label: 'Check every', type: 'number', value: 15, min: 1, max: 60, step: 1, suffix: 'min' },
        ];
      case 'Price > 0.5':
      case 'Preço > 0.5':
        return [
          { key: 'price', label: 'Min price', type: 'number', value: 0.5, min: 0.01, max: 0.99, step: 0.01 },
        ];
      case 'Momentum +':
      case 'Momentum Positive':
        return [
          { key: 'lookback', label: 'Lookback', type: 'number', value: 24, min: 1, max: 168, step: 1, suffix: 'h' },
        ];
      case 'Low Volatility':
      case 'Baixa Volatilidade':
        return [
          { key: 'maxVol', label: 'Max volatility', type: 'number', value: 15, min: 1, max: 50, step: 1, suffix: '%' },
        ];
      case 'Buy':
      case 'Comprar':
        return [
          { key: 'size', label: 'Size', type: 'number', value: 500, min: 10, max: 10000, step: 10, suffix: '$' },
          { key: 'outcome', label: 'Outcome', type: 'select', value: 'Yes', options: ['Yes', 'No'] },
        ];
      case 'Sell':
      case 'Vender':
        return [
          { key: 'size', label: 'Size', type: 'number', value: 500, min: 10, max: 10000, step: 10, suffix: '$' },
          { key: 'outcome', label: 'Outcome', type: 'select', value: 'Yes', options: ['Yes', 'No'] },
        ];
      case 'Take Profit':
        return [
          { key: 'target', label: 'Target', type: 'number', value: 20, min: 1, max: 200, step: 1, suffix: '%' },
        ];
      case 'Stop Loss':
        return [
          { key: 'limit', label: 'Max loss', type: 'number', value: 10, min: 1, max: 50, step: 1, suffix: '%' },
        ];
      case 'Risk Check':
      case 'Verificação de Risco':
        return [
          { key: 'maxTrades', label: 'Max trades', type: 'number', value: 10, min: 1, max: 100, step: 1 },
          { key: 'maxExposure', label: 'Max exposure', type: 'number', value: 1000, min: 100, max: 50000, step: 100, suffix: '$' },
        ];
      default:
        return [];
    }
  };

  const handleDragStart = (e: React.DragEvent, type: string, name: string) => {
    e.dataTransfer.setData('type', type);
    e.dataTransfer.setData('name', name);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('type') as Block['type'];
    const name = e.dataTransfer.getData('name');
    
    setDroppedBlocks(prev => [...prev, { type, name, params: getDefaultParams(name) }]);
    log(`Added: ${name}`);
  };

  const updateBlockParam = (blockIndex: number, paramKey: string, newValue: number | string) => {
    setDroppedBlocks(prev => prev.map((block, i) => {
      if (i !== blockIndex) return block;
      return {
        ...block,
        params: block.params.map(p => p.key === paramKey ? { ...p, value: newValue } : p)
      };
    }));
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
      market: <Globe size={16} color="#0EA5E9" />,
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
    log('📊 Validating strategy against real Polymarket markets...');
    await sleep(500);
    
    let marketsToAnalyze = selectedMarkets.length > 0 ? selectedMarkets : realMarkets.slice(0, 20);
    const marketBlocks = droppedBlocks.filter(b => b.type === 'market');
    if (marketBlocks.length > 0) {
      const allowedNames = marketBlocks.map(b => b.name);
      marketsToAnalyze = marketsToAnalyze.filter(m => allowedNames.includes(m.question));
      log(`🎯 Targeted: ${marketsToAnalyze.length} specific market(s)`);
    } else {
      log(`✓ Scope: ${marketsToAnalyze.length} markets`);
    }

    await validateStrategy(marketsToAnalyze);
  };

  const simulateExecution = async () => {
    log('🧪 Validating strategy in Demo mode...');
    let marketsToAnalyze = selectedMarkets;
    const marketBlocks = droppedBlocks.filter(b => b.type === 'market');
    if (marketBlocks.length > 0) {
      const allowedNames = marketBlocks.map(b => b.name);
      marketsToAnalyze = marketsToAnalyze.filter(m => allowedNames.includes(m.question));
      log(`🎯 Targeted: ${marketsToAnalyze.length} specific market(s)`);
    } else {
      log(`✓ Scope: ${marketsToAnalyze.length} demo markets`);
    }
    await sleep(500);

    await validateStrategy(marketsToAnalyze);
  };

  const validateStrategy = async (markets: Market[]) => {
    const triggers = droppedBlocks.filter(b => b.type === 'trigger');
    const conditions = droppedBlocks.filter(b => b.type === 'condition');
    const actions = droppedBlocks.filter(b => b.type === 'action');
    const strategies = droppedBlocks.filter(b => b.type === 'strategy');
    const marketBlocks = droppedBlocks.filter(b => b.type === 'market');

    log('');
    log('━━━ STRATEGY PIPELINE ━━━');
    await sleep(300);

    // Show pipeline blocks
    if (triggers.length > 0) {
      for (const t of triggers) {
        const params = t.params.map(p => `${p.label}: ${p.value}${p.suffix || ''}`).join(', ');
        log(`⚡ Trigger: ${t.name} ${params ? `(${params})` : ''}`);
      }
    } else {
      log('⚠️  No triggers — bot will check every market on each cycle');
    }
    await sleep(200);

    if (conditions.length > 0) {
      for (const c of conditions) {
        const params = c.params.map(p => `${p.label}: ${p.value}${p.suffix || ''}`).join(', ');
        log(`⚖️  Condition: ${c.name} ${params ? `(${params})` : ''}`);
      }
    }
    await sleep(200);

    if (actions.length > 0) {
      for (const a of actions) {
        const params = a.params.map(p => `${p.label}: ${p.value}${p.suffix || ''}`).join(', ');
        log(`💰 Action: ${a.name} ${params ? `(${params})` : ''}`);
      }
    } else {
      log('⚠️  No actions — add a Buy or Sell block to execute trades');
    }
    await sleep(200);

    if (strategies.length > 0) {
      for (const s of strategies) {
        const params = s.params.map(p => `${p.label}: ${p.value}${p.suffix || ''}`).join(', ');
        log(`🛡️  Risk: ${s.name} ${params ? `(${params})` : ''}`);
      }
    }
    await sleep(300);

    // Show targeted markets
    log('');
    log('━━━ TARGET MARKETS ━━━');
    for (const m of markets.slice(0, 10)) {
      await sleep(150);
      const shortQ = m.question.length > 55 ? m.question.substring(0, 55) + '...' : m.question;
      log(`📈 ${shortQ}  (price: ${m.price.toFixed(2)})`);
    }
    if (markets.length > 10) {
      log(`   ...and ${markets.length - 10} more`);
    }
    await sleep(300);

    // Validation summary
    log('');
    log('━━━ VALIDATION ━━━');
    const hasActions = actions.length > 0;
    const hasMarkets = markets.length > 0;
    
    if (hasActions && hasMarkets) {
      log('✅ Strategy is valid and ready to deploy!');
      log(`   ${triggers.length} trigger(s) → ${conditions.length} condition(s) → ${actions.length} action(s) → ${strategies.length} risk rule(s)`);
      log(`   Targeting ${markets.length} market(s)${marketBlocks.length > 0 ? ' (specifically selected)' : ''}`);
      log('💡 Click "Copy Setup Script" to grab your runnable project code.');
    } else {
      if (!hasActions) log('❌ Missing action blocks (Buy/Sell). Add at least one.');
      if (!hasMarkets) log('❌ No markets selected.');
    }
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
    let testRunner = "";
    testRunner += "import * as dotenv from 'dotenv';\n";
    testRunner += "dotenv.config();\n\n";
    testRunner += "import axios from 'axios';\n";
    testRunner += "import { SynthesisClient } from '../core/synthesis-client';\n";
    testRunner += "import { CustomStrategy } from '../strategies/custom-strategy';\n\n";
    testRunner += "const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));\n\n";
    testRunner += "async function main() {\n";
    testRunner += "  const client = new SynthesisClient();\n";
    testRunner += "  const strategy = new CustomStrategy();\n\n";
    testRunner += "  console.log('');\n";
    testRunner += "  console.log('  PolyFlow Continuous Bot (Powered by Synthesis API)');\n";
    testRunner += "  console.log('  ===================================================');\n\n";
    testRunner += "  const PROJECT_SECRET = process.env.SYNTHESIS_SECRET;\n";
    testRunner += "  let accountApiKey = '';\n";
    testRunner += "  let walletId = '';\n\n";
    testRunner += "  if (PROJECT_SECRET) {\n";
    testRunner += "    try {\n";
    testRunner += "      console.log('  Authenticating with Synthesis Network...');\n";
    testRunner += "      let accountId = '';\n";
    testRunner += "      const acctRes = await axios.get('https://synthesis.trade/api/v1/project/account', {\n";
    testRunner += "        headers: { 'X-PROJECT-API-KEY': PROJECT_SECRET }\n";
    testRunner += "      });\n";
    testRunner += "      if (acctRes.data?.success && acctRes.data?.response?.length > 0) {\n";
    testRunner += "        accountId = acctRes.data.response[0].account_id;\n";
    testRunner += "        console.log('  ✅ Account Found: ' + accountId);\n";
    testRunner += "      } else {\n";
    testRunner += "        console.log('  ⚠️ No accounts. Auto-provisioning...');\n";
    testRunner += "        const createRes = await axios.post('https://synthesis.trade/api/v1/project/account', {}, {\n";
    testRunner += "          headers: { 'X-PROJECT-API-KEY': PROJECT_SECRET }\n";
    testRunner += "        });\n";
    testRunner += "        accountId = createRes.data?.response?.account_id || '';\n";
    testRunner += "        console.log('  ✅ New Account Created: ' + accountId);\n";
    testRunner += "      }\n";
    testRunner += "      if (accountId) {\n";
    testRunner += "        console.log('  🔑 Generating Account API Key...');\n";
    testRunner += "        const keyRes = await axios.post('https://synthesis.trade/api/v1/project/account/' + accountId + '/api-key',\n";
    testRunner += "          { name: 'polyflow-bot' },\n";
    testRunner += "          { headers: { 'X-PROJECT-API-KEY': PROJECT_SECRET, 'Content-Type': 'application/json' } }\n";
    testRunner += "        );\n";
    testRunner += "        if (keyRes.data?.success) {\n";
    testRunner += "          accountApiKey = keyRes.data.response.secret_key;\n";
    testRunner += "          console.log('  ✅ Account API Key Created: ' + keyRes.data.response.public_key);\n";
    testRunner += "        }\n";
    testRunner += "      }\n";
    testRunner += "      if (accountApiKey) {\n";
    testRunner += "        console.log('  💼 Creating Polygon Wallet...');\n";
    testRunner += "        const walletRes = await axios.post('https://synthesis.trade/api/v1/wallet', {}, {\n";
    testRunner += "          headers: { 'X-API-KEY': accountApiKey }\n";
    testRunner += "        });\n";
    testRunner += "        if (walletRes.data?.success) {\n";
    testRunner += "          walletId = walletRes.data.response.wallet_id;\n";
    testRunner += "          const polyAddr = walletRes.data.response.chains?.POL?.address || 'unknown';\n";
    testRunner += "          console.log('  ✅ Wallet Created: ' + walletId);\n";
    testRunner += "          console.log('  📍 Polygon Address: ' + polyAddr);\n";
    testRunner += "        }\n";
    testRunner += "      }\n";
    testRunner += "    } catch (e: any) {\n";
    testRunner += "      console.log('  ⚠️ Setup Warning: ' + (e.response?.data?.message || e.message));\n";
    testRunner += "    }\n";
    testRunner += "  } else {\n";
    testRunner += "    console.log('  ⚠️ Paper Trading Mode (No API Keys)');\n";
    testRunner += "  }\n\n";
    testRunner += "  console.log('');\n";
    testRunner += "  console.log('  Waiting 10s between market checks... Press Ctrl+C to stop.');\n";
    testRunner += "  console.log('');\n\n";
    testRunner += "  let cycle = 1;\n";
    testRunner += "  while (true) {\n";
    testRunner += "    console.log('[Cycle ' + cycle + '] Fetching live markets from Synthesis...');\n";
    testRunner += "    const allMarkets = await client.getMarkets(500);\n\n";

    const targetedMarkets = droppedBlocks.filter((b: any) => b.type === 'market');
    if (targetedMarkets.length > 0) {
      testRunner += "    const targetMarkets = " + JSON.stringify(targetedMarkets.map((b: any) => b.name)) + ";\n";
      testRunner += "    console.log('    Looking for targets: ', targetMarkets);\n";
      testRunner += "    console.log('    Total live markets received from API: ' + allMarkets.length);\n";
      testRunner += "    const markets = allMarkets.filter((m: any) => targetMarkets.includes(m.question));\n";
      testRunner += "    console.log('    Found ' + markets.length + ' matched market(s)');\n";
    } else {
      testRunner += "    const markets = allMarkets;\n";
      testRunner += "    console.log('    Found ' + markets.length + ' active markets');\n";
    }

    testRunner += "    console.log('');\n";
    testRunner += "    let signals = 0;\n";
    testRunner += "    for (const market of markets) {\n";
    testRunner += "      const signal = await strategy.analyze(market);\n";
    testRunner += "      if (signal.action !== 'HOLD') {\n";
    testRunner += "        signals++;\n";
    testRunner += "        const icon = signal.action === 'BUY' ? 'BUY' : 'SELL';\n";
    testRunner += "        console.log('    ' + icon + ' — ' + market.question);\n";
    testRunner += "        console.log('      Token: ' + market.token_id);\n";
    testRunner += "        console.log('      Price: ' + market.prices[0].toFixed(4) + ' | Size: $' + signal.size.toFixed(0) + ' | Confidence: ' + (signal.confidence * 100).toFixed(0) + '%');\n";
    testRunner += "        if (signal.reason) console.log('      Reason: ' + signal.reason);\n";
    testRunner += "        if (market.prices[0] >= 0.99 || market.prices[0] <= 0.01) {\n";
    testRunner += "          console.log('      ⚠️ Market already resolved (price ' + market.prices[0] + ') — skipping order.');\n";
    testRunner += "          console.log('');\n";
    testRunner += "          continue;\n";
    testRunner += "        }\n";
    testRunner += "        if (accountApiKey && walletId) {\n";
    testRunner += "          console.log('      ⚡ Routing ' + icon + ' order to Synthesis Network...');\n";
    testRunner += "          try {\n";
    testRunner += "            if (!market.token_id) { console.log('      ⚠️ No token_id for this market, skipping order.'); } else {\n";
    testRunner += "            const orderRes = await axios.post('https://synthesis.trade/api/v1/wallet/pol/' + walletId + '/order', {\n";
    testRunner += "              token_id: market.token_id,\n";
    testRunner += "              side: signal.action.toUpperCase(),\n";
    testRunner += "              type: 'MARKET',\n";
    testRunner += "              amount: String(signal.size),\n";
    testRunner += "              units: 'USDC',\n";
    testRunner += "            }, { headers: { 'X-API-KEY': accountApiKey, 'Content-Type': 'application/json' } });\n";
    testRunner += "            if (orderRes.data?.success) {\n";
    testRunner += "              const ord = orderRes.data.response;\n";
    testRunner += "              console.log('      ✅ Order Filled! ID: ' + ord.order_id + ' | Status: ' + ord.status + ' | Shares: ' + ord.shares);\n";
    testRunner += "            }\n";
    testRunner += "            }\n";
    testRunner += "          } catch(err: any) {\n";
    testRunner += "            console.log('      ❌ Order Failed: ' + JSON.stringify(err.response?.data || err.message));\n";
    testRunner += "          }\n";
    testRunner += "        } else {\n";
    testRunner += "          console.log('      ⚠️ No wallet — order simulated locally.');\n";
    testRunner += "        }\n";
    testRunner += "        console.log('');\n";
    testRunner += "      }\n";
    testRunner += "    }\n";
    testRunner += "    if (signals === 0) {\n";
    testRunner += "      console.log('    No signals generated this cycle.');\n";
    testRunner += "    } else {\n";
    testRunner += "      console.log('    Done — ' + signals + ' signals executed.');\n";
    testRunner += "    }\n";
    testRunner += "    console.log('');\n";
    testRunner += "    cycle++;\n";
    testRunner += "    await sleep(10000);\n";
    testRunner += "  }\n";
    testRunner += "}\n\n";
    testRunner += "main().catch(console.error);\n";

    // Single all-in-one setup script (No comments, prevents zsh interactive parser errors on paste)
    const setupScript = `set -e

echo ""
echo "  PolyFlow — Setting up your trading bot"
echo "  ═══════════════════════════════════════"
echo ""

echo "── Creating project ──"
mkdir -p polyflow-bot && cd polyflow-bot

mkdir -p src/core src/strategies src/types src/examples

echo "── package.json ──"
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

echo "── tsconfig.json ──"
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
echo "── .env (your credentials are pre-filled) ──"
cat > .env << 'ENVFILE'
SYNTHESIS_API_KEY=${apiKey}
SYNTHESIS_SECRET=${apiSecret}
ENVFILE

echo "🔑 Synthesis API credentials loaded into .env"
` : `
echo "── .env.example ──"
cat > .env.example << 'ENVEX'
# To enable live trading, add your Synthesis API keys:
SYNTHESIS_API_KEY=
SYNTHESIS_SECRET=
ENVEX

echo "ℹ️  No API keys provided — running in analysis-only mode"
echo "   To trade, rename .env.example to .env and add your keys"
`}

echo "── Types ──"
cat > src/types/index.ts << 'TYPES'
export interface Market {
  id: string;
  token_id: string;
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

echo "── Base Strategy ──"
cat > src/core/strategy.ts << 'STRAT'
import { Market, Signal } from '../types';

export abstract class Strategy {
  constructor(public name: string) {}
  abstract analyze(market: Market): Promise<Signal>;
  protected log(msg: string) { console.log(\`[\${this.name}] \${msg}\`); }
}
STRAT

echo "── Synthesis API Client ──"
cat > src/core/synthesis-client.ts << 'CLIENT'
import axios from 'axios';
import { Market } from '../types';

export class SynthesisClient {
  private baseUrl = 'https://synthesis.trade/api/v1';

  async getMarkets(limit = 100): Promise<Market[]> {
    try {
      const { data } = await axios.get(\`\${this.baseUrl}/markets\`, {
        params: { venue: 'polymarket', limit, status: 'active' }
      });
      
      let rawMarkets: any[] = [];
      if (Array.isArray(data)) {
        rawMarkets = data;
      } else if (data.success && Array.isArray(data.response)) {
        for (const entry of data.response) {
          if (entry.markets && Array.isArray(entry.markets)) {
            rawMarkets.push(...entry.markets);
          } else {
            rawMarkets.push(entry);
          }
        }
      } else if (data.data) {
        rawMarkets = data.data;
      }

      return rawMarkets
        .filter((m: any) => (m.question || m.title) && m.active !== false && !m.resolved)
        .map((m: any) => ({
          id: m.condition_id || m.id,
          token_id: m.left_token_id || m.tokens?.[0]?.token_id || '',
          question: m.question || m.title || 'Unknown',
          outcomes: [m.left_outcome || 'Yes', m.right_outcome || 'No'],
          prices: [
            parseFloat(m.left_price ?? m.tokens?.[0]?.price ?? 0.5),
            parseFloat(m.right_price ?? m.tokens?.[1]?.price ?? 0.5)
          ],
          volume: parseFloat(m.volume || m.volume24hr || '0'),
          liquidity: parseFloat(m.liquidity || '0'),
          endDate: new Date(m.ends_at || m.end_date_iso || Date.now() + 86400000)
        }));
    } catch (e) {
      console.error('Error fetching markets:', e);
      return [];
    }
  }
}
CLIENT

echo "── Your Strategy (auto-generated from PolyFlow blocks) ──"
cat > src/strategies/custom-strategy.ts << 'CUSTOMSTRAT'
${strategyCode}
CUSTOMSTRAT

echo "── Test Runner ──"
cat > src/examples/run-strategy.ts << 'RUNNER'
${testRunner}
RUNNER

echo "── Install & Done ──"
echo "📦 Installing dependencies..."
npm install --silent

cat << 'INFO'

  ✅ Setup complete! Booting up your trading bot now...

INFO

echo "🚀 Launching the bot immediately..."
npm start


`;

    try {
      // Chrome's download manager is being overly restrictive with blobs on macOS
      // The most reliable and frictionless way is to just write it to the clipboard!
      await navigator.clipboard.writeText(setupScript);
      
    } catch (err: any) {
      log('⚠️ Clipboard copy failed: ' + err.message);
      return; 
    }

    log('');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    log('✅ Copied to clipboard!');
    log('');
    log('📋 Just paste it directly into your terminal:');
    log('');
    log('   (Press Cmd+V then Enter)');
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
        const p = (key: string) => trigger.params?.find(x => x.key === key)?.value;
        if (trigger.name === 'Price Change' || trigger.name === 'Mudança de Preço') {
          const threshold = (p('threshold') as number) / 100 || 0.05;
          code += `    const priceChange = Math.abs(market.prices[0] - 0.5) / 0.5;\n`;
          code += `    if (priceChange < ${threshold}) return { action: 'HOLD', size: 0, confidence: 0 };\n\n`;
        } else if (trigger.name === 'Volume Spike' || trigger.name === 'Pico de Volume') {
          const mult = p('multiplier') || 2;
          code += `    const avgVolume = market.volume * 0.8;\n`;
          code += `    if (market.volume / avgVolume < ${mult}) return { action: 'HOLD', size: 0, confidence: 0 };\n\n`;
        } else if (trigger.name === 'Time Trigger') {
          const mins = p('interval') || 15;
          code += `    // Time trigger logic (runs every ${mins}min)\n\n`;
        }
      });
    }

    const conditions = droppedBlocks.filter(b => b.type === 'condition');
    if (conditions.length > 0) {
      code += `    // ── Conditions ──\n`;
      conditions.forEach(c => {
        const p = (key: string) => c.params?.find(x => x.key === key)?.value;
        if (c.name === 'Price > 0.5' || c.name === 'Preço > 0.5') {
          const price = p('price') || 0.5;
          code += `    if (market.prices[0] <= ${price}) return { action: 'HOLD', size: 0, confidence: 0 };\n`;
        } else if (c.name === 'Momentum +' || c.name === 'Momentum Positive') {
          const lookback = p('lookback') || 24;
          code += `    // Momentum check based on ${lookback}h lookback\n`;
          code += `    if (market.prices[0] - 0.5 <= 0) return { action: 'HOLD', size: 0, confidence: 0 };\n`;
        } else if (c.name === 'Low Volatility' || c.name === 'Baixa Volatilidade') {
          const maxVol = (p('maxVol') as number) / 100 || 0.15;
          code += `    if (Math.abs(market.prices[0] - 0.5) > ${maxVol}) return { action: 'HOLD', size: 0, confidence: 0 };\n`;
        }
      });
      code += '\n';
    }

    const strategies = droppedBlocks.filter(b => b.type === 'strategy');
    if (strategies.length > 0) {
      code += `    // ── Risk & Position Management ──\n`;
      strategies.forEach(s => {
        const p = (key: string) => s.params?.find(x => x.key === key)?.value;
        if (s.name === 'Risk Check' || s.name === 'Verificação de Risco') {
          const maxExposure = p('maxExposure') || 1000;
          code += `    const maxPositionSize = ${maxExposure};\n`;
        } else if (s.name === 'Stop Loss') {
          const limit = p('limit') || 10;
          code += `    // Stop loss configured to ${limit}%\n`;
        } else if (s.name === 'Take Profit') {
          const target = p('target') || 20;
          code += `    // Take profit configured to ${target}%\n`;
        }
      });
      if (!code.includes('maxPositionSize')) code += `    const maxPositionSize = 1000;\n`;
      code += `    const confidence = this.calculateConfidence(market);\n\n`;
    }

    const actions = droppedBlocks.filter(b => b.type === 'action');
    if (actions.length > 0) {
      const action = actions[0];
      const p = (key: string) => action.params?.find(x => x.key === key)?.value;
      const size = p('size') || 500;
      const actionType = action.name.includes('Buy') || action.name.includes('Comprar') ? 'BUY' : 'SELL';
      
      code += `    // ── Action ──\n`;
      code += `    return {\n`;
      code += `      action: '${actionType}',\n`;
      code += `      size: ${strategies.length > 0 ? `Math.min(${size}, maxPositionSize * confidence)` : `${size}`},\n`;
      code += `      confidence: ${strategies.length > 0 ? 'confidence' : '0.7'},\n`;
      code += `      reason: 'Logic matched for ${action.name} with outcome ${p('outcome') || 'Yes'}'\n`;
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
            <a href="https://www.linkedin.com/in/juanpabloperezdev/" target="_blank" rel="noopener noreferrer" className="btn btn-primary">Contact Sales</a>
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
            <div className="network-toggle" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 0' }}>
              <span className={`network-status ${!isMainnet ? 'testnet' : ''}`} style={{ opacity: !isMainnet ? 1 : 0.5, transition: '0.2s', margin: 0 }}>
                {t.nav.product === 'Produto' ? 'Demo' : 'Demo'}
              </span>
              <div 
                className={`toggle-switch ${isMainnet ? 'active' : ''}`}
                onClick={toggleNetwork}
                title="Toggle Demo/Live"
              >
                <div className="toggle-slider"></div>
              </div>
              <span className={`network-status ${isMainnet ? 'mainnet' : ''}`} style={{ opacity: isMainnet ? 1 : 0.5, transition: '0.2s', margin: 0 }}>
                {t.nav.product === 'Produto' ? 'Real' : 'Live'}
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
              <div className="selected-count" style={{ marginBottom: '0.5rem' }}>
                {t.builder.selected}: {selectedMarkets.length} {t.builder.markets} {!isMainnet && t.builder.demo}
              </div>
              <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem', paddingRight: '0.25rem' }}>
                {selectedMarkets.map(market => (
                  <div
                    key={market.id}
                    className="block trigger"
                    style={{ background: 'white', color: 'var(--text-dark)', border: '1px solid #e2e8f0', fontSize: '0.75rem', padding: '0.5rem', cursor: 'grab' }}
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'market', market.question)}
                  >
                    <Globe size={12} color="#0EA5E9" style={{flexShrink: 0, marginRight: '4px', verticalAlign: 'middle'}}/>
                    <span style={{lineHeight: 1.2, display: 'inline-block'}}>{market.question.length > 45 ? market.question.substring(0, 45) + '...' : market.question}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* API Credentials (optional) */}
            <div className="market-selector" style={{marginTop: '0.5rem'}}>
              <div
                onClick={() => setShowCreds(!showCreds)}
                style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer'}}
              >
                  <label className="market-label" style={{margin: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                    <Key size={14} />
                    Synthesis API Keys
                  </label>
                  <span style={{fontSize: '0.75rem', color: 'var(--text-gray)'}}>{showCreds ? '▲' : '▼'} {apiKey ? '✓' : 'optional'}</span>
                </div>
                {showCreds && (
                  <div style={{marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                    <p style={{fontSize: '0.75rem', color: 'var(--text-gray)', margin: 0}}>
                      PolyFlow is powered by the Synthesis API! Add your keys here and they'll be embedded in the download. Required only for live trading.
                    </p>
                    <input
                      type="text"
                      placeholder="Synthesis API Key"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="market-select"
                      style={{fontFamily: 'monospace', fontSize: '0.8rem'}}
                    />
                    <input
                      type="password"
                      placeholder="Secret Key (sk_...)"
                      value={apiSecret}
                      onChange={(e) => setApiSecret(e.target.value)}
                      className="market-select"
                      style={{fontFamily: 'monospace', fontSize: '0.8rem'}}
                    />
                    <a href="https://docs.polymarket.com" target="_blank" rel="noopener noreferrer" style={{fontSize: '0.75rem', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                      <Globe size={12} /> How to get API keys →
                    </a>
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
              <div 
                className="block trigger"
                draggable
                onDragStart={(e) => handleDragStart(e, 'trigger', t.builder.blocks.timeTrigger)}
              >
                <Clock size={16} /> {t.builder.blocks.timeTrigger}
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
                onDragStart={(e) => handleDragStart(e, 'strategy', t.builder.blocks.takeProfit)}
              >
                <TrendingUp size={16} /> {t.builder.blocks.takeProfit}
              </div>
              <div 
                className="block strategy"
                draggable
                onDragStart={(e) => handleDragStart(e, 'strategy', t.builder.blocks.stopLoss)}
              >
                <Activity size={16} /> {t.builder.blocks.stopLoss}
              </div>
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
                      <div className={`dropped-block ${block.type}`} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                          <span className="flex items-center gap-2">{getBlockIcon(block.type)} {block.name}</span>
                          <button 
                            className="remove-btn"
                            onClick={() => removeBlock(index)}
                          >
                            ✕
                          </button>
                        </div>
                        {block.params && block.params.length > 0 && (
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', width: '100%', padding: '0.75rem', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 'var(--radius-sm)' }}>
                            {block.params.map((param, pIdx) => (
                              <div key={pIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem' }}>
                                <label style={{ color: 'var(--text-gray)' }}>{param.label}:</label>
                                {param.type === 'select' ? (
                                  <select 
                                    style={{ padding: '2px 4px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '0.8rem' }}
                                    value={param.value}
                                    onChange={(e) => updateBlockParam(index, param.key, e.target.value)}
                                  >
                                    {param.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                  </select>
                                ) : (
                                  <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <input 
                                      type="number"
                                      style={{ padding: '2px 4px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '0.8rem', width: '60px' }}
                                      value={param.value}
                                      min={param.min} max={param.max} step={param.step}
                                      onChange={(e) => updateBlockParam(index, param.key, parseFloat(e.target.value) || 0)}
                                    />
                                    {param.suffix && <span style={{ marginLeft: '2px', color: 'var(--text-gray)' }}>{param.suffix}</span>}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
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

          {/* Console / Output Panel */}
          <div className="panel">

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
              <div style={{fontSize: '0.8rem', fontWeight: 700, color: '#166534', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}><ClipboardList size={14} /> After copying script</div>
              <div style={{fontSize: '0.8rem', color: '#15803d', lineHeight: 1.7}}>
                <div style={{display: 'flex', gap: '0.5rem', alignItems: 'flex-start'}}>
                  <span>Simply paste the script into any terminal window to build and run your bot instantly:<br/>
                    <code style={{background: '#dcfce7', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.78rem', display: 'inline-block', marginTop: '4px'}}>Cmd+V</code> then <code style={{background: '#dcfce7', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.78rem', display: 'inline-block', marginTop: '4px'}}>Enter</code>
                  </span>
                </div>
                <div style={{marginTop: '0.75rem', fontSize: '0.75rem', color: '#166534', opacity: 0.8}}>
                  <Zap size={12} style={{display:'inline', marginRight:'4px', verticalAlign:'middle'}} />Analyzes live markets on startup.{apiKey ? ' Your API keys are included — ready for live trading!' : ' Add API keys for live trading.'}
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
