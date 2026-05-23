"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type JDInputProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function JDInput({ value, onChange, disabled }: JDInputProps) {
  const loadSample = async () => {
    const response = await fetch("/fixtures/sample-jd.txt");
    const text = await response.text();
    onChange(text);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor="jd-input" className="text-sm font-medium">
          Job description
        </label>
        <Button type="button" variant="outline" size="sm" onClick={() => void loadSample()} disabled={disabled}>
          Load sample
        </Button>
      </div>
      <Textarea
        id="jd-input"
        placeholder="Paste the full job listing text…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="min-h-[220px] text-sm"
      />
      <p className="text-xs text-muted-foreground">{value.trim().length} characters</p>
    </div>
  );
}
