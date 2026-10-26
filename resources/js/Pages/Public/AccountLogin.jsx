import React from "react";
import { Link, useForm } from "@inertiajs/react";
import { ArrowRight } from "lucide-react";
import SiteLayout from "../../Components/SiteLayout";
import { Field } from "../../Components/UI";

export default function AccountLogin({ register }) {
    const form = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });
    return (
        <SiteLayout noindex>
            <section className="customer-auth">
                <span className="site-eyebrow">YOUR OWN LITTLE SPACE</span>
                <h1>{register ? "Make yourself at home." : "Welcome back."}</h1>
                <p>
                    {register
                        ? "Create an account to keep future orders and personal reports together."
                        : "Your orders, assigned documents, and downloads are waiting."}
                </p>
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        form.post(
                            register ? "/account/register" : "/account/login",
                            {
                                onFinish: () =>
                                    form.reset(
                                        "password",
                                        "password_confirmation",
                                    ),
                            },
                        );
                    }}
                >
                    {register && (
                        <Field label="YOUR NAME" error={form.errors.name}>
                            <input
                                required
                                autoComplete="name"
                                maxLength={100}
                                value={form.data.name}
                                onChange={(event) =>
                                    form.setData("name", event.target.value)
                                }
                            />
                        </Field>
                    )}
                    <Field label="EMAIL ADDRESS" error={form.errors.email}>
                        <input
                            type="email"
                            required
                            autoComplete="username"
                            value={form.data.email}
                            onChange={(event) =>
                                form.setData("email", event.target.value)
                            }
                        />
                    </Field>
                    <Field label="PASSWORD" error={form.errors.password}>
                        <input
                            type="password"
                            required
                            minLength={register ? 12 : undefined}
                            autoComplete={
                                register ? "new-password" : "current-password"
                            }
                            value={form.data.password}
                            onChange={(event) =>
                                form.setData("password", event.target.value)
                            }
                        />
                    </Field>
                    {register && (
                        <Field
                            label="CONFIRM PASSWORD"
                            hint="Use at least 12 characters, including letters and numbers."
                        >
                            <input
                                type="password"
                                required
                                autoComplete="new-password"
                                value={form.data.password_confirmation}
                                onChange={(event) =>
                                    form.setData(
                                        "password_confirmation",
                                        event.target.value,
                                    )
                                }
                            />
                        </Field>
                    )}
                    <button className="site-button" disabled={form.processing}>
                        {form.processing
                            ? "Please wait…"
                            : register
                              ? "Create account"
                              : "Sign in"}
                        <ArrowRight size={17} />
                    </button>
                </form>
                <Link
                    className="site-text-link"
                    href={register ? "/account/login" : "/account/register"}
                >
                    {register
                        ? "Already a customer? Sign in"
                        : "New here? Create an account"}
                </Link>
                <p className="small-text muted">
                    For access help or a password reset, contact the website
                    team.
                </p>
            </section>
        </SiteLayout>
    );
}
