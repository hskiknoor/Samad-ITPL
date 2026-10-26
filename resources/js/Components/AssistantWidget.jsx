import React, { useEffect, useRef, useState } from "react";
import { usePage } from "@inertiajs/react";
import { ArrowUpRight, MessageCircle, Send, Sparkles, X } from "lucide-react";

export default function AssistantWidget() {
    const { site, assistantWelcome, auth } = usePage().props;
    const [open, setOpen] = useState(false);
    const [question, setQuestion] = useState("");
    const [messages, setMessages] = useState([]);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const input = useRef(null);
    const end = useRef(null);
    useEffect(() => {
        setMessages([]);
    }, [auth.user?.id]);
    useEffect(() => {
        if (open) input.current?.focus();
    }, [open]);
    useEffect(() => {
        end.current?.scrollIntoView({ block: "nearest" });
    }, [messages, busy]);
    const ask = async (event) => {
        event.preventDefault();
        if (busy || question.trim().length < 2) return;
        const text = question.trim();
        setQuestion("");
        setError("");
        setBusy(true);
        setMessages((old) => [...old, { question: text }]);
        try {
            const token = document.cookie
                .split("; ")
                .find((value) => value.startsWith("XSRF-TOKEN="))
                ?.split("=")
                .slice(1)
                .join("=");
            const response = await fetch("/assistant", {
                method: "POST",
                credentials: "same-origin",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-XSRF-TOKEN": decodeURIComponent(token || ""),
                },
                body: JSON.stringify({ question: text }),
            });
            if (!response.ok)
                throw new Error(
                    response.status === 429
                        ? "A few too many questions. Please try again in a minute."
                        : "I could not complete that request. Please try again.",
                );
            const data = await response.json();
            setMessages((old) => [...old, data]);
        } catch (problem) {
            setError(problem.message);
        } finally {
            setBusy(false);
        }
    };
    return (
        <div className="assistant-widget">
            {open && (
                <section
                    className="assistant-window"
                    aria-label="Website assistant"
                >
                    <header>
                        <span className="assistant-symbol">
                            <Sparkles size={19} />
                        </span>
                        <div>
                            <strong>Ask {site.name}</strong>
                            <small>Website knowledge & your own records</small>
                        </div>
                        <button
                            className="icon-button"
                            aria-label="Close assistant"
                            onClick={() => setOpen(false)}
                        >
                            <X size={18} />
                        </button>
                    </header>
                    <div className="assistant-messages" aria-live="polite">
                        <div className="assistant-reply">
                            {assistantWelcome}
                        </div>
                        {messages.length === 0 && (
                            <div className="assistant-suggestions">
                                {[
                                    "Find a report to download",
                                    "Show my orders",
                                    "Tell me about your products",
                                ].map((text) => (
                                    <button
                                        key={text}
                                        onClick={() => {
                                            setQuestion(text);
                                            input.current?.focus();
                                        }}
                                    >
                                        {text}
                                        <ArrowUpRight size={13} />
                                    </button>
                                ))}
                            </div>
                        )}
                        {messages.map((message, i) =>
                            message.question ? (
                                <div className="assistant-question" key={i}>
                                    {message.question}
                                </div>
                            ) : (
                                <article className="assistant-reply" key={i}>
                                    <span className="assistant-mode">
                                        {message.mode === "ai"
                                            ? "AI answer · website sources"
                                            : "Website search"}
                                    </span>
                                    <p>{message.answer}</p>
                                    {message.sources?.length > 0 && (
                                        <div className="assistant-sources">
                                            {message.sources.map(
                                                (source, j) => (
                                                    <a
                                                        href={source.url}
                                                        key={j}
                                                    >
                                                        {source.title}
                                                        <ArrowUpRight
                                                            size={13}
                                                        />
                                                    </a>
                                                ),
                                            )}
                                        </div>
                                    )}
                                    {message.actions?.map((action) => (
                                        <a
                                            className="assistant-action"
                                            key={action.url}
                                            href={action.url}
                                        >
                                            {action.label}
                                            <ArrowUpRight size={14} />
                                        </a>
                                    ))}
                                </article>
                            ),
                        )}
                        {busy && (
                            <p className="assistant-thinking">
                                Finding the right information…
                            </p>
                        )}
                        {error && (
                            <p role="alert" className="field-error">
                                {error}
                            </p>
                        )}
                        <div ref={end} />
                    </div>
                    <form onSubmit={ask}>
                        <input
                            ref={input}
                            aria-label="Ask the website assistant"
                            value={question}
                            onChange={(event) =>
                                setQuestion(event.target.value)
                            }
                            minLength={2}
                            maxLength={1500}
                            placeholder="Ask about this website…"
                            required
                        />
                        <button aria-label="Send question" disabled={busy}>
                            <Send size={17} />
                        </button>
                    </form>
                    <footer>
                        Private downloads require your customer account.
                    </footer>
                </section>
            )}
            <button
                className="assistant-launcher"
                onClick={() => setOpen(!open)}
                aria-label={
                    open ? "Close website assistant" : "Open website assistant"
                }
                aria-expanded={open}
            >
                <MessageCircle size={20} />
                <span>Ask {site.name}</span>
            </button>
        </div>
    );
}
