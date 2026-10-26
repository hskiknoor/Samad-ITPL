import React from "react";
import { Link, usePage } from "@inertiajs/react";
import { ArrowDown, ArrowRight, ArrowUpRight } from "lucide-react";
import SiteLayout from "../../Components/SiteLayout";
import EntryCard from "../../Components/EntryCard";

export default function Home({ posts, products, seo }) {
    const { site } = usePage().props;
    return (
        <SiteLayout seo={seo}>
            <section className="site-hero">
                <div className="hero-text">
                    <span className="site-eyebrow">
                        <span />
                        {site.tagline}
                    </span>
                    <h1>{site.hero_title}</h1>
                    <p>{site.hero_subtitle}</p>
                    <Link href="/pages/about" className="site-button">
                        A little about us
                        <ArrowUpRight size={20} />
                    </Link>
                    <a href="#journal" className="hero-scroll">
                        <ArrowDown size={17} />A few things from our world
                    </a>
                </div>
                <div
                    className="hero-poster"
                    aria-label="Abstract composition of organic shapes in forest green and soft yellow"
                    role="img"
                >
                    <div className="poster-top">
                        <span>
                            THE ART OF
                            <br />
                            SEEING DIFFERENTLY.
                        </span>
                        <span>01 — ∞</span>
                    </div>
                    <div className="poster-composition">
                        <span className="poster-circle" />
                        <span className="poster-arch" />
                        <span className="poster-slice" />
                        <span className="poster-small" />
                        <span className="poster-star">✳</span>
                    </div>
                    <div className="poster-bottom">
                        <span>A FRESH PERSPECTIVE</span>
                        <span>© {site.name.toUpperCase()}</span>
                    </div>
                    <div className="poster-label">
                        Thoughtfully
                        <br />
                        <em>different.</em>
                    </div>
                </div>
            </section>
            <div className="studio-values">
                <span>INDEPENDENT IN SPIRIT.</span>
                <span>THOUGHTFUL BY NATURE.</span>
                <span>
                    ALWAYS A LITTLE CURIOUS. <span>✳</span>
                </span>
            </div>
            <section className="site-section" id="journal">
                <div className="site-section-heading">
                    <div>
                        <span className="site-eyebrow">
                            NOTES FROM OUR WORLD
                        </span>
                        <h2>A little food for thought.</h2>
                    </div>
                    <Link className="site-text-link" href="/journal">
                        Explore the journal
                        <ArrowRight size={18} />
                    </Link>
                </div>
                {posts.length ? (
                    <div className="entry-grid">
                        {posts.map((entry) => (
                            <EntryCard key={entry.id} entry={entry} />
                        ))}
                    </div>
                ) : (
                    <p className="public-empty">
                        The next story is taking shape. Check back soon.
                    </p>
                )}
            </section>
            <section className="studio-statement">
                <span>OUR POINT OF VIEW</span>
                <p>
                    Good design is a conversation.
                    <br />
                    Great things happen when we
                    <br />
                    <em>make space for each other.</em>
                </p>
                <Link href="/contact" className="site-text-link">
                    Start a conversation
                    <ArrowUpRight size={19} />
                </Link>
                <span className="statement-flower" aria-hidden="true">
                    ✳
                </span>
            </section>
            {products.length > 0 && (
                <section className="site-section">
                    <div className="site-section-heading">
                        <div>
                            <span className="site-eyebrow">
                                OBJECTS WITH A LITTLE PURPOSE
                            </span>
                            <h2>Considered. Collected. Yours.</h2>
                        </div>
                        <Link className="site-text-link" href="/shop">
                            Visit the shop
                            <ArrowRight size={18} />
                        </Link>
                    </div>
                    <div className="entry-grid">
                        {products.map((entry) => (
                            <EntryCard key={entry.id} entry={entry} />
                        ))}
                    </div>
                </section>
            )}
        </SiteLayout>
    );
}
