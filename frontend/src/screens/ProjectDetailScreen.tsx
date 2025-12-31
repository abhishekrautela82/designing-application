import React, { useEffect, useState } from "react";
import type { Capture, DesignVersion, ExportJob, Project, Scene, Snippet } from "../api-client";
import {
    buildScene,
    createExport,
    finalizeCapture,
    getExport,
    getScene,
    listCaptures,
    listSnippets,
    listVersions,
    prepareUpload,
    uploadToSignedUrl,
} from "../api-client";

interface Props {
    project: Project;
    onBack: () => void;
    onOpenEditor: () => void;
}

export function ProjectDetailScreen({ project, onBack, onOpenEditor }: Props) {
    const [activeTab, setActiveTab] = useState<"captures" | "versions" | "snippets" | "exports">("captures");
    const [captures, setCaptures] = useState<Capture[]>([]);
    const [versions, setVersions] = useState<DesignVersion[]>([]);
    const [snippets, setSnippets] = useState<Snippet[]>([]);
    const [scene, setScene] = useState<Scene | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        loadData();
    }, [project.id, activeTab]);

    async function loadData() {
        setLoading(true);
        setError(null);
        try {
            if (activeTab === "captures") {
                setCaptures(await listCaptures(project.id));
            } else if (activeTab === "versions") {
                setVersions(await listVersions(project.id));
            } else if (activeTab === "snippets") {
                setSnippets(await listSnippets(project.id));
            }
        } catch (e: any) {
            setError(e?.message ?? String(e));
        } finally {
            setLoading(false);
        }
    }

    async function handleUpload() {
        if (!uploadFile) return;
        setUploading(true);
        setError(null);
        try {
            const uploads = await prepareUpload(project.id, 1, uploadFile.type);
            await uploadToSignedUrl(uploads[0].url, uploadFile);
            await finalizeCapture(project.id, [uploads[0].key]);
            setUploadFile(null);
            loadData();
        } catch (e: any) {
            setError(e?.message ?? String(e));
        } finally {
            setUploading(false);
        }
    }

    async function handleBuildScene() {
        setLoading(true);
        setError(null);
        try {
            const newScene = await buildScene(project.id);
            setScene(newScene);
        } catch (e: any) {
            setError(e?.message ?? String(e));
        } finally {
            setLoading(false);
        }
    }

    async function handleCheckScene() {
        setLoading(true);
        setError(null);
        try {
            const s = await getScene(project.id);
            setScene(s);
        } catch (e: any) {
            setError(e?.message ?? String(e));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="screen project-detail-screen">
            <div className="screen-header">
                <div>
                    <button className="btn-link" onClick={onBack}>
                        ← Back
                    </button>
                    <h2>{project.name}</h2>
                    <span className={`badge badge-${project.type}`}>{project.type}</span>
                </div>
                <div className="actions">
                    <button className="btn-primary" onClick={onOpenEditor}>
                        Open Editor
                    </button>
                </div>
            </div>

            {error && (
                <div className="error-banner">
                    {error}
                    <button className="close" onClick={() => setError(null)}>
                        ×
                    </button>
                </div>
            )}

            <div className="tabs">
                <button
                    className={activeTab === "captures" ? "active" : ""}
                    onClick={() => setActiveTab("captures")}
                >
                    Captures ({captures.length})
                </button>
                <button
                    className={activeTab === "versions" ? "active" : ""}
                    onClick={() => setActiveTab("versions")}
                >
                    Versions ({versions.length})
                </button>
                <button
                    className={activeTab === "snippets" ? "active" : ""}
                    onClick={() => setActiveTab("snippets")}
                >
                    Snippets ({snippets.length})
                </button>
                <button className={activeTab === "exports" ? "active" : ""} onClick={() => setActiveTab("exports")}>
                    Exports
                </button>
            </div>

            <div className="tab-content">
                {activeTab === "captures" && (
                    <div className="captures-tab">
                        <div className="section-header">
                            <h3>Photo Captures</h3>
                            <div className="upload-section">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                                    disabled={uploading}
                                />
                                <button
                                    className="btn-primary"
                                    onClick={handleUpload}
                                    disabled={!uploadFile || uploading}
                                >
                                    {uploading ? "Uploading..." : "Upload Photo"}
                                </button>
                            </div>
                        </div>

                        {captures.length === 0 && !loading && (
                            <div className="empty-state">
                                <p>No captures yet. Upload photos of your space to get started.</p>
                            </div>
                        )}

                        <div className="captures-list">
                            {captures.map((capture) => (
                                <div key={capture.id} className="capture-item">
                                    <div className="capture-icon">📷</div>
                                    <div className="capture-info">
                                        <div className="capture-date">
                                            {new Date(capture.createdAt).toLocaleString()}
                                        </div>
                                        <div className="capture-files">{capture.originalUrls.length} file(s)</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {captures.length > 0 && (
                            <div className="scene-section">
                                <h3>3D Scene Build</h3>
                                {!scene ? (
                                    <div className="scene-controls">
                                        <p>Build a 3D scene from your captures for better angles and AR preview.</p>
                                        <button className="btn-secondary" onClick={handleBuildScene} disabled={loading}>
                                            {loading ? "Starting..." : "Build 3D Scene"}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="scene-status">
                                        <div className="status-row">
                                            <span>Status:</span>
                                            <span className={`status-badge status-${scene.status}`}>
                                                {scene.status}
                                            </span>
                                        </div>
                                        <div className="status-row">
                                            <span>Progress:</span>
                                            <span>{Math.round(scene.progress * 100)}%</span>
                                        </div>
                                        {scene.error && (
                                            <div className="status-error">Error: {scene.error}</div>
                                        )}
                                        <button className="btn-secondary" onClick={handleCheckScene} disabled={loading}>
                                            Refresh Status
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "versions" && (
                    <div className="versions-tab">
                        <h3>Design Versions</h3>
                        {versions.length === 0 && !loading && (
                            <div className="empty-state">
                                <p>No design versions yet. Open the editor to create variations.</p>
                            </div>
                        )}
                        <div className="versions-list">
                            {versions.map((version) => (
                                <div key={version.id} className="version-item">
                                    <div className="version-icon">🎨</div>
                                    <div className="version-info">
                                        <div className="version-id">Version {version.id.slice(0, 8)}</div>
                                        <div className="version-date">
                                            {new Date(version.createdAt).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === "snippets" && (
                    <div className="snippets-tab">
                        <h3>Viewpoint Snippets</h3>
                        {snippets.length === 0 && !loading && (
                            <div className="empty-state">
                                <p>No snippets saved. Use 3D/AR mode to capture specific angles with lighting.</p>
                            </div>
                        )}
                        <div className="snippets-grid">
                            {snippets.map((snippet) => (
                                <div key={snippet.id} className="snippet-card">
                                    <div className="snippet-preview">📸</div>
                                    <div className="snippet-label">{snippet.label || "Untitled"}</div>
                                    <div className="snippet-date">
                                        {new Date(snippet.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === "exports" && (
                    <div className="exports-tab">
                        <h3>Export Jobs</h3>
                        <div className="export-info">
                            <p>Server-side rendering for high-quality before/after comparisons and snippet exports.</p>
                            <p className="note">Create exports from the editor after applying your designs.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
