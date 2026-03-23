import { useState } from 'react';
import { ArrowRight, Shield, Globe, Lock, Database, Fingerprint, Cpu, Terminal, Zap, BarChart2 } from 'lucide-react';
import './index.css';
import Builder from './Builder';
import { translations } from './translations';
import type { Language } from './translations';

function App() {
  const [showBuilder, setShowBuilder] = useState(false);
  const [activeTab, setActiveTab] = useState<'builder' | 'execution' | 'backtest' | 'risk'>('builder');
  const [language, setLanguage] = useState<Language>('EN');

  const t = translations[language];

  if (showBuilder) {
    return <Builder language={language} />;
  }

  return (
    <div className="app-wrapper">
      <nav className="nav">
        <div className="container flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span style={{ fontWeight: 700, fontSize: '1.4rem', color: 'var(--text-dark)' }}>Poly<span style={{color: 'var(--accent-blue)'}}>Flow</span></span>
          </div>

          <ul className="nav-links flex gap-8 items-center">
            <li><a href="#product">{t.nav.product}</a></li>
            <li><a href="#strategies">{t.nav.strategies}</a></li>
            <li><a href="#developers">{t.nav.developers}</a></li>
            <li><a href="#docs">{t.nav.docs}</a></li>
            <li><a href="#pricing">{t.nav.pricing}</a></li>
          </ul>

          <div className="flex gap-4 items-center">
            <a href="#login" style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-dark)', textDecoration: 'none' }}>{t.nav.signIn}</a>
            <button className="btn btn-primary" onClick={() => setShowBuilder(true)}>{t.nav.tryBuilder}</button>
            <div className="language-selector">
              <button className="language-btn" onClick={() => setLanguage(language === 'EN' ? 'PT' : 'EN')}>
                <span className="flag">{language === 'EN' ? '🇺🇸' : '🇧🇷'}</span>
                <span className="lang-code">{language === 'EN' ? 'EN' : 'PT'}</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot"></span>
            {t.hero.badge}
          </div>
          <h1 className="hero-title">
            {t.hero.title}<br />{t.hero.titleFor} <span className="hero-highlight">Polymarket</span> {t.hero.titleNoCode}
          </h1>
          <p className="hero-sub">
            {t.hero.subtitle}<br />
            {t.hero.subtitle2}
          </p>
          <div className="hero-cta-row">
            <button className="btn hero-btn-primary" onClick={() => setShowBuilder(true)}>
              {t.hero.launchBuilder} <ArrowRight size={18} style={{marginLeft: '6px'}} />
            </button>
            <a href="#product" className="hero-btn-ghost">{t.hero.seeHow}</a>
          </div>
          <p className="hero-footnote">{t.hero.footnote}</p>
        </div>

        {/* Floating stats cards */}
        <div className="hero-stats">
          <div className="stat-card">
            <div className="stat-value">62.8%</div>
            <div className="stat-label">{t.hero.stats.winRate}</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">50+</div>
            <div className="stat-label">{t.hero.stats.markets}</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">1.44</div>
            <div className="stat-label">{t.hero.stats.sharpe}</div>
          </div>
        </div>
      </section>

      {/* Tools Strip */}
      <section className="logos-strip">
        <h4>{t.tools.title}</h4>
        <div className="logos-flex container">
          <a href="https://polymarket.com" target="_blank" rel="noopener noreferrer" style={{fontWeight: 700, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'inherit'}}><Globe size={22}/> POLYMARKET</a>
          <a href="https://synthesis.ai" target="_blank" rel="noopener noreferrer" style={{fontWeight: 700, fontSize: '1.2rem', textDecoration: 'none', color: 'inherit'}}>SYNTHESIS</a>
          <a href="https://docs.polymarket.com/developers/clob/overview" target="_blank" rel="noopener noreferrer" style={{fontWeight: 700, fontSize: '1.2rem', textDecoration: 'none', color: 'inherit'}}>CLOB API</a>
          <a href="https://ethereum.org" target="_blank" rel="noopener noreferrer" style={{fontWeight: 700, fontSize: '1.2rem', textDecoration: 'none', color: 'inherit'}}>ETHEREUM</a>
          <a href="https://polygon.technology" target="_blank" rel="noopener noreferrer" style={{fontWeight: 700, fontSize: '1.2rem', textDecoration: 'none', color: 'inherit'}}>POLYGON</a>
        </div>
      </section>

      <section id="product" className="container">
        <div className="text-center" style={{margin: '0 auto', maxWidth: '700px'}}>
          <h2>{t.product.title} <span style={{color: 'var(--accent-blue)'}}>{t.product.titleHighlight}</span></h2>
          <p style={{color: 'var(--text-gray)', marginTop: '1rem', fontSize: '1.1rem'}}>
            {t.product.subtitle}
          </p>
        </div>

        <div className="tabs-container">
          <button className={`tab ${activeTab === 'builder' ? 'active' : ''}`} onClick={() => setActiveTab('builder')}>{t.product.tabs.builder}</button>
          <button className={`tab ${activeTab === 'execution' ? 'active' : ''}`} onClick={() => setActiveTab('execution')}>{t.product.tabs.execution}</button>
          <button className={`tab ${activeTab === 'backtest' ? 'active' : ''}`} onClick={() => setActiveTab('backtest')}>{t.product.tabs.backtest}</button>
          <button className={`tab ${activeTab === 'risk' ? 'active' : ''}`} onClick={() => setActiveTab('risk')}>{t.product.tabs.risk}</button>
        </div>

        <div className="showcase-grid">
          {/* ── Visual Builder ── */}
          {activeTab === 'builder' && (
            <>
              <div className="showcase-card showcase-dark">
                <h3>Drag & Drop Strategy Builder</h3>
                <p>Assemble trading logic by connecting blocks — Triggers, Conditions, Actions, and Risk Controls. No code. No setup. Just strategy.</p>
                <a href="#builder" className="action-link" onClick={(e) => { e.preventDefault(); setShowBuilder(true); }}>
                  Launch Builder <ArrowRight size={18} />
                </a>
              </div>
              <div className="showcase-card showcase-teal">
                <div className="terminal-window">
                  <div className="terminal-header">
                    <div className="term-dot dot-r"></div><div className="term-dot dot-y"></div><div className="term-dot dot-g"></div>
                    <span style={{marginLeft: '10px', fontSize: '0.8rem', color: '#a1a1aa'}}><Terminal size={12} style={{display:'inline', marginRight: '4px'}}/>strategy-runner.ts</span>
                  </div>
                  <div className="terminal-body">
                    <div><span className="term-muted">[14:22:05]</span> <span className="term-info">INFO</span>  Fetching Polymarket CLOB data...</div>
                    <div><span className="term-muted">[14:22:06]</span> <span className="term-info">INFO</span>  Analyzing 50 active markets</div>
                    <div><span className="term-muted">[14:22:08]</span> <span className="term-success">MATCH</span> Momentum trigger on "Bitcoin ~ $80k"</div>
                    <div><span className="term-muted">[14:22:09]</span> <span className="term-warning">EXEC</span>  Placing order: BUY Yes @ 0.45 USDC</div>
                    <div style={{marginTop: '1.5rem'}}>
                      <div style={{fontSize: '2rem', fontWeight: 700, color: 'var(--accent-green)'}}>+ $24.50</div>
                      <div className="term-muted">Simulated P&L — Testnet Mode</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── Auto Execution ── */}
          {activeTab === 'execution' && (
            <>
              <div className="showcase-card showcase-dark">
                <h3>Download & Run Locally</h3>
                <p>Build your strategy visually, then export it as a ready-to-run TypeScript file. Run it on your own machine — you stay in full control of your keys, your wallet, and your trades.</p>
                <a href="#builder" className="action-link" onClick={(e) => { e.preventDefault(); setShowBuilder(true); }}>
                  Build & Export <ArrowRight size={18} />
                </a>
              </div>
              <div className="showcase-card showcase-teal">
                <div className="terminal-window">
                  <div className="terminal-header">
                    <div className="term-dot dot-r"></div><div className="term-dot dot-y"></div><div className="term-dot dot-g"></div>
                    <span style={{marginLeft: '10px', fontSize: '0.8rem', color: '#a1a1aa'}}><Terminal size={12} style={{display:'inline', marginRight: '4px'}}/>your-terminal</span>
                  </div>
                  <div className="terminal-body">
                    <div><span className="term-muted">$</span> <span className="term-info">bash</span> setup.sh</div>
                    <div><span className="term-muted">  ✅ Setup complete!</span></div>
                    <div style={{marginTop: '0.5rem'}}><span className="term-muted">$</span> <span className="term-info">cd</span> polyflow-bot <span className="term-muted">&&</span> <span className="term-warning">npm start</span></div>
                    <div style={{marginTop: '0.5rem'}}><span className="term-muted">[boot]</span> <span className="term-success">READY</span>  Strategy loaded on your device</div>
                    <div><span className="term-muted">[run]</span>  <span className="term-info">INFO</span>  Fetching 20 live markets...</div>
                    <div><span className="term-muted">[run]</span>  <span className="term-success">🟢 BUY</span>  — "Will BTC reach $100k?" (conf: 85%)</div>
                    <div style={{marginTop: '1.5rem'}}>
                      <div style={{fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-green)'}}>🔒 Your keys. Your device.</div>
                      <div className="term-muted">Nothing leaves your machine</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── Backtesting ── */}
          {activeTab === 'backtest' && (
            <>
              <div className="showcase-card showcase-dark">
                <h3>Historical Backtesting Engine</h3>
                <p>Replay your strategy against months of real Polymarket data. Measure win rate, drawdown, Sharpe ratio, and P&L before going live — risk free.</p>
                <a href="#builder" className="action-link" onClick={(e) => { e.preventDefault(); setShowBuilder(true); }}>
                  Run a Backtest <ArrowRight size={18} />
                </a>
              </div>
              <div className="showcase-card showcase-teal">
                <div className="terminal-window">
                  <div className="terminal-header">
                    <div className="term-dot dot-r"></div><div className="term-dot dot-y"></div><div className="term-dot dot-g"></div>
                    <span style={{marginLeft: '10px', fontSize: '0.8rem', color: '#a1a1aa'}}><Terminal size={12} style={{display:'inline', marginRight: '4px'}}/>backtest-engine.ts</span>
                  </div>
                  <div className="terminal-body">
                    <div><span className="term-muted">[SIM]</span> <span className="term-info">START</span>  Running 90-day backtest...</div>
                    <div><span className="term-muted">[SIM]</span> <span className="term-info">DATA</span>  Loaded 156 historical trades</div>
                    <div><span className="term-muted">[SIM]</span> <span className="term-success">DONE</span>  Backtest complete</div>
                    <div style={{marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem'}}>
                      <div><div style={{fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-green)'}}>62.8%</div><div className="term-muted">Win Rate</div></div>
                      <div><div style={{fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-green)'}}>$19.27</div><div className="term-muted">Total P&L</div></div>
                      <div><div style={{fontSize: '1.4rem', fontWeight: 700, color: '#e4e4e7'}}>1.44</div><div className="term-muted">Sharpe Ratio</div></div>
                      <div><div style={{fontSize: '1.4rem', fontWeight: 700, color: '#e4e4e7'}}>156</div><div className="term-muted">Total Trades</div></div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── Risk Management ── */}
          {activeTab === 'risk' && (
            <>
              <div className="showcase-card showcase-dark">
                <h3>Built-In Risk Controls</h3>
                <p>Protect your capital with configurable guardrails — set max trade size, daily loss limits, confidence thresholds, and exposure caps per market.</p>
                <a href="#builder" className="action-link" onClick={(e) => { e.preventDefault(); setShowBuilder(true); }}>
                  Configure Risk <ArrowRight size={18} />
                </a>
              </div>
              <div className="showcase-card showcase-teal">
                <div className="terminal-window">
                  <div className="terminal-header">
                    <div className="term-dot dot-r"></div><div className="term-dot dot-y"></div><div className="term-dot dot-g"></div>
                    <span style={{marginLeft: '10px', fontSize: '0.8rem', color: '#a1a1aa'}}><Terminal size={12} style={{display:'inline', marginRight: '4px'}}/>risk-guard.ts</span>
                  </div>
                  <div className="terminal-body">
                    <div><span className="term-muted">[RISK]</span> <span className="term-info">CHECK</span>  Max trades per day: 10/10</div>
                    <div><span className="term-muted">[RISK]</span> <span className="term-warning">WARN</span>  Daily loss limit approaching ($-45)</div>
                    <div><span className="term-muted">[RISK]</span> <span className="term-success">PASS</span>  Confidence ≥ 0.7 — trade allowed</div>
                    <div><span className="term-muted">[RISK]</span> <span className="term-success">SAFE</span>  Max exposure per market: $100</div>
                    <div style={{marginTop: '1.5rem'}}>
                      <div style={{fontSize: '2rem', fontWeight: 700, color: '#fbbf24'}}>🛡 Protected</div>
                      <div className="term-muted">All risk checks passing</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Feature cards row */}
        <div className="features-row">
          <div className="feature-card">
            <div className="feature-icon"><Zap size={22} /></div>
            <h4>Real-Time Triggers</h4>
            <p>React to price changes, volume spikes, and market events the moment they happen on Polymarket.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><BarChart2 size={22} /></div>
            <h4>Historical Backtesting</h4>
            <p>Replay your strategy against real past market data before risking a single dollar.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Shield size={22} /></div>
            <h4>Built-In Risk Controls</h4>
            <p>Set max trade limits, drawdown guards, and confidence thresholds to protect your capital.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Cpu size={22} /></div>
            <h4>Export to Code</h4>
            <p>When you're ready to go deeper, export your strategy as production-ready TypeScript in one click.</p>
          </div>
        </div>

        <div className="network-section">
          <div className="network-text">
            <h2>Connect to any prediction market</h2>
            <p>Integrate with Polymarket CLOB API, Synthesis markets, and custom data sources. Your bots run with live data and execute trades automatically.</p>
          </div>
          <div style={{flex: 1, position: 'relative', display: 'flex', justifyContent: 'flex-end'}}>
            <div style={{
              width: '400px', height: '300px',
              background: 'radial-gradient(circle at center, rgba(6,182,212,0.1) 0%, transparent 70%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <div style={{
                width: '80px', height: '80px', background: 'white', borderRadius: '50%',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Cpu size={35} color="var(--accent-blue)" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="dark-section">
        <div className="container text-center">
          <div className="security-subtitle">Security and Compliance</div>
          <h2>Enterprise-grade security for your trading strategies</h2>


          <div className="privacy-grid text-left">
            <div className="privacy-card" style={{textAlign: 'left'}}>
              <div className="privacy-card-icon"><Lock size={24} /></div>
              <h4>Strategy Privacy</h4>
              <p>Your rules and execution logic are encrypted end-to-end and never shared with third parties or stored on external services.</p>
            </div>
            <div className="privacy-card" style={{textAlign: 'left'}}>
              <div className="privacy-card-icon"><Database size={24} /></div>
              <h4>Zero Data Exposure</h4>
              <p>Your API keys and wallet addresses stay strictly in your control. We never process or transmit them to outside services.</p>
            </div>
            <div className="privacy-card" style={{textAlign: 'left'}}>
              <div className="privacy-card-icon"><Fingerprint size={24} /></div>
              <h4>Auditable Execution</h4>
              <p>Every trade triggered by your strategy is logged with timestamps and context, giving you complete transparency at all times.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-top">
            <div className="footer-brand">
              <span style={{ fontWeight: 700, fontSize: '1.4rem', color: 'white' }}>Poly<span style={{color: 'var(--accent-cyan)'}}>Flow</span></span>
              <p>The visual automation framework for Polymarket traders. Build strategies without code, backtest on real data, and deploy in seconds.</p>
              <div className="footer-socials">
                <a className="footer-social-btn" href="https://github.com/juapperez/polyflow" target="_blank" rel="noopener noreferrer" title="GitHub">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
              </div>
            </div>
            <div className="footer-col">
              <h5>Product</h5>
              <ul>
                <li><a href="#">Visual Builder</a></li>
                <li><a href="#">Backtesting</a></li>
                <li><a href="#">Auto Execution</a></li>
                <li><a href="#">Risk Controls</a></li>
                <li><a href="#">Pricing</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h5>Integrations</h5>
              <ul>
                <li><a href="https://docs.polymarket.com" target="_blank" rel="noopener noreferrer">Polymarket CLOB</a></li>
                <li><a href="https://www.synthesis.ai" target="_blank" rel="noopener noreferrer">Synthesis API</a></li>
                <li><a href="https://ethereum.org/en/developers/" target="_blank" rel="noopener noreferrer">Ethereum</a></li>
                <li><a href="https://docs.polygon.technology" target="_blank" rel="noopener noreferrer">Polygon</a></li>
                <li><a href="https://clob.polymarket.com" target="_blank" rel="noopener noreferrer">CLOB REST API</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h5>Developers</h5>
              <ul>
                <li><a href="#">Documentation</a></li>
                <li><a href="#">API Reference</a></li>
                <li><a href="#">SDK</a></li>
                <li><a href="#">Examples</a></li>
                <li><a href="#">Changelog</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h5>Company</h5>
              <ul>
                <li><a href="#">About</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Contact</a></li>
                <li><a href="#">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <span className="footer-bottom-copy">© 2025 PolyFlow. All rights reserved.</span>
            <div className="footer-bottom-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Cookie Settings</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
