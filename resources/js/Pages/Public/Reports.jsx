import React from "react";
import { usePage } from "@inertiajs/react";
import { Download, FileText, LockKeyhole } from "lucide-react";
import SiteLayout from "../../Components/SiteLayout";

export default function Reports({ reports, seo }) {
    const { auth } = usePage().props;
    return (
        <SiteLayout seo={seo} noindex={Boolean(auth.user)}>
            <section className="site-page-intro">
                <span className="site-eyebrow">KNOWLEDGE TO TAKE WITH YOU</span>
                <h1>Useful little resources.</h1>
                <p>
                    Explore public reports and documents assigned to your
                    customer account.
                </p>
            </section>
            <section className="site-section">
                <div className="public-report-grid">
                    {reports.map((report) => (
                        <article className="public-report-card" key={report.id}>
                            <span className="resource-symbol">
                                {report.audience === "customer" ? (
                                    <LockKeyhole size={25} />
                                ) : (
                                    <FileText size={25} />
                                )}
                            </span>
                            <span className="site-eyebrow">
                                {report.audience === "customer"
                                    ? "ONLY FOR YOUR ACCOUNT"
                                    : "PUBLIC RESOURCE"}
                            </span>
                            <h2>{report.title}</h2>
                            <p>{report.summary}</p>
                            <a
                                className="site-text-link"
                                href={`/reports/${report.slug}/download`}
                            >
                                <Download size={15} />
                                Download · {Math.ceil(report.size / 1024)} KB
                            </a>
                        </article>
                    ))}
                </div>
                {!reports.length && (
                    <p className="public-empty">
                        There are no resources available for you just yet.
                    </p>
                )}
            </section>
        </SiteLayout>
    );
}
