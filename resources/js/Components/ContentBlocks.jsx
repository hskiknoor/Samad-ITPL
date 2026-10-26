import React from "react";
import { Link } from "@inertiajs/react";
import { ArrowRight } from "lucide-react";

export default function ContentBlocks({ blocks = [] }) {
    return (
        <div className="content-blocks">
            {(blocks || []).map((block, i) => (
                <section
                    className={`content-block block-${block.type}`}
                    key={i}
                >
                    {block.heading && <h2>{block.heading}</h2>}
                    {block.body && <p className="pre-line">{block.body}</p>}
                    {block.type === "features" && (
                        <div className="feature-block-grid">
                            {block.items?.map((item, j) => (
                                <article key={j}>
                                    <span>
                                        {String(j + 1).padStart(2, "0")}
                                    </span>
                                    <h3>{item.title}</h3>
                                    <p>{item.text}</p>
                                </article>
                            ))}
                        </div>
                    )}
                    {block.type === "faq" && (
                        <div className="faq-block">
                            {block.items?.map((item, j) => (
                                <details key={j}>
                                    <summary>{item.title}</summary>
                                    <p>{item.text}</p>
                                </details>
                            ))}
                        </div>
                    )}
                    {block.type === "cta" &&
                        block.button_label &&
                        block.button_url && (
                            <Link
                                className="site-button"
                                href={block.button_url}
                            >
                                {block.button_label}
                                <ArrowRight size={17} />
                            </Link>
                        )}
                </section>
            ))}
        </div>
    );
}
