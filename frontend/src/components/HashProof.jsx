import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, AlertOctagon, ChevronDown, ChevronUp, Link as LinkIcon, Database } from 'lucide-react';

export default function HashProof({ verification }) {
  const [expanded, setExpanded] = useState(false);

  if (!verification) return null;

  const isIntact = verification.chainIntact;

  return (
    <div className={`mt-8 border rounded-xl overflow-hidden ${isIntact ? 'border-brand-green/20' : 'border-error/30'}`}>
      <button 
        onClick={() => setExpanded(!expanded)}
        className={`w-full p-4 flex items-center justify-between transition-colors ${isIntact ? 'bg-brand-green/5 hover:bg-brand-green/10' : 'bg-error/5 hover:bg-error/10'}`}
      >
        <div className="flex items-center gap-3">
          {isIntact ? (
            <ShieldCheck className="text-brand-green" size={24} />
          ) : (
            <AlertOctagon className="text-error" size={24} />
          )}
          <div className="text-left">
            <h3 className={`font-display font-semibold ${isIntact ? 'text-brand-green' : 'text-error'}`}>
              {isIntact ? 'Cryptographic Integrity Verified' : 'Integrity Compromised'}
            </h3>
            <p className="text-xs text-on-surface/70 mt-1">
              SHA-256 Hash-Chain • {verification.totalEvents} Blocks
            </p>
          </div>
        </div>
        {expanded ? <ChevronUp className="text-on-surface/50" /> : <ChevronDown className="text-on-surface/50" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-brand-surface/30 p-4 border-t border-white/5"
          >
            {!isIntact && verification.brokenAt && (
              <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded text-sm text-error/90 font-mono">
                <span className="font-bold block mb-1">Break Detected at Block #{verification.brokenAt.recordId}</span>
                Issue: {verification.brokenAt.issue}<br/>
                Expected: {verification.brokenAt.expectedHash || verification.brokenAt.expectedPrevHash}<br/>
                Actual: {verification.brokenAt.actualHash || verification.brokenAt.actualPrevHash}
              </div>
            )}
            
            <div className="space-y-4">
              {verification.events?.map((event, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-brand-dark border border-brand-green/30 flex items-center justify-center">
                      <Database size={12} className="text-brand-green/70" />
                    </div>
                    {idx < verification.events.length - 1 && (
                      <div className="w-px h-full bg-brand-green/20 my-1"></div>
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="text-sm font-semibold text-white">{event.type}</p>
                    <p className="text-xs text-on-surface/50 mb-2">{new Date(event.timestamp).toLocaleString()}</p>
                    <div className="flex items-center gap-1 text-[10px] font-mono text-brand-green/60 bg-brand-dark/50 p-1.5 rounded border border-brand-green/10 break-all">
                      <LinkIcon size={10} />
                      Verified
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-on-surface/40 mt-4 text-center italic">
              This proof replaces traditional blockchain networks by using an append-only PostgreSQL ledger with cryptographic hash chaining.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
