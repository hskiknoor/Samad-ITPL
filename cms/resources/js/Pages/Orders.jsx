import React from "react";
import { router } from "@inertiajs/react";
import { ChevronDown, Package } from "lucide-react";
import AdminLayout from "../Components/AdminLayout";
import {
    Badge,
    Button,
    date,
    Empty,
    money,
    Pagination,
} from "../Components/UI";

export default function Orders({ orders }) {
    return (
        <AdminLayout
            title="From your shop, with care."
            subtitle="Keep every order moving in the right direction."
        >
            <div className="info-note">
                Orders are submitted for manual confirmation. Payment, shipping
                rates, and tax services are not connected.
            </div>
            {orders.data.length ? (
                <>
                    <div className="order-list">
                        {orders.data.map((order) => (
                            <details
                                className="panel order-card"
                                key={order.id}
                            >
                                <summary>
                                    <span className="quick-icon sage">
                                        <Package size={21} />
                                    </span>
                                    <div>
                                        <strong>
                                            Order #
                                            {String(order.id).padStart(4, "0")}
                                        </strong>
                                        <small>
                                            {order.name} ·{" "}
                                            {date(order.created_at)}
                                        </small>
                                    </div>
                                    <strong>
                                        {money(
                                            order.total_cents,
                                            order.currency,
                                        )}
                                    </strong>
                                    <Badge status={order.status} />
                                    <ChevronDown size={18} />
                                </summary>
                                <div className="order-body">
                                    <div className="order-info">
                                        <p>
                                            <strong>Customer</strong>
                                            <span>
                                                {order.name}
                                                <br />
                                                {order.email}
                                            </span>
                                        </p>
                                        <p>
                                            <strong>Delivery address</strong>
                                            <span className="pre-line">
                                                {order.address}
                                            </span>
                                        </p>
                                        <p>
                                            <strong>Reference</strong>
                                            <code>{order.reference}</code>
                                        </p>
                                    </div>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>ITEM</th>
                                                <th>QUANTITY</th>
                                                <th>UNIT PRICE</th>
                                                <th>SUBTOTAL</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {order.items.map((item, i) => (
                                                <tr key={i}>
                                                    <td>{item.title}</td>
                                                    <td>{item.quantity}</td>
                                                    <td>
                                                        {money(
                                                            item.price_cents,
                                                            order.currency,
                                                        )}
                                                    </td>
                                                    <td>
                                                        {money(
                                                            item.price_cents *
                                                                item.quantity,
                                                            order.currency,
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {!["completed", "cancelled"].includes(
                                        order.status,
                                    ) && (
                                        <div className="order-actions">
                                            {[
                                                "processing",
                                                "completed",
                                                "cancelled",
                                            ]
                                                .filter(
                                                    (status) =>
                                                        status !== order.status,
                                                )
                                                .map((status) => (
                                                    <Button
                                                        secondary={
                                                            status !==
                                                            "processing"
                                                        }
                                                        small
                                                        key={status}
                                                        onClick={() => {
                                                            if (
                                                                window.confirm(
                                                                    `Mark this order as ${status}?${status === "cancelled" ? " Reserved stock will be restored." : ""}`,
                                                                )
                                                            )
                                                                router.patch(
                                                                    `/admin/orders/${order.id}`,
                                                                    { status },
                                                                    {
                                                                        preserveScroll: true,
                                                                    },
                                                                );
                                                        }}
                                                    >
                                                        {status === "processing"
                                                            ? "Start processing"
                                                            : status ===
                                                                "completed"
                                                              ? "Mark completed"
                                                              : "Cancel order"}
                                                    </Button>
                                                ))}
                                        </div>
                                    )}
                                </div>
                            </details>
                        ))}
                    </div>
                    <Pagination paginator={orders} />
                </>
            ) : (
                <section className="panel">
                    <Empty
                        title="Your next order is on its way."
                        text="Orders submitted through your store will appear here."
                        href="/shop"
                        action="Visit your shop"
                    />
                </section>
            )}
        </AdminLayout>
    );
}
