import React from "react";
import { Link } from "@inertiajs/react";
import {
    ArrowLeft,
    ArrowRight,
    FileText,
    Image as ImageIcon,
    Plus,
} from "lucide-react";

export const date = (value) =>
    value
        ? new Intl.DateTimeFormat("en", {
              dateStyle: "medium",
              timeZone: "UTC",
          }).format(new Date(value))
        : "Not scheduled";
export const money = (cents, currency = "INR") =>
    new Intl.NumberFormat("en", {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
    }).format(cents / 100);
export const slugify = (value) =>
    value
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

export function Button({
    href,
    children,
    secondary,
    small,
    className = "",
    ...props
}) {
    const classes = `button ${secondary ? "secondary" : ""} ${small ? "small" : ""} ${className}`;
    return href ? (
        <Link href={href} className={classes} {...props}>
            {children}
        </Link>
    ) : (
        <button className={classes} {...props}>
            {children}
        </button>
    );
}
export function Badge({ status }) {
    return (
        <span className={`badge ${status}`}>
            <i />
            {status}
        </span>
    );
}
export function Field({ label, error, hint, children, className = "" }) {
    return (
        <label className={`field ${className}`}>
            <span className="field-label">{label}</span>
            {children}
            {hint && <small>{hint}</small>}
            {error && (
                <span className="field-error" role="alert">
                    {error}
                </span>
            )}
        </label>
    );
}
export function Empty({
    title = "A fresh start.",
    text = "Your content will appear here.",
    href,
    action = "Create content",
}) {
    return (
        <div className="empty-state">
            <span className="empty-icon">
                <FileText size={26} />
            </span>
            <h3>{title}</h3>
            <p>{text}</p>
            {href && (
                <Button href={href} small>
                    <Plus size={16} />
                    {action}
                </Button>
            )}
        </div>
    );
}
export function Pagination({ paginator }) {
    if (paginator.last_page <= 1) return null;
    return (
        <div className="pagination">
            <span>
                Page {paginator.current_page} of {paginator.last_page} ·{" "}
                {paginator.total} results
            </span>
            <div>
                {paginator.prev_page_url && (
                    <Button secondary small href={paginator.prev_page_url}>
                        <ArrowLeft size={15} />
                        Previous
                    </Button>
                )}
                {paginator.next_page_url && (
                    <Button secondary small href={paginator.next_page_url}>
                        Next
                        <ArrowRight size={15} />
                    </Button>
                )}
            </div>
        </div>
    );
}
export function Cover({ media, className = "" }) {
    return media?.mime?.startsWith("image/") ? (
        <img
            className={`cover ${className}`}
            src={media.url}
            alt={media.alt || ""}
            loading="lazy"
        />
    ) : (
        <div className={`cover cover-placeholder ${className}`}>
            <ImageIcon size={24} />
        </div>
    );
}
export function CreateMenu() {
    return (
        <details className="create-menu">
            <summary className="button">
                <Plus size={17} />
                Create new
            </summary>
            <div className="dropdown">
                {[
                    ["page", "Website page"],
                    ["post", "Journal article"],
                    ["product", "Store product"],
                ].map(([type, title]) => (
                    <Link
                        key={type}
                        href={`/admin/content/create?type=${type}`}
                    >
                        <Plus size={15} />
                        {title}
                    </Link>
                ))}
            </div>
        </details>
    );
}
