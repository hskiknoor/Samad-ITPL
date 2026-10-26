import React, { useState } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import { ArrowRight, ArrowUpRight, Menu, ShoppingBag, X } from "lucide-react";

export default function SiteLayout({ children, seo, noindex = false }) {
    const { site, cartCount, flash, errors } = usePage().props;
    const [open, setOpen] = useState(false);
    return (
        <div className="public-site" style={{ "--site-accent": site.accent }}>
            <Head title={seo?.title || site.name}>
                <meta
                    name="description"
                    content={seo?.description || site.description}
                />
                <meta
                    name="robots"
                    content={
                        noindex || seo?.noindex
                            ? "noindex,nofollow"
                            : "index,follow"
                    }
                />
                {seo?.canonical && (
                    <link rel="canonical" href={seo.canonical} />
                )}
                <meta property="og:title" content={seo?.title || site.name} />
                <meta
                    property="og:description"
                    content={seo?.description || site.description}
                />
                <meta property="og:site_name" content={site.name} />
                <meta property="og:type" content={seo?.type || "website"} />
                {seo?.canonical && (
                    <meta property="og:url" content={seo.canonical} />
                )}
                {seo?.image && <meta property="og:image" content={seo.image} />}
                <meta
                    name="twitter:card"
                    content={seo?.image ? "summary_large_image" : "summary"}
                />
                {seo?.schema && (
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{
                            __html: JSON.stringify(seo.schema).replace(
                                /</g,
                                "\\u003c",
                            ),
                        }}
                    />
                )}
            </Head>
            <a href="#main-content" className="skip-link">
                Skip to content
            </a>
            <header className="site-header">
                <Link href="/" className="site-brand">
                    <span className="site-logomark" aria-hidden="true">
                        ✳
                    </span>
                    {site.name}
                    <span className="site-brand-period">®</span>
                </Link>
                <nav
                    className={open ? "open" : ""}
                    aria-label="Website navigation"
                >
                    {site.navigation.map((link, i) => (
                        <Link
                            key={i}
                            href={link.url}
                            onClick={() => setOpen(false)}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>
                <div className="site-header-right">
                    <Link
                        className="bag-link"
                        href="/cart"
                        aria-label={`Shopping bag, ${cartCount} items`}
                    >
                        <ShoppingBag size={19} />
                        <span>Bag ({cartCount})</span>
                    </Link>
                    <button
                        className="icon-button site-mobile-menu"
                        onClick={() => setOpen(!open)}
                        aria-label={open ? "Close menu" : "Open menu"}
                        aria-expanded={open}
                    >
                        {open ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </header>
            {flash?.success && (
                <div className="site-notice notice success" role="status">
                    {flash.success}
                </div>
            )}
            {Object.keys(errors || {}).length > 0 && (
                <div className="site-notice notice error" role="alert">
                    {[...new Set(Object.values(errors))].join(" ")}
                </div>
            )}
            <main id="main-content">{children}</main>
            <section className="site-contact-strip">
                <span>HAVE SOMETHING IN MIND?</span>
                <Link href="/contact">
                    Let’s make it happen.
                    <ArrowUpRight />
                </Link>
            </section>
            <footer className="site-footer">
                <div>
                    <Link className="site-brand" href="/">
                        <span className="site-logomark">✳</span>
                        {site.name}
                    </Link>
                    <p>{site.footer}</p>
                </div>
                <div>
                    <a href={`mailto:${site.contact_email}`}>
                        {site.contact_email}
                        <ArrowUpRight size={15} />
                    </a>
                    <span>
                        © {new Date().getUTCFullYear()} {site.name}
                    </span>
                </div>
            </footer>
        </div>
    );
}
