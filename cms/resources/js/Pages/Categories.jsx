import React, { useState } from "react";
import { router, useForm } from "@inertiajs/react";
import { Folder, Plus, Trash2 } from "lucide-react";
import AdminLayout from "../Components/AdminLayout";
import { Button, Empty, Field, slugify } from "../Components/UI";

export default function Categories({ categories }) {
    const form = useForm({ name: "", slug: "" });
    const [manualSlug, setManualSlug] = useState(false);
    return (
        <AdminLayout
            title="A place for everything."
            subtitle="Bring a little order to your stories, pages, and products."
        >
            <div className="two-column">
                <section className="panel">
                    <div className="panel-heading">
                        <h2>Your categories</h2>
                        <span className="subtle-pill">
                            {categories.length} categories
                        </span>
                    </div>
                    {categories.length ? (
                        <div className="category-list">
                            {categories.map((category) => (
                                <div className="category-row" key={category.id}>
                                    <span className="quick-icon sage">
                                        <Folder size={20} />
                                    </span>
                                    <div>
                                        <strong>{category.name}</strong>
                                        <small>
                                            /{category.slug} ·{" "}
                                            {category.entries_count} pieces of
                                            content
                                        </small>
                                    </div>
                                    <button
                                        className="icon-button"
                                        aria-label={`Delete ${category.name}`}
                                        onClick={() => {
                                            if (
                                                window.confirm(
                                                    "Delete this category? Its content will be kept without a category.",
                                                )
                                            )
                                                router.delete(
                                                    `/admin/categories/${category.id}`,
                                                );
                                        }}
                                    >
                                        <Trash2 size={17} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Empty text="Create a category to organize your content." />
                    )}
                </section>
                <form
                    className="panel side-panel"
                    onSubmit={(event) => {
                        event.preventDefault();
                        form.post("/admin/categories", {
                            onSuccess: () => {
                                form.reset();
                                setManualSlug(false);
                            },
                        });
                    }}
                >
                    <h2>Make a little space.</h2>
                    <p className="muted">Create a new category.</p>
                    <Field label="NAME" error={form.errors.name}>
                        <input
                            value={form.data.name}
                            onChange={(event) => {
                                const name = event.target.value;
                                form.setData((values) => ({
                                    ...values,
                                    name,
                                    ...(!manualSlug
                                        ? { slug: slugify(name) }
                                        : {}),
                                }));
                            }}
                            required
                            maxLength={80}
                            placeholder="e.g. Behind the scenes"
                        />
                    </Field>
                    <Field label="SLUG" error={form.errors.slug}>
                        <input
                            value={form.data.slug}
                            onChange={(event) => {
                                setManualSlug(true);
                                form.setData("slug", event.target.value);
                            }}
                            required
                            maxLength={100}
                        />
                    </Field>
                    <Button disabled={form.processing}>
                        <Plus size={16} />
                        Add category
                    </Button>
                </form>
            </div>
        </AdminLayout>
    );
}
