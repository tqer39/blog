interface JsonLdProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- JSON-LD data can have various shapes
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
