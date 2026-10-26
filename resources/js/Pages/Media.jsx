import React, { useRef, useState } from "react";
import { router, useForm } from "@inertiajs/react";
import {
    ArrowDownToLine,
    Check,
    File,
    Image as ImageIcon,
    Trash2,
    Upload,
    X,
} from "lucide-react";
import AdminLayout from "../Components/AdminLayout";
import { Button, Cover, date, Empty, Field } from "../Components/UI";

export default function Media({ media }) {
    const [selected, setSelected] = useState(null);
    const [dragging, setDragging] = useState(false);
    const input = useRef(null);
    const upload = useForm({ file: null, alt: "" });
    const details = useForm({ alt: "" });
    const item = media.find((item) => item.id === selected);
    const choose = (item) => {
        setSelected(item.id);
        details.setData("alt", item.alt);
    };
    const size = (bytes) =>
        bytes >= 1048576
            ? `${(bytes / 1048576).toFixed(1)} MB`
            : `${Math.ceil(bytes / 1024)} KB`;
    return (
        <AdminLayout
            title="A library of possibilities."
            subtitle={`${media.length} assets, ready for their next story.`}
            actions={
                <Button onClick={() => input.current?.click()}>
                    <Upload size={17} />
                    Choose a file
                </Button>
            }
        >
            <form
                className={`upload-zone ${dragging ? "dragging" : ""}`}
                onSubmit={(event) => {
                    event.preventDefault();
                    upload.post("/admin/media", {
                        forceFormData: true,
                        onSuccess: () => {
                            upload.reset();
                            if (input.current) input.current.value = "";
                        },
                    });
                }}
                onDragOver={(event) => {
                    event.preventDefault();
                    setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(event) => {
                    event.preventDefault();
                    setDragging(false);
                    upload.setData("file", event.dataTransfer.files[0] || null);
                }}
            >
                <span className="upload-icon">
                    <Upload size={24} />
                </span>
                <div>
                    <strong>
                        {upload.data.file
                            ? upload.data.file.name
                            : "Drop something inspiring here."}
                    </strong>
                    <p>JPG, PNG, WebP, GIF, AVIF, or PDF · Up to 10 MB</p>
                </div>
                <input
                    ref={input}
                    type="file"
                    aria-label="Choose media file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/avif,application/pdf"
                    onChange={(event) =>
                        upload.setData("file", event.target.files[0] || null)
                    }
                    hidden
                />
                {upload.data.file ? (
                    <Button type="submit" disabled={upload.processing}>
                        {upload.processing
                            ? `Uploading ${upload.progress?.percentage || 0}%`
                            : "Upload file"}
                    </Button>
                ) : (
                    <Button
                        type="button"
                        secondary
                        onClick={() => input.current?.click()}
                    >
                        Browse files
                    </Button>
                )}
            </form>
            <div className={`media-layout ${item ? "has-selection" : ""}`}>
                <section>
                    {media.length ? (
                        <div className="media-grid">
                            {media.map((asset) => (
                                <button
                                    key={asset.id}
                                    className={`media-card ${asset.id === selected ? "selected" : ""}`}
                                    onClick={() => choose(asset)}
                                >
                                    <Cover media={asset} />
                                    <div>
                                        <strong>{asset.name}</strong>
                                        <span>
                                            {size(asset.size)}
                                            <span>
                                                {asset.alt
                                                    ? "Alt text added"
                                                    : "No alt text"}
                                            </span>
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <section className="panel">
                            <Empty
                                title="Every story needs a little imagery."
                                text="Upload your first image or document to get started."
                            />
                        </section>
                    )}
                </section>
                {item && (
                    <aside className="panel media-details">
                        <div className="panel-heading">
                            <h2>Asset details</h2>
                            <button
                                className="icon-button"
                                onClick={() => setSelected(null)}
                                aria-label="Close asset details"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <Cover media={item} />
                        <div className="media-detail-body">
                            <strong>{item.name}</strong>
                            <p className="muted small-text">
                                {size(item.size)} · Added{" "}
                                {date(item.created_at)}
                            </p>
                            <form
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    details.patch(`/admin/media/${item.id}`, {
                                        preserveScroll: true,
                                    });
                                }}
                            >
                                <Field
                                    label="ALT TEXT"
                                    hint="Describe what’s in the image for people using screen readers."
                                    error={details.errors.alt}
                                >
                                    <textarea
                                        rows={3}
                                        value={details.data.alt}
                                        onChange={(event) =>
                                            details.setData(
                                                "alt",
                                                event.target.value,
                                            )
                                        }
                                        maxLength={255}
                                        required
                                    />
                                </Field>
                                <Button
                                    type="submit"
                                    small
                                    disabled={details.processing}
                                >
                                    <Check size={15} />
                                    Save alt text
                                </Button>
                            </form>
                            <a
                                href={item.url}
                                download={item.name}
                                className="text-link"
                            >
                                <ArrowDownToLine size={15} />
                                Download original
                            </a>
                            <button
                                className="delete-link"
                                onClick={() => {
                                    if (
                                        window.confirm(
                                            "Delete this asset? Content using it must be updated first.",
                                        )
                                    )
                                        router.delete(
                                            `/admin/media/${item.id}`,
                                            {
                                                preserveScroll: true,
                                                onSuccess: () =>
                                                    setSelected(null),
                                            },
                                        );
                                }}
                            >
                                <Trash2 size={15} />
                                Delete asset
                            </button>
                        </div>
                    </aside>
                )}
            </div>
        </AdminLayout>
    );
}
