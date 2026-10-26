import React, { useState } from "react";
import { Link, router } from "@inertiajs/react";
import { ArrowRight, Search } from "lucide-react";
import SiteLayout from "../../Components/SiteLayout";

export default function SearchPage({ query, results }) {
    const [text, setText] = useState(query);
    return (
        <SiteLayout noindex>
            <section className="site-page-intro">
                <span className="site-eyebrow">FIND YOUR WAY</span>
                <h1>A little curiosity.</h1>
                <p>
                    Search pages, stories, products, available reports, or your
                    own orders.
                </p>
                <form
                    className="site-search-form"
                    onSubmit={(event) => {
                        event.preventDefault();
                        router.get("/search", { q: text });
                    }}
                >
                    <Search size={20} />
                    <input
                        aria-label="Search website"
                        value={text}
                        onChange={(event) => setText(event.target.value)}
                        maxLength={200}
                        placeholder="What are you looking for?"
                    />
                    <button aria-label="Search">
                        <ArrowRight size={20} />
                    </button>
                </form>
            </section>
            <section className="site-section search-results">
                {results.sources.map((source, i) => (
                    <article key={i}>
                        <span className="site-eyebrow">{source.kind}</span>
                        <h2>
                            <a href={source.url}>{source.title}</a>
                        </h2>
                        <p>{source.excerpt}</p>
                    </article>
                ))}
                {results.actions.map((action) => (
                    <a
                        className="site-button"
                        key={action.url}
                        href={action.url}
                    >
                        {action.label}
                        <ArrowRight size={16} />
                    </a>
                ))}
                {query && !results.sources.length && (
                    <p className="public-empty">
                        No matching website information yet. Try another title
                        or topic.
                    </p>
                )}
            </section>
        </SiteLayout>
    );
}
