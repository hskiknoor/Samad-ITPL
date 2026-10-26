import React from "react";
import { useForm, usePage } from "@inertiajs/react";
import { ArrowUpRight } from "lucide-react";
import SiteLayout from "../../Components/SiteLayout";
import { Field } from "../../Components/UI";

export default function Contact({ seo }) {
    const { site } = usePage().props;
    const form = useForm({ name: "", email: "", message: "", website: "" });
    return (
        <SiteLayout seo={seo}>
            <section className="public-contact">
                <div>
                    <span className="site-eyebrow">
                        GOOD THINGS START WITH HELLO
                    </span>
                    <h1>
                        A little idea?
                        <br />
                        <em>A big possibility.</em>
                    </h1>
                    <p>
                        Tell us what you’re thinking. A new project, a
                        collaboration, or just a friendly hello. We’re all ears.
                    </p>
                    <a
                        className="site-text-link"
                        href={`mailto:${site.contact_email}`}
                    >
                        {site.contact_email}
                        <ArrowUpRight size={18} />
                    </a>
                    <span className="contact-flower" aria-hidden="true">
                        ✳
                    </span>
                </div>
                <form
                    className="contact-form"
                    onSubmit={(event) => {
                        event.preventDefault();
                        form.post("/contact", {
                            preserveScroll: true,
                            onSuccess: () => form.reset(),
                        });
                    }}
                >
                    <Field label="YOUR NAME" error={form.errors.name}>
                        <input
                            required
                            autoComplete="name"
                            maxLength={100}
                            value={form.data.name}
                            placeholder="What should we call you?"
                            onChange={(event) =>
                                form.setData("name", event.target.value)
                            }
                        />
                    </Field>
                    <Field label="EMAIL ADDRESS" error={form.errors.email}>
                        <input
                            required
                            autoComplete="email"
                            type="email"
                            maxLength={180}
                            value={form.data.email}
                            placeholder="Where can we find you?"
                            onChange={(event) =>
                                form.setData("email", event.target.value)
                            }
                        />
                    </Field>
                    <Field
                        label="WHAT’S ON YOUR MIND?"
                        error={form.errors.message}
                    >
                        <textarea
                            rows={7}
                            required
                            minLength={10}
                            maxLength={10000}
                            value={form.data.message}
                            placeholder="A little about your idea…"
                            onChange={(event) =>
                                form.setData("message", event.target.value)
                            }
                        />
                    </Field>
                    <div className="honeypot" aria-hidden="true">
                        <label>
                            Website
                            <input
                                name="website"
                                tabIndex={-1}
                                autoComplete="off"
                                value={form.data.website}
                                onChange={(event) =>
                                    form.setData("website", event.target.value)
                                }
                            />
                        </label>
                    </div>
                    <button className="site-button" disabled={form.processing}>
                        {form.processing ? "Sending…" : "Send a little hello"}
                        <ArrowUpRight size={18} />
                    </button>
                    <p className="small-text muted">
                        We use your details to respond to this enquiry.
                    </p>
                </form>
            </section>
        </SiteLayout>
    );
}
