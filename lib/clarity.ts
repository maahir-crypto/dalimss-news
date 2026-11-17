/** Microsoft Clarity. The tag is rendered from pages/_app.tsx. */

export const CLARITY_SCRIPT_ID = "microsoft-clarity";

export const DEFAULT_CLARITY_PROJECT_ID = "zf4rzuycbu";

/** Hosts that are the public site. Preview and local hosts are not included. */
export const CLARITY_PRODUCTION_HOSTS = ["dalimss.news", "www.dalimss.news"] as const;

export type ClarityRenderDecision =
  | { render: false }
  | { render: true; projectId: string; gateOnProductionHost: boolean };

/** Enough of process.env for the Clarity decision. Partial objects are fine in tests. */
type EnvSource = Record<string, string | undefined>;

function readEnv(value: string | undefined): string {
  return (value ?? "").trim();
}

/** Project id from NEXT_PUBLIC_CLARITY_ID, or the dalimss.news project. */
export function clarityProjectId(env: EnvSource = process.env): string {
  const configured = readEnv(env.NEXT_PUBLIC_CLARITY_ID);
  return configured || DEFAULT_CLARITY_PROJECT_ID;
}

/**
 * Whether pages/_app.tsx should emit the Clarity snippet.
 *
 * Production renders the standard snippet. Preview and development skip it.
 * When neither NEXT_PUBLIC_VERCEL_ENV nor VERCEL_ENV is set at build time,
 * the snippet is still emitted and refuses to load unless the hostname is
 * the public site.
 */
export function clarityRenderDecision(
  env: EnvSource = process.env
): ClarityRenderDecision {
  const vercelEnv =
    readEnv(env.NEXT_PUBLIC_VERCEL_ENV) || readEnv(env.VERCEL_ENV);
  if (vercelEnv === "production") {
    return {
      render: true,
      projectId: clarityProjectId(env),
      gateOnProductionHost: false,
    };
  }
  if (vercelEnv) {
    return { render: false };
  }
  return {
    render: true,
    projectId: clarityProjectId(env),
    gateOnProductionHost: true,
  };
}

export function isClarityProductionHost(hostname: string): boolean {
  const host = hostname.trim().toLowerCase().replace(/\.$/, "");
  return (CLARITY_PRODUCTION_HOSTS as readonly string[]).includes(host);
}

/** Standard Clarity bootstrap. The project id is embedded as a JS string. */
export function clarityInlineScript(
  projectId: string,
  gateOnProductionHost: boolean
): string {
  const id = JSON.stringify(projectId);
  const boot =
    'c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);';
  const gate = gateOnProductionHost
    ? `var h=window.location.hostname;if(${CLARITY_PRODUCTION_HOSTS.map(
        (host) => `h!==${JSON.stringify(host)}`
      ).join("&&")})return;`
    : "";
  return `(function(c,l,a,r,i,t,y){${gate}${boot}})(window, document, "clarity", "script", ${id});`;
}
