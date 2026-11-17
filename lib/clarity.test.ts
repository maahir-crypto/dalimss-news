import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  CLARITY_SCRIPT_ID,
  DEFAULT_CLARITY_PROJECT_ID,
  clarityInlineScript,
  clarityProjectId,
  clarityRenderDecision,
  isClarityProductionHost,
} from "./clarity";

const STANDARD_SNIPPET =
  '(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "zf4rzuycbu");';

assert.equal(CLARITY_SCRIPT_ID, "microsoft-clarity");
assert.equal(clarityProjectId({}), DEFAULT_CLARITY_PROJECT_ID);
assert.equal(clarityProjectId({ NEXT_PUBLIC_CLARITY_ID: "  " }), DEFAULT_CLARITY_PROJECT_ID);
assert.equal(clarityProjectId({ NEXT_PUBLIC_CLARITY_ID: "abc123" }), "abc123");

{
  const decision = clarityRenderDecision({ NEXT_PUBLIC_VERCEL_ENV: "production" });
  assert.equal(decision.render, true);
  if (!decision.render) throw new Error("expected production to render");
  assert.equal(decision.gateOnProductionHost, false);
  assert.equal(decision.projectId, DEFAULT_CLARITY_PROJECT_ID);
  assert.equal(clarityInlineScript(decision.projectId, decision.gateOnProductionHost), STANDARD_SNIPPET);
}

{
  const decision = clarityRenderDecision({
    NEXT_PUBLIC_VERCEL_ENV: "production",
    NEXT_PUBLIC_CLARITY_ID: "customid",
  });
  assert.equal(decision.render, true);
  if (!decision.render) throw new Error("expected production to render");
  assert.equal(decision.projectId, "customid");
  assert.match(
    clarityInlineScript(decision.projectId, false),
    /"customid"\);$/
  );
}

assert.equal(clarityRenderDecision({ VERCEL_ENV: "production" }).render, true);
assert.equal(
  clarityRenderDecision({
    NEXT_PUBLIC_VERCEL_ENV: "preview",
    VERCEL_ENV: "production",
  }).render,
  false
);
assert.equal(clarityRenderDecision({ NEXT_PUBLIC_VERCEL_ENV: "preview" }).render, false);
assert.equal(clarityRenderDecision({ VERCEL_ENV: "preview" }).render, false);
assert.equal(clarityRenderDecision({ NEXT_PUBLIC_VERCEL_ENV: "development" }).render, false);
assert.equal(clarityRenderDecision({ VERCEL_ENV: "development" }).render, false);
assert.equal(clarityRenderDecision({ NEXT_PUBLIC_VERCEL_ENV: " Production " }).render, false);

{
  const decision = clarityRenderDecision({});
  assert.equal(decision.render, true);
  if (!decision.render) throw new Error("expected an unknown env to render");
  assert.equal(decision.gateOnProductionHost, true);
  const script = clarityInlineScript(decision.projectId, true);
  assert.match(script, /var h=window\.location\.hostname;/);
  assert.match(script, /h!=="dalimss\.news"/);
  assert.match(script, /h!=="www\.dalimss\.news"/);
  assert.match(script, /https:\/\/www\.clarity\.ms\/tag\//);
  assert.equal(
    script,
    '(function(c,l,a,r,i,t,y){var h=window.location.hostname;if(h!=="dalimss.news"&&h!=="www.dalimss.news")return;c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "zf4rzuycbu");'
  );
}

assert.equal(clarityRenderDecision({ NEXT_PUBLIC_VERCEL_ENV: "" }).render, true);
assert.equal(
  clarityRenderDecision({ NEXT_PUBLIC_VERCEL_ENV: "   ", VERCEL_ENV: "" }).render,
  true
);

const appSource = readFileSync(new URL("../pages/_app.tsx", import.meta.url), "utf8");
assert.match(appSource, /id=\{CLARITY_SCRIPT_ID\}/);
assert.match(appSource, /strategy="lazyOnload"/);
assert.match(appSource, /clarityRenderDecision\(/);
assert.doesNotMatch(appSource, /googlesyndication|AdSlot|adsbygoogle/);

assert.equal(isClarityProductionHost("dalimss.news"), true);
assert.equal(isClarityProductionHost("www.dalimss.news"), true);
assert.equal(isClarityProductionHost("WWW.DALIMSS.NEWS."), true);
assert.equal(isClarityProductionHost("preview.dalimss.news"), false);
assert.equal(isClarityProductionHost("localhost"), false);
assert.equal(isClarityProductionHost("dalimss-news.vercel.app"), false);
