# PolyFlow

**No-code trading automation for Polymarket. Build strategies visually, backtest on real data, export to TypeScript.**

[Try it Live](https://polyflow.ai) • [Documentation](https://docs.polyflow.ai) • [Discord](https://discord.gg/polyflow)

---

## What is this?

PolyFlow lets you build Polymarket trading bots without writing code. Drag blocks, connect logic, test with real market data, then export production-ready TypeScript.

**No API keys needed to start.** Just clone and run.

---

## Quick Start

```bash
git clone https://github.com/juapperez/polyflow.git
cd polyflow
npm install
npm run dev
```

Open `http://localhost:5173` → Start building.

---

## How it works

1. **Drag blocks** - Triggers, conditions, actions, risk controls
2. **Connect logic** - Build your strategy visually
3. **Test live** - Run against real Polymarket markets (no auth needed)
4. **Export code** - Get TypeScript you can run locally

---

## Features

- ✅ Visual strategy builder (no code)
- ✅ Real-time Polymarket CLOB data
- ✅ Backtest on historical data
- ✅ Export to TypeScript
- ✅ Run locally (your keys, your machine)
- ✅ Multi-language (EN, PT-BR)

---

## Example Strategy

```typescript
// Auto-generated from visual builder
export class CustomStrategy extends Strategy {
  async analyze(market: Market): Promise<Signal> {
    // Price trigger
    if (market.prices[0] < 0.3) return { action: 'HOLD', size: 0, confidence: 0 };
    
    // Momentum check
    const momentum = market.prices[0] - 0.5;
    if (momentum <= 0) return { action: 'HOLD', size: 0, confidence: 0 };
    
    // Risk management
    const confidence = this.calculateConfidence(market);
    
    // Execute
    return {
      action: 'BUY',
      size: Math.min(500, 1000 * confidence),
      confidence
    };
  }
}
```

---

## Why PolyFlow?

**For traders:** Build strategies without learning to code  
**For developers:** Prototype fast, export clean TypeScript  
**For everyone:** Test risk-free with demo markets

---

## Architecture

```
┌─────────────────┐
│  Visual Builder │  ← Drag & drop interface
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Strategy Logic │  ← Your trading rules
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Polymarket API │  ← Real market data (no auth for reads)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Local Execution│  ← Runs on your machine
└─────────────────┘
```

---

## Project Structure

```
polyflow/
├── frontend/          # React app (visual builder)
├── src/
│   ├── core/         # Trading engine
│   ├── strategies/   # Strategy implementations
│   └── examples/     # Demo scripts
└── demo/             # Standalone HTML demo
```

---

## Development

```bash
# Install
npm install

# Dev server
npm run dev

# Build
npm run build

# Test
npm test

# Run backtest
npm run backtest
```

---

## API Keys?

**Not needed for testing.** Polymarket CLOB API is public for reading market data.

**Only needed for live trading.** Add to `.env`:

```bash
POLYMARKET_API_KEY=your_key
POLYMARKET_SECRET=your_secret
```

---

## Security

- Runs 100% locally
- No data collection
- No telemetry
- Your keys never leave your machine

---

## Contributing

PRs welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## License

MIT - see [LICENSE](LICENSE)

---

## Links

- [Website](https://polyflow.ai)
- [Docs](https://docs.polyflow.ai)
- [GitHub](https://github.com/juapperez/polyflow)
- [Discord](https://discord.gg/polyflow)

---

**Built with:** React • TypeScript • Vite • Polymarket CLOB API

**Made by traders, for traders.**
