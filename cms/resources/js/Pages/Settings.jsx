import React, { useState } from "react";
import { useForm } from "@inertiajs/react";
import { ArrowDown, ArrowUp, Plus, Save, Trash2 } from "lucide-react";
import AdminLayout from "../Components/AdminLayout";
import { Button, Field } from "../Components/UI";

export default function Settings({ settings }) {
    const [tab, setTab] = useState("brand");
    const form = useForm(settings);
    const { data, setData, errors } = form;
    const move = (index, direction) => {
        const next = [...data.navigation];
        const target = index + direction;
        if (target < 0 || target >= next.length) return;
        [next[index], next[target]] = [next[target], next[index]];
        setData("navigation", next);
    };
    const updateLink = (index, field, value) =>
        setData(
            "navigation",
            data.navigation.map((link, i) =>
                i === index ? { ...link, [field]: value } : link,
            ),
        );
    return (
        <AdminLayout
            title="A site that feels like you."
            subtitle="Your brand, your voice, your little corner of the internet."
            actions={
                <Button
                    type="submit"
                    form="site-settings"
                    disabled={form.processing}
                >
                    <Save size={16} />
                    {form.processing ? "Saving…" : "Save settings"}
                </Button>
            }
        >
            <form
                id="site-settings"
                onSubmit={(event) => {
                    event.preventDefault();
                    form.put("/admin/settings", { preserveScroll: true });
                }}
            >
                <div className="settings-layout">
                    <aside className="settings-nav">
                        {[
                            [
                                "brand",
                                "Brand & identity",
                                "The basics that make it yours.",
                            ],
                            [
                                "homepage",
                                "Homepage",
                                "Make a good first impression.",
                            ],
                            [
                                "navigation",
                                "Navigation",
                                "Help visitors find their way.",
                            ],
                        ].map(([key, title, text]) => (
                            <button
                                key={key}
                                type="button"
                                className={tab === key ? "active" : ""}
                                onClick={() => setTab(key)}
                            >
                                <strong>{title}</strong>
                                <small>{text}</small>
                            </button>
                        ))}
                    </aside>
                    <section className="panel settings-panel">
                        {tab === "brand" && (
                            <>
                                <div className="section-intro">
                                    <h2>The start of your story.</h2>
                                    <p>
                                        These details appear throughout your
                                        website.
                                    </p>
                                </div>
                                <div className="field-grid">
                                    <Field
                                        label="SITE NAME"
                                        error={errors.name}
                                    >
                                        <input
                                            value={data.name}
                                            required
                                            maxLength={80}
                                            onChange={(event) =>
                                                setData(
                                                    "name",
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </Field>
                                    <Field
                                        label="TAGLINE"
                                        error={errors.tagline}
                                    >
                                        <input
                                            value={data.tagline}
                                            required
                                            maxLength={120}
                                            onChange={(event) =>
                                                setData(
                                                    "tagline",
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </Field>
                                </div>
                                <Field
                                    label="DEFAULT SEO DESCRIPTION"
                                    error={errors.description}
                                >
                                    <textarea
                                        rows={3}
                                        value={data.description}
                                        required
                                        maxLength={320}
                                        onChange={(event) =>
                                            setData(
                                                "description",
                                                event.target.value,
                                            )
                                        }
                                    />
                                </Field>
                                <div className="field-grid">
                                    <Field
                                        label="CONTACT EMAIL"
                                        error={errors.contact_email}
                                    >
                                        <input
                                            type="email"
                                            value={data.contact_email}
                                            required
                                            onChange={(event) =>
                                                setData(
                                                    "contact_email",
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </Field>
                                    <Field
                                        label="STORE CURRENCY"
                                        error={errors.currency}
                                        hint="Changing currency requires migrating existing products first."
                                    >
                                        <select
                                            value={data.currency}
                                            onChange={(event) =>
                                                setData(
                                                    "currency",
                                                    event.target.value,
                                                )
                                            }
                                        >
                                            {[
                                                "INR",
                                                "USD",
                                                "EUR",
                                                "GBP",
                                                "AED",
                                            ].map((value) => (
                                                <option key={value}>
                                                    {value}
                                                </option>
                                            ))}
                                        </select>
                                    </Field>
                                </div>
                                <Field
                                    label="BRAND COLOR"
                                    error={errors.accent}
                                >
                                    <div className="color-picker">
                                        <input
                                            type="color"
                                            value={data.accent}
                                            onChange={(event) =>
                                                setData(
                                                    "accent",
                                                    event.target.value,
                                                )
                                            }
                                        />
                                        <code>{data.accent}</code>
                                        <span>Used on your public website</span>
                                    </div>
                                </Field>
                                <Field
                                    label="FOOTER MESSAGE"
                                    error={errors.footer}
                                >
                                    <input
                                        required
                                        value={data.footer}
                                        maxLength={160}
                                        onChange={(event) =>
                                            setData(
                                                "footer",
                                                event.target.value,
                                            )
                                        }
                                    />
                                </Field>
                            </>
                        )}
                        {tab === "homepage" && (
                            <>
                                <div className="section-intro">
                                    <h2>Hello, world.</h2>
                                    <p>
                                        Set the tone with a clear headline and a
                                        little personality.
                                    </p>
                                </div>
                                <Field
                                    label="HERO HEADLINE"
                                    error={errors.hero_title}
                                >
                                    <textarea
                                        rows={3}
                                        value={data.hero_title}
                                        required
                                        maxLength={180}
                                        onChange={(event) =>
                                            setData(
                                                "hero_title",
                                                event.target.value,
                                            )
                                        }
                                    />
                                </Field>
                                <Field
                                    label="INTRODUCTION"
                                    error={errors.hero_subtitle}
                                >
                                    <textarea
                                        rows={5}
                                        value={data.hero_subtitle}
                                        required
                                        maxLength={500}
                                        onChange={(event) =>
                                            setData(
                                                "hero_subtitle",
                                                event.target.value,
                                            )
                                        }
                                    />
                                </Field>
                                <div className="info-note">
                                    Your latest published articles and products
                                    appear on the homepage automatically.
                                </div>
                            </>
                        )}
                        {tab === "navigation" && (
                            <>
                                <div className="section-intro">
                                    <h2>Every good journey needs a map.</h2>
                                    <p>
                                        Arrange up to 10 links in your website’s
                                        main menu. Use paths such as /journal or
                                        /pages/about.
                                    </p>
                                </div>
                                {data.navigation.map((link, index) => (
                                    <div className="navigation-row" key={index}>
                                        <span>
                                            {String(index + 1).padStart(2, "0")}
                                        </span>
                                        <Field
                                            label="LABEL"
                                            error={
                                                errors[
                                                    `navigation.${index}.label`
                                                ]
                                            }
                                        >
                                            <input
                                                value={link.label}
                                                required
                                                maxLength={40}
                                                onChange={(event) =>
                                                    updateLink(
                                                        index,
                                                        "label",
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </Field>
                                        <Field
                                            label="PATH"
                                            error={
                                                errors[
                                                    `navigation.${index}.url`
                                                ]
                                            }
                                        >
                                            <input
                                                value={link.url}
                                                required
                                                placeholder="/pages/about"
                                                onChange={(event) =>
                                                    updateLink(
                                                        index,
                                                        "url",
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </Field>
                                        <div>
                                            <button
                                                type="button"
                                                className="icon-button"
                                                disabled={index === 0}
                                                onClick={() => move(index, -1)}
                                                aria-label="Move link up"
                                            >
                                                <ArrowUp size={15} />
                                            </button>
                                            <button
                                                type="button"
                                                className="icon-button"
                                                disabled={
                                                    index ===
                                                    data.navigation.length - 1
                                                }
                                                onClick={() => move(index, 1)}
                                                aria-label="Move link down"
                                            >
                                                <ArrowDown size={15} />
                                            </button>
                                            <button
                                                type="button"
                                                className="icon-button"
                                                disabled={
                                                    data.navigation.length <= 1
                                                }
                                                onClick={() =>
                                                    setData(
                                                        "navigation",
                                                        data.navigation.filter(
                                                            (_, i) =>
                                                                i !== index,
                                                        ),
                                                    )
                                                }
                                                aria-label="Remove link"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    secondary
                                    small
                                    disabled={data.navigation.length >= 10}
                                    onClick={() =>
                                        setData("navigation", [
                                            ...data.navigation,
                                            { label: "", url: "/" },
                                        ])
                                    }
                                >
                                    <Plus size={16} />
                                    Add a link
                                </Button>
                            </>
                        )}
                    </section>
                </div>
            </form>
        </AdminLayout>
    );
}
