import React, { useEffect, useState } from "react";
import type { Capture, DesignVersion, ExportJob, Project } from "../api-client";
import {
    createExport,
    createVersion,
    getExport,
    listCaptures,
    listVersions,
} from "../api-client";

interface Props {
    project: Project;
    onBack: () => void;
}

type EditorMode = "surfaces" | "objects" | "lighting" | "refine";

export function EditorScreen({ project, onBack }: Props) {
    const [mode, setMode] = useState<EditorMode>("surfaces");
    const [captures, setCaptures] = useState<Capture[]>([]);
    const [versions, setVersions] = useState<DesignVersion[]>([]);
    const [selectedVersion, setSelectedVersion] = useState<DesignVersion | null>(null);
    const [operations, setOperations] = useState<any>({ surfaces: [], objects: [], lighting: {} });
    const [showBeforeAfter, setShowBeforeAfter] = useState(false);
    const [saving, setSaving] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [exportJob, setExportJob] = useState<ExportJob | null>(null);
    const [downloadUrls, setDownloadUrls] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadEditorData();
    }, [project.id]);

    async function loadEditorData() {
        try {
            const [caps, vers] = await Promise.all([
                listCaptures(project.id),
                listVersions(project.id),
            ]);
            setCaptures(caps);
            setVersions(vers);
            if (vers.length > 0) {
                setSelectedVersion(vers[0]);
                setOperations(vers[0].operations ?? { surfaces: [], objects: [], lighting: {} });
            }
        } catch (e: any) {
            setError(e?.message ?? String(e));
        }
    }

    async function handleSaveVersion() {
        setSaving(true);
        setError(null);
        try {
            const newVersion = await createVersion({
                projectId: project.id,
                baseVersionId: selectedVersion?.id,
                operations,
            });
            setVersions((prev) => [newVersion, ...prev]);
            setSelectedVersion(newVersion);
        } catch (e: any) {
            setError(e?.message ?? String(e));
        } finally {
            setSaving(false);
        }
    }

    async function handleCreateExport() {
        if (!selectedVersion) {
            setError("Save a version first before exporting");
            return;
        }
        setExporting(true);
        setError(null);
        try {
            const job = await createExport({
                projectId: project.id,
                versionId: selectedVersion.id,
                type: "before_after",
                quality: "high",
            });
            setExportJob(job);
            pollExport(job.id);
        } catch (e: any) {
            setError(e?.message ?? String(e));
            setExporting(false);
        }
    }

    async function pollExport(exportId: string) {
        try {
            const result = await getExport(project.id, exportId, true);
            setExportJob(result.export);
            if (result.downloadUrls) {
                setDownloadUrls(result.downloadUrls);
            }
            if (result.export.status === "running" || result.export.status === "queued") {
                setTimeout(() => pollExport(exportId), 2000);
            } else {
                setExporting(false);
            }
        } catch (e: any) {
            setError(e?.message ?? String(e));
            setExporting(false);
        }
    }

    function addSurfaceEdit(surface: string, material: string) {
        setOperations((prev: any) => ({
            ...prev,
            surfaces: [...prev.surfaces, { surface, material, timestamp: Date.now() }],
        }));
    }

    function addObjectPlacement(objectType: string, position: { x: number; y: number }) {
        setOperations((prev: any) => ({
            ...prev,
            objects: [...prev.objects, { objectType, position, timestamp: Date.now() }],
        }));
    }

    function setLightingPreset(preset: string) {
        setOperations((prev: any) => ({
            ...prev,
            lighting: { preset, timestamp: Date.now() },
        }));
    }

    return (
        <div className="screen editor-screen">
            <div className="editor-header">
                <button className="btn-link" onClick={onBack}>
                    ← Back to Project
                </button>
                <h2>Editor — {project.name}</h2>
                <div className="editor-actions">
                    <button className="btn-toggle" onClick={() => setShowBeforeAfter(!showBeforeAfter)}>
                        {showBeforeAfter ? "Hide" : "Show"} Before/After
                    </button>
                    <button className="btn-secondary" onClick={handleSaveVersion} disabled={saving}>
                        {saving ? "Saving..." : "Save Version"}
                    </button>
                    <button className="btn-primary" onClick={handleCreateExport} disabled={exporting}>
                        {exporting ? "Exporting..." : "Export"}
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

            <div className="editor-layout">
                <div className="editor-sidebar">
                    <div className="mode-selector">
                        <button
                            className={mode === "surfaces" ? "active" : ""}
                            onClick={() => setMode("surfaces")}
                        >
                            <span className="icon">🎨</span>
                            Surfaces
                        </button>
                        <button
                            className={mode === "objects" ? "active" : ""}
                            onClick={() => setMode("objects")}
                        >
                            <span className="icon">🪑</span>
                            Objects
                        </button>
                        <button
                            className={mode === "lighting" ? "active" : ""}
                            onClick={() => setMode("lighting")}
                        >
                            <span className="icon">💡</span>
                            Lighting
                        </button>
                        <button className={mode === "refine" ? "active" : ""} onClick={() => setMode("refine")}>
                            <span className="icon">✏️</span>
                            Refine
                        </button>
                    </div>

                    <div className="tools-panel">
                        {mode === "surfaces" && (
                            <div className="tools-section">
                                <h3>Paint & Materials</h3>
                                <p className="tool-hint">Click on walls, floors, or ceilings to apply materials.</p>
                                <div className="material-grid">
                                    {["White Paint", "Grey Paint", "Wood Floor", "Marble", "Tile", "Brick"].map(
                                        (mat) => (
                                            <button
                                                key={mat}
                                                className="material-btn"
                                                onClick={() => addSurfaceEdit("wall", mat)}
                                            >
                                                {mat}
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>
                        )}

                        {mode === "objects" && (
                            <div className="tools-section">
                                <h3>Object Placement</h3>
                                <p className="tool-hint">Select an object and click in the canvas to place it.</p>
                                <div className="object-grid">
                                    {project.type === "interior"
                                        ? ["Sofa", "Chair", "Table", "Lamp", "Plant", "Rug"].map((obj) => (
                                              <button
                                                  key={obj}
                                                  className="object-btn"
                                                  onClick={() =>
                                                      addObjectPlacement(obj, {
                                                          x: Math.random(),
                                                          y: Math.random(),
                                                      })
                                                  }
                                              >
                                                  {obj}
                                              </button>
                                          ))
                                        : ["Tree", "Planter", "Paving", "Fence", "Lighting", "Bench"].map((obj) => (
                                              <button
                                                  key={obj}
                                                  className="object-btn"
                                                  onClick={() =>
                                                      addObjectPlacement(obj, {
                                                          x: Math.random(),
                                                          y: Math.random(),
                                                      })
                                                  }
                                              >
                                                  {obj}
                                              </button>
                                          ))}
                                </div>
                            </div>
                        )}

                        {mode === "lighting" && (
                            <div className="tools-section">
                                <h3>Lighting Presets</h3>
                                <div className="preset-list">
                                    {["Natural", "Warm", "Cool", "Dramatic", "Soft", "Bright"].map((preset) => (
                                        <button
                                            key={preset}
                                            className="preset-btn"
                                            onClick={() => setLightingPreset(preset)}
                                        >
                                            {preset}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {mode === "refine" && (
                            <div className="tools-section">
                                <h3>Mask Refinement</h3>
                                <p className="tool-hint">Brush to refine edges and fix material boundaries.</p>
                                <div className="refine-tools">
                                    <button className="tool-btn">Brush</button>
                                    <button className="tool-btn">Eraser</button>
                                    <button className="tool-btn">Auto-refine</button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="version-history">
                        <h3>Versions</h3>
                        <div className="version-list">
                            {versions.map((v) => (
                                <div
                                    key={v.id}
                                    className={`version-item ${selectedVersion?.id === v.id ? "active" : ""}`}
                                    onClick={() => {
                                        setSelectedVersion(v);
                                        setOperations(v.operations ?? { surfaces: [], objects: [], lighting: {} });
                                    }}
                                >
                                    <div className="version-label">v{v.id.slice(0, 6)}</div>
                                    <div className="version-date">{new Date(v.createdAt).toLocaleTimeString()}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="editor-canvas">
                    <div className="canvas-container">
                        {captures.length === 0 ? (
                            <div className="canvas-placeholder">
                                <p>📷</p>
                                <p>No captures available. Add photos to your project first.</p>
                            </div>
                        ) : (
                            <div className="canvas-placeholder">
                                <p>🎨</p>
                                <p>
                                    <strong>Editor Canvas</strong>
                                </p>
                                <p>
                                    This is a desktop preview UI. The actual photo-editing canvas with masks, materials,
                                    and object placement will be implemented in the mobile app.
                                </p>
                                <p className="operation-count">
                                    Operations applied: {operations.surfaces?.length ?? 0} surfaces,{" "}
                                    {operations.objects?.length ?? 0} objects,{" "}
                                    {operations.lighting?.preset ? "lighting set" : "no lighting"}
                                </p>
                            </div>
                        )}
                    </div>

                    {showBeforeAfter && (
                        <div className="before-after-slider">
                            <div className="slider-label">Before ← → After</div>
                        </div>
                    )}
                </div>
            </div>

            {exportJob && (
                <div className="export-status">
                    <div className="export-status-header">
                        <h3>Export Job</h3>
                        <span className={`status-badge status-${exportJob.status}`}>{exportJob.status}</span>
                    </div>
                    <div className="export-progress">
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{ width: `${Math.round((exportJob.progress ?? 0) * 100)}%` }}
                            ></div>
                        </div>
                        <span>{Math.round((exportJob.progress ?? 0) * 100)}%</span>
                    </div>
                    {downloadUrls.length > 0 && (
                        <div className="export-downloads">
                            <h4>Downloads</h4>
                            {downloadUrls.map((url, i) => (
                                <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="download-link">
                                    Download Export {i + 1}
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
