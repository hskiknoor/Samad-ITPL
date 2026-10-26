import React from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import { ArrowRight, ArrowUpRight, LockKeyhole } from "lucide-react";
import { Button, Field } from "../Components/UI";

export default function Login() {
    const form = useForm({ email: "", password: "", remember: false });
    return (
        <div className="login-page">
            <Head title="Welcome back · Folio CMS">
                <meta name="robots" content="noindex,nofollow" />
            </Head>
            <section className="login-story">
                <Link className="folio-brand" href="/">
                    <span className="brand-symbol">
                        f<span>·</span>
                    </span>
                    folio<span className="brand-label">CMS</span>
                </Link>
                <div>
                    <span className="eyebrow">
                        A HOME FOR YOUR NEXT BIG THING
                    </span>
                    <h1>
                        A little structure.
                        <br />A lot of
                        <br />
                        <em>possibility.</em>
                    </h1>
                    <p>
                        Bring your stories, ideas, and business together.
                        <br />
                        Make a space that’s unmistakably yours.
                    </p>
                </div>
                <span className="login-star" aria-hidden="true">
                    ✳
                </span>
                <span className="login-story-footer">
                    Thoughtfully made. Ready to grow. <ArrowUpRight size={18} />
                </span>
            </section>
            <section className="login-form-side">
                <Link href="/" className="text-link login-back">
                    Visit the website
                    <ArrowUpRight size={16} />
                </Link>
                <form
                    className="login-form"
                    onSubmit={(event) => {
                        event.preventDefault();
                        form.post("/login", {
                            onFinish: () => form.reset("password"),
                        });
                    }}
                >
                    <span className="login-lock">
                        <LockKeyhole size={23} />
                    </span>
                    <p className="eyebrow">YOUR CREATIVE WORKSPACE</p>
                    <h2>Welcome back.</h2>
                    <p className="muted">
                        A fresh perspective is just a sign-in away.
                    </p>
                    <Field label="EMAIL ADDRESS" error={form.errors.email}>
                        <input
                            type="email"
                            required
                            autoComplete="username"
                            autoFocus
                            value={form.data.email}
                            onChange={(event) =>
                                form.setData("email", event.target.value)
                            }
                            placeholder="you@yourstudio.com"
                        />
                    </Field>
                    <Field label="PASSWORD" error={form.errors.password}>
                        <input
                            type="password"
                            required
                            autoComplete="current-password"
                            value={form.data.password}
                            onChange={(event) =>
                                form.setData("password", event.target.value)
                            }
                            placeholder="Your password"
                        />
                    </Field>
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={form.data.remember}
                            onChange={(event) =>
                                form.setData("remember", event.target.checked)
                            }
                        />
                        Keep me signed in
                    </label>
                    <Button type="submit" disabled={form.processing}>
                        {form.processing
                            ? "Signing in…"
                            : "Step into your workspace"}
                        <ArrowRight size={17} />
                    </Button>
                    <p className="login-help">
                        Need access? Ask your site administrator to create an
                        account or reset your password.
                    </p>
                </form>
                <span className="login-copyright">
                    Folio CMS · A space for what’s next.
                </span>
            </section>
        </div>
    );
}
