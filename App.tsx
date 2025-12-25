
import React, { useState, useMemo } from 'react';
import FractalCanvas from './components/FractalCanvas';
import { ViewPort, FractalConfig } from './types';
import { INITIAL_VIEW, PALETTES, EQUATION_PRESETS, Bookmark } from './constants';
import { describeFractalView } from './services/geminiService';

// Improved helper to render math formulas with beautiful subscripts and superscripts
const RenderFormula: React.FC<{ formula: string }> = ({ formula }) => {
  const parts = formula.split(/(\_{.*?\}|\_\{?.\}?|\^.)/g).map((part, i) => {
    if ((part.startsWith('_{') && part.endsWith('}')) || (part.startsWith('_') && part.length > 1)) {
      const content = part.startsWith('_{') ? part.slice(2, -1) : part.slice(1);
      return <sub key={i} className="text-[0.6em] align-baseline relative -bottom-[0.15em] opacity-80">{content}</sub>;
    }
    if (part.startsWith('^')) {
      return <sup key={i} className="text-[0.6em] align-baseline relative top-[-0.35em] opacity-80">{part.slice(1)}</sup>;
    }
    return part;
  });
  return <span className="font-mono tracking-tighter whitespace-nowrap">{parts}</span>;
};

const App: React.FC = () => {
  const [view, setView] = useState<ViewPort>(INITIAL_VIEW);
  const [config, setConfig] = useState<FractalConfig>({
    maxIterations: 200,
    colorPalette: 'Electric Blue',
    realEquation: EQUATION_PRESETS[0].real,
    imagEquation: EQUATION_PRESETS[0].imag
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalysis = async () => {
    setIsAnalyzing(true);
    setAiAnalysis(null);
    try {
      const result = await describeFractalView(view.centerX, view.centerY, view.zoom);
      setAiAnalysis(result || "Unable to interpret view.");
    } catch (e) {
      setAiAnalysis("Analysis failed.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyPreset = (preset: typeof EQUATION_PRESETS[0]) => {
    setConfig(prev => ({
      ...prev,
      realEquation: preset.real,
      imagEquation: preset.imag
    }));
    setView(INITIAL_VIEW);
  };

  const handleResetView = () => {
    setView(INITIAL_VIEW);
  };

  const activePreset = useMemo(() => {
    return EQUATION_PRESETS.find(
      p => p.real === config.realEquation && p.imag === config.imagEquation
    );
  }, [config.realEquation, config.imagEquation]);

  const currentBookmarks = activePreset ? activePreset.bookmarks : EQUATION_PRESETS[0].bookmarks;

  const currentPaletteColors = PALETTES[config.colorPalette as keyof typeof PALETTES] || PALETTES['Electric Blue'];
  const colorBarGradient = `linear-gradient(to right, ${currentPaletteColors.join(', ')})`;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black text-white selection:bg-blue-500/30 font-sans antialiased">
      <FractalCanvas view={view} onViewChange={setView} config={config} />

      {/* Top Left Integrated Container */}
      <div className="absolute top-0 left-0 p-10 pointer-events-none z-10">
        <div className="pointer-events-auto bg-white/[0.03] backdrop-blur-[40px] rounded-[40px] border border-white/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,1)] w-[340px] overflow-hidden group transition-all duration-700 hover:bg-white/[0.05] hover:border-white/20">
          
          {/* Header Branding */}
          <div className="px-8 pt-8 pb-6 border-b border-white/5 bg-white/[0.02]">
             <h1 className="text-[13px] font-black uppercase tracking-[0.8em] text-white/90 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] text-center transition-all group-hover:tracking-[0.85em]">
               Mandelbrot Voyager
             </h1>
          </div>
          
          <div className="p-8 space-y-9">
            {/* Dynamic Color Spectrum with Label */}
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/25">Chromatic Scope</span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-white/40 transition-colors"></span>
              </div>
              <div className="h-[7px] w-full rounded-full bg-white/5 overflow-hidden p-[1px]">
                 <div 
                   className="h-full w-full rounded-full transition-all duration-1000 ease-in-out" 
                   style={{ background: colorBarGradient }}
                 ></div>
              </div>
            </div>

            <div className="flex justify-between items-center gap-6 bg-white/[0.02] p-4 rounded-3xl border border-white/5">
              <div className="space-y-2.5 pl-2">
                <p className="text-[13px] text-white font-extrabold uppercase tracking-[0.15em] leading-none">Scroll to zoom</p>
                <p className="text-[13px] text-white font-extrabold uppercase tracking-[0.15em] leading-none opacity-25">Drag to pan</p>
              </div>
              
              <button 
                onClick={handleResetView}
                className="flex flex-col items-center justify-center group active:scale-90 transition-all"
                title="Reset Camera View"
              >
                <div className="bg-white/5 w-14 h-14 flex items-center justify-center rounded-[20px] group-hover:bg-blue-500 group-hover:text-white transition-all border border-white/5 group-hover:border-blue-400 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                  <i className="fas fa-redo-alt text-lg group-hover:rotate-[-90deg] transition-transform duration-500"></i>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Toggle - High contrast floating pill */}
      <div className="absolute top-10 right-10 pointer-events-none z-30">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="pointer-events-auto bg-white text-black hover:bg-white/90 p-4 rounded-full backdrop-blur-3xl transition-all shadow-[0_20px_50px_rgba(0,0,0,1)] border border-white/20 flex items-center justify-center w-16 h-16 group active:scale-90"
        >
          <i className={`fas ${isSidebarOpen ? 'fa-times' : 'fa-sliders-h'} text-2xl transition-all duration-500 ${isSidebarOpen ? '' : 'rotate-180'}`}></i>
        </button>
      </div>

      {/* Sidebar Controls - Improved Spacing and Aesthetics */}
      <aside className={`absolute top-0 right-0 h-full w-[400px] bg-[#080808]/95 backdrop-blur-[50px] border-l border-white/10 transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1) ${isSidebarOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'} shadow-[-60px_0_120px_rgba(0,0,0,1)] z-20 overflow-y-auto`}>
        <div className="p-10 space-y-14">
          
          {/* Sidebar Header Section */}
          <section className="flex items-center gap-6 border-b border-white/5 pb-10 pt-6">
            <div className="w-16 h-16 bg-white/[0.03] rounded-3xl flex items-center justify-center border border-white/10 shadow-inner group hover:border-white/20 transition-all">
              <i className="fas fa-infinity text-white/80 text-3xl group-hover:scale-110 transition-transform"></i>
            </div>
            <div className="space-y-1">
              <h2 className="text-[11px] font-black uppercase tracking-[0.6em] text-white/20">SYSTEM v2.5</h2>
              <h1 className="text-2xl font-black tracking-tighter text-white/90 leading-tight">EXPLORER CORE</h1>
            </div>
          </section>

          {/* Equation Display Area - Deep Shadow & Glow */}
          <section className="space-y-8">
            <div className="bg-white/[0.01] border border-white/10 rounded-[40px] p-10 text-center relative overflow-hidden group shadow-2xl">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <div className="text-[32px] font-mono text-white font-bold tracking-tighter mb-12 drop-shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all group-hover:scale-[1.03]">
                 <RenderFormula formula={activePreset ? activePreset.formula : 'Z_{n+1} = ...'} />
               </div>
               
               <div className="space-y-7 text-left relative z-10">
                 <div className="space-y-3">
                   <div className="flex justify-between items-center px-2">
                     <label className="text-[10px] text-white/30 font-black uppercase tracking-[0.3em]">RE_MAPPING</label>
                     {/* Fix: Use string literals for text containing curly braces to avoid "Cannot find name 'n'" error in JSX */}
                     <span className="text-[9px] font-mono text-white/15">{"Z_{n+1}.re"}</span>
                   </div>
                   <input 
                    type="text"
                    value={config.realEquation}
                    onChange={(e) => setConfig({...config, realEquation: e.target.value})}
                    className="w-full bg-black/40 border border-white/5 hover:border-white/20 rounded-2xl px-6 py-5 text-sm font-mono text-white/70 focus:bg-black/60 focus:border-white/30 focus:ring-4 focus:ring-white/5 outline-none transition-all placeholder:text-white/10"
                    spellCheck={false}
                   />
                 </div>
                 <div className="space-y-3">
                   <div className="flex justify-between items-center px-2">
                     <label className="text-[10px] text-white/30 font-black uppercase tracking-[0.3em]">IM_MAPPING</label>
                     {/* Fix: Use string literals for text containing curly braces to avoid "Cannot find name 'n'" error in JSX */}
                     <span className="text-[9px] font-mono text-white/15">{"Z_{n+1}.im"}</span>
                   </div>
                   <input 
                    type="text"
                    value={config.imagEquation}
                    onChange={(e) => setConfig({...config, imagEquation: e.target.value})}
                    className="w-full bg-black/40 border border-white/5 hover:border-white/20 rounded-2xl px-6 py-5 text-sm font-mono text-white/70 focus:bg-black/60 focus:border-white/30 focus:ring-4 focus:ring-white/5 outline-none transition-all placeholder:text-white/10"
                    spellCheck={false}
                   />
                 </div>
               </div>
            </div>

            {/* Variations Wrapper - Refined Pill Layout */}
            <div className="space-y-6">
              <h3 className="text-[11px] font-black uppercase text-white/20 tracking-[0.5em] ml-2">FRACTAL VARIATIONS</h3>
              <div className="grid grid-cols-2 gap-4">
                {EQUATION_PRESETS.map(p => {
                  const isActive = config.realEquation === p.real && config.imagEquation === p.imag;
                  const nameSize = p.name.length > 15 ? 'text-[9px]' : 'text-[10px]';
                  return (
                    <button
                      key={p.name}
                      onClick={() => applyPreset(p)}
                      className={`px-5 py-5 font-black uppercase tracking-widest rounded-3xl transition-all border leading-tight flex items-center justify-center text-center group active:scale-95 ${
                        isActive 
                          ? 'bg-white text-black border-white shadow-[0_20px_40px_rgba(255,255,255,0.2)] translate-y-[-2px]' 
                          : 'bg-white/[0.02] border-white/5 text-white/40 hover:bg-white/[0.05] hover:border-white/20 hover:text-white/80'
                      } ${nameSize}`}
                    >
                      {p.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Color Palettes - Soft Cards */}
          <section className="space-y-7">
            <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-white/20 ml-2">CHROMATIC ENGINE</h2>
            <div className="flex flex-col gap-4">
              {Object.keys(PALETTES).map(p => {
                const colors = PALETTES[p as keyof typeof PALETTES];
                const isActive = config.colorPalette === p;
                return (
                  <button
                    key={p}
                    onClick={() => setConfig({ ...config, colorPalette: p })}
                    className={`flex items-center justify-between px-7 py-6 rounded-[32px] border transition-all duration-500 group relative overflow-hidden ${
                      isActive 
                        ? 'bg-white/[0.08] border-white/30 text-white shadow-xl' 
                        : 'bg-white/[0.02] border-white/5 text-white/30 hover:bg-white/[0.04] hover:border-white/10 active:scale-[0.98]'
                    }`}
                  >
                    <div className="flex items-center gap-6 relative z-10">
                      <div className="flex -space-x-3">
                        {colors.slice(0, 3).map((c, i) => (
                          <div key={i} className="w-7 h-7 rounded-full border-[3px] border-black shadow-2xl transition-transform group-hover:scale-110" style={{ backgroundColor: c }}></div>
                        ))}
                      </div>
                      <span className="text-[13px] font-black uppercase tracking-[0.1em] group-hover:text-white transition-colors">{p}</span>
                    </div>
                    {isActive ? (
                      <div className="w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.8)] relative z-10"></div>
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-white/5 group-hover:bg-white/20 relative z-10"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Settings / Iterations - Minimal Slider */}
          <section className="space-y-7">
            <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-white/20 ml-2">COMPUTATION DEPTH</h2>
            <div className="bg-white/[0.01] p-9 rounded-[40px] border border-white/5 shadow-inner">
              <div className="flex justify-between items-end mb-8">
                <label className="text-[12px] font-black uppercase text-white/40 tracking-[0.2em]">Resolving Iterations</label>
                <span className="text-white font-mono text-2xl font-bold tracking-tighter">{config.maxIterations}</span>
              </div>
              <input 
                type="range" min="50" max="2000" step="50"
                value={config.maxIterations} 
                onChange={(e) => setConfig({ ...config, maxIterations: parseInt(e.target.value) })}
                className="w-full h-[6px] bg-white/5 rounded-full appearance-none cursor-pointer accent-white hover:bg-white/10 transition-all outline-none"
              />
            </div>
          </section>

          {/* AI Perspective Section - Mystical styling */}
          <section className="pt-8 space-y-6">
             <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-white/20 ml-2">INTELLIGENCE</h2>
            <button
              onClick={handleAnalysis}
              disabled={isAnalyzing}
              className={`w-full py-7 px-10 rounded-[36px] font-black text-[14px] uppercase tracking-[0.4em] flex items-center justify-center gap-6 transition-all duration-700 shadow-2xl border relative overflow-hidden group ${
                isAnalyzing 
                ? 'bg-white/5 text-white/20 border-white/5 cursor-wait' 
                : 'bg-white text-black hover:bg-white/95 border-white hover:scale-[1.03] active:scale-95'
              }`}
            >
              <i className={`fas ${isAnalyzing ? 'fa-circle-notch fa-spin' : 'fa-brain'} text-2xl`}></i>
              {isAnalyzing ? 'SYNTHESIZING' : 'AI PERSPECTIVE'}
            </button>
            
            {aiAnalysis && (
              <div className="mt-8 p-10 bg-white/[0.02] rounded-[48px] border border-white/10 text-[15px] leading-relaxed text-white/60 font-medium italic shadow-inner relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                  <i className="fas fa-quote-right text-6xl"></i>
                </div>
                <p className="relative z-10 leading-relaxed font-serif italic text-white/80">{aiAnalysis}</p>
              </div>
            )}
          </section>

          {/* Saved Telemetry - Minimalist Pills */}
          <section className="space-y-7 pb-10">
            <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-white/20 ml-2">COORD_LOG</h2>
            <div className="space-y-4">
              {currentBookmarks.map(spot => (
                <button
                  key={spot.name}
                  onClick={() => setView({ centerX: spot.x, centerY: spot.y, zoom: spot.zoom })}
                  className="w-full p-8 bg-white/[0.01] hover:bg-white/[0.05] border border-white/5 hover:border-white/20 rounded-[36px] text-left transition-all group active:scale-[0.98] shadow-sm"
                >
                  <div className="text-[14px] font-black group-hover:text-white transition-colors uppercase tracking-[0.1em]">{spot.name}</div>
                  <div className="text-[12px] text-white/20 leading-relaxed mt-3 font-medium line-clamp-2 transition-colors group-hover:text-white/40">{spot.description}</div>
                </button>
              ))}
            </div>
          </section>

          {/* Telemetry Stats - Technical Footer */}
          <footer className="text-[10px] font-mono text-white/5 pt-12 border-t border-white/5 space-y-4 pb-20">
            <div className="flex justify-between items-center group">
              <span className="group-hover:text-white/30 transition-colors uppercase tracking-widest">REAL_POSITION</span> 
              <span className="text-white/20 font-bold tabular-nums">{view.centerX.toFixed(12)}</span>
            </div>
            <div className="flex justify-between items-center group">
              <span className="group-hover:text-white/30 transition-colors uppercase tracking-widest">IMAG_POSITION</span> 
              <span className="text-white/20 font-bold tabular-nums">{view.centerY.toFixed(12)}</span>
            </div>
            <div className="flex justify-between items-center group">
              <span className="group-hover:text-white/30 transition-colors uppercase tracking-widest">ZOOM_SCALE</span> 
              <span className="text-white/20 font-bold tracking-tighter tabular-nums">{view.zoom.toExponential(8)}</span>
            </div>
          </footer>
        </div>
      </aside>

      {/* Decorative Overlays - Center Reticle & Vignette */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center pointer-events-none z-0">
        <div className="w-56 h-56 border border-white/5 rounded-full flex items-center justify-center relative overflow-hidden">
           <div className="w-48 h-48 border border-dashed border-white/5 rounded-full flex items-center justify-center animate-[spin_60s_linear_infinite] opacity-50"></div>
           <div className="absolute w-5 h-[0.5px] bg-white/20"></div>
           <div className="absolute h-5 w-[0.5px] bg-white/20"></div>
        </div>
      </div>
      
      {/* Heavy Vignette for cinematic look */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.6)_100%)] z-[5]"></div>
    </div>
  );
};

export default App;
