import React from "react";
import { Link, usePage } from "@inertiajs/react";
import { ArrowUpRight, Download, LogOut } from "lucide-react";
import SiteLayout from "../../Components/SiteLayout";
import { Badge, date, money, Pagination } from "../../Components/UI";

export default function Account({ orders }) {
    const { auth } = usePage().props;
    return (
        <SiteLayout noindex>
            <section className="site-page-intro">
                <span className="site-eyebrow">YOUR CUSTOMER SPACE</span>
                <h1>Hello, {auth.user.name.split(" ")[0]}.</h1>
                <p>Your orders and personal downloads. All in one place.</p>
                <div className="account-actions">
                    <a
                        className="site-text-link"
                        href="/account/export?format=csv"
                    >
                        <Download size={15} />
                        Orders CSV
                    </a>
                    <a
                        className="site-text-link"
                        href="/account/export?format=json"
                    >
                        <Download size={15} />
                        My data JSON
                    </a>
                    <Link
                        className="site-text-link"
                        href="/logout"
                        method="post"
                        as="button"
                    >
                        <LogOut size={15} />
                        Sign out
                    </Link>
                </div>
            </section>
            <section className="site-section">
                <div className="site-section-heading">
                    <h2>Your orders.</h2>
                    <Link className="site-text-link" href="/reports">
                        Your available reports
                        <ArrowUpRight size={16} />
                    </Link>
                </div>
                {orders.data.length ? (
                    <>
                        <div className="customer-orders">
                            {orders.data.map((order) => (
                                <Link
                                    key={order.id}
                                    href={`/account/orders/${order.id}`}
                                >
                                    <div>
                                        <strong>
                                            Order #
                                            {String(order.id).padStart(4, "0")}
                                        </strong>
                                        <small>{date(order.created_at)}</small>
                                    </div>
                                    <Badge status={order.status} />
                                    <span>
                                        {money(
                                            order.total_cents,
                                            order.currency,
                                        )}
                                    </span>
                                    <ArrowUpRight size={18} />
                                </Link>
                            ))}
                        </div>
                        <Pagination paginator={orders} />
                    </>
                ) : (
                    <p className="public-empty">
                        Orders you place while signed in will appear here. Older
                        guest orders are not linked automatically by email.
                    </p>
                )}
            </section>
        </SiteLayout>
    );
}
