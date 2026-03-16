// app/components/Markdown.tsx
import { buildHeadingId } from "@/app/lib/markdownToc";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize from "rehype-sanitize";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

type Props = {
  content: string;
};

function getNodeText(children: React.ReactNode): string {
  return Array.isArray(children)
    ? children.map((child) => getNodeText(child)).join("")
    : typeof children === "string" || typeof children === "number"
      ? String(children)
      : "";
}

export default function Markdown({ content }: Props) {
  const used = new Map<string, number>();

  return (
    <div className="markdown-body max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeHighlight, rehypeSanitize]}
        components={{
          h1: ({ children }) => {
            const text = getNodeText(children);
            const id = buildHeadingId(text, used);
            return <h1 id={id}>{children}</h1>;
          },
          h2: ({ children }) => {
            const text = getNodeText(children);
            const id = buildHeadingId(text, used);
            return <h2 id={id}>{children}</h2>;
          },
          h3: ({ children }) => {
            const text = getNodeText(children);
            const id = buildHeadingId(text, used);
            return <h3 id={id}>{children}</h3>;
          },
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