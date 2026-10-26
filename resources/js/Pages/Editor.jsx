import React, { useRef, useState } from "react";
import { Link, router, useForm } from "@inertiajs/react";
import {
    ArrowLeft,
    ArrowUpRight,
    Bold,
    Heading2,
    Italic,
    Link as LinkIcon,
    List,
    Save,
    Trash2,
} from "lucide-react";
import BlocksEditor from "../Components/BlocksEditor";
import AdminLayout from "../Components/AdminLayout";
import { Button, Cover, date, Field, slugify } from "../Components/UI";

export default function Editor({ entry, type, categories, media, revisions }) {
    const [tab, setTab] = useState("content");
    const [slugEdited, setSlugEdited] = useState(Boolean(entry));
    const [tagsText, setTagsText] = useState(entry?.tags?.join(", ") || "");
    const textarea = useRef(null);
    const form = useForm({
        type,
        title: entry?.title || "",
        slug: entry?.slug || "",
        status: entry?.status || "draft",
        excerpt: entry?.excerpt || "",
        body: entry?.body || "",
        category_id: entry?.category_id || "",
        media_id: entry?.media_id || "",
        tags: entry?.tags || [],
        blocks: (entry?.blocks || []).map((block) => ({
            ...block,
            heading: block.heading || "",
            body: block.body || "",
            items: block.items || [],
            button_label: block.button_label || "",
            button_url: block.button_url || "",
        })),
        seo_keywords: entry?.seo_keywords || "",
        canonical_url: entry?.canonical_url || "",
        seo_title: entry?.seo_title || "",
        seo_description: entry?.seo_description || "",
        noindex: entry?.noindex || false,
        published_at: entry?.published_at?.slice(0, 16) || "",
        price_cents: entry?.price_cents || 0,
        stock: entry?.stock || 0,
    });
    const { data, setData, errors, processing } = form;
    const submit = (event) => {
        event.preventDefault();
        form.transform((values) => ({
            ...values,
            tags: tagsText
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean),
        }));
        entry
            ? form.put(`/admin/content/${entry.id}`, { preserveScroll: true })
            : form.post("/admin/content");
    };
    const insert = (text) => {
        const el = textarea.current;
        const start = el?.selectionStart ?? data.body.length;
        const end = el?.selectionEnd ?? start;
        setData(
            "body",
            data.body.slice(0, start) + text + data.body.slice(end),
        );
        el?.focus();
    };
    const words = data.body.trim() ? data.body.trim().split(/\s+/).length : 0;
    const chosenMedia = media.find((item) => item.id === Number(data.media_id));
    return (
        <AdminLayout
            title={entry ? "Make it a little better." : "Start with an idea."}
            subtitle={`${entry ? "Edit" : "Create"} your ${type === "post" ? "article" : type}. Great things start here.`}
            actions={
                <>
                    <Button href={`/admin/content?type=${type}`} secondary>
                        <ArrowLeft size={16} />
                        Back
                    </Button>
                    <button
                        className="button"
                        type="submit"
                        form="content-editor"
                        disabled={processing}
                    >
                        <Save size={16} />
                        {processing ? "Saving…" : "Save changes"}
                    </button>
                </>
            }
        >
            <form id="content-editor" onSubmit={submit} className="editor-grid">
                <section className="panel editor-main">
                    <div className="tabs editor-tabs">
                        {[
                            ["content", "Content"],
                            ["sections", "Sections"],
                            ["seo", "Search & social"],
                            ["history", "Revision history"],
                        ].map(([key, label]) => (
                            <button
                                type="button"
                                key={key}
                                className={tab === key ? "selected" : ""}
                                onClick={() => setTab(key)}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                    {tab === "content" && (
                        <div className="editor-fields">
                            <Field label="TITLE" error={errors.title}>
                                <input
                                    className="title-input"
                                    autoFocus={!entry}
                                    placeholder="A title worth reading…"
                                    maxLength={180}
                                    value={data.title}
                                    onChange={(event) => {
                                        const title = event.target.value;
                                        setData((values) => ({
                                            ...values,
                                            title,
                                            ...(!slugEdited
                                                ? { slug: slugify(title) }
                                                : {}),
                                        }));
                                    }}
                                    required
                                />
                            </Field>
                            <Field label="URL SLUG" error={errors.slug}>
                                <div className="slug-input">
                                    <span>
                                        /
                                        {type === "post"
                                            ? "journal"
                                            : type === "product"
                                              ? "shop"
                                              : "pages"}
                                        /
                                    </span>
                                    <input
                                        value={data.slug}
                                        onChange={(event) => {
                                            setSlugEdited(true);
                                            setData("slug", event.target.value);
                                        }}
                                        required
                                        pattern="[a-z0-9]+(-[a-z0-9]+)*"
                                    />
                                </div>
                            </Field>
                            <Field
                                label="EXCERPT"
                                error={errors.excerpt}
                                hint="A short introduction for cards, listings, and curious readers."
                            >
                                <textarea
                                    rows={3}
                                    maxLength={1000}
                                    placeholder="What’s the story in a sentence or two?"
                                    value={data.excerpt}
                                    onChange={(event) =>
                                        setData("excerpt", event.target.value)
                                    }
                                />
                            </Field>
                            <div className="body-editor">
                                <div className="format-toolbar">
                                    {[
                                        [
                                            Heading2,
                                            "Insert heading",
                                            "## Your heading\n",
                                        ],
                                        [
                                            Bold,
                                            "Insert bold text",
                                            "**bold text**",
                                        ],
                                        [
                                            Italic,
                                            "Insert italic text",
                                            "*italic text*",
                                        ],
                                        [
                                            LinkIcon,
                                            "Insert link",
                                            "[link text](/contact)",
                                        ],
                                        [
                                            List,
                                            "Insert list",
                                            "\n- First item\n- Second item\n",
                                        ],
                                    ].map(([Icon, label, text]) => (
                                        <button
                                            key={label}
                                            type="button"
                                            aria-label={label}
                                            title={label}
                                            onClick={() => insert(text)}
                                        >
                                            <Icon size={17} />
                                        </button>
                                    ))}
                                    <span>Markdown</span>
                                </div>
                                <textarea
                                    ref={textarea}
                                    aria-label="Content body"
                                    rows={17}
                                    placeholder="Tell your story. Use ## headings, **bold**, lists, and links."
                                    value={data.body}
                                    onChange={(event) =>
                                        setData("body", event.target.value)
                                    }
                                />
                                <div className="editor-status">
                                    <span>
                                        {words} words ·{" "}
                                        {Math.max(1, Math.ceil(words / 200))}{" "}
                                        min read
                                    </span>
                                    <span>HTML is safely filtered</span>
                                </div>
                            </div>
                        </div>
                    )}
                    {tab === "sections" && (
                        <BlocksEditor
                            blocks={data.blocks}
                            onChange={(blocks) => setData("blocks", blocks)}
                        />
                    )}
                    {tab === "seo" && (
                        <div className="editor-fields">
                            <div className="section-intro">
                                <h2>A good first impression.</h2>
                                <p>
                                    Help search engines and readers understand
                                    this page.
                                </p>
                            </div>
                            <Field
                                label="META KEYWORDS"
                                hint="Comma separated. Google does not use this as a ranking signal."
                            >
                                <input
                                    maxLength={1000}
                                    value={data.seo_keywords}
                                    onChange={(event) =>
                                        setData(
                                            "seo_keywords",
                                            event.target.value,
                                        )
                                    }
                                />
                            </Field>
                            <Field
                                label="CANONICAL URL OVERRIDE"
                                error={errors.canonical_url}
                                hint="Leave blank for the automatically generated page URL."
                            >
                                <input
                                    type="url"
                                    maxLength={2048}
                                    value={data.canonical_url}
                                    onChange={(event) =>
                                        setData(
                                            "canonical_url",
                                            event.target.value,
                                        )
                                    }
                                    placeholder="https://your-domain.com/preferred-page"
                                />
                            </Field>
                            <Field
                                label="SEO TITLE"
                                error={errors.seo_title}
                                hint={`${data.seo_title.length}/70 characters. Aim for a useful, descriptive title.`}
                            >
                                <input
                                    maxLength={70}
                                    value={data.seo_title}
                                    onChange={(event) =>
                                        setData("seo_title", event.target.value)
                                    }
                                    placeholder={data.title}
                                />
                            </Field>
                            <Field
                                label="META DESCRIPTION"
                                error={errors.seo_description}
                                hint={`${data.seo_description.length} characters. Around 150–160 is a good starting point.`}
                            >
                                <textarea
                                    rows={4}
                                    maxLength={320}
                                    value={data.seo_description}
                                    onChange={(event) =>
                                        setData(
                                            "seo_description",
                                            event.target.value,
                                        )
                                    }
                                />
                            </Field>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={data.noindex}
                                    onChange={(event) =>
                                        setData("noindex", event.target.checked)
                                    }
                                />
                                Ask search engines not to index this content
                            </label>
                            <div className="search-preview">
                                <span className="eyebrow">SEARCH PREVIEW</span>
                                <p>
                                    /
                                    {type === "post"
                                        ? "journal"
                                        : type === "product"
                                          ? "shop"
                                          : "pages"}
                                    /{data.slug}
                                </p>
                                <h3>
                                    {data.seo_title ||
                                        data.title ||
                                        "Your page title"}
                                </h3>
                                <span>
                                    {data.seo_description ||
                                        data.excerpt ||
                                        "A thoughtful description helps the right people find your content."}
                                </span>
                            </div>
                            <p className="muted small-text">
                                Canonical URLs, social sharing tags, structured
                                data, and sitemap entries are generated for
                                published content. This preview is illustrative;
                                search engines choose their own snippets.
                            </p>
                        </div>
                    )}
                    {tab === "history" && (
                        <div className="editor-fields">
                            <div className="section-intro">
                                <h2>A little room to rewind.</h2>
                                <p>
                                    The previous version is kept each time you
                                    save. Restoring creates a draft.
                                </p>
                            </div>
                            {revisions.length ? (
                                revisions.map((revision) => (
                                    <div
                                        className="revision-row"
                                        key={revision.id}
                                    >
                                        <span>
                                            Version #{revision.id}
                                            <small>
                                                {date(revision.created_at)}
                                            </small>
                                        </span>
                                        <Button
                                            type="button"
                                            secondary
                                            small
                                            onClick={() => {
                                                if (
                                                    window.confirm(
                                                        "Restore this version as a draft? Unsaved changes will be lost.",
                                                    )
                                                )
                                                    router.post(
                                                        `/admin/content/${entry.id}/restore/${revision.id}`,
                                                    );
                                            }}
                                        >
                                            Restore version
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <p className="muted">
                                    Your previous versions will appear after
                                    your first update.
                                </p>
                            )}
                        </div>
                    )}
                </section>
                <aside className="editor-sidebar">
                    <section className="panel side-panel">
                        <h2>Publish your way.</h2>
                        <Field label="STATUS">
                            <select
                                value={data.status}
                                onChange={(event) =>
                                    setData("status", event.target.value)
                                }
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="scheduled">Scheduled</option>
                            </select>
                        </Field>
                        {data.status !== "draft" && (
                            <Field
                                label="PUBLISH DATE (UTC)"
                                hint="Leave blank to publish now. A future date keeps content private until then."
                                error={errors.published_at}
                            >
                                <input
                                    type="datetime-local"
                                    value={data.published_at}
                                    required={data.status === "scheduled"}
                                    onChange={(event) =>
                                        setData(
                                            "published_at",
                                            event.target.value,
                                        )
                                    }
                                />
                            </Field>
                        )}
                        {entry && (
                            <p className="small-text muted">
                                Last saved {date(entry.updated_at)}
                            </p>
                        )}
                        {entry?.is_public && (
                            <Link
                                className="text-link"
                                href={entry.public_path}
                            >
                                View public page
                                <ArrowUpRight size={15} />
                            </Link>
                        )}
                    </section>
                    <section className="panel side-panel">
                        <h2>The finishing touches.</h2>
                        <Field label="CATEGORY">
                            <select
                                value={data.category_id}
                                onChange={(event) =>
                                    setData("category_id", event.target.value)
                                }
                            >
                                <option value="">Uncategorized</option>
                                {categories.map((category) => (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </Field>
                        <Field
                            label="TAGS"
                            hint="Separate with commas. Up to 12."
                        >
                            <input
                                value={tagsText}
                                placeholder="Design, ideas, studio"
                                onChange={(event) =>
                                    setTagsText(event.target.value)
                                }
                            />
                        </Field>
                        <Field label="FEATURED IMAGE">
                            <select
                                value={data.media_id}
                                onChange={(event) =>
                                    setData("media_id", event.target.value)
                                }
                            >
                                <option value="">No featured image</option>
                                {media
                                    .filter((item) =>
                                        item.mime.startsWith("image/"),
                                    )
                                    .map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.name}
                                        </option>
                                    ))}
                            </select>
                        </Field>
                        {chosenMedia && (
                            <Cover
                                media={chosenMedia}
                                className="editor-cover"
                            />
                        )}
                        <Link className="text-link" href="/admin/media">
                            Manage media library
                            <ArrowUpRight size={14} />
                        </Link>
                    </section>
                    {type === "product" && (
                        <section className="panel side-panel">
                            <h2>Product details.</h2>
                            <Field
                                label="PRICE (SITE CURRENCY)"
                                error={errors.price_cents}
                            >
                                <input
                                    type="number"
                                    min="0"
                                    max="1000000"
                                    step="0.01"
                                    value={data.price_cents / 100}
                                    onChange={(event) =>
                                        setData(
                                            "price_cents",
                                            Math.round(
                                                Number(event.target.value) *
                                                    100,
                                            ),
                                        )
                                    }
                                />
                            </Field>
                            <Field label="AVAILABLE STOCK" error={errors.stock}>
                                <input
                                    type="number"
                                    min="0"
                                    max="1000000"
                                    step="1"
                                    value={data.stock}
                                    onChange={(event) =>
                                        setData(
                                            "stock",
                                            Number(event.target.value),
                                        )
                                    }
                                />
                            </Field>
                            <p className="small-text muted">
                                Stock is reserved when an order is submitted.
                                Prices exclude shipping and tax integrations.
                            </p>
                        </section>
                    )}
                    {entry && (
                        <button
                            type="button"
                            className="delete-link"
                            onClick={() => {
                                if (
                                    window.confirm(
                                        "Delete this content and all of its revisions? This cannot be undone.",
                                    )
                                )
                                    router.delete(`/admin/content/${entry.id}`);
                            }}
                        >
                            <Trash2 size={15} />
                            Delete this {type === "post" ? "article" : type}
                        </button>
                    )}
                </aside>
            </form>
        </AdminLayout>
    );
}
