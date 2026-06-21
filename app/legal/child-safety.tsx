import { LegalDocumentView, CHILD_SAFETY_POLICY } from "@/features/legal";

export default function ChildSafetyRoute() {
  return <LegalDocumentView document={CHILD_SAFETY_POLICY} />;
}
