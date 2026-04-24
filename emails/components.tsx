import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { siteConfig } from "@/lib/site-config";
import * as React from "react";

export const emailColors = {
  paper: "#FAFAF7",
  ink: "#1A1A1A",
  primary: "#B8142B",
  accent: "#D4A017",
  mute: "#6B6A65",
};

export function Shell({
  preview,
  children,
}: {
  preview: string;
  children: React.ReactNode;
}) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: emailColors.paper, fontFamily: "Inter, Helvetica, Arial, sans-serif", margin: 0, padding: 0, color: emailColors.ink }}>
        <Container style={{ maxWidth: 560, margin: "40px auto", padding: "32px", background: "#ffffff", borderRadius: 8, border: "1px solid #e6e3db" }}>
          <Section style={{ borderBottom: "2px solid #1A1A1A", paddingBottom: 12, marginBottom: 20 }}>
            <Text style={{ margin: 0, fontFamily: "Georgia, serif", fontStyle: "italic", color: emailColors.primary, fontSize: 14 }}>
              {siteConfig.name}
            </Text>
            <Heading style={{ fontSize: 26, margin: "4px 0 0", color: emailColors.ink, letterSpacing: -0.5 }}>
              Georgia Print Hub
            </Heading>
          </Section>
          {children}
          <Hr style={{ borderColor: "#e6e3db", margin: "24px 0" }} />
          <Text style={{ color: emailColors.mute, fontSize: 12, margin: 0 }}>
            {siteConfig.name} · Locally printed in Georgia · {siteConfig.email}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export function CTA({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      style={{
        display: "inline-block",
        background: emailColors.primary,
        color: "#ffffff",
        padding: "12px 22px",
        borderRadius: 6,
        textDecoration: "none",
        fontWeight: 600,
        fontSize: 14,
      }}
    >
      {children}
    </a>
  );
}
