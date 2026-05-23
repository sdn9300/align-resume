"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type ResumeInputProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function ResumeInput({ value, onChange, disabled }: ResumeInputProps) {
  const loadSample = async () => {
    const response = await fetch("/fixtures/sample-resume.txt");
    const text = await response.text();
    onChange(text);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor="resume-input" className="text-sm font-medium">
          Resume
        </label>
        <Button type="button" variant="outline" size="sm" onClick={() => void loadSample()} disabled={disabled}>
          Load sample
        </Button>
      </div>
      <Textarea
        id="resume-input"
        placeholder="Paste your resume text here…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="min-h-[220px] font-mono text-xs"
      />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{value.trim().length} characters</span>
        <span>
          File upload (PDF/DOCX) —{" "}
          <span className="text-foreground/70">Phase 2+</span>
        </span>
      </div>
      <input
        type="file"
        accept=".pdf,.docx"
        disabled
        className="block w-full cursor-not-allowed text-xs text-muted-foreground opacity-50"
        title="File upload available in Phase 2+"
      />
    </div>
  );
}
