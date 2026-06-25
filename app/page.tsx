import { readFileSync } from "node:fs";
import path from "node:path";
import Script from "next/script";
import { theme } from "@/lib/theme";

const stage14Html = readFileSync(
  path.join(process.cwd(), "Design Upgrade", "supportpilot-lynai-stage-14-clean.html"),
  "utf8",
);

const stage14Css = Array.from(stage14Html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g))
  .map((match) => match[1])
  .join("\n\n");

const stage14Script = extractBetween(stage14Html, "<script>", "</script>");
const stage14Header = extractBlock(stage14Html, '<header class="site-header">', "</header>");
const stage14Footer = extractBlock(stage14Html, '<footer class="site-footer">', "</footer>");
const stage14LowerSections = extractBetween(stage14Html, '<section class="story-section"', "</main>", {
  includeStart: true,
});

const pageMarkup = [
  stage14Header,
  '<main class="main">',
  donorHeroHtml(theme.escalation.url),
  stage14LowerSections,
  "</main>",
  stage14Footer,
].join("\n");

export default function Home() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `${stage14Css}\n\n${donorHeroCss}` }} />
      <div className="page" id="top" dangerouslySetInnerHTML={{ __html: pageMarkup }} />
      <Script id="supportpilot-stage14-interactions" strategy="afterInteractive">
        {stage14Script}
      </Script>
    </>
  );
}

function extractBetween(
  source: string,
  startMarker: string,
  endMarker: string,
  options: { includeStart?: boolean; includeEnd?: boolean } = {},
) {
  const start = source.indexOf(startMarker);
  if (start === -1) {
    throw new Error(`Missing Stage 14 start marker: ${startMarker}`);
  }
  const contentStart = options.includeStart ? start : start + startMarker.length;
  const end = source.indexOf(endMarker, contentStart);
  if (end === -1) {
    throw new Error(`Missing Stage 14 end marker: ${endMarker}`);
  }
  const contentEnd = options.includeEnd ? end + endMarker.length : end;
  return source.slice(contentStart, contentEnd).trim();
}

function extractBlock(source: string, startMarker: string, endMarker: string) {
  return extractBetween(source, startMarker, endMarker, { includeStart: true, includeEnd: true });
}

function donorHeroHtml(demoUrl: string) {
  return `
      <section class="sp-hero-v2" aria-labelledby="hero-title">
        <div class="shell">
          <div class="sp-hero-v2__copy">
            <span class="sp-hero-v2__eyebrow">White-label AI support</span>
            <h1 id="hero-title">AI support with <span>evidence,</span> approvals, and a human fallback.</h1>
            <p>Turn trusted docs and support workflows into a branded AI agent that cites answers, flags risk, and brings in your team at the right moment.</p>
            <div class="sp-hero-v2__actions">
              <a class="sp-hero-v2__button sp-hero-v2__button--primary" href="${demoUrl}" target="_blank" rel="noopener noreferrer">Book a demo <span aria-hidden="true">↗</span></a>
              <a class="sp-hero-v2__button sp-hero-v2__button--outline" href="#support-flow">See how it works <span aria-hidden="true">↗</span></a>
            </div>
          </div>

          <div class="sp-hero-v2__stage" aria-label="SupportPilot product interface preview">
            <div class="sp-hero-v2__tabs" aria-hidden="true">
              <span class="active">Overview</span><span>Sources</span><span>Approvals</span><span>Analytics</span><span>Settings</span>
            </div>
            <div class="sp-hero-v2__console">
              <aside class="sp-hero-v2__sidebar">
                <b>SupportPilot</b>
                <span class="active">Overview</span>
                <span>Tickets</span>
                <span>Knowledge</span>
                <span>Approvals</span>
                <span>Analytics</span>
              </aside>
              <section class="sp-hero-v2__conversation" aria-label="Cited answer conversation">
                <div class="sp-hero-v2__console-top">
                  <h2>Refund request #1842</h2>
                  <span>Review ready</span>
                </div>
                <div class="sp-hero-v2__message sp-hero-v2__message--user">Can I get a refund on my annual plan?</div>
                <div class="sp-hero-v2__message sp-hero-v2__message--ai">
                  <b>Pilot draft <small>AI</small></b>
                  <p>Annual plans are eligible for a refund within 30 days when usage remains inside the policy limit.</p>
                  <div><span>Refund Policy</span><span>Subscription Terms</span><span>API Usage Limits</span></div>
                </div>
                <div class="sp-hero-v2__composer">Ask about a policy, setup, or billing question <span aria-hidden="true">→</span></div>
              </section>
              <aside class="sp-hero-v2__confidence">
                <b>Confidence</b>
                <strong>92%</strong>
                <div class="sp-hero-v2__meter"><i></i></div>
                <dl>
                  <div><dt>Source freshness</dt><dd>Current</dd></div>
                  <div><dt>Policy risk</dt><dd>Review required</dd></div>
                  <div><dt>Next step</dt><dd>Manager approval</dd></div>
                </dl>
              </aside>
            </div>
          </div>

          <div class="sp-hero-v2__trust" aria-label="SupportPilot trust signals">
            <span>✓ Cited answers</span><span>✓ Approval gates</span><span>✓ Audit logs</span><span>✓ Verified domains</span>
          </div>
        </div>
      </section>`;
}

