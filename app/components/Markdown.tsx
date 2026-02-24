import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import rehypeHighlight from "rehype-highlight";

type Props = {
  content: string;
};

export default function Markdown({ content }: Props) {
  return (
    <div className="prose prose-neutral max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeHighlight,
          rehypeSanitize, // ✅ sanitize는 마지막 쪽에 두는게 보통 안전
        ]}
        components={{
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              className="underline"
            >
              {children}
            </a>
          ),
          img: ({ src, alt }) => {
            // 일단은 simplest: img로 렌더 (next/image는 도메인 whitelist 필요)
            if (!src) return null;
            return (
              <img
                src={src}
                alt={alt ?? "image"}
                className="my-4 rounded-xl border border-neutral-200"
                referrerPolicy="no-referrer"
              />
            );
          },
          code: ({ className, children }) => (
            <code className={className}>{children}</code>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}