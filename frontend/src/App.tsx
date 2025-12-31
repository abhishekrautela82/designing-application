import React, { useMemo, useState } from "react";
import {
    clearToken,
    createExport,
    createProject,
    getExport,
    listProjects,
    prepareUpload,
    readToken,
    setManualToken,
    type Project,
    type ProjectType
} from "./api";
import { finalizeCapture, uploadToSignedUrl } from "./api";

export function App() {
    const [token, setToken] = useState(() => readToken());
    const [busy, setBusy] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string>("");

    const selectedProject = useMemo(
        () => projects.find((p) => p.id === selectedProjectId) ?? null,
        [projects, selectedProjectId]
    );

    const [newName, setNewName] = useState<string>("My Project");
    const [newType, setNewType] = useState<ProjectType>("interior");

    const [file, setFile] = useState<File | null>(null);

    const [versionId, setVersionId] = useState<string>("v-placeholder");
    const [exportId, setExportId] = useState<string>("");
    const [exportStatus, setExportStatus] = useState<string>("");
    const [downloadUrls, setDownloadUrls] = useState<string[]>([]);

    async function refreshProjects() {
        setError(null);
        setBusy("Loading projects...");
        try {
            const items = await listProjects();
            setProjects(items);
            if (!selectedProjectId && items[0]) setSelectedProjectId(items[0].id);
            setToken(readToken());
        } catch (e: any) {
            setError(e?.message ?? String(e));
        } finally {
            setBusy(null);
        }
    }

    async function onCreateProject() {
        setError(null);
        setBusy("Creating project...");
        try {
            const p = await createProject({ name: newName, type: newType });
            setProjects((prev) => [p, ...prev]);
            setSelectedProjectId(p.id);
            setToken(readToken());
        } catch (e: any) {
            setError(e?.message ?? String(e));
        } finally {
            setBusy(null);
        }
    }

    async function onUpload() {
        if (!selectedProjectId) {
            setError("Select a project first");
            return;
        }
        if (!file) {
            setError("Choose a file first");
            return;
        }

        setError(null);
        setBusy("Preparing upload...");
        try {
            const uploads = await prepareUpload(selectedProjectId, 1);
            const { key, url } = uploads[0];
            setBusy("Uploading to storage...");
            await uploadToSignedUrl(url, file);
            setBusy("Finalizing capture...");
            await finalizeCapture(selectedProjectId, [key]);
            setToken(readToken());
            setBusy("Upload complete");
            setTimeout(() => setBusy(null), 800);
        } catch (e: any) {
            setError(e?.message ?? String(e));
            setBusy(null);
        }
    }

    async function onCreateExport() {
        if (!selectedProjectId) {
            setError("Select a project first");
            return;
        }
        setError(null);
        setBusy("Creating export job...");
        setDownloadUrls([]);
        try {
            const exp = await createExport({ projectId: selectedProjectId, versionId, type: "before_after", quality: "high" });
            setExportId(exp.id);
            setExportStatus(`${exp.status} (${Math.round(exp.progress * 100)}%)`);
            setBusy(null);
        } catch (e: any) {
            setError(e?.message ?? String(e));
            setBusy(null);
        }
    }

    async function onPollExport() {
        if (!selectedProjectId || !exportId) {
            setError("Create an export job first");
            return;
        }
        setError(null);
        setBusy("Polling export...");
        try {
            const data = await getExport(selectedProjectId, exportId, true);
            setExportStatus(`${data.export.status} (${Math.round((data.export.progress ?? 0) * 100)}%)`);
            setDownloadUrls(data.downloadUrls ?? []);
            setBusy(null);
        } catch (e: any) {
            setError(e?.message ?? String(e));
            setBusy(null);
        }
    }

    return (
        <div className="container">
            <h1>Designing Application — Local Review UI</h1>

            <div className="grid">
                <div className="card">
                    <h2>Auth (dev)</h2>
                    <div className="small">The backend can auto-issue a dev token via the <span className="mono">x-dev-token</span> header.</div>
                    <hr />
                    <div className="row">
                        <label>Dev token</label>
                        <input
                            style={{ flex: 1, minWidth: 260 }}
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            placeholder="(auto-filled after first API call)"
                        />
                        <button
                            onClick={() => {
                                setManualToken(token);
                                setToken(readToken());
                            }}
                        >
                            Save
                        </button>
                        <button
                            onClick={() => {
                                clearToken();
                                setToken("");
                            }}
                        >
                            Clear
                        </button>
                    </div>
                    <div className="row" style={{ marginTop: 10 }}>
                        <button className="primary" onClick={refreshProjects}>
                            Connect + Load Projects
                        </button>
                    </div>
                </div>

                <div className="card">
                    <h2>Projects</h2>
                    <div className="row">
                        <label>Name</label>
                        <input value={newName} onChange={(e) => setNewName(e.target.value)} />
                        <label>Type</label>
                        <select value={newType} onChange={(e) => setNewType(e.target.value as ProjectType)}>
                            <option value="interior">interior</option>
                            <option value="exterior">exterior</option>
                        </select>
                        <button className="primary" onClick={onCreateProject}>Create</button>
                    </div>

                    <hr />
                    <div className="row">
                        <label>Select</label>
                        <select
                            style={{ minWidth: 280 }}
                            value={selectedProjectId}
                            onChange={(e) => setSelectedProjectId(e.target.value)}
                        >
                            <option value="">(none)</option>
                            {projects.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name} — {p.type}
                                </option>
                            ))}
                        </select>
                        {selectedProject && <span className="small">ID: <span className="mono">{selectedProject.id}</span></span>}
                    </div>
                </div>

                <div className="card">
                    <h2>Upload capture (signed URL)</h2>
                    <div className="small">Uploads 1 image to MinIO/S3 using a presigned PUT URL, then registers it as a Capture.</div>
                    <hr />
                    <div className="row">
                        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                        <button className="primary" onClick={onUpload}>Upload</button>
                    </div>
                </div>

                <div className="card">
                    <h2>Export (server-side)</h2>
                    <div className="small">Creates an export job and fetches signed download URLs once ready.</div>
                    <hr />
                    <div className="row">
                        <label>Version ID</label>
                        <input value={versionId} onChange={(e) => setVersionId(e.target.value)} />
                        <button className="primary" onClick={onCreateExport}>Create export job</button>
                        <button onClick={onPollExport}>Poll + get signed URLs</button>
                    </div>
                    <div className="small" style={{ marginTop: 10 }}>
                        Export ID: <span className="mono">{exportId || "(none)"}</span>
                    </div>
                    <div className="small">Status: <span className="mono">{exportStatus || "(unknown)"}</span></div>

                    {downloadUrls.length > 0 && (
                        <>
                            <hr />
                            <div className="small">Download URLs (open in new tab):</div>
                            <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
                                {downloadUrls.map((u) => (
                                    <a key={u} href={u} target="_blank" rel="noreferrer" className="mono">
                                        {u}
                                    </a>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {busy && (
                <div className="card" style={{ marginTop: 12 }}>
                    <div><strong>{busy}</strong></div>
                </div>
            )}

            {error && (
                <div className="card" style={{ marginTop: 12, borderColor: "#f2b8b5", background: "#fff5f5" }}>
                    <div><strong>Error</strong></div>
                    <div className="mono">{error}</div>
                </div>
            )}

            <div className="small" style={{ marginTop: 12 }}>
                Backend expected at <span className="mono">http://localhost:8080</span>. Vite proxies <span className="mono">/api</span> and <span className="mono">/health</span>.
            </div>
        </div>
    );
}
