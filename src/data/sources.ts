import type { Source } from '../engine/types';

// Every real-world fact shown to players cites one of these. Each was read with WebFetch on 25 October 2026
// and the fact checked against it: see docs/BUILD_NOTES.md ("Sources checked").
export const SOURCES = {
  // The two scenarios (fiction, always labelled "In this story" / "In the CFG scenarios").
  ai2027: { label: 'AI 2027', url: 'https://ai-2027.com' },
  ai2027Race: { label: 'AI 2027, Race ending', url: 'https://ai-2027.com/race' },
  ai2027Slowdown: { label: 'AI 2027, Slowdown ending', url: 'https://ai-2027.com/slowdown' },
  cfg: { label: 'CFG, Advanced AI: Possible Futures (2025)', url: 'https://cfg.eu/advanced-ai-possible-futures/' },

  // EU institutions
  aiAct: { label: 'European Commission, AI Act enters into force (Aug 2024)', url: 'https://commission.europa.eu/news/ai-act-enters-force-2024-08-01_en' },
  aiOffice: { label: 'European Commission, European AI Office', url: 'https://digital-strategy.ec.europa.eu/en/policies/ai-office' },
  gpaiCode: { label: 'European Commission, General-Purpose AI Code of Practice (Jul 2025)', url: 'https://digital-strategy.ec.europa.eu/en/news/general-purpose-ai-code-practice-now-available' },
  investAi: { label: 'European Commission, InvestAI (Feb 2025)', url: 'https://digital-strategy.ec.europa.eu/en/news/eu-launches-investai-initiative-mobilise-eu200-billion-investment-artificial-intelligence' },
  openEuroLlm: { label: 'European Commission, OpenEuroLLM (Feb 2025)', url: 'https://digital-strategy.ec.europa.eu/en/news/pioneering-ai-project-awarded-opening-large-language-models-european-languages' },
  cyberHealth: { label: 'European Commission, €145.5 million for cybersecurity (Jun 2025)', url: 'https://digital-strategy.ec.europa.eu/en/news/eu-allocates-eu1455-million-boost-european-cybersecurity-including-hospitals-and-healthcare' },
  euUsDeal: { label: 'EU–US Joint Statement on trade (21 Aug 2025)', url: 'https://policy.trade.ec.europa.eu/news/joint-statement-united-states-european-union-framework-agreement-reciprocal-fair-and-balanced-trade-2025-08-21_en' },
  omnibus: { label: 'European Parliament Research Service, Digital Omnibus on AI (2026)', url: 'https://www.europarl.europa.eu/thinktank/es/document/EPRS_BRI(2026)782651' },
  aldWithdrawal: { label: 'Council of the EU, withdrawal of pending Commission proposals (Oct 2025)', url: 'https://data.consilium.europa.eu/doc/document/ST-13873-2025-INIT/en/pdf' },
  edpsDri: { label: 'EDPS, statement on the Court’s data retention ruling (Apr 2014)', url: 'https://edps.europa.eu/sites/edp/files/edpsweb_press_releases/edps-2014-08_press_statement_drd_en.pdf' },
  egf: { label: 'European Parliament, EGF support for BelGaN workers (Oct 2025)', url: 'https://data.europarl.europa.eu/distribution/doc/TA-10-2025-0220_en.pdf' },
  coe: { label: 'Council of Europe, first global treaty on AI opens for signature (Sep 2024)', url: 'https://www.coe.int/en/web/portal/-/council-of-europe-opens-first-ever-global-treaty-on-ai-for-signature' },
  garante: { label: 'Garante per la protezione dei dati personali, ChatGPT (Apr 2023)', url: 'https://www.garanteprivacy.it/home/docweb/-/docweb-display/print/9874751' },
  nlExport: { label: 'Government of the Netherlands, export measures for chipmaking equipment (Jun 2023)', url: 'https://government.nl/latest/news/2023/06/30/government-publishes-additional-export-measures-for-advanced-semiconductor-manufacturing-equipment' },

  // US and China
  diffusionRule: { label: 'Federal Register, Framework for AI Diffusion (Jan 2025)', url: 'https://www.govinfo.gov/content/pkg/FR-2025-01-15/html/2025-00636.htm' },
  diffusionRescinded: { label: 'US Department of Commerce, rescission of the AI Diffusion Rule (May 2025)', url: 'https://www.bis.gov/press-release/department-commerce-announces-rescission-biden-era-artificial-intelligence-diffusion-rule-strengthens' },
  bidenXi: { label: 'Readout of the Biden–Xi meeting in Lima (Nov 2024), American Presidency Project', url: 'https://www.presidency.ucsb.edu/documents/readout-president-joe-bidens-meeting-with-president-xi-jinping-the-peoples-republic-1' },
  stargate: { label: 'OpenAI, Announcing the Stargate Project (Jan 2025)', url: 'https://openai.com/de-DE/index/announcing-the-stargate-project/' },

  // Labs, research and civil society
  metaEu: { label: 'Axios, Meta won’t offer future multimodal AI models in EU (Jul 2024)', url: 'https://www.axios.com/2024/07/17/meta-future-multimodal-ai-models-eu' },
  llama4Policy: { label: 'Meta, Llama 4 Acceptable Use Policy (Apr 2025)', url: 'https://raw.githubusercontent.com/meta-llama/llama-models/main/models/llama4/USE_POLICY.md' },
  mixtral: { label: 'Mistral AI, Mixtral of experts (Dec 2023)', url: 'https://mistral.ai/news/mixtral-of-experts/' },
  ceoLobby: { label: 'Corporate Europe Observatory, Byte by byte (Nov 2023)', url: 'https://corporateeurope.org/en/2023/11/byte-byte' },
  rand: { label: 'RAND, Securing AI Model Weights (2024)', url: 'https://www.rand.org/pubs/research_reports/RRA2849-1.html' },
  apollo: { label: 'Apollo Research, Frontier Models are Capable of In-context Scheming (2024)', url: 'https://arxiv.org/abs/2412.04984' },
  alignmentFaking: { label: 'Anthropic, Alignment faking in large language models (Dec 2024)', url: 'https://www.anthropic.com/research/alignment-faking' },
  agenticMisalignment: { label: 'Anthropic, Agentic misalignment (Jun 2025)', url: 'https://www.anthropic.com/research/agentic-misalignment' },
  tracing: { label: 'Anthropic, Tracing the thoughts of a large language model (Mar 2025)', url: 'https://www.anthropic.com/research/tracing-thoughts-language-model' },
  asl3: { label: 'Anthropic, Activating ASL-3 protections (May 2025)', url: 'https://anthropic.com/news/activating-asl3-protections' },
  espionage: { label: 'Anthropic, Disrupting AI-orchestrated cyber espionage (Nov 2025)', url: 'https://www.anthropic.com/news/disrupting-AI-espionage' },
  misuse: { label: 'Anthropic, Detecting and countering misuse of AI (Aug 2025)', url: 'https://www.anthropic.com/news/detecting-countering-misuse-aug-2025' },
  openaiScheming: { label: 'OpenAI and Apollo Research, Detecting and reducing scheming (Sep 2025)', url: 'https://openai.com/index/detecting-and-reducing-scheming-in-ai-models/' },
  cotMonitor: { label: 'Chain of Thought Monitorability (Korbak et al., Jul 2025)', url: 'https://arxiv.org/abs/2507.11473' },
  metr: { label: 'METR, Measuring AI Ability to Complete Long Tasks (Mar 2025)', url: 'https://arxiv.org/html/2503.14499v1' },
  aisr: { label: 'International AI Safety Report (Jan 2025)', url: 'https://arxiv.org/abs/2501.17805v1' },
  aisiAlignment: { label: 'UK AI Security Institute, The Alignment Project (Jul 2025)', url: 'https://www.aisi.gov.uk/work/announcing-the-alignment-project' },
  gradual: { label: 'Gradual Disempowerment (Kulveit et al., 2025)', url: 'https://arxiv.org/abs/2501.16946' },
  fliPause: { label: 'Future of Life Institute, Pause Giant AI Experiments (Mar 2023)', url: 'https://futureoflife.org/open-letter/pause-giant-ai-experiments/' },
  caisStatement: { label: 'Center for AI Safety, Statement on AI Risk (May 2023)', url: 'https://safe.ai/work/statement-on-ai-risk' },
  rightToWarn: { label: 'Axios, OpenAI insiders call to protect AI whistleblowers (Jun 2024)', url: 'https://www.axios.com/2024/06/04/openai-whistleblowers-open-letter' },
  imf: { label: 'IMF Blog, AI will transform the global economy (Jan 2024)', url: 'https://www.imf.org/en/blogs/articles/2024/01/14/ai-will-transform-the-global-economy-lets-make-sure-it-benefits-humanity/index.md' },
  wga: { label: 'Writers Guild of America, Summary of the 2023 MBA', url: 'https://wgacontract2023.org/the-campaign/summary-of-the-2023-wga-mba' },
  epoch: { label: 'Epoch AI, AI supercomputer performance share by country (2025)', url: 'https://epoch.ai/data-insights/ai-supercomputers-performance-share-by-country' },
  europe2031: { label: 'Europe 2031 (summary)', url: 'https://europe2031.ai/summary' },
  asmlCnbc: { label: 'CNBC, Inside ASML (2022)', url: 'https://www.cnbc.com/2022/03/23/inside-asml-the-company-advanced-chipmakers-use-for-euv-lithography.html' },
} satisfies Record<string, Source>;

export type SourceKey = keyof typeof SOURCES;
