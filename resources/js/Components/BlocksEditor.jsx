import React from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button, Field } from "./UI";

export default function BlocksEditor({ blocks, onChange }) {
    const update = (index, key, value) =>
        onChange(
            blocks.map((block, i) =>
                i === index ? { ...block, [key]: value } : block,
            ),
        );
    const move = (index, direction) => {
        const next = [...blocks];
        const target = index + direction;
        if (target < 0 || target >= next.length) return;
        [next[index], next[target]] = [next[target], next[index]];
        onChange(next);
    };
    return (
        <div className="editor-fields">
            <div className="section-intro">
                <h2>Build it one section at a time.</h2>
                <p>
                    Add text, feature grids, FAQs, and calls to action. These
                    sections appear after the main body.
                </p>
            </div>
            {blocks.map((block, i) => (
                <section className="block-editor-card" key={i}>
                    <header>
                        <strong>
                            Section {i + 1} · {block.type}
                        </strong>
                        <div>
                            <button
                                type="button"
                                className="icon-button"
                                onClick={() => move(i, -1)}
                                disabled={i === 0}
                                aria-label="Move section up"
                            >
                                <ArrowUp size={15} />
                            </button>
                            <button
                                type="button"
                                className="icon-button"
                                onClick={() => move(i, 1)}
                                disabled={i === blocks.length - 1}
                                aria-label="Move section down"
                            >
                                <ArrowDown size={15} />
                            </button>
                            <button
                                type="button"
                                className="icon-button"
                                onClick={() =>
                                    onChange(blocks.filter((_, j) => j !== i))
                                }
                                aria-label="Remove section"
                            >
                                <Trash2 size={15} />
                            </button>
                        </div>
                    </header>
                    <Field label="SECTION HEADING">
                        <input
                            maxLength={180}
                            value={block.heading}
                            onChange={(event) =>
                                update(i, "heading", event.target.value)
                            }
                        />
                    </Field>
                    <Field label="TEXT">
                        <textarea
                            rows={3}
                            maxLength={4000}
                            value={block.body}
                            onChange={(event) =>
                                update(i, "body", event.target.value)
                            }
                        />
                    </Field>
                    {["faq", "features"].includes(block.type) && (
                        <div>
                            {block.items.map((item, j) => (
                                <div className="block-item-editor" key={j}>
                                    <Field
                                        label={
                                            block.type === "faq"
                                                ? "QUESTION"
                                                : "FEATURE"
                                        }
                                    >
                                        <input
                                            required
                                            maxLength={180}
                                            value={item.title}
                                            onChange={(event) =>
                                                update(
                                                    i,
                                                    "items",
                                                    block.items.map(
                                                        (value, k) =>
                                                            k === j
                                                                ? {
                                                                      ...value,
                                                                      title: event
                                                                          .target
                                                                          .value,
                                                                  }
                                                                : value,
                                                    ),
                                                )
                                            }
                                        />
                                    </Field>
                                    <Field
                                        label={
                                            block.type === "faq"
                                                ? "ANSWER"
                                                : "DESCRIPTION"
                                        }
                                    >
                                        <textarea
                                            required
                                            rows={2}
                                            maxLength={2000}
                                            value={item.text}
                                            onChange={(event) =>
                                                update(
                                                    i,
                                                    "items",
                                                    block.items.map(
                                                        (value, k) =>
                                                            k === j
                                                                ? {
                                                                      ...value,
                                                                      text: event
                                                                          .target
                                                                          .value,
                                                                  }
                                                                : value,
                                                    ),
                                                )
                                            }
                                        />
                                    </Field>
                                    <button
                                        type="button"
                                        className="delete-link"
                                        onClick={() =>
                                            update(
                                                i,
                                                "items",
                                                block.items.filter(
                                                    (_, k) => k !== j,
                                                ),
                                            )
                                        }
                                    >
                                        Remove item
                                    </button>
                                </div>
                            ))}
                            <Button
                                type="button"
                                secondary
                                small
                                disabled={block.items.length >= 12}
                                onClick={() =>
                                    update(i, "items", [
                                        ...block.items,
                                        { title: "", text: "" },
                                    ])
                                }
                            >
                                <Plus size={14} />
                                Add item
                            </Button>
                        </div>
                    )}
                    {block.type === "cta" && (
                        <div className="field-grid">
                            <Field label="BUTTON LABEL">
                                <input
                                    maxLength={60}
                                    value={block.button_label}
                                    onChange={(event) =>
                                        update(
                                            i,
                                            "button_label",
                                            event.target.value,
                                        )
                                    }
                                />
                            </Field>
                            <Field label="BUTTON PATH">
                                <input
                                    value={block.button_url}
                                    onChange={(event) =>
                                        update(
                                            i,
                                            "button_url",
                                            event.target.value,
                                        )
                                    }
                                    placeholder="/contact"
                                />
                            </Field>
                        </div>
                    )}
                </section>
            ))}
            <div className="add-block-buttons">
                {["text", "features", "faq", "cta"].map((type) => (
                    <Button
                        key={type}
                        type="button"
                        secondary
                        small
                        disabled={blocks.length >= 20}
                        onClick={() =>
                            onChange([
                                ...blocks,
                                {
                                    type,
                                    heading: "",
                                    body: "",
                                    items: [],
                                    button_label: "",
                                    button_url: "",
                                },
                            ])
                        }
                    >
                        <Plus size={14} />
                        {type === "cta" ? "Call to action" : type.toUpperCase()}
                    </Button>
                ))}
            </div>
        </div>
    );
}
