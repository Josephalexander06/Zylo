import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorDisplayProps {
  message?: string;
  error?: string | null;
  className?: string;
}

export function ErrorDisplay({ message, error, className }: ErrorDisplayProps) {
  const displayMsg = message || error;
  if (!displayMsg) return null;

  return (
    <div
      className={`rounded-lg bg-red-50 p-4 border border-red-200 text-sm text-red-800 flex items-start gap-3 ${
        className || ''
      }`}
    >
      <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
      <div>
        <h4 className="font-medium text-red-800">Error</h4>
        <p className="mt-0.5 text-red-700">{displayMsg}</p>
      </div>
    </div>
  );
}

