import React, { useState } from "react";
import { Link, router } from "@inertiajs/react";
import { Search, X } from "lucide-react";
import SiteLayout from "../../Components/SiteLayout";
import EntryCard from "../../Components/EntryCard";
import { Pagination } from "../../Components/UI";

export default function Listing({ entries, categories, type, filters, seo }) {
    const [query, setQuery] = useState(filters.q || "");
    const path = type === "product" ? "/shop" : "/journal";
    const url = (category) =>
        `${path}?${new URLSearchParams(Object.entries({ ...filters, category }).filter(([, v]) => v))}`;
    return (
        <SiteLayout seo={seo}>
            <section className="site-page-intro">
                <span className="site-eyebrow">
                    {type === "product"
                        ? "SMALL THINGS. CONSIDERED WELL."
                        : "A FEW THINGS ON OUR MIND"}
                </span>
                <h1>
                    {type === "product" ? "The little shop." : "The journal."}
                </h1>
                <p>
                    {type === "product"
                        ? "Useful objects, thoughtful resources, and a little everyday inspiration."
                        : "Ideas, observations, and the occasional different point of view."}
                </p>
            </section>
            <section className="site-section listing-section">
                <div className="public-filters">
                    <div className="category-filters">
                        <Link
                            className={!filters.category ? "active" : ""}
                            href={url("")}
                        >
                            Everything
                        </Link>
                        {categories.map((category) => (
                            <Link
                                className={
                                    filters.category === category.slug
                                        ? "active"
                                        : ""
                                }
                                key={category.id}
                                href={url(category.slug)}
                            >
                                {category.name}
                            </Link>
                        ))}
                    </div>
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            router.get(path, { ...filters, q: query });
                        }}
                        className="public-search"
                    >
                        <Search size={17} />
                        <input
                            aria-label="Search the site"
                            placeholder="A little search…"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                        />
                    </form>
                </div>
                {filters.tag && (
                    <div className="tag-filter">
                        Tagged: {filters.tag}
                        <Link href={path} aria-label="Clear tag filter">
                            <X size={14} />
                        </Link>
                    </div>
                )}
                {entries.data.length ? (
                    <>
                        <div className="entry-grid">
                            {entries.data.map((entry) => (
                                <EntryCard key={entry.id} entry={entry} />
                            ))}
                        </div>
                        <Pagination paginator={entries} />
                    </>
                ) : (
                    <div className="public-empty">
                        <h2>A little quiet around here.</h2>
                        <p>No results yet. Try another search or category.</p>
                        <Link className="site-text-link" href={path}>
                            See everything
                        </Link>
                    </div>
                )}
            </section>
        </SiteLayout>
    );
}
