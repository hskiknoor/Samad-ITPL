import React from "react";
import { Link, router, useForm, usePage } from "@inertiajs/react";
import { ArrowLeft, ArrowRight, Minus, Plus, Trash2 } from "lucide-react";
import SiteLayout from "../../Components/SiteLayout";
import { Cover, Field, money } from "../../Components/UI";

export default function Cart({ items, total, checkoutToken }) {
    const { site } = usePage().props;
    const form = useForm({
        name: "",
        email: "",
        address: "",
        checkout_token: checkoutToken,
    });
    return (
        <SiteLayout noindex>
            <section className="site-page-intro">
                <span className="site-eyebrow">A FEW GOOD CHOICES</span>
                <h1>Your little bag.</h1>
                <p>Good things, ready for their next home.</p>
            </section>
            <section className="public-cart">
                {items.length ? (
                    <div className="cart-layout">
                        <div>
                            <div className="cart-items">
                                {items.map(({ entry, quantity }) => (
                                    <article
                                        className="cart-item"
                                        key={entry.id}
                                    >
                                        <Cover media={entry.media} />
                                        <div>
                                            <h2>
                                                <Link href={entry.public_path}>
                                                    {entry.title}
                                                </Link>
                                            </h2>
                                            <span>
                                                {money(
                                                    entry.price_cents,
                                                    site.currency,
                                                )}{" "}
                                                each
                                            </span>
                                            <div className="quantity-control">
                                                <button
                                                    aria-label={`Decrease quantity of ${entry.title}`}
                                                    disabled={quantity <= 1}
                                                    onClick={() =>
                                                        router.patch(
                                                            `/cart/${entry.id}`,
                                                            {
                                                                quantity:
                                                                    quantity -
                                                                    1,
                                                            },
                                                            {
                                                                preserveScroll: true,
                                                            },
                                                        )
                                                    }
                                                >
                                                    <Minus size={13} />
                                                </button>
                                                <span>{quantity}</span>
                                                <button
                                                    aria-label={`Increase quantity of ${entry.title}`}
                                                    disabled={
                                                        quantity >=
                                                        Math.min(
                                                            99,
                                                            entry.stock,
                                                        )
                                                    }
                                                    onClick={() =>
                                                        router.patch(
                                                            `/cart/${entry.id}`,
                                                            {
                                                                quantity:
                                                                    quantity +
                                                                    1,
                                                            },
                                                            {
                                                                preserveScroll: true,
                                                            },
                                                        )
                                                    }
                                                >
                                                    <Plus size={13} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="cart-item-right">
                                            <strong>
                                                {money(
                                                    entry.price_cents *
                                                        quantity,
                                                    site.currency,
                                                )}
                                            </strong>
                                            <button
                                                className="icon-button"
                                                aria-label={`Remove ${entry.title}`}
                                                onClick={() =>
                                                    router.delete(
                                                        `/cart/${entry.id}`,
                                                        {
                                                            preserveScroll: true,
                                                        },
                                                    )
                                                }
                                            >
                                                <Trash2 size={17} />
                                            </button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                            <div className="cart-total">
                                <span>Subtotal</span>
                                <strong>{money(total, site.currency)}</strong>
                            </div>
                            <p className="small-text muted">
                                This is a manual order request. Shipping,
                                applicable taxes, and payment will be confirmed
                                by our team before fulfilment.
                            </p>
                            <Link href="/shop" className="site-text-link">
                                <ArrowLeft size={16} />
                                Keep exploring
                            </Link>
                        </div>
                        <form
                            className="checkout-form"
                            onSubmit={(event) => {
                                event.preventDefault();
                                form.post("/checkout");
                            }}
                        >
                            <span className="site-eyebrow">
                                ONE LAST LITTLE DETAIL
                            </span>
                            <h2>Make it yours.</h2>
                            <p>Tell us where your order is headed.</p>
                            <Field label="FULL NAME" error={form.errors.name}>
                                <input
                                    required
                                    autoComplete="name"
                                    value={form.data.name}
                                    onChange={(event) =>
                                        form.setData("name", event.target.value)
                                    }
                                    maxLength={100}
                                />
                            </Field>
                            <Field label="EMAIL" error={form.errors.email}>
                                <input
                                    required
                                    type="email"
                                    autoComplete="email"
                                    value={form.data.email}
                                    onChange={(event) =>
                                        form.setData(
                                            "email",
                                            event.target.value,
                                        )
                                    }
                                    maxLength={180}
                                />
                            </Field>
                            <Field
                                label="DELIVERY ADDRESS"
                                error={form.errors.address}
                            >
                                <textarea
                                    required
                                    autoComplete="street-address"
                                    minLength={10}
                                    maxLength={1000}
                                    rows={4}
                                    value={form.data.address}
                                    onChange={(event) =>
                                        form.setData(
                                            "address",
                                            event.target.value,
                                        )
                                    }
                                />
                            </Field>
                            <button
                                className="site-button"
                                disabled={form.processing}
                            >
                                {form.processing
                                    ? "Submitting…"
                                    : "Submit order request"}
                                <ArrowRight size={18} />
                            </button>
                            <p className="small-text muted">
                                No payment is collected here. Your details are
                                used to process and confirm this order.
                            </p>
                        </form>
                    </div>
                ) : (
                    <div className="public-empty">
                        <h2>A little room for something good.</h2>
                        <p>Your bag is empty. Let’s find you something.</p>
                        <Link className="site-button" href="/shop">
                            Explore the shop
                            <ArrowUpRightIcon />
                        </Link>
                    </div>
                )}
            </section>
        </SiteLayout>
    );
}
function ArrowUpRightIcon() {
    return <ArrowRight size={18} />;
}
