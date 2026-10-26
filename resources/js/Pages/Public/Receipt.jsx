import React from "react";
import { Link } from "@inertiajs/react";
import { ArrowRight, Check } from "lucide-react";
import SiteLayout from "../../Components/SiteLayout";
import { money } from "../../Components/UI";

export default function Receipt({ order }) {
    return (
        <SiteLayout noindex>
            <section className="order-receipt">
                <span className="receipt-check">
                    <Check size={30} />
                </span>
                <span className="site-eyebrow">
                    A LITTLE SOMETHING TO LOOK FORWARD TO
                </span>
                <h1>Good choice, {order.name.split(" ")[0]}.</h1>
                <p>
                    Your order request is safely with us. Our team will contact
                    you to confirm payment, delivery, and the final total. No
                    payment has been collected.
                </p>
                <div className="receipt-details">
                    <span>ORDER #{String(order.id).padStart(4, "0")}</span>
                    {order.items.map((item, i) => (
                        <div key={i}>
                            <span>
                                {item.title} × {item.quantity}
                            </span>
                            <strong>
                                {money(
                                    item.price_cents * item.quantity,
                                    order.currency,
                                )}
                            </strong>
                        </div>
                    ))}
                    <div className="receipt-total">
                        <span>Requested subtotal</span>
                        <strong>
                            {money(order.total_cents, order.currency)}
                        </strong>
                    </div>
                </div>
                <Link className="site-button" href="/shop">
                    A little more exploring
                    <ArrowRight size={18} />
                </Link>
            </section>
        </SiteLayout>
    );
}
