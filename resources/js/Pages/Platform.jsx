import React, { useState } from "react";
import { Link, router, useForm } from "@inertiajs/react";
import {
    ArrowUpRight,
    Boxes,
    Check,
    Download,
    Globe,
    Plus,
    Save,
    ShieldCheck,
    Sparkles,
    Trash2,
} from "lucide-react";
import AdminLayout from "../Components/AdminLayout";
import { Button, Field } from "../Components/UI";

export default function Platform({
    tab,
    settings,
    assistant,
    keyConfigured,
    redirects,
    media,
    pages,
}) {
    const modules = useForm({ modules: settings.modules });
    const discovery = useForm({
        home_page_id: settings.home_page_id || "",
        seo_keywords: settings.seo_keywords || "",
        google_verification: settings.google_verification || "",
        bing_verification: settings.bing_verification || "",
        robots_disallow: settings.robots_disallow || [],
        social_image_id: settings.social_image_id || "",
    });
    const [robotsText, setRobotsText] = useState(
        settings.robots_disallow.join("\n"),
    );
    const ai = useForm({ ...assistant, model: assistant.model || "" });
    const redirect = useForm({ from_path: "", to_path: "/", status: 301 });
    const options = [
        [
            "business",
            "Business website",
            "Website pages, flexible content sections, service information, and landing pages.",
        ],
        [
            "publishing",
            "Publishing & journal",
            "Articles, categories, tags, scheduled publishing, and an RSS feed.",
        ],
        [
            "commerce",
            "E-commerce catalog",
            "Products, inventory, shopping bag, and manual order requests.",
        ],
        [
            "reports",
            "Reports & resources",
            "Publish downloadable resources or assign a private document to a customer.",
        ],
        [
            "assistant",
            "Website assistant",
            "Search website knowledge, discover downloads, and access your own account records.",
        ],
    ];
    return (
        <AdminLayout
            title="One foundation. Your possibilities."
            subtitle="Choose the modules and discovery tools each client needs."
        >
            <div className="platform-tabs tabs">
                {[
                    ["modules", "Modules"],
                    ["discovery", "Search & discovery"],
                    ["assistant", "AI integration"],
                    ["redirects", "Redirects"],
                ].map(([key, label]) => (
                    <Link
                        key={key}
                        className={tab === key ? "selected" : ""}
                        href={`/admin/platform?tab=${key}`}
                    >
                        {label}
                    </Link>
                ))}
            </div>
            {tab === "modules" && (
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        modules.put("/admin/platform/modules");
                    }}
                >
                    <div className="module-grid">
                        {options.map(([key, title, text]) => (
                            <label
                                className={`panel module-card ${modules.data.modules[key] ? "enabled" : ""}`}
                                key={key}
                            >
                                <span className="module-icon">
                                    <Boxes size={23} />
                                </span>
                                <input
                                    type="checkbox"
                                    checked={modules.data.modules[key]}
                                    onChange={(event) =>
                                        modules.setData("modules", {
                                            ...modules.data.modules,
                                            [key]: event.target.checked,
                                        })
                                    }
                                />
                                <h2>{title}</h2>
                                <p>{text}</p>
                                <span className="module-state">
                                    {modules.data.modules[key]
                                        ? "Enabled"
                                        : "Disabled"}
                                </span>
                            </label>
                        ))}
                    </div>
                    <div className="platform-actions">
                        <p>
                            Disabling a module hides its public routes and
                            content. Your saved content and existing customer
                            order history are kept.
                        </p>
                        <Button disabled={modules.processing}>
                            <Save size={16} />
                            Save modules
                        </Button>
                    </div>
                </form>
            )}
            {tab === "discovery" && (
                <div className="two-column">
                    <form
                        className="panel settings-panel"
                        onSubmit={(event) => {
                            event.preventDefault();
                            discovery.transform((values) => ({
                                ...values,
                                robots_disallow: robotsText
                                    .split("\n")
                                    .map((value) => value.trim())
                                    .filter(Boolean),
                            }));
                            discovery.put("/admin/platform/discovery");
                        }}
                    >
                        <div className="section-intro">
                            <h2>A website ready to be discovered.</h2>
                            <p>
                                Control site-wide metadata and search engine
                                discovery.
                            </p>
                        </div>
                        <Field
                            label="CUSTOM HOMEPAGE"
                            hint="Choose a published page built with content sections, or use the default landing page."
                        >
                            <select
                                value={discovery.data.home_page_id}
                                onChange={(event) =>
                                    discovery.setData(
                                        "home_page_id",
                                        event.target.value,
                                    )
                                }
                            >
                                <option value="">Default landing page</option>
                                {pages.map((page) => (
                                    <option key={page.id} value={page.id}>
                                        {page.title}
                                    </option>
                                ))}
                            </select>
                        </Field>
                        <Field
                            label="DEFAULT META KEYWORDS"
                            hint="Comma separated. Supported for completeness; Google does not use keywords as a ranking signal."
                        >
                            <input
                                value={discovery.data.seo_keywords}
                                onChange={(event) =>
                                    discovery.setData(
                                        "seo_keywords",
                                        event.target.value,
                                    )
                                }
                                maxLength={1000}
                            />
                        </Field>
                        <Field label="DEFAULT SOCIAL IMAGE">
                            <select
                                value={discovery.data.social_image_id}
                                onChange={(event) =>
                                    discovery.setData(
                                        "social_image_id",
                                        event.target.value,
                                    )
                                }
                            >
                                <option value="">No default image</option>
                                {media.map((image) => (
                                    <option key={image.id} value={image.id}>
                                        {image.name}
                                    </option>
                                ))}
                            </select>
                        </Field>
                        <div className="field-grid">
                            <Field label="GOOGLE VERIFICATION TOKEN">
                                <input
                                    value={discovery.data.google_verification}
                                    onChange={(event) =>
                                        discovery.setData(
                                            "google_verification",
                                            event.target.value,
                                        )
                                    }
                                    maxLength={255}
                                />
                            </Field>
                            <Field label="BING VERIFICATION TOKEN">
                                <input
                                    value={discovery.data.bing_verification}
                                    onChange={(event) =>
                                        discovery.setData(
                                            "bing_verification",
                                            event.target.value,
                                        )
                                    }
                                    maxLength={255}
                                />
                            </Field>
                        </div>
                        <Field
                            label="ADDITIONAL ROBOTS DISALLOW PATHS"
                            hint="One path per line. Account, admin, checkout, and private routes are already excluded."
                        >
                            <textarea
                                rows={5}
                                value={robotsText}
                                onChange={(event) =>
                                    setRobotsText(event.target.value)
                                }
                                placeholder="/internal-preview"
                            />
                        </Field>
                        <Button disabled={discovery.processing}>
                            <Save size={16} />
                            Save discovery settings
                        </Button>
                    </form>
                    <section className="panel side-panel">
                        <h2>Your discovery files.</h2>
                        <div className="discovery-links">
                            {[
                                ["/sitemap.xml", "XML sitemap"],
                                ["/robots.txt", "Robots rules"],
                                ["/llms.txt", "LLM content index"],
                                ["/llms-full.txt", "LLM expanded content"],
                                ["/feed.xml", "Journal RSS feed"],
                            ].map(([url, title]) => (
                                <a href={url} key={url}>
                                    {title}
                                    <ArrowUpRight size={16} />
                                </a>
                            ))}
                        </div>
                        <p className="muted small-text">
                            The requested /llm.txt also redirects to /llms.txt.
                            LLM files are an emerging convention and do not
                            guarantee AI indexing or citations.
                        </p>
                    </section>
                </div>
            )}
            {tab === "assistant" && (
                <div className="two-column">
                    <form
                        className="panel settings-panel"
                        onSubmit={(event) => {
                            event.preventDefault();
                            ai.put("/admin/platform/assistant");
                        }}
                    >
                        <div className="section-intro">
                            <h2>Helpful by design.</h2>
                            <p>
                                The search assistant works now. Choose an AI
                                provider when you are ready.
                            </p>
                        </div>
                        <Field label="PROVIDER">
                            <select
                                value={ai.data.provider}
                                onChange={(event) =>
                                    ai.setData("provider", event.target.value)
                                }
                            >
                                <option value="disabled">
                                    Website search only — choose AI later
                                </option>
                                <option value="openai">
                                    OpenAI Responses API
                                </option>
                                <option value="anthropic">
                                    Anthropic Messages API
                                </option>
                            </select>
                        </Field>
                        <Field
                            label="MODEL ID"
                            hint="Use a model supported by the selected provider."
                            error={ai.errors.model}
                        >
                            <input
                                value={ai.data.model}
                                onChange={(event) =>
                                    ai.setData("model", event.target.value)
                                }
                                maxLength={100}
                                disabled={ai.data.provider === "disabled"}
                                required={ai.data.provider !== "disabled"}
                            />
                        </Field>
                        <Field label="WELCOME MESSAGE">
                            <textarea
                                rows={3}
                                value={ai.data.welcome}
                                onChange={(event) =>
                                    ai.setData("welcome", event.target.value)
                                }
                                maxLength={250}
                                required
                            />
                        </Field>
                        <Field
                            label="WEBSITE-SPECIFIC INSTRUCTIONS"
                            hint="These supplement fixed website-only and access restrictions."
                        >
                            <textarea
                                rows={5}
                                value={ai.data.instructions}
                                onChange={(event) =>
                                    ai.setData(
                                        "instructions",
                                        event.target.value,
                                    )
                                }
                                maxLength={3000}
                                required
                            />
                        </Field>
                        <Button disabled={ai.processing}>
                            <Save size={16} />
                            Save assistant settings
                        </Button>
                    </form>
                    <section className="panel side-panel">
                        <h2>Connected with care.</h2>
                        <div className="permission-note">
                            <ShieldCheck size={21} />
                            <p>
                                Credentials:{" "}
                                {keyConfigured
                                    ? "Present on the server"
                                    : "Not configured yet"}
                                . Set CMS_AI_API_KEY securely in the server
                                environment. Keys are never sent to the browser.
                            </p>
                        </div>
                        <p className="muted small-text">
                            Public visitors can search published content and
                            public reports. Customers can also search their own
                            orders and assigned reports. Downloads always
                            recheck the signed-in account.
                        </p>
                        <div className="info-note">
                            Search mode remains available if the provider is
                            unconfigured or unavailable. An AI answer is clearly
                            marked when an enabled provider responds.
                        </div>
                    </section>
                </div>
            )}
            {tab === "redirects" && (
                <div className="two-column">
                    <section className="panel">
                        <div className="panel-heading">
                            <div>
                                <h2>Keep every link useful.</h2>
                                <p>Internal 301 and 302 redirects.</p>
                            </div>
                        </div>
                        {redirects.length ? (
                            <div className="table-wrap">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>FROM</th>
                                            <th>TO</th>
                                            <th>STATUS</th>
                                            <th />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {redirects.map((item) => (
                                            <tr key={item.id}>
                                                <td>{item.from_path}</td>
                                                <td>{item.to_path}</td>
                                                <td>{item.status}</td>
                                                <td>
                                                    <button
                                                        aria-label={`Delete redirect ${item.from_path}`}
                                                        className="icon-button"
                                                        onClick={() =>
                                                            router.delete(
                                                                `/admin/redirects/${item.id}`,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="empty-state">
                                <p>
                                    No redirects yet. Create one when you change
                                    a public URL.
                                </p>
                            </div>
                        )}
                    </section>
                    <form
                        className="panel side-panel"
                        onSubmit={(event) => {
                            event.preventDefault();
                            redirect.post("/admin/redirects", {
                                onSuccess: () => redirect.reset(),
                            });
                        }}
                    >
                        <h2>A fresh direction.</h2>
                        <Field label="OLD PATH">
                            <input
                                required
                                value={redirect.data.from_path}
                                onChange={(event) =>
                                    redirect.setData(
                                        "from_path",
                                        event.target.value,
                                    )
                                }
                                placeholder="/old-service"
                            />
                        </Field>
                        <Field label="NEW PATH">
                            <input
                                required
                                value={redirect.data.to_path}
                                onChange={(event) =>
                                    redirect.setData(
                                        "to_path",
                                        event.target.value,
                                    )
                                }
                                placeholder="/pages/services"
                            />
                        </Field>
                        <Field label="REDIRECT TYPE">
                            <select
                                value={redirect.data.status}
                                onChange={(event) =>
                                    redirect.setData(
                                        "status",
                                        Number(event.target.value),
                                    )
                                }
                            >
                                <option value={301}>301 — Permanent</option>
                                <option value={302}>302 — Temporary</option>
                            </select>
                        </Field>
                        <Button disabled={redirect.processing}>
                            <Plus size={16} />
                            Create redirect
                        </Button>
                    </form>
                </div>
            )}
        </AdminLayout>
    );
}
