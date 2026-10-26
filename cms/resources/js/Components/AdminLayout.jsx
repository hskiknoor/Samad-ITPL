import React, { useEffect, useRef, useState } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import {
    ArrowUpRight,
    ChevronDown,
    FileText,
    Folder,
    Globe,
    Images,
    LayoutDashboard,
    LogOut,
    Mail,
    Menu,
    Newspaper,
    Package,
    Search,
    Settings,
    ShieldCheck,
    ShoppingBag,
    Sparkles,
    Users,
    X,
} from "lucide-react";

const nav = [
    {
        label: "WORKSPACE",
        items: [
            ["Overview", "/admin", LayoutDashboard],
            ["Pages", "/admin/content?type=page", FileText],
            ["Articles", "/admin/content?type=post", Newspaper],
            ["Products", "/admin/content?type=product", ShoppingBag],
        ],
    },
    {
        label: "ORGANIZE",
        items: [
            ["Media library", "/admin/media", Images],
            ["Categories", "/admin/categories", Folder],
            ["SEO overview", "/admin/seo", Globe],
        ],
    },
    {
        label: "MANAGE",
        admin: true,
        items: [
            ["Orders", "/admin/orders", Package],
            ["Inbox", "/admin/inbox", Mail],
            ["Team members", "/admin/team", Users],
            ["Site settings", "/admin/settings", Settings],
        ],
    },
];

export default function AdminLayout({ title, subtitle, actions, children }) {
    const { auth, site, flash, errors } = usePage().props;
    const { url } = usePage();
    const [open, setOpen] = useState(false);
    const search = useRef(null);
    useEffect(() => {
        const listener = (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === "k") {
                event.preventDefault();
                search.current?.focus();
            }
            if (event.key === "Escape") setOpen(false);
        };
        window.addEventListener("keydown", listener);
        return () => window.removeEventListener("keydown", listener);
    }, []);
    const currentType =
        usePage().props.entry?.type ||
        usePage().props.type ||
        usePage().props.filters?.type;
    const selected = (href) =>
        href === "/admin"
            ? url === "/admin"
            : href.includes("?")
              ? url.startsWith(href) ||
                (url.startsWith("/admin/content/") &&
                    currentType === href.split("type=")[1])
              : url.startsWith(href);
    const initials = auth.user.name
        .split(" ")
        .map((v) => v[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
    return (
        <div className="admin-app">
            <Head title={`${title} · Folio CMS`}>
                <meta name="robots" content="noindex,nofollow" />
            </Head>
            {open && (
                <button
                    className="sidebar-overlay"
                    onClick={() => setOpen(false)}
                    aria-label="Close navigation"
                />
            )}
            <aside className={`sidebar ${open ? "is-open" : ""}`}>
                <Link href="/admin" className="folio-brand">
                    <span className="brand-symbol">
                        f<span>·</span>
                    </span>
                    folio<span className="brand-label">CMS</span>
                </Link>
                <div className="workspace-card">
                    <span className="workspace-avatar">
                        {site.name.slice(0, 1)}
                    </span>
                    <div>
                        <strong>{site.name}</strong>
                        <span>Your website workspace</span>
                    </div>
                </div>
                <nav aria-label="Admin navigation">
                    {nav
                        .filter(
                            (group) =>
                                !group.admin || auth.user.role === "admin",
                        )
                        .map((group) => (
                            <div className="nav-group" key={group.label}>
                                <span className="nav-label">{group.label}</span>
                                {group.items.map(([label, href, Icon]) => (
                                    <Link
                                        key={label}
                                        href={href}
                                        onClick={() => setOpen(false)}
                                        className={`nav-item ${selected(href) ? "active" : ""}`}
                                    >
                                        <Icon size={18} strokeWidth={1.7} />
                                        <span>{label}</span>
                                        {selected(href) && (
                                            <span className="nav-active-dot" />
                                        )}
                                    </Link>
                                ))}
                            </div>
                        ))}
                </nav>
                <div className="sidebar-bottom">
                    <div className="workspace-note">
                        <Sparkles size={19} />
                        <strong>Room for your next idea.</strong>
                        <p>One flexible home for everything you create.</p>
                    </div>
                    <details className="profile-menu">
                        <summary>
                            <span className="avatar">{initials}</span>
                            <span>
                                <strong>{auth.user.name}</strong>
                                <small>
                                    {auth.user.role === "admin"
                                        ? "Administrator"
                                        : "Content editor"}
                                </small>
                            </span>
                            <ChevronDown size={15} />
                        </summary>
                        <div className="dropdown profile-dropdown">
                            <span>{auth.user.email}</span>
                            <Link href="/logout" method="post" as="button">
                                <LogOut size={16} />
                                Sign out
                            </Link>
                        </div>
                    </details>
                </div>
            </aside>
            <div className="admin-main">
                <header className="topbar">
                    <div className="breadcrumb">
                        <button
                            className="icon-button mobile-toggle"
                            aria-label="Open navigation"
                            onClick={() => setOpen(true)}
                        >
                            <Menu size={21} />
                        </button>
                        <span>Workspace</span>
                        <span className="slash">/</span>
                        <strong>{site.name}</strong>
                    </div>
                    <div className="topbar-actions">
                        <form action="/admin/content" className="global-search">
                            <Search size={16} />
                            <input
                                ref={search}
                                name="q"
                                placeholder="Search content…"
                                aria-label="Search content"
                            />
                            <kbd>⌘ K</kbd>
                        </form>
                        <Link href="/" className="visit-site">
                            View website
                            <ArrowUpRight size={16} />
                        </Link>
                        <span className="topbar-avatar">{initials}</span>
                    </div>
                </header>
                <main className="admin-content">
                    <div className="page-heading">
                        <div>
                            <p className="eyebrow">YOUR CREATIVE WORKSPACE</p>
                            <h1>{title}</h1>
                            {subtitle && (
                                <p className="page-subtitle">{subtitle}</p>
                            )}
                        </div>
                        <div className="heading-actions">{actions}</div>
                    </div>
                    {flash?.success && (
                        <div className="notice success" role="status">
                            <ShieldCheck size={18} />
                            {flash.success}
                        </div>
                    )}
                    {Object.keys(errors || {}).length > 0 && (
                        <div className="notice error" role="alert">
                            {[...new Set(Object.values(errors))].join(" ")}
                        </div>
                    )}
                    {children}
                    <footer className="admin-footer">
                        <span>
                            <span className="tiny-folio">f.</span> A little
                            structure. A lot of possibility.
                        </span>
                        <span>
                            Made for your next chapter <span>↗</span>
                        </span>
                    </footer>
                </main>
            </div>
        </div>
    );
}
