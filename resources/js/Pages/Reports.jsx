import React, { useState, useRef } from "react";
import { router, useForm } from "@inertiajs/react";
import { FileText, ShieldCheck, Trash2, Upload } from "lucide-react";
import AdminLayout from "../Components/AdminLayout";
import { Badge, Button, date, Empty, Field, slugify } from "../Components/UI";

export default function Reports({ reports, customers }) {
    const [editing, setEditing] = useState(null);
    const fileInput = useRef(null);
    const form = useForm({
        title: "",
        slug: "",
        summary: "",
        content: "",
        status: "draft",
        audience: "public",
        owner_id: "",
        noindex: false,
        file: null,
    });
    return (
        <AdminLayout
            title="Knowledge worth sharing."
            subtitle="Public resources and customer-only reports, managed in one place."
        >
            <div className="two-column">
                <section className="panel">
                    <div className="panel-heading">
                        <div>
                            <h2>Your resource library</h2>
                            <p>
                                Files are stored privately and served through
                                access-checked downloads.
                            </p>
                        </div>
                    </div>
                    {reports.length ? (
                        <div className="table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>REPORT</th>
                                        <th>ACCESS</th>
                                        <th>STATUS</th>
                                        <th />
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.map((report) => (
                                        <tr key={report.id}>
                                            <td>
                                                <button
                                                    className="text-link"
                                                    onClick={() => {
                                                        setEditing(report.id);
                                                        form.setData({
                                                            title: report.title,
                                                            slug: report.slug,
                                                            summary:
                                                                report.summary,
                                                            content:
                                                                report.content ||
                                                                "",
                                                            status: report.status,
                                                            audience:
                                                                report.audience,
                                                            owner_id:
                                                                report.owner_id ||
                                                                "",
                                                            noindex:
                                                                report.noindex,
                                                            file: null,
                                                        });
                                                        if (fileInput.current)
                                                            fileInput.current.value =
                                                                "";
                                                    }}
                                                >
                                                    {report.title}
                                                </button>
                                                <small className="report-subtext">
                                                    <a
                                                        href={`/admin/reports/${report.id}/download`}
                                                    >
                                                        {report.original_name}
                                                    </a>{" "}
                                                    ·{" "}
                                                    {Math.ceil(
                                                        report.size / 1024,
                                                    )}{" "}
                                                    KB
                                                </small>
                                            </td>
                                            <td>
                                                <span className="type-label">
                                                    {report.audience ===
                                                    "public"
                                                        ? "Public"
                                                        : customers.find(
                                                              (c) =>
                                                                  c.id ===
                                                                  report.owner_id,
                                                          )?.name ||
                                                          "Assigned customer"}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    onClick={() =>
                                                        router.patch(
                                                            `/admin/reports/${report.id}`,
                                                            {
                                                                status:
                                                                    report.status ===
                                                                    "draft"
                                                                        ? "published"
                                                                        : "draft",
                                                            },
                                                        )
                                                    }
                                                    title="Toggle publication"
                                                >
                                                    <Badge
                                                        status={report.status}
                                                    />
                                                </button>
                                            </td>
                                            <td>
                                                <button
                                                    className="icon-button"
                                                    aria-label={`Delete report ${report.title}`}
                                                    onClick={() => {
                                                        if (
                                                            window.confirm(
                                                                "Delete this report and its file?",
                                                            )
                                                        )
                                                            router.delete(
                                                                `/admin/reports/${report.id}`,
                                                            );
                                                    }}
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
                        <Empty
                            title="Give your knowledge a home."
                            text="Add a public guide, research report, or a document for one customer."
                        />
                    )}
                </section>
                <form
                    className="panel side-panel"
                    onSubmit={(event) => {
                        event.preventDefault();
                        form.transform((values) =>
                            editing ? { ...values, _method: "PATCH" } : values,
                        );
                        form.post(
                            editing
                                ? `/admin/reports/${editing}`
                                : "/admin/reports",
                            {
                                forceFormData: true,
                                onSuccess: () => {
                                    form.reset();
                                    setEditing(null);
                                    if (fileInput.current)
                                        fileInput.current.value = "";
                                },
                            },
                        );
                    }}
                >
                    <h2>
                        {editing ? "Update your resource." : "Add a resource."}
                    </h2>
                    {editing && (
                        <button
                            type="button"
                            className="text-link"
                            onClick={() => {
                                setEditing(null);
                                form.reset();
                                if (fileInput.current)
                                    fileInput.current.value = "";
                            }}
                        >
                            Cancel editing
                        </button>
                    )}
                    <Field label="TITLE">
                        <input
                            required
                            maxLength={180}
                            value={form.data.title}
                            onChange={(event) =>
                                form.setData((values) => ({
                                    ...values,
                                    title: event.target.value,
                                    slug: slugify(event.target.value),
                                }))
                            }
                        />
                    </Field>
                    <Field label="URL SLUG">
                        <input
                            required
                            value={form.data.slug}
                            onChange={(event) =>
                                form.setData("slug", event.target.value)
                            }
                        />
                    </Field>
                    <Field label="SUMMARY">
                        <textarea
                            required
                            maxLength={2000}
                            rows={3}
                            value={form.data.summary}
                            onChange={(event) =>
                                form.setData("summary", event.target.value)
                            }
                        />
                    </Field>
                    <Field
                        label="SEARCHABLE KNOWLEDGE"
                        hint="Add relevant facts from the report for website search and assistant answers."
                    >
                        <textarea
                            rows={4}
                            maxLength={20000}
                            value={form.data.content}
                            onChange={(event) =>
                                form.setData("content", event.target.value)
                            }
                        />
                    </Field>
                    <Field label="WHO MAY DOWNLOAD?">
                        <select
                            value={form.data.audience}
                            onChange={(event) =>
                                form.setData("audience", event.target.value)
                            }
                        >
                            <option value="public">Anyone</option>
                            <option value="customer">
                                One assigned customer
                            </option>
                        </select>
                    </Field>
                    {form.data.audience === "customer" && (
                        <Field label="CUSTOMER">
                            <select
                                required
                                value={form.data.owner_id}
                                onChange={(event) =>
                                    form.setData("owner_id", event.target.value)
                                }
                            >
                                <option value="">Select a customer</option>
                                {customers.map((customer) => (
                                    <option
                                        value={customer.id}
                                        key={customer.id}
                                    >
                                        {customer.name}
                                    </option>
                                ))}
                            </select>
                        </Field>
                    )}
                    <Field label="STATUS">
                        <select
                            value={form.data.status}
                            onChange={(event) =>
                                form.setData("status", event.target.value)
                            }
                        >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                        </select>
                    </Field>
                    <Field
                        label="DOCUMENT"
                        hint="PDF, CSV, TXT, JSON, or XLSX · Maximum 20 MB"
                    >
                        <input
                            ref={fileInput}
                            required={!editing}
                            type="file"
                            accept=".pdf,.csv,.txt,.json,.xlsx"
                            onChange={(event) =>
                                form.setData(
                                    "file",
                                    event.target.files[0] || null,
                                )
                            }
                        />
                    </Field>
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={form.data.noindex}
                            onChange={(event) =>
                                form.setData("noindex", event.target.checked)
                            }
                        />
                        Exclude from LLM discovery files
                    </label>
                    <Button
                        className="report-upload-button"
                        disabled={form.processing}
                    >
                        <Upload size={16} />
                        {form.processing
                            ? "Uploading…"
                            : editing
                              ? "Save changes"
                              : "Save report"}
                    </Button>
                </form>
            </div>
        </AdminLayout>
    );
}
