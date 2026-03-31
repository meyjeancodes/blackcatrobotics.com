"use client";

import { useState, useEffect, useCallback } from "react";
import {
  GRID_STATUS_INITIAL,
  TRADE_HISTORY,
  type GridStatus,
  type GridMode,
  type Trade,
} from "./mock-data";

export function useGridSimulation() {
  const [gridStatus, setGridStatus] = useState<GridStatus>(GRID_STATUS_INITIAL);
  const [trades, setTrades] = useState<Trade[]>(TRADE_HISTORY);

  useEffect(() => {
    const interval = setInterval(() => {
      setGridStatus((prev) => {
        const rateDelta  = (Math.random() - 0.5) * 0.006;
        const newRate    = Math.min(0.135, Math.max(0.055, +(prev.currentRate + rateDelta).toFixed(3)));

        const autoSelling = prev.autoTradeEnabled && prev.surplus > 2;
        const surplusDelta = autoSelling ? -0.8 : (Math.random() - 0.5) * 0.8;
        const rawSurplus   = prev.surplus + surplusDelta;
        const newSurplus   = rawSurplus < 2 ? 14.2 : +rawSurplus.toFixed(1);

        const netDelta =
          prev.autoTradeEnabled && newRate > prev.sellFloor && newSurplus > 2
            ? 0.08 : 0;

        let mode: GridMode;
        if (newRate > prev.buyRate)                         mode = "buying";
        else if (newRate > prev.sellFloor && newSurplus > 2) mode = "selling";
        else                                                 mode = "balanced";

        return {
          ...prev,
          currentRate:    newRate,
          surplus:        newSurplus,
          netThisMonth:   +( prev.netThisMonth + netDelta).toFixed(2),
          mode,
          lastUpdated:    new Date(),
        };
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const updateFloor = useCallback((floor: number) => {
    setGridStatus((prev) => ({ ...prev, sellFloor: floor }));
  }, []);

  const toggleAutoTrade = useCallback(() => {
    setGridStatus((prev) => ({ ...prev, autoTradeEnabled: !prev.autoTradeEnabled }));
  }, []);

  const executeTrade = useCallback((kwhAmount: number, pricePerKwh: number) => {
    const newTrade: Trade = {
      id:          `t-live-${Date.now()}`,
      timestamp:   new Date(),
      type:        "sell",
      kwhAmount,
      pricePerKwh,
      total:       +( kwhAmount * pricePerKwh).toFixed(2),
      status:      "pending",
      nodeId:      "solar-habitat-tx01",
    };

    setTrades((prev) => [newTrade, ...prev]);
    setGridStatus((prev) => ({
      ...prev,
      surplus: Math.max(0, +(prev.surplus - kwhAmount).toFixed(1)),
    }));

    // Transition pending -> completed after 8 s
    setTimeout(() => {
      setTrades((prev) =>
        prev.map((t) =>
          t.id === newTrade.id ? { ...t, status: "completed" as const } : t
        )
      );
    }, 8000);
  }, []);

  return { gridStatus, trades, updateFloor, toggleAutoTrade, executeTrade };
}
