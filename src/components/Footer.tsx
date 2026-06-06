/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer id="shafinbd-footer" className="mt-auto bg-zinc-950 border-t border-white/5 py-6">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <span className="text-white text-xs font-bold uppercase tracking-wider">
            shafinbd<span className="text-cyan-400"> tv</span>
          </span>
          <span className="text-[10px] text-slate-400 mt-1">
            Perfect-fit IPTV streaming engine for live HLS streams. Copyright &copy; 2026. All rights secured.
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
          {/* Links removed as per user request */}
        </div>
      </div>
    </footer>
  );
}
