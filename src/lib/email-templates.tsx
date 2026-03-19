// src/lib/email-templates.tsx
// Optional: React Email components for better template management
// Currently using inline HTML in email.ts — this file provides a migration path

/**
 * React Email Setup (if needed later):
 *
 * 1. Install: npm install @react-email/components react-email
 * 2. Move templates here using React Email primitives
 * 3. Use render() to convert to HTML:
 *
 * import { render } from "@react-email/render"
 * import { StatusChangeEmail } from "./email-templates"
 * const html = render(<StatusChangeEmail {...data} />)
 *
 * Benefits:
 * - Better TypeScript support for template data
 * - Preview emails in browser during development
 * - Reusable components across templates
 *
 * Current approach (inline HTML in email.ts) is sufficient for v1.
 */

// Placeholder export to satisfy module requirements
export const TEMPLATES_VERSION = "1.0.0"

// Example React Email component structure (for future use):
/*
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components"

interface StatusChangeEmailProps {
  recipientName: string
  listingTitle: string
  listingUrl: string
  status: "pending" | "active" | "rejected"
  rejectionReason?: string
}

export function StatusChangeEmail({
  recipientName,
  listingTitle,
  listingUrl,
  status,
  rejectionReason,
}: StatusChangeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Listing update: {listingTitle}</Preview>
      <Body style={{ fontFamily: "sans-serif" }}>
        <Container>
          <Heading>...</Heading>
          <Text>Hi {recipientName},</Text>
          ...
        </Container>
      </Body>
    </Html>
  )
}
*/
