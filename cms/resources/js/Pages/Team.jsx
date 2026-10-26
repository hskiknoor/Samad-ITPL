import React from "react";
import { useForm, usePage } from "@inertiajs/react";
import { Plus, Save, ShieldCheck } from "lucide-react";
import AdminLayout from "../Components/AdminLayout";
import { Button, Field } from "../Components/UI";

function Member({ user, self }) {
    const form = useForm({ role: user.role, password: "" });
    return (
        <form
            className="member-card"
            onSubmit={(event) => {
                event.preventDefault();
                form.patch(`/admin/team/${user.id}`, {
                    preserveScroll: true,
                    onSuccess: () => form.setData("password", ""),
                });
            }}
        >
            <div className="member-heading">
                <span className="avatar">{user.name.slice(0, 1)}</span>
                <div>
                    <strong>
                        {user.name}
                        {self ? " (you)" : ""}
                    </strong>
                    <small>{user.email}</small>
                </div>
            </div>
            <Field label="ROLE">
                <select
                    value={form.data.role}
                    onChange={(event) =>
                        form.setData("role", event.target.value)
                    }
                    disabled={self}
                >
                    <option value="editor">Content editor</option>
                    <option value="admin">Administrator</option>
                </select>
            </Field>
            <Field
                label="RESET PASSWORD"
                hint="Leave blank to keep the current password."
                error={form.errors.password}
            >
                <input
                    type="password"
                    autoComplete="new-password"
                    minLength={12}
                    value={form.data.password}
                    onChange={(event) =>
                        form.setData("password", event.target.value)
                    }
                    placeholder="New password (12+ characters)"
                />
            </Field>
            <Button secondary small disabled={form.processing}>
                <Save size={14} />
                Save member
            </Button>
        </form>
    );
}
export default function Team({ users }) {
    const { auth } = usePage().props;
    const form = useForm({ name: "", email: "", role: "editor", password: "" });
    return (
        <AdminLayout
            title="Good things take good people."
            subtitle="Give your collaborators the right space to create."
        >
            <div className="team-layout">
                <section className="team-grid">
                    {users.map((user) => (
                        <Member
                            key={user.id}
                            user={user}
                            self={auth.user.id === user.id}
                        />
                    ))}
                </section>
                <form
                    className="panel side-panel"
                    onSubmit={(event) => {
                        event.preventDefault();
                        form.post("/admin/team", {
                            onSuccess: () => form.reset(),
                        });
                    }}
                >
                    <h2>A new face at the table.</h2>
                    <p className="muted small-text">
                        Create a member account. Share their credentials
                        securely.
                    </p>
                    {[
                        ["name", "FULL NAME", "text"],
                        ["email", "EMAIL ADDRESS", "email"],
                        ["password", "INITIAL PASSWORD", "password"],
                    ].map(([key, label, type]) => (
                        <Field key={key} label={label} error={form.errors[key]}>
                            <input
                                type={type}
                                required
                                minLength={key === "password" ? 12 : undefined}
                                autoComplete={
                                    key === "password" ? "new-password" : "off"
                                }
                                value={form.data[key]}
                                onChange={(event) =>
                                    form.setData(key, event.target.value)
                                }
                            />
                        </Field>
                    ))}
                    <Field label="ROLE">
                        <select
                            value={form.data.role}
                            onChange={(event) =>
                                form.setData("role", event.target.value)
                            }
                        >
                            <option value="editor">Content editor</option>
                            <option value="admin">Administrator</option>
                        </select>
                    </Field>
                    <div className="permission-note">
                        <ShieldCheck size={17} />
                        <p>
                            Editors manage content, categories, media, and SEO.
                            Administrators also manage settings, team access,
                            orders, and messages.
                        </p>
                    </div>
                    <Button disabled={form.processing}>
                        <Plus size={16} />
                        Add team member
                    </Button>
                </form>
            </div>
        </AdminLayout>
    );
}
