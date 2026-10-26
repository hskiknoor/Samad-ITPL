import React from "react";
import { Link, useForm, usePage } from "@inertiajs/react";
import { ArrowLeft, ArrowRight, ShoppingBag } from "lucide-react";
import ContentBlocks from "../../Components/ContentBlocks";
import SiteLayout from "../../Components/SiteLayout";
import { Cover, date, Field, money } from "../../Components/UI";

export default function Entry({ entry, seo }) {
    const { site } = usePage().props;
    const form = useForm({ quantity: 1 });
    const words = (entry.body || "").trim().split(/\s+/).length;
    if (entry.type === "product")
        return (
            <SiteLayout seo={seo}>
                <section className="public-product">
                    <Link className="back-to-list" href="/shop">
                        <ArrowLeft size={16} />
                        Back to the shop
                    </Link>
                    <div className="product-layout">
                        <Cover
                            media={entry.media}
                            className="product-hero-image"
                        />
                        <div className="product-copy">
                            <span className="site-eyebrow">
                                {entry.category?.name ||
                                    "A CONSIDERED LITTLE THING"}
                            </span>
                            <h1>{entry.title}</h1>
                            <span className="product-price">
                                {money(entry.price_cents, site.currency)}
                            </span>
                            <p>{entry.excerpt}</p>
                            <div
                                className="prose"
                                dangerouslySetInnerHTML={{ __html: entry.html }}
                            />
                            <ContentBlocks blocks={entry.blocks} />
                            <form
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    form.post(`/cart/${entry.id}`, {
                                        preserveScroll: true,
                                    });
                                }}
                            >
                                <div className="add-to-bag">
                                    <Field
                                        label="QUANTITY"
                                        error={form.errors.quantity}
                                    >
                                        <input
                                            aria-label="Quantity"
                                            type="number"
                                            min="1"
                                            max={Math.min(99, entry.stock)}
                                            step="1"
                                            value={form.data.quantity}
                                            disabled={!entry.stock}
                                            onChange={(event) =>
                                                form.setData(
                                                    "quantity",
                                                    Number(event.target.value),
                                                )
                                            }
                                        />
                                    </Field>
                                    <button
                                        className="site-button"
                                        disabled={
                                            !entry.stock || form.processing
                                        }
                                    >
                                        <ShoppingBag size={18} />
                                        {entry.stock
                                            ? form.processing
                                                ? "Adding…"
                                                : "Add to your bag"
                                            : "Currently sold out"}
                                    </button>
                                </div>
                            </form>
                            <span className="product-order-note">
                                Orders are confirmed by our team. Payment and
                                delivery are arranged after confirmation.
                            </span>
                            <Link href="/cart" className="site-text-link">
                                View your bag
                                <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                </section>
            </SiteLayout>
        );
    return (
        <SiteLayout seo={seo}>
            <article className="public-article">
                <header className="article-heading">
                    <Link
                        className="back-to-list"
                        href={entry.type === "post" ? "/journal" : "/"}
                    >
                        <ArrowLeft size={16} />
                        {entry.type === "post"
                            ? "Back to the journal"
                            : "Back home"}
                    </Link>
                    <span className="site-eyebrow">
                        {entry.category?.name || site.tagline}
                    </span>
                    <h1>{entry.title}</h1>
                    <p>{entry.excerpt}</p>
                    {entry.type === "post" && (
                        <div className="article-byline">
                            <span className="avatar">
                                {entry.author.name.slice(0, 1)}
                            </span>
                            <span>By {entry.author.name}</span>
                            <span>·</span>
                            <time dateTime={entry.published_at}>
                                {date(entry.published_at)}
                            </time>
                            <span>·</span>
                            <span>
                                {Math.max(1, Math.ceil(words / 200))} min read
                            </span>
                        </div>
                    )}
                </header>
                {entry.media && (
                    <Cover media={entry.media} className="article-cover" />
                )}
                <div
                    className="prose article-body"
                    dangerouslySetInnerHTML={{ __html: entry.html }}
                />
                <div className="article-body">
                    <ContentBlocks blocks={entry.blocks} />
                </div>
                {entry.tags?.length > 0 && (
                    <div className="article-tags">
                        {entry.tags.map((tag) => (
                            <Link
                                key={tag}
                                href={`/journal?tag=${encodeURIComponent(tag)}`}
                            >
                                {tag}
                            </Link>
                        ))}
                    </div>
                )}
            </article>
        </SiteLayout>
    );
}
