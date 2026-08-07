import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase URL & Key
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://qfitpimxfsgelkebpyot.supabase.co";
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_-MvA9oPG1E6nqgYhL-vSYQ_2tiVVaMP";

// Target Output Directory: frontend/public/logos
const LOGOS_DIR = path.resolve(__dirname, '../public/logos');

if (!fs.existsSync(LOGOS_DIR)) {
  fs.mkdirSync(LOGOS_DIR, { recursive: true });
}

async function fetchCompanyTickers() {
  try {
    console.log("Fetching company list from Supabase...");
    const res = await fetch(`${SUPABASE_URL}/rest/v1/company_list?select=id,name`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });

    if (!res.ok) {
      throw new Error(`Supabase fetch failed: ${res.status} ${res.statusText}`);
    }

    const companies = await res.json();
    console.log(`Fetched ${companies.length} companies from database.`);
    return companies.map(c => c.id);
  } catch (err) {
    console.warn("Failed to fetch from Supabase, using default fallback tickers:", err.message);
    // Fallback ticker list if Supabase is unavailable
    return ["005930", "000660", "035420", "035720", "005380", "000270", "068270", "005490"];
  }
}

async function downloadLogo(ticker) {
  const url = `https://static.toss.im/png-icons/securities/icn-sec-fill-${ticker}.png`;
  const filePath = path.join(LOGOS_DIR, `${ticker}.png`);

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
      }
    });

    if (res.status === 200) {
      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fs.writeFileSync(filePath, buffer);
      return true;
    } else {
      return false;
    }
  } catch (err) {
    return false;
  }
}

async function main() {
  console.log("🚀 Starting Toss CDN company logo download...");
  const tickers = await fetchCompanyTickers();

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < tickers.length; i++) {
    const ticker = tickers[i];
    process.stdout.write(`[${i + 1}/${tickers.length}] Downloading logo for ${ticker}... `);

    const success = await downloadLogo(ticker);
    if (success) {
      console.log("✅ Success");
      successCount++;
    } else {
      console.log("❌ Failed (or not available on Toss CDN)");
      failCount++;
    }

    // Small delay to prevent rate limits
    await new Promise(r => setTimeout(r, 50));
  }

  console.log(`\n🎉 Completed logo download!`);
  console.log(`- Success: ${successCount}`);
  console.log(`- Failed: ${failCount}`);
  console.log(`- Saved to: ${LOGOS_DIR}`);
}

main();
