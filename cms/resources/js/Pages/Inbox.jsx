import React from "react";
import { router } from "@inertiajs/react";
import { Archive, Check, Mail } from "lucide-react";
import AdminLayout from "../Components/AdminLayout";
import { Badge, Button, date, Empty, Pagination } from "../Components/UI";

export default function Inbox({ submissions }) {
    return (
        <AdminLayout
            title="A little hello can go a long way."
            subtitle="Messages sent through your website’s contact form."
        >
            {submissions.data.length ? (
                <>
                    <div className="inbox-list">
                        {submissions.data.map((message) => (
                            <article
                                className={`panel message-card ${message.status}`}
                                key={message.id}
                            >
                                <div className="message-heading">
                                    <span className="avatar">
                                        {message.name.slice(0, 1)}
                                    </span>
                                    <div>
                                        <strong>{message.name}</strong>
                                        <a href={`mailto:${message.email}`}>
                                            {message.email}
                                        </a>
                                    </div>
                                    <span className="muted small-text">
                                        {date(message.created_at)}
                                    </span>
                                    <Badge status={message.status} />
                                </div>
                                <p className="pre-line message-text">
                                    {message.message}
                                </p>
                                <div className="message-actions">
                                    {message.status !== "read" && (
                                        <Button
                                            secondary
                                            small
                                            onClick={() =>
                                                router.patch(
                                                    `/admin/inbox/${message.id}`,
                                                    { status: "read" },
                                                    { preserveScroll: true },
                                                )
                                            }
                                        >
                                            <Check size={15} />
                                            Mark as read
                                        </Button>
                                    )}
                                    {message.status !== "archived" && (
                                        <Button
                                            secondary
                                            small
                                            onClick={() =>
                                                router.patch(
                                                    `/admin/inbox/${message.id}`,
                                                    { status: "archived" },
                                                    { preserveScroll: true },
                                                )
                                            }
                                        >
                                            <Archive size={15} />
                                            Archive
                                        </Button>
                                    )}
                                    {message.status === "archived" && (
                                        <Button
                                            secondary
                                            small
                                            onClick={() =>
                                                router.patch(
                                                    `/admin/inbox/${message.id}`,
                                                    { status: "unread" },
                                                    { preserveScroll: true },
                                                )
                                            }
                                        >
                                            Move to inbox
                                        </Button>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                    <Pagination paginator={submissions} />
                </>
            ) : (
                <section className="panel">
                    <Empty
                        title="A quiet little inbox."
                        text="Messages from your contact page will land here."
                    />
                </section>
            )}
        </AdminLayout>
    );
}
