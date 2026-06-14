import { ScrollView, Text, View } from "react-native";
import type { LegalDocument } from "../content/documents";

type LegalDocumentViewProps = {
  document: LegalDocument;
};

export function LegalDocumentView({ document }: LegalDocumentViewProps) {
  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerClassName="px-5 py-6 pb-10"
    >
      <Text className="mb-1 text-2xl font-bold text-gray-900">
        {document.title}
      </Text>
      <Text className="mb-6 text-sm text-gray-500">
        Son güncelleme: {document.updatedAt}
      </Text>

      {document.sections.map((section, index) => (
        <View key={`${section.title ?? "section"}-${index}`} className="mb-5">
          {section.title ? (
            <Text className="mb-2 text-base font-semibold text-gray-900">
              {section.title}
            </Text>
          ) : null}
          {section.paragraphs.map((paragraph, paragraphIndex) => (
            <Text
              key={`${index}-${paragraphIndex}`}
              className="mb-3 text-base leading-6 text-gray-700"
            >
              {paragraph}
            </Text>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}
