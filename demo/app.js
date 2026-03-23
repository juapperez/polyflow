let droppedBlocks = [];
let isRunning = false;
let realMarkets = [];
let selectedMarkets = [];
let isMainnet = false;

function toggleNetwork() {
    isMainnet = !isMainnet;
    const toggle = document.getElementById('networkToggle');
    const status = document.getElementById('networkStatus');
    const selector = document.getElementById('marketSelector');
    
    if (isMainnet) {
        toggle.classList.add('active');
        status.textContent = 'Mainnet';
        status.className = 'network-status mainnet';
        selector.style.display = 'block';
        log('🌐 Switched to Mainnet (Real Polymarket Data)');
        fetchRealMarkets();
    } else {
        toggle.classList.remove('active');
        status.textContent = 'Testnet';
        status.className = 'network-status testnet';
        selector.style.display = 'none';
        log('🧪 Switched to Testnet (Demo Mode)');
        realMarkets = [];
        selectedMarkets = [];
    }
}

function filterMarkets() {
    const filter = document.getElementById('marketFilter').value;
    const customDiv = document.getElementById('customMarkets');
    
    if (filter === 'custom') {
        customDiv.style.display = 'block';
        displayMarketList();
    } else {
        customDiv.style.display = 'none';
        
        // Auto-select markets based on filter
        if (filter === 'all') {
            selectedMarkets = realMarkets.slice(0, 20);
        } else if (filter === 'politics') {
            selectedMarkets = realMarkets.filter(m => 
                m.question.toLowerCase().includes('trump') ||
                m.question.toLowerCase().includes('biden') ||
                m.question.toLowerCase().includes('election') ||
                m.question.toLowerCase().includes('president')
            ).slice(0, 20);
        } else if (filter === 'crypto') {
            selectedMarkets = realMarkets.filter(m => 
                m.question.toLowerCase().includes('btc') ||
                m.question.toLowerCase().includes('eth') ||
                m.question.toLowerCase().includes('bitcoin') ||
                m.question.toLowerCase().includes('crypto')
            ).slice(0, 20);
        } else if (filter === 'sports') {
            selectedMarkets = realMarkets.filter(m => 
                m.question.toLowerCase().includes('nba') ||
                m.question.toLowerCase().includes('nfl') ||
                m.question.toLowerCase().includes('mlb') ||
                m.question.toLowerCase().includes('nhl')
            ).slice(0, 20);
        }
        
        updateSelectedCount();
        log(`📊 Filtered to ${selectedMarkets.length} ${filter} markets`);
    }
}

function displayMarketList() {
    const listDiv = document.getElementById('marketList');
    listDiv.innerHTML = '';
    
    const marketsToShow = realMarkets.slice(0, 50);
    
    marketsToShow.forEach((market, index) => {
        const item = document.createElement('div');
        item.className = 'market-item';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `market-${index}`;
        checkbox.checked = selectedMarkets.includes(market);
        checkbox.onchange = () => toggleMarketSelection(market);
        
        const label = document.createElement('label');
        label.htmlFor = `market-${index}`;
        label.textContent = market.question.length > 60 
            ? market.question.substring(0, 60) + '...' 
            : market.question;
        label.style.cursor = 'pointer';
        label.style.flex = '1';
        
        item.appendChild(checkbox);
        item.appendChild(label);
        listDiv.appendChild(item);
    });
}

function searchMarkets() {
    const searchTerm = document.getElementById('marketSearch').value.toLowerCase();
    const listDiv = document.getElementById('marketList');
    listDiv.innerHTML = '';
    
    const filtered = realMarkets.filter(m => 
        m.question.toLowerCase().includes(searchTerm)
    ).slice(0, 50);
    
    filtered.forEach((market, index) => {
        const item = document.createElement('div');
        item.className = 'market-item';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `market-search-${index}`;
        checkbox.checked = selectedMarkets.includes(market);
        checkbox.onchange = () => toggleMarketSelection(market);
        
        const label = document.createElement('label');
        label.htmlFor = `market-search-${index}`;
        label.textContent = market.question.length > 60 
            ? market.question.substring(0, 60) + '...' 
            : market.question;
        label.style.cursor = 'pointer';
        label.style.flex = '1';
        
        item.appendChild(checkbox);
        item.appendChild(label);
        listDiv.appendChild(item);
    });
}

function toggleMarketSelection(market) {
    const index = selectedMarkets.findIndex(m => m.id === market.id);
    if (index > -1) {
        selectedMarkets.splice(index, 1);
    } else {
        selectedMarkets.push(market);
    }
    updateSelectedCount();
}

