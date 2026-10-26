import React from "react";
import { Link, usePage } from "@inertiajs/react";
import { ArrowUpRight } from "lucide-react";
import { Cover, date, money } from "./UI";

export default function EntryCard({ entry }) {
    const { site } = usePage().props;
    return (
        <article className="entry-card">
            <Link href={entry.public_path} className="entry-card-image">
                <Cover media={entry.media} />
                <span className="entry-card-arrow">
                    <ArrowUpRight size={22} />
                </span>
            </Link>
            <div className="entry-card-meta">
                <span>
                    {entry.category?.name ||
                        (entry.type === "product"
                            ? "THE SHOP"
                            : "FROM THE STUDIO")}
                </span>
                <span>
                    {entry.type === "product"
                        ? money(entry.price_cents, site.currency)
                        : date(entry.published_at)}
                </span>
            </div>
            <h3>
                <Link href={entry.public_path}>{entry.title}</Link>
            </h3>
            <p>{entry.excerpt}</p>
            {entry.type === "product" && (
                <span className="product-stock">
                    {entry.stock
                        ? "In stock · made for everyday"
                        : "Currently sold out"}
                </span>
            )}
        </article>
    );
}
