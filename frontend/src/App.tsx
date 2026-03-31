"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle2, 
  ShieldAlert, 
  Activity, 
  RefreshCcw, 
  Search, 
  MousePointer2, 
  Play,
  Settings,
  Database,
  Terminal,
  Globe,
  Lock
} from "lucide-react";
import { cn } from "@/lib/utils";

const PHASES = [
  { id: "start", label: "Initial", icon: Play },
  { id: "search", label: "Discovery", icon: Search },
  { id: "select", label: "Select", icon: MousePointer2 },
  { id: "init", label: "Execute", icon: Activity },
  { id: "confirm", label: "Confirm", icon: CheckCircle2 }
];

export default function OAREDashboard() {
  const [state, setState] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<any>(null);
  const [running, setRunning] = useState(false);

  const API_URL = "http://127.0.0.1:8000";

  const fetchState = async () => {
    try {
      const res = await fetch(`${API_URL}/state`);
      const data = await res.json();
      setState(data);
      setLoading(false);
    } catch (e) {
      console.error("Backend error", e);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    await fetch(`${API_URL}/reset`, { method: "POST" });
    setResults(null);
    fetchState();
  };

  const handleRunInference = async () => {
    setRunning(true);
    try {
      const res = await fetch(`${API_URL}/run-inference`, { method: "POST" });
      const data = await res.json();
      setResults(data);
    } catch (e) {
      console.error("Inference error", e);
    } finally {
      setRunning(false);
    }
  };

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 2000);
    return () => clearInterval(interval);
  }, []);

  const getProgressValue = () => {
    if (!state?.phase) return 0;
    const ids = PHASES.map(p => p.id);
    const idx = ids.indexOf(state.phase);
    return ((idx + 1) / PHASES.length) * 100;
  };

  return (
    <div className="flex h-screen bg-background text-foreground font-sans antialiased overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col shrink-0">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 bg-primary rounded-sm" />
            <h1 className="font-bold tracking-tight text-sm uppercase">OARE Manager</h1>
          </div>
          <p className="text-[10px] text-muted-foreground uppercase font-medium">Internal System v2.1</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <div className="px-3 py-2 text-[10px] uppercase font-bold text-muted-foreground tracking-wider">System Controls</div>
          <Button 
            onClick={handleReset} 
            variant="ghost" 
            className="w-full justify-start gap-3 h-10 font-medium text-sm hover:bg-accent"
          >
            <RefreshCcw className={cn("w-4 h-4", loading && "animate-spin")} />
            Reset Environment
          </Button>
          <Button 
            onClick={handleRunInference} 
            disabled={running}
            variant="ghost" 
            className="w-full justify-start gap-3 h-10 font-bold text-sm text-primary hover:bg-primary/5 bg-primary/5 border border-primary/20"
          >
            <Activity className={cn("w-4 h-4", running && "animate-pulse")} />
            {running ? "Executing..." : "Run AI Test"}
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 h-10 font-medium text-sm text-muted-foreground">
            <Settings className="w-4 h-4" />
            Config Settings
          </Button>
        </nav>

        {results && (
          <div className="mx-4 p-4 rounded-lg bg-zinc-50 border border-border space-y-3 shadow-inner">
            <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest text-center border-b border-border pb-2">Last Test Scores</div>
            <div className="space-y-2">
              {Object.entries(results).map(([task, score]: any) => (
                <div key={task} className="flex justify-between items-center bg-card p-2 rounded border border-border/50 text-[11px] font-mono shadow-sm">
                  <span className="uppercase font-bold text-muted-foreground">{task}</span>
                  <span className={cn(
                    "font-bold",
                    (score as number) > 0 ? "text-green-600" : "text-red-500"
                  )}>{score}</span>
                </div>
              ))}
            </div>
            <div className="text-[9px] text-zinc-400 text-center italic mt-1 font-medium italic animate-pulse">Inference Complete</div>
          </div>
        )}

        <div className="p-4 border-t border-border space-y-4">
          <div className="space-y-2 px-1">
            <div className="flex justify-between text-[10px] uppercase font-bold text-muted-foreground/80">
              <span>Status</span>
              <span className="text-green-600">Online</span>
            </div>
            <div className="flex justify-between text-[10px] uppercase font-bold text-muted-foreground/80">
              <span>Server</span>
              <span className="text-foreground">Localhost:8k</span>
            </div>
            <div className="flex justify-between text-[10px] uppercase font-bold text-muted-foreground/80">
              <span>Node</span>
              <span className="text-foreground">US-EAST-1</span>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-secondary/50 rounded text-[10px] font-mono text-muted-foreground uppercase font-bold border border-border/50">
            <Lock className="w-3 h-3 text-primary" />
            SECURE_LINK_ACTIVE
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-background">
        
        {/* Header */}
        <header className="h-16 border-b border-border flex items-center justify-between px-8 bg-card/30">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-semibold uppercase tracking-wider">System Monitor</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground uppercase font-bold">Phase:</span>
              <span className="text-xs font-mono font-bold text-primary uppercase bg-primary/10 px-2 py-0.5 rounded">
                {state?.phase || "Standby"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-mono text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              API: 12ms
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              CPU: 2.4%
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-8 space-y-8">
          
          {/* Stepper Sections */}
          <section className="space-y-4">
            <h2 className="text-xs font-bold uppercase text-muted-foreground tracking-widest pl-1">Execution Pipeline</h2>
            <div className="grid grid-cols-5 gap-px bg-border border border-border rounded-lg overflow-hidden shadow-sm">
              {PHASES.map((phase, i) => {
                const ids = PHASES.map(p => p.id);
                const currentIdx = ids.indexOf(state?.phase);
                const isActive = phase.id === state?.phase;
                const isCompleted = ids.indexOf(phase.id) < currentIdx;
                
                return (
                  <div key={phase.id} className={cn(
                    "p-4 flex flex-col items-center gap-2 transition-colors",
                    isActive ? "bg-primary/5" : "bg-card"
                  )}>
                    <div className={cn(
                      "w-8 h-8 rounded border flex items-center justify-center transition-all",
                      isActive ? "bg-primary text-primary-foreground border-primary" :
                      isCompleted ? "bg-primary/10 text-primary border-primary/20" :
                      "bg-muted/50 text-muted-foreground border-border"
                    )}>
                      <phase.icon className="w-4 h-4" />
                    </div>
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-tight",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}>
                      {phase.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Metrics & Logs Grid */}
          <div className="grid grid-cols-12 gap-8 h-[400px]">
            
            {/* Live Stats */}
            <div className="col-span-4 space-y-4">
              <h2 className="text-xs font-bold uppercase text-muted-foreground tracking-widest pl-1">Environment Stats</h2>
              <div className="space-y-3">
                <Card className="bg-card border border-border shadow-none">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-accent rounded">
                        <Database className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground uppercase">Market</span>
                    </div>
                    <span className="text-sm font-bold capitalize">{state?.market_condition || "--"}</span>
                  </CardContent>
                </Card>
                <Card className="bg-card border border-border shadow-none">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-accent rounded">
                        <Activity className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground uppercase">Reward</span>
                    </div>
                    <span className="text-sm font-bold font-mono">
                      {state?.reward_signal !== undefined ? state.reward_signal.toFixed(3) : "0.000"}
                    </span>
                  </CardContent>
                </Card>
                <Card className="bg-card border border-border shadow-none">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-accent rounded">
                        <ShieldAlert className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground uppercase">Errors</span>
                    </div>
                    <span className={cn(
                      "text-[10px] font-bold uppercase px-2 py-0.5 rounded",
                      state?.last_error ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"
                    )}>
                      {state?.last_error || "Nominal"}
                    </span>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* System Logs */}
            <div className="col-span-8 flex flex-col space-y-4">
              <h2 className="text-xs font-bold uppercase text-muted-foreground tracking-widest pl-1">System Console</h2>
              <div className="flex-1 bg-zinc-50 border border-border rounded-lg overflow-hidden flex flex-col shadow-sm">
                <div className="h-8 bg-zinc-100 border-b border-border flex items-center px-4 gap-2">
                  <Terminal className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] font-mono text-muted-foreground font-bold uppercase">agent_activity_log.sh</span>
                </div>
                <div className="flex-1 p-4 font-mono text-[11px] overflow-auto text-zinc-600 space-y-1 selection:bg-primary/20">
                  {!state || !state.history || state.history.length === 0 ? (
                    <div className="text-zinc-400 italic">Waiting for command trace...</div>
                  ) : (
                    state.history.map((log: string, i: number) => (
                      <div key={i} className="flex gap-4 border-b border-zinc-100 pb-1">
                        <span className="text-zinc-400 w-12 shrink-0">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}</span>
                        <span className="text-primary/70 shrink-0 font-bold">{"[LOG]"}</span>
                        <span className="text-zinc-800 font-medium">Executed: <span className="text-primary font-bold">{log}</span></span>
                      </div>
                    ))
                  )}
                  <div className="flex gap-4 animate-pulse">
                    <span className="text-zinc-300 w-12 shrink-0">--:--:--</span>
                    <span className="text-zinc-200">_</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}
