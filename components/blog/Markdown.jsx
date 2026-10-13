import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeHighlight from "rehype-highlight";
import { cn } from "@/lib/utils";

// Renders post Markdown. Raw HTML in the source is ignored (react-markdown's
// default), so content can never inject scripts. Used by the public article
// page and the admin live preview, so both look identical.

function isExternalLink(href = "") {
  return /^https?:\/\//.test(href);
}

const components = {
  a({ href = "", children, ...props }) {
    const external = isExternalLink(href);
    return (
      <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...props}>
        {children}
      </a>
    );
  },
  img({ src = "", alt = "", title }) {
    return (
      <figure>
        {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary author images of unknown size */}
        <img src={src} alt={alt} title={title} loading="lazy" decoding="async" />
        {title && <figcaption>{title}</figcaption>}
      </figure>
    );
  },
  table({ children }) {
    return (
      <div className="table-wrap">
        <table>{children}</table>
      </div>
    );
  },
  // Images render a <figure>, which is invalid inside <p>; unwrap those paragraphs.
  p({ node, children }) {
    const onlyImage = node?.children?.length === 1 && node.children[0].tagName === "img";
    return onlyImage ? <>{children}</> : <p>{children}</p>;
  },
};

export default function Markdown({ children, className }) {
  return (
    <div className={cn("prose-blog", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug, rehypeHighlight]}
        components={components}
      >
        {children || ""}
      </ReactMarkdown>
    </div>
  );
}
