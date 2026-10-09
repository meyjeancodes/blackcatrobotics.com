"use client";

/**
 * /glasses/install — how to install the TechMedix web app on Ray-Ban Display.
 */
import {
  Screen,
  Kicker,
  Title,
  Card,
  GhostButton,
  theme,
} from "../ui";

const APP_URL = "https://blackcatrobotics.com/glasses";

function Step({
  n,
  title,
  body,
}: {
  n: string;
  title: string;
  body: string;
}) {
  return (
    <Card>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            background: theme.fireDim,
            color: "#fff",
            fontSize: 30,
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {n}
        </div>
        <div>
          <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
            {title}
          </div>
          <div style={{ fontSize: 22, color: theme.mut, lineHeight: 1.5 }}>
            {body}
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function GlassesInstall() {
  return (
    <Screen>
      <Kicker>TechMedix · Glasses</Kicker>
      <Title>Install on your Display</Title>

      <Card>
        <div style={{ fontSize: 20, color: theme.mut, marginBottom: 10 }}>
          App URL — feed this to Meta&apos;s QR generator:
        </div>
        <div
          style={{
            fontSize: 26,
            fontWeight: 700,
            color: theme.fire,
            wordBreak: "break-all",
            fontFamily: "ui-monospace, Menlo, monospace",
          }}
        >
          {APP_URL}
        </div>
      </Card>

      <Step
        n="1"
        title="Check requirements"
        body="Ray-Ban Display with software v125 or newer, Meta AI app v272 or newer on your paired phone, and Developer Mode enabled in the Meta AI app (tap the app version 5 times under Settings → App Info)."
      />
      <Step
        n="2"
        title="Generate the install QR"
        body="Use Meta's 'View on Glasses QR' feature in the Ray-Ban Display Simulator, or the Web App AI Coding plugin. A plain QR code of the URL will NOT work — it must be Meta's install link format."
      />
      <Step
        n="3"
        title="Scan with your glasses"
        body="Look at the QR code while wearing your Display. An add-to-glasses screen appears — confirm to install."
      />
      <Step
        n="4"
        title="Expect the 'unverified' label"
        body="Because the app hasn't been through Meta review, the confirmation screen marks it unverified. That's normal for now."
      />
      <Step
        n="5"
        title="Connect your fleet"
        body="Open the TechMedix app on your Display and enter your connector API key (tmdx_live_…). You'll see fleet status, alerts, and step-by-step repair guidance."
      />

      <Card>
        <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 10 }}>
          Troubleshooting
        </div>
        <div style={{ fontSize: 22, color: theme.mut, lineHeight: 1.6 }}>
          QR not recognized? Make sure the inner URL is HTTPS and generated with
          Meta&apos;s tooling. App won&apos;t load? Confirm the phone and
          glasses are paired and both are on the latest software. Install button
          does nothing? Installation must be confirmed on the glasses — check
          the display.
        </div>
      </Card>

      <GhostButton href="/glasses">Back to fleet</GhostButton>
    </Screen>
  );
}
