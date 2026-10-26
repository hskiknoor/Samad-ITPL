import React from "react";
import { Link, usePage } from "@inertiajs/react";
import {
    ArrowRight,
    ArrowUpRight,
    CalendarDays,
    Check,
    FileText,
    Globe,
    Images,
    Layers,
    Plus,
    Sparkles,
} from "lucide-react";
import AdminLayout from "../Components/AdminLayout";
import {
    Badge,
    Button,
    Cover,
    CreateMenu,
    date,
    Empty,
} from "../Components/UI";

export default function Dashboard({
    stats,
    recent,
    scheduled,
    activity,
    date: today,
}) {
    const { auth, site } = usePage().props;
    const max = Math.max(1, ...activity.map((day) => day.count));
    return (
        <AdminLayout
            title="A little overview."
            subtitle="Your content, your progress, your next big thing. All right here."
            actions={<CreateMenu />}
        >
            <section className="welcome-banner">
                <div className="welcome-copy">
                    <span className="welcome-date">
                        <span className="live-dot" />
                        {today}
                    </span>
                    <h2>
                        Good things are
                        <br />
                        taking shape<span>.</span>
                    </h2>
                    <p>
                        Welcome back, {auth.user.name.split(" ")[0]}.<br />
                        Let’s put your next idea out into the world.
                    </p>
                    <Link href="/admin/content/create?type=post">
                        Create something new <ArrowUpRight size={17} />
                    </Link>
                </div>
                <div className="welcome-art" aria-hidden="true">
                    <span className="art-orbit" />
                    <div className="art-card art-card-back">
                        <span />
                        <span />
                        <i />
                    </div>
                    <div className="art-card art-card-front">
                        <div className="art-dot" />
                        <span />
                        <span />
                        <span />
                        <div className="art-photo">
                            <i />
                            <b />
                        </div>
                    </div>
                    <div className="art-spark">✳</div>
                    <span className="art-note">
                        a space for
                        <br />
                        what’s next.
                    </span>
                </div>
                <div className="welcome-stamp">
                    <Sparkles size={16} />
                    {site.name}
                </div>
            </section>
            <section className="stats-grid" aria-label="Workspace statistics">
                {[
                    [
                        Layers,
                        "Total content",
                        stats.content,
                        `${stats.drafts} ideas in draft`,
                        "sage",
                    ],
                    [
                        Globe,
                        "Published",
                        stats.published,
                        "Live on your website",
                        "blue",
                    ],
                    [
                        Images,
                        "Media assets",
                        stats.media,
                        "Ready for your next story",
                        "peach",
                    ],
                    [
                        Sparkles,
                        "Metadata checklist",
                        `${stats.seo}%`,
                        "Average for public content",
                        "lavender",
                    ],
                ].map(([Icon, label, value, hint, color]) => (
                    <div className="stat-card" key={label}>
                        <div className="stat-top">
                            <span>{label}</span>
                            <span className={`stat-icon ${color}`}>
                                <Icon size={18} />
                            </span>
                        </div>
                        <strong>{value}</strong>
                        <p>
                            <span className="small-dot" />
                            {hint}
                        </p>
                    </div>
                ))}
            </section>
            <div className="dashboard-columns">
                <section className="panel recent-panel">
                    <div className="panel-heading">
                        <div>
                            <h2>Recently worked on</h2>
                            <p>Pick up right where you left off.</p>
                        </div>
                        <Link className="text-link" href="/admin/content">
                            All content
                            <ArrowRight size={15} />
                        </Link>
                    </div>
                    {recent.length ? (
                        <div className="table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>CONTENT</th>
                                        <th>STATUS</th>
                                        <th>LAST UPDATED</th>
                                        <th aria-label="Edit" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {recent.map((entry) => (
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
                                                            {entry.type ===
                                                            "post"
                                                                ? "Article"
                                                                : entry.type ===
                                                                    "page"
                                                                  ? "Page"
                                                                  : "Product"}{" "}
                                                            ·{" "}
                                                            {entry.author.name}
                                                        </small>
                                                    </span>
                                                </Link>
                                            </td>
                                            <td>
                                                <Badge status={entry.status} />
                                            </td>
                                            <td className="muted table-date">
                                                {date(entry.updated_at)}
                                            </td>
                                            <td>
                                                <Link
                                                    href={`/admin/content/${entry.id}/edit`}
                                                    aria-label={`Edit ${entry.title}`}
                                                    className="table-arrow"
                                                >
                                                    <ArrowUpRight size={17} />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <Empty href="/admin/content/create" />
                    )}
                </section>
                <section className="panel activity-panel">
                    <div className="panel-heading">
                        <div>
                            <h2>A week of creating</h2>
                            <p>New content in the last 7 days.</p>
                        </div>
                        <span className="subtle-pill">This week</span>
                    </div>
                    <div className="chart-total">
                        <strong>
                            {activity.reduce((n, day) => n + day.count, 0)}
                        </strong>
                        <span>pieces created</span>
                    </div>
                    <div className="bar-chart" aria-label="Daily new content">
                        {activity.map((day, i) => (
                            <div className="chart-column" key={day.label}>
                                <div
                                    className={`chart-bar ${i === 6 ? "today" : ""}`}
                                    style={{
                                        height: `${Math.max(4, (day.count / max) * 110)}px`,
                                    }}
                                    title={`${day.label}: ${day.count} pieces`}
                                >
                                    <span>{day.count}</span>
                                </div>
                                <small>{day.label}</small>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
            <div className="dashboard-bottom">
                <section className="panel quick-start">
                    <div className="panel-heading">
                        <div>
                            <h2>Make it yours.</h2>
                            <p>Small steps for a site that feels like you.</p>
                        </div>
                        <span className="round-icon">
                            <Sparkles size={20} />
                        </span>
                    </div>
                    <div className="quick-links">
                        <Link href="/admin/content/create?type=page">
                            <span className="quick-icon sage">
                                <FileText size={20} />
                            </span>
                            <div>
                                <strong>Build your next page</strong>
                                <p>Give your ideas a place to live.</p>
                            </div>
                            <ArrowUpRight size={18} />
                        </Link>
                        <Link href="/admin/media">
                            <span className="quick-icon peach">
                                <Images size={20} />
                            </span>
                            <div>
                                <strong>Curate your media</strong>
                                <p>A library full of possibilities.</p>
                            </div>
                            <ArrowUpRight size={18} />
                        </Link>
                        <Link href="/admin/seo">
                            <span className="quick-icon lavender">
                                <Globe size={20} />
                            </span>
                            <div>
                                <strong>Get found, naturally</strong>
                                <p>Give every page the right details.</p>
                            </div>
                            <ArrowUpRight size={18} />
                        </Link>
                    </div>
                </section>
                <section className="panel schedule-panel">
                    <div className="panel-heading">
                        <div>
                            <h2>Coming up next</h2>
                            <p>Your scheduled content.</p>
                        </div>
                        <CalendarDays size={19} />
                    </div>
                    {scheduled.length ? (
                        scheduled.map((entry) => (
                            <Link
                                key={entry.id}
                                href={`/admin/content/${entry.id}/edit`}
                                className="scheduled-item"
                            >
                                <span className="schedule-day">
                                    {new Date(entry.published_at).getUTCDate()}
                                </span>
                                <div>
                                    <strong>{entry.title}</strong>
                                    <small>
                                        {date(entry.published_at)} · UTC
                                    </small>
                                </div>
                                <ArrowUpRight size={16} />
                            </Link>
                        ))
                    ) : (
                        <div className="schedule-empty">
                            <CalendarDays size={24} />
                            <p>A little breathing room.</p>
                            <span>
                                Nothing scheduled yet. Your next idea can start
                                today.
                            </span>
                        </div>
                    )}
                </section>
            </div>
        </AdminLayout>
    );
}
