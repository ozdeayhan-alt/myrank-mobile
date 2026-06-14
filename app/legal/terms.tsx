import { LegalDocumentView, TERMS_OF_SERVICE } from "@/features/legal";

export default function TermsOfServiceScreen() {
  return <LegalDocumentView document={TERMS_OF_SERVICE} />;
}
