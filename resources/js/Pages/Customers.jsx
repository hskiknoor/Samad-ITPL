import React from "react";
import { useForm } from "@inertiajs/react";
import { KeyRound, Users } from "lucide-react";
import AdminLayout from "../Components/AdminLayout";
import { Button, date, Empty, Field } from "../Components/UI";

function Customer({ customer }) {
    const form = useForm({ password: "", password_confirmation: "" });
    return (
        <article className="panel customer-admin-card">
            <header>
                <span className="avatar">{customer.name.slice(0, 1)}</span>
                <div>
                    <strong>{customer.name}</strong>
                    <small>{customer.email}</small>
                </div>
                <span className="subtle-pill">
                    {customer.orders_count} orders
                </span>
            </header>
            <p className="muted small-text">
                Joined {date(customer.created_at)}
            </p>
            <details>
                <summary className="text-link">
                    <KeyRound size={15} />
                    Reset account password
                </summary>
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        form.patch(`/admin/customers/${customer.id}/password`, {
                            preserveScroll: true,
                            onSuccess: () => form.reset(),
                        });
                    }}
                >
                    <Field label="NEW PASSWORD" error={form.errors.password}>
                        <input
                            type="password"
                            autoComplete="new-password"
                            minLength={12}
                            value={form.data.password}
                            onChange={(event) =>
                                form.setData("password", event.target.value)
                            }
                            required
                        />
                    </Field>
                    <Field label="CONFIRM PASSWORD">
                        <input
                            type="password"
                            autoComplete="new-password"
                            minLength={12}
                            value={form.data.password_confirmation}
                            onChange={(event) =>
                                form.setData(
                                    "password_confirmation",
                                    event.target.value,
                                )
                            }
                            required
                        />
                    </Field>
                    <Button small disabled={form.processing}>
                        Reset password
                    </Button>
                    <p className="small-text muted">
                        Share the new password securely. Existing customer
                        sessions will be signed out.
                    </p>
                </form>
            </details>
        </article>
    );
}
export default function Customers({ customers }) {
    return (
        <AdminLayout
            title="The people behind your orders."
            subtitle="Customer accounts and access support, separate from your staff team."
        >
            {customers.length ? (
                <div className="customer-admin-grid">
                    {customers.map((customer) => (
                        <Customer key={customer.id} customer={customer} />
                    ))}
                </div>
            ) : (
                <section className="panel">
                    <Empty
                        title="A little space for your first customer."
                        text="Customers who register on your website will appear here."
                    />
                </section>
            )}
        </AdminLayout>
    );
}
