import { chromium } from "playwright";

import { getServerRun } from "@/lib/run-storage";

function getBaseUrl(): string {
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

async function generatePdfFromUrl(url: string): Promise<Buffer> {
  // --no-sandbox is required on Windows and CI environments
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle", timeout: 15000 });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

/** Generate the side-by-side comparison PDF by navigating to the print route. */
export async function generateComparisonPdf(runId: string): Promise<Buffer> {
  const url = `${getBaseUrl()}/export/${runId}`;
  return generatePdfFromUrl(url);
}

/** Generate the tailored resume PDF by navigating to the resume print route. */
export async function generateTailoredResumePdf(runId: string): Promise<Buffer> {
  const url = `${getBaseUrl()}/export/${runId}/resume`;
  return generatePdfFromUrl(url);
}

/** Fetch the run and generate both PDFs if it exists. */
export async function generatePdfsForRun(runId: string): Promise<{
  comparison: Buffer;
  tailoredResume: Buffer;
} | null> {
  const run = getServerRun(runId);
  if (!run) return null;

  const [comparison, tailoredResume] = await Promise.all([
    generateComparisonPdf(runId),
    generateTailoredResumePdf(runId),
  ]);

  return { comparison, tailoredResume };
}
