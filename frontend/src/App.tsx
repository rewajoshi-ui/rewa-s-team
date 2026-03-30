"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, ShieldAlert } from "lucide-react";

export default function OAREDashboard() {
  const [state, setState] = useState<any>(null);

  const API_URL = "http://localhost:8000";

  const fetchState = async () => {
    try {
      const res = await fetch(`${API_URL}/state`);
      const data = await res.json();
      console.log("STATE:", data); // debug
      setState(data);
    } catch (e) {
      console.error("Backend error", e);
    }
  };

  const handleReset = async () => {
    await fetch(`${API_URL}/reset`, { method: "POST" });
    fetchState();
  };

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 2000);
    return () => clearInterval(interval);
  }, []);

  const getProgress = (phase: string) => {
    const steps = ["start", "search", "select", "init", "confirm"];
    return phase ? (steps.indexOf(phase) / 4) * 100 : 0;
  };

  return (
    <div className="p-8 bg-black min-h-screen text-white">
      <div className="max-w-xl mx-auto space-y-6">

        <h1 className="text-3xl font-bold text-blue-400">
          OARE DASHBOARD 
        </h1>

        <Button onClick={handleReset}>Reset</Button>

        <Card>
          <CardHeader>
            <CardTitle>Phase</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl capitalize">
              {state ? state.phase : "Loading..."}
            </p>
            <Progress value={getProgress(state?.phase)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            {state?.phase === "start" ? (
              <CheckCircle2 className="text-green-500" />
            ) : (
              <ShieldAlert className="text-yellow-500" />
            )}
            <p>{state?.phase || "..."}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>History</CardTitle>
          </CardHeader>
          <CardContent>
            {!state || !state.history || state.history.length === 0
              ? "No actions yet"
              : state.history.join(" → ")}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}