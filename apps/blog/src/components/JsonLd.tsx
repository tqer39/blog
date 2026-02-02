interface JsonLdProps {
  /** JSON-LD structured data for SEO. Type is intentionally loose for schema.org flexibility. */
  data: object;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
