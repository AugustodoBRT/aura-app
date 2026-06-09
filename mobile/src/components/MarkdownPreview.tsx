import Markdown from "react-native-markdown-display";
import { useTheme } from "../contexts/ThemeContext";

// Preserva o editor Markdown do PWA: renderiza o texto da nota como Markdown.
export default function MarkdownPreview({ content }: { content: string }) {
  const { colors } = useTheme();

  return (
    <Markdown
      style={{
        body: { color: colors.text, fontSize: 16, lineHeight: 24 },
        heading1: { color: colors.text, fontWeight: "700" },
        heading2: { color: colors.text, fontWeight: "700" },
        link: { color: colors.primary },
        code_inline: {
          backgroundColor: colors.surface,
          color: colors.primary,
          paddingHorizontal: 4,
          borderRadius: 4,
        },
        code_block: {
          backgroundColor: colors.surface,
          color: colors.text,
          padding: 10,
          borderRadius: 8,
        },
        blockquote: {
          backgroundColor: colors.surface,
          borderLeftColor: colors.primary,
          borderLeftWidth: 4,
          paddingHorizontal: 10,
        },
      }}
    >
      {content || "_Sem conteúdo_"}
    </Markdown>
  );
}
