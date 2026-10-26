import React from "react";
import { Link } from "@inertiajs/react";
import { ArrowUpRight, CheckCircle2, Globe, ScanSearch } from "lucide-react";
import AdminLayout from "../Components/AdminLayout";
import { Badge, Empty } from "../Components/UI";

export default function Seo({ entries }) {
    const missing = entries.filter(
        (entry) => !entry.seo_title || !entry.seo_description,
    );
    const noindex = entries.filter((entry) => entry.noindex);
    const average = entries.length
        ? Math.round(
              entries.reduce((sum, entry) => sum + entry.seo_score, 0) /
                  entries.length,
          )
        : 0;
    return (
        <AdminLayout
            title="Good work deserves to be found."
            subtitle="The right details help the right people find your website."
            actions={
                <a className="button secondary" href="/sitemap.xml">
                    View sitemap
                    <ArrowUpRight size={16} />
                </a>
            }
        >
            <div className="seo-cards">
                <section className="panel seo-summary">
                    <span className="stat-icon sage">
                        <ScanSearch size={22} />
                    </span>
                    <strong>
                        {average}
                        <small>/100</small>
                    </strong>
                    <h2>Metadata completeness</h2>
                    <p>A simple checklist, not a search ranking prediction.</p>
                </section>
                <section className="panel seo-summary">
                    <span className="stat-icon peach">
                        <Globe size={22} />
                    </span>
                    <strong>{missing.length}</strong>
                    <h2>Could use a little detail</h2>
                    <p>Content missing an SEO title or meta description.</p>
                </section>
                <section className="panel seo-summary">
                    <span className="stat-icon lavender">
                        <CheckCircle2 size={22} />
                    </span>
                    <strong>{noindex.length}</strong>
                    <h2>Intentionally private</h2>
                    <p>Content marked noindex and excluded from the sitemap.</p>
                </section>
            </div>
            <section className="panel">
                <div className="panel-heading">
                    <div>
                        <h2>The details that matter.</h2>
                        <p>
                            Each check contributes 25 points: title,
                            description, excerpt, and substantial body copy.
                        </p>
                    </div>
                </div>
                {entries.length ? (
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>CONTENT</th>
                                    <th>STATUS</th>
                                    <th>TITLE</th>
                                    <th>DESCRIPTION</th>
                                    <th>INDEXING</th>
                                    <th>CHECKLIST</th>
                                </tr>
                            </thead>
                            <tbody>
                                {entries.map((entry) => (
                                    <tr key={entry.id}>
                                        <td>
                                            <Link
                                                className="text-link"
                                                href={`/admin/content/${entry.id}/edit`}
                                            >
                                                {entry.title}
                                                <ArrowUpRight size={14} />
                                            </Link>
                                        </td>
                                        <td>
                                            <Badge status={entry.status} />
                                        </td>
                                        <td>
                                            <span
                                                className={
                                                    entry.seo_title
                                                        ? "check-good"
                                                        : "check-missing"
                                                }
                                            >
                                                {entry.seo_title
                                                    ? "Added"
                                                    : "Missing"}
                                            </span>
                                        </td>
                                        <td>
                                            <span
                                                className={
                                                    entry.seo_description
                                                        ? "check-good"
                                                        : "check-missing"
                                                }
                                            >
                                                {entry.seo_description
                                                    ? "Added"
                                                    : "Missing"}
                                            </span>
                                        </td>
                                        <td className="muted">
                                            {entry.noindex
                                                ? "Noindex"
                                                : "Allowed when public"}
                                        </td>
                                        <td>
                                            <span
                                                className={`seo-indicator ${entry.seo_score >= 75 ? "good" : "needs-work"}`}
                                            >
                                                <i />
                                                {entry.seo_score}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <Empty />
                )}
            </section>
            <div className="info-note seo-note">
                <CheckCircle2 size={20} />
                <p>
                    Public pages use server rendering, canonical links, Open
                    Graph tags, structured data, and a generated XML sitemap.
                    Drafts and future publications stay private. Search engines
                    decide whether and when to index a page.
                </p>
            </div>
        </AdminLayout>
    );
}
