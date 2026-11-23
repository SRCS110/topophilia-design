// Client intake: validates the form and emails it to the studio via Resend.
// Env (Vercel project settings): RESEND_API_KEY, INTAKE_TO (client inbox),
// INTAKE_FROM (verified Resend sender, e.g. "Topophilia Design <intake@topophiliadesign.com>").
const MAX = { short: 200, long: 5000 };
const SERVICES = { collector: "The Collector (sourcing)", tailor: "The Tailor (making pieces work with what you have)", builder: "The Builder (a cohesive plan)" };
const hits = new Map(); // best-effort per-instance rate limit

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const clean = (v, n) => String(v ?? "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, n);

function reply(request, status, body) {
  const wantsJson = (request.headers.get("accept") || "").includes("application/json");
  if (wantsJson) return Response.json(body, { status });
  const to = body.ok ? "/thank-you" : "/contact?error=1";
  return new Response(null, { status: 303, headers: { Location: to } });
}

export async function POST(request) {
  const ip = (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  if (recent.length >= 5) return reply(request, 429, { ok: false, error: "Too many submissions. Please wait a few minutes." });
  recent.push(now); hits.set(ip, recent);

  let form;
  try { form = await request.formData(); } catch { return reply(request, 400, { ok: false, error: "Could not read the form." }); }

  // Spam checks: honeypot and minimum fill time
  if (clean(form.get("company_website"), 200)) return reply(request, 200, { ok: true });
  const started = Number(form.get("started") || 0);
  if (started && now - started < 3000) return reply(request, 200, { ok: true });

  const d = {
    name: clean(form.get("name"), MAX.short),
    email: clean(form.get("email"), MAX.short),
    phone: clean(form.get("phone"), 40),
    contact_pref: clean(form.get("contact_pref"), 20),
    location: clean(form.get("location"), MAX.short),
    space_type: clean(form.get("space_type"), 40),
    services: form.getAll("services").map((s) => clean(s, 20)).filter((s) => SERVICES[s]),
    spaces: clean(form.get("spaces"), MAX.long),
    timeline: clean(form.get("timeline"), 40),
    budget: clean(form.get("budget"), MAX.short),
    message: clean(form.get("message"), MAX.long),
    referral: clean(form.get("referral"), MAX.short),
    consent: form.get("consent") === "yes"
  };

  const errors = [];
  if (!d.name) errors.push("name");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) errors.push("email");
  if (!d.location) errors.push("location");
  if (!d.services.length) errors.push("services");
  if (!d.message) errors.push("message");
  if (!d.consent) errors.push("consent");
  if (errors.length) return reply(request, 422, { ok: false, error: "Please complete the required fields.", fields: errors });

  const { RESEND_API_KEY, INTAKE_TO, INTAKE_FROM } = process.env;
  if (!RESEND_API_KEY || !INTAKE_TO || !INTAKE_FROM) {
    console.error("intake: missing RESEND_API_KEY, INTAKE_TO or INTAKE_FROM");
    return reply(request, 503, { ok: false, error: "The form is not connected yet." });
  }

  const rows = [
    ["Name", d.name], ["Email", d.email], ["Phone", d.phone || "Not given"], ["Preferred contact", d.contact_pref || "Not given"],
    ["Project location", d.location], ["Type of space", d.space_type || "Not given"],
    ["Services", d.services.map((s) => SERVICES[s]).join(", ")],
    ["Rooms or wardrobe areas", d.spaces || "Not given"], ["Timeline", d.timeline || "Not given"],
    ["Budget", d.budget || "Not given"], ["How they found us", d.referral || "Not given"], ["About the project", d.message]
  ];
  const html = `<div style="font-family:Arial,sans-serif;color:#1E1A17;max-width:640px">
<h2 style="font-family:Georgia,serif;font-weight:400;color:#5A3F2E">New client intake</h2>
<table cellpadding="8" style="border-collapse:collapse;width:100%">${rows.map(([k, v]) => `<tr><td style="border-bottom:1px solid #E9DCC6;font-weight:bold;vertical-align:top;width:180px">${esc(k)}</td><td style="border-bottom:1px solid #E9DCC6;white-space:pre-wrap">${esc(v)}</td></tr>`).join("")}</table>
<p style="font-size:12px;color:#5C5249">Sent from the intake form at topophiliadesign.com. The client agreed to the privacy policy.</p></div>`;
  const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n\n");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: INTAKE_FROM,
      to: INTAKE_TO.split(",").map((s) => s.trim()).filter(Boolean),
      reply_to: d.email,
      subject: `New client intake: ${d.name}`,
      html, text
    })
  });
  if (!res.ok) {
    console.error("intake: resend failed", res.status, await res.text().catch(() => ""));
    return reply(request, 502, { ok: false, error: "We could not send your details." });
  }
  return reply(request, 200, { ok: true });
}
