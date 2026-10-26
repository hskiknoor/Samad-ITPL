import React, { useState } from "react";
import { Link, router } from "@inertiajs/react";
import { ArrowUpRight, Search } from "lucide-react";
import AdminLayout from "../Components/AdminLayout";
import {
    Badge,
    Cover,
    CreateMenu,
    date,
    Empty,
    Pagination,
} from "../Components/UI";

export default function Content({ entries, filters, counts }) {
    const [query, setQuery] = useState(filters.q || "");
    const title =
        {
            page: "Your pages.",
            post: "Your stories.",
            product: "Your products.",
        }[filters.type] || "All your content.";
    const makeUrl = (change) =>
        `/admin/content?${new URLSearchParams(Object.entries({ ...filters, ...change }).filter(([, v]) => v))}`;
    return (
        <AdminLayout
            title={title}
            subtitle="A home for every idea, from first draft to the world."
            actions={<CreateMenu />}
        >
            <section className="panel">
                <div className="content-toolbar">
                    <div className="tabs" aria-label="Content status">
                        {[
                            ["", "All content"],
                            ["published", "Published"],
                            ["draft", "Drafts"],
                            ["scheduled", "Scheduled"],
                        ].map(([status, label]) => (
                            <Link
                                key={status}
                                className={
                                    (!filters.status && !status) ||
                                    filters.status === status
                                        ? "selected"
                                        : ""
                                }
                                href={makeUrl({ status })}
                            >
                                {label}
                                {status && <span>{counts[status] || 0}</span>}
                            </Link>
                        ))}
                    </div>
                    <form
                        className="filter-search"
                        onSubmit={(event) => {
                            event.preventDefault();
                            router.get("/admin/content", {
                                ...filters,
                                q: query,
                            });
                        }}
                    >
                        <Search size={17} />
                        <input
                            aria-label="Filter content by title"
                            placeholder="Find a title…"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                        />
                    </form>
                </div>
                {entries.data.length ? (
                    <>
                        <div className="table-wrap">
                            <table className="content-table">
                                <thead>
                                    <tr>
                                        <th>TITLE</th>
                                        <th>TYPE</th>
                                        <th>STATUS</th>
                                        <th>METADATA</th>
                                        <th>UPDATED</th>
                                        <th />
                                    </tr>
                                </thead>
                                <tbody>
                                    {entries.data.map((entry) => (
                                        <tr key={entry.id}>
                                            <td>
                                                <Link
                                                    className="content-cell"
                                                    href={`/admin/content/${entry.id}/edit`}
                                                >
                                                    <Cover
                                                        media={entry.media}
                                                        className="content-thumb"
                                                    />
                                                    <span>
                                                        <strong>
                                                            {entry.title}
                                                        </strong>
                                                        <small>
                                                            /{entry.slug}
                                                        </small>
                                                    </span>
                                                </Link>
                                            </td>
                                            <td>
                                                <span className="type-label">
                                                    {entry.type === "post"
                                                        ? "Article"
                                                        : entry.type}
                                                </span>
                                            </td>
                                            <td>
                                                <Badge status={entry.status} />
                                            </td>
                                            <td>
                                                <span
                                                    className={`seo-indicator ${entry.seo_score >= 75 ? "good" : "needs-work"}`}
                                                >
                                                    <i />
                                                    {entry.seo_score}%
                                                </span>
                                            </td>
                                            <td className="muted table-date">
                                                {date(entry.updated_at)}
                                            </td>
                                            <td>
                                                <Link
                                                    href={`/admin/content/${entry.id}/edit`}
                                                    className="table-arrow"
                                                    aria-label={`Edit ${entry.title}`}
                                                >
                                                    <ArrowUpRight size={18} />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Pagination paginator={entries} />
                    </>
                ) : (
                    <Empty
                        title="A blank page. A new possibility."
                        text="Create your first piece, or try a different search."
                        href={`/admin/content/create?type=${filters.type || "post"}`}
                    />
                )}
            </section>
        </AdminLayout>
    );
}