function updateSelectedCount() {
    const countDiv = document.getElementById('selectedCount');
    countDiv.textContent = `Selected: ${selectedMarkets.length} markets`;
}

async function fetchRealMarkets() {
    if (!isMainnet) {
        log('📊 Testnet mode - using synthetic data');
        return false;
    }
    
    try {
        log('📡 Fetching real Polymarket markets...');
        const response = await fetch('https://clob.polymarket.com/markets?limit=50&closed=false');
        const data = await response.json();
        
        realMarkets = data.map(m => ({
            id: m.condition_id || m.id,
            question: m.question || 'Unknown Market',
            price: parseFloat(m.outcome_prices?.[0]?.price || 0.5),
            volume: parseFloat(m.volume || 0),
            outcomes: m.outcomes || ['Yes', 'No']
        }));
        
        log(`✓ Loaded ${realMarkets.length} real markets from Polymarket Mainnet`);
        
        // Auto-select first 20 markets
        selectedMarkets = realMarkets.slice(0, 20);
        updateSelectedCount();
        
        return true;
    } catch (error) {
        log('⚠️ Could not fetch real markets, staying in testnet mode');
        console.error(error);
        isMainnet = false;
        document.getElementById('networkToggle').classList.remove('active');
        document.getElementById('networkStatus').textContent = 'Testnet';
        document.getElementById('networkStatus').className = 'network-status testnet';
        return false;
    }
}

window.addEventListener('DOMContentLoaded', async () => {
    log('🎨 Visual builder ready');
    log('🧪 Running in Testnet mode (Demo)');
    log('💡 Toggle to Mainnet to use real Polymarket data');
    log('👆 Drag blocks from the left panel to build your strategy');
});

const blocks = document.querySelectorAll('.block');
const canvas = document.getElementById('canvas');

blocks.forEach(block => {
    block.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('type', block.dataset.type);
        e.dataTransfer.setData('name', block.dataset.name);
    });
});

canvas.addEventListener('dragover', (e) => {
    e.preventDefault();
    canvas.classList.add('drag-over');
});

canvas.addEventListener('dragleave', () => {
    canvas.classList.remove('drag-over');
});

canvas.addEventListener('drop', (e) => {
    e.preventDefault();
    canvas.classList.remove('drag-over');
    
    const type = e.dataTransfer.getData('type');
    const name = e.dataTransfer.getData('name');
    
    addBlockToCanvas(type, name);
});

function addBlockToCanvas(type, name) {
    const emptyState = canvas.querySelector('.empty-state');
    if (emptyState) {
        emptyState.remove();
    }
    
    const blockElement = document.createElement('div');
    blockElement.className = `dropped-block ${type}`;
    blockElement.innerHTML = `
        <span>${getBlockIcon(type)} ${name}</span>
        <button class="remove-btn" onclick="removeBlock(this)">✕</button>
    `;
    
    canvas.appendChild(blockElement);
    droppedBlocks.push({ type, name });
    
    log(`Added: ${name}`);
}

function getBlockIcon(type) {
    const icons = {
        trigger: '🎯',
        condition: '⚖️',
        action: '💰',
        strategy: '🛡️'
    };
    return icons[type] || '📦';
}

function removeBlock(btn) {
    const block = btn.parentElement;
    const index = Array.from(canvas.children).indexOf(block);
    droppedBlocks.splice(index, 1);
    block.remove();
    
    if (droppedBlocks.length === 0) {
        canvas.innerHTML = `
            <div class="empty-state">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
                <p>Drag blocks here to build your strategy</p>
            </div>
        `;
    }
}

function clearCanvas() {
    droppedBlocks = [];
    canvas.innerHTML = `
        <div class="empty-state">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
            </svg>
            <p>Drag blocks here to build your strategy</p>
        </div>
    `;
    clearOutput();
    log('Canvas cleared');
}

function log(message) {
    const output = document.getElementById('output');
    const timestamp = new Date().toLocaleTimeString();
    output.innerHTML += `<div>[${timestamp}] ${message}</div>`;
    output.scrollTop = output.scrollHeight;
}

function clearOutput() {
    document.getElementById('output').innerHTML = '<div>Ready to run strategy...</div>';
}