const donorHeroCss = `
.sp-hero-v2 {
  padding: 92px 0 0;
  overflow: hidden;
  text-align: center;
  background:
    linear-gradient(90deg, rgba(222, 210, 191, 0.42) 1px, transparent 1px),
    linear-gradient(180deg, rgba(222, 210, 191, 0.44) 1px, transparent 1px),
    linear-gradient(180deg, var(--canvas) 0%, #fff 100%);
  background-size: 72px 72px, 72px 72px, auto;
}
.sp-hero-v2 .shell {
  position: relative;
}
.sp-hero-v2__copy {
  max-width: 880px;
  margin: 0 auto;
}
.sp-hero-v2__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #7b5d2e;
  font-size: 11px;
  line-height: 1.35;
  font-weight: 500;
  letter-spacing: .025em;
  text-transform: uppercase;
}
.sp-hero-v2__eyebrow::before {
  content: "";
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--orange);
  box-shadow: 0 0 0 3px rgba(250,143,31,.14);
}
.sp-hero-v2__copy h1 {
  max-width: 880px;
  margin: 18px auto 0;
  color: var(--ink);
  font-family: "IBM Plex Sans", Inter, sans-serif;
  font-size: 80px;
  font-weight: 500;
  letter-spacing: 0;
  line-height: 1;
}
.sp-hero-v2__copy h1 span {
  color: #a96e18;
}
.sp-hero-v2__copy p {
  max-width: 660px;
  margin: 24px auto 0;
  color: var(--muted);
  font-size: 17px;
  line-height: 1.65;
}
.sp-hero-v2__actions {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 30px;
}
.sp-hero-v2__button {
  min-height: 46px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: 1px solid transparent;
  border-radius: 8px;
  padding: 11px 18px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
}
.sp-hero-v2__button:hover {
  transform: translateY(-2px);
  box-shadow: 0 9px 18px rgba(33,13,2,.11);
}
.sp-hero-v2__button--primary {
  background: var(--yellow);
  border-color: #d3ad19;
  color: var(--ink);
}
.sp-hero-v2__button--outline {
  background: rgba(255,255,255,.72);
  border-color: var(--rule-strong);
  color: var(--ink);
}
.sp-hero-v2__stage {
  position: relative;
  width: min(1060px, 100%);
  margin: 74px auto 0;
  padding-top: 38px;
  text-align: left;
}
.sp-hero-v2__tabs {
  position: absolute;
  inset: 0 0 auto;
  height: 39px;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  border: 1px solid var(--rule);
  background: #fff;
  color: #6d6258;
  font-size: 10px;
}
.sp-hero-v2__tabs span {
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid var(--rule);
}
.sp-hero-v2__tabs span:last-child {
  border-right: 0;
}
.sp-hero-v2__tabs .active {
  background: var(--powder);
  color: var(--ink);
  font-weight: 600;
}
.sp-hero-v2__console {
  min-height: 520px;
  display: grid;
  grid-template-columns: 180px minmax(0, 1fr) 238px;
  border: 1px solid var(--rule);
  background: #fff;
  box-shadow: 0 28px 90px rgba(33, 13, 2, 0.16);
  overflow: hidden;
}
.sp-hero-v2__sidebar,
.sp-hero-v2__conversation,
.sp-hero-v2__confidence {
  min-width: 0;
}
.sp-hero-v2__sidebar {
  border-right: 1px solid var(--rule);
  background: #fffdf9;
  padding: 22px 16px;
}
.sp-hero-v2__sidebar b {
  display: block;
  margin-bottom: 22px;
  font-size: 12px;
}
.sp-hero-v2__sidebar span {
  display: block;
  border-radius: 5px;
  padding: 8px 9px;
  color: #675d54;
  font-size: 11px;
}
.sp-hero-v2__sidebar span.active {
  background: #f4ecdd;
  color: var(--ink);
  font-weight: 600;
}
.sp-hero-v2__conversation {
  padding: 24px;
}
.sp-hero-v2__console-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid #eee8df;
  padding-bottom: 16px;
}
.sp-hero-v2__console-top h2 {
  color: var(--ink);
  font-size: 22px;
  letter-spacing: 0;
}
.sp-hero-v2__console-top span {
  border: 1px solid #d8c9ff;
  border-radius: 4px;
  background: #f1edff;
  color: #6245bf;
  padding: 5px 8px;
  font-size: 10px;
  font-weight: 600;
}
.sp-hero-v2__message {
  max-width: 82%;
  margin-top: 18px;
  border-radius: 6px;
  padding: 12px 13px;
  font-size: 13px;
  line-height: 1.55;
}
.sp-hero-v2__message--user {
  margin-left: auto;
  background: #f7f1e8;
}
.sp-hero-v2__message--ai {
  border: 1px solid #eee8df;
  background: #fbfaf7;
  box-shadow: 0 8px 20px rgba(33,13,2,.05);
}
.sp-hero-v2__message b {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 7px;
}
.sp-hero-v2__message small {
  border-radius: 4px;
  background: #efeaff;
  color: #7259ba;
  padding: 2px 5px;
  font-size: 9px;
}
.sp-hero-v2__message div {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
}
.sp-hero-v2__message div span {
  border: 1px solid #e9e2d6;
  background: #fff;
  padding: 5px 7px;
  color: #6d6258;
  font-size: 10px;
}
.sp-hero-v2__composer {
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 24px;
  border: 1px solid #e5ddd1;
  border-radius: 6px;
  padding: 0 12px;
  color: #9a9188;
  font-size: 12px;
}
.sp-hero-v2__confidence {
  border-left: 1px solid var(--rule);
  background: #fffdf9;
  padding: 22px 16px;
}
.sp-hero-v2__confidence b,
.sp-hero-v2__confidence dt {
  color: #675d54;
  font-size: 11px;
  font-weight: 600;
}
.sp-hero-v2__confidence strong {
  display: block;
  margin-top: 10px;
  color: var(--ink);
  font-family: "IBM Plex Sans", Inter, sans-serif;
  font-size: 44px;
  font-weight: 500;
  letter-spacing: 0;
}
.sp-hero-v2__meter {
  height: 7px;
  overflow: hidden;
  border-radius: 999px;
  background: #e9e2d8;
}
.sp-hero-v2__meter i {
  display: block;
  width: 92%;
  height: 100%;
  border-radius: inherit;
  background: var(--success);
}
.sp-hero-v2__confidence dl {
  display: grid;
  gap: 15px;
  margin-top: 22px;
}
.sp-hero-v2__confidence dd {
  margin-top: 4px;
  color: var(--ink);
  font-size: 12px;
}
.sp-hero-v2__trust {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 28px;
  min-height: 72px;
  border: 1px solid var(--rule);
  border-top: 0;
  background: #fffdf9;
  color: #514940;
  font-size: 12px;
  font-weight: 600;
}
.sp-hero-v2__trust span {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
@media (max-width: 1120px) {
  .sp-hero-v2__copy h1 {
    font-size: 66px;
  }
  .sp-hero-v2__console {
    grid-template-columns: 150px minmax(0, 1fr);
  }
  .sp-hero-v2__confidence {
    display: none;
  }
}
@media (max-width: 760px) {
  .sp-hero-v2 {
    padding-top: 72px;
    text-align: left;
  }
  .sp-hero-v2__copy h1 {
    font-size: 42px;
  }
  .sp-hero-v2__copy p {
    font-size: 15px;
  }
  .sp-hero-v2__actions,
  .sp-hero-v2__button {
    width: 100%;
  }
  .sp-hero-v2__stage {
    margin-top: 61px;
  }
  .sp-hero-v2__tabs {
    grid-template-columns: repeat(5, minmax(92px, 1fr));
    overflow: hidden;
  }
  .sp-hero-v2__console {
    display: block;
    min-height: auto;
  }
  .sp-hero-v2__sidebar {
    display: none;
  }
  .sp-hero-v2__conversation {
    padding: 18px;
  }
  .sp-hero-v2__console-top {
    align-items: flex-start;
    flex-direction: column;
  }
  .sp-hero-v2__message {
    max-width: 100%;
  }
  .sp-hero-v2__trust {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
    padding: 18px;
  }
}`;