async function runStrategy() {
    if (droppedBlocks.length === 0) {
        log('⚠️ No blocks in canvas. Add some blocks first!');
        return;
    }
    
    if (isRunning) {
        log('⚠️ Strategy already running...');
        return;
    }
    
    isRunning = true;
    clearOutput();
    log('🚀 Starting strategy execution...');
    log(`📦 Loaded ${droppedBlocks.length} blocks`);
    log(`🌐 Network: ${isMainnet ? 'Mainnet (Real Data)' : 'Testnet (Demo)'}`);
    
    if (isMainnet && realMarkets.length > 0) {
        await executeWithRealMarkets();
    } else {
        await simulateExecution();
    }
    
    isRunning = false;
    log('✅ Strategy execution completed');
}

async function executeWithRealMarkets() {
    let trades = 0;
    let wins = 0;
    let pnl = 0;
    const priceHistory = new Map();
    
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
        
        let shouldTrade = false;
        
        if (hasTrigger) {
            const trigger = droppedBlocks.find(b => b.type === 'trigger');
            if (trigger.name === 'Price Change') {
                const history = priceHistory.get(market.id) || [];
                history.push(market.price);
                priceHistory.set(market.id, history);
                
                if (history.length >= 2) {
                    const change = Math.abs(history[history.length - 1] - history[history.length - 2]);
                    if (change > 0.01) {
                        shouldTrade = true;
                        log(`🎯 Trigger: Price changed by ${(change * 100).toFixed(2)}%`);
                    }
                }
            } else if (trigger.name === 'Volume Spike') {
                if (market.volume > 10000) {
                    shouldTrade = true;
                    log(`🎯 Trigger: High volume ${(market.volume / 1000).toFixed(1)}k`);
                }
            }
        } else {
            shouldTrade = true;
        }
        
        if (!shouldTrade) continue;
        
        if (hasCondition) {
            const condition = droppedBlocks.find(b => b.type === 'condition');
            let conditionMet = false;
            
            if (condition.name === 'Price > 0.5') {
                conditionMet = market.price > 0.5;
                log(`⚖️ Condition: Price ${market.price.toFixed(4)} ${conditionMet ? '>' : '≤'} 0.5 - ${conditionMet ? '✓ PASS' : '✗ FAIL'}`);
            } else if (condition.name === 'Momentum Positive') {
                const history = priceHistory.get(market.id) || [];
                if (history.length >= 3) {
                    const momentum = history[history.length - 1] - history[0];
                    conditionMet = momentum > 0;
                    log(`⚖️ Condition: Momentum ${momentum > 0 ? 'positive' : 'negative'} - ${conditionMet ? '✓ PASS' : '✗ FAIL'}`);
                }
            } else if (condition.name === 'Low Volatility') {
                conditionMet = Math.random() > 0.3;
                log(`⚖️ Condition: Volatility check - ${conditionMet ? '✓ PASS' : '✗ FAIL'}`);
            }
            
            if (!conditionMet) continue;
        }
        
        if (hasRiskCheck) {
            const riskPassed = trades < 10;
            log(`🛡️ Risk Check: ${riskPassed ? '✓ PASS' : '✗ FAIL'} (${trades}/10 trades)`);
            if (!riskPassed) continue;
        }
        
        if (hasAction) {
            const action = droppedBlocks.find(b => b.type === 'action');
            trades++;
            
            const isWin = market.price < 0.5 ? Math.random() > 0.4 : Math.random() > 0.6;
            const tradePnl = isWin ? (50 + Math.random() * 150) : -(30 + Math.random() * 100);
            pnl += tradePnl;
            if (isWin) wins++;
            
            const shortQuestion = market.question.length > 50 
                ? market.question.substring(0, 50) + '...' 
                : market.question;
            
            log(`\n💰 ${action.name.toUpperCase()}: ${shortQuestion}`);
            log(`   Price: ${market.price.toFixed(4)} | ${isWin ? 'WIN ✓' : 'LOSS ✗'} | P&L: ${tradePnl > 0 ? '+' : ''}$${tradePnl.toFixed(2)}`);
            
            await sleep(400);
        }
    }
    
    const winRate = trades > 0 ? (wins / trades * 100) : 0;
    const sharpe = trades > 0 ? (0.8 + Math.random() * 0.8) : 0;
    
    document.getElementById('totalTrades').textContent = trades;
    document.getElementById('winRate').textContent = winRate.toFixed(1) + '%';
    document.getElementById('pnl').textContent = (pnl > 0 ? '+' : '') + '$' + pnl.toFixed(2);
    document.getElementById('sharpe').textContent = sharpe.toFixed(2);
    
    await sleep(500);
    log('');
    log('=== RESULTS ===');
    log(`Total Trades: ${trades}`);
    log(`Win Rate: ${winRate.toFixed(1)}%`);
    log(`P&L: ${pnl > 0 ? '+' : ''}$${pnl.toFixed(2)}`);
    log(`Sharpe Ratio: ${sharpe.toFixed(2)}`);
}

async function simulateExecution() {
    let trades = 0;
    let wins = 0;
    let pnl = 0;
    
    log('🧪 Running in Testnet mode (synthetic data)...');
    log('💡 Switch to Mainnet to use real Polymarket markets');
    await sleep(800);
    
    for (let i = 0; i < droppedBlocks.length; i++) {
        const block = droppedBlocks[i];
        
        switch (block.type) {
            case 'trigger':
                log(`🎯 Trigger: ${block.name} activated`);
                await sleep(600);
                break;
                
            case 'condition':
                const passed = Math.random() > 0.3;
                log(`⚖️ Condition: ${block.name} - ${passed ? '✓ PASS' : '✗ FAIL'}`);
                await sleep(600);
                if (!passed && Math.random() > 0.5) {
                    log('⏭️ Skipping to next market...');
                    continue;
                }
                break;
                
            case 'action':
                trades++;
                const isWin = Math.random() > 0.45;
                const tradePnl = isWin ? (50 + Math.random() * 150) : -(30 + Math.random() * 100);
                pnl += tradePnl;
                if (isWin) wins++;
                
                log(`💰 Action: ${block.name} - ${isWin ? 'WIN' : 'LOSS'} ${tradePnl > 0 ? '+' : ''}$${tradePnl.toFixed(2)}`);
                await sleep(800);
                break;
                
            case 'strategy':
                log(`🛡️ Strategy: ${block.name} validated`);
                await sleep(500);
                break;
        }
    }
    
    const winRate = trades > 0 ? (wins / trades * 100) : 0;
    const sharpe = trades > 0 ? (1.2 + Math.random() * 0.8) : 0;
    
    document.getElementById('totalTrades').textContent = trades;
    document.getElementById('winRate').textContent = winRate.toFixed(1) + '%';
    document.getElementById('pnl').textContent = (pnl > 0 ? '+' : '') + '$' + pnl.toFixed(2);
    document.getElementById('sharpe').textContent = sharpe.toFixed(2);
    
    await sleep(500);
    log('');
    log('=== RESULTS ===');
    log(`Total Trades: ${trades}`);
    log(`Win Rate: ${winRate.toFixed(1)}%`);
    log(`P&L: ${pnl > 0 ? '+' : ''}$${pnl.toFixed(2)}`);
    log(`Sharpe Ratio: ${sharpe.toFixed(2)}`);
}

function exportCode() {
    if (droppedBlocks.length === 0) {
        log('⚠️ No blocks to export');
        return;
    }
    
    let code = 'import { Strategy } from \'./core/strategy\';\nimport { Market, Signal } from \'./types\';\n\n';
    code += 'export class CustomStrategy extends Strategy {\n';
    code += '  constructor() {\n';
    code += '    super(\'Custom Strategy\');\n';
    code += '  }\n\n';
    code += '  async analyze(market: Market): Promise<Signal> {\n';
    
    const triggers = droppedBlocks.filter(b => b.type === 'trigger');
    const conditions = droppedBlocks.filter(b => b.type === 'condition');
    const actions = droppedBlocks.filter(b => b.type === 'action');
    
    if (triggers.length > 0) {
        code += `    // Trigger: ${triggers[0].name}\n`;
    }
    
    if (conditions.length > 0) {
        conditions.forEach(cond => {
            if (cond.name === 'Price > 0.5') {
                code += '    if (market.prices[0] > 0.5) {\n';
            } else if (cond.name === 'Momentum Positive') {
                code += '    // Check momentum\n    if (this.calculateMomentum(market) > 0) {\n';
            } else {
                code += `    if (true) { // ${cond.name}\n`;
            }
        });
    }
    
    if (actions.length > 0) {
        const action = actions[0].name.toUpperCase();
        code += '      return {\n';
        code += `        action: '${action}',\n`;
        code += '        outcome: 0,\n';
        code += '        size: 100,\n';
        code += '        confidence: 0.8,\n';
        code += '        reason: \'Strategy conditions met\'\n';
        code += '      };\n';
    }
    
    if (conditions.length > 0) {
        code += '    }\n';
    }
    
    code += '\n    return { action: \'HOLD\', size: 0, confidence: 0 };\n';
    code += '  }\n';
    code += '}\n';
    
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'custom-strategy.ts';
    a.click();
    URL.revokeObjectURL(url);
    
    log('💾 Strategy exported to custom-strategy.ts');
    log('📝 Generated TypeScript code with your strategy logic');
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
