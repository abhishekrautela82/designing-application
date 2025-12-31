import React, { useEffect, useState } from "react";
import type { Project } from "./api-client";
import { clearToken, listProjects, readToken } from "./api-client";
import { ProjectsScreen } from "./screens/ProjectsScreen";
import { ProjectDetailScreen } from "./screens/ProjectDetailScreen";
import { EditorScreen } from "./screens/EditorScreen";

type Screen = "projects" | "project-detail" | "editor";

export function App() {
    const [token, setToken] = useState(() => readToken());
    const [screen, setScreen] = useState<Screen>("projects");
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Auto-load projects on mount
    useEffect(() => {
        loadProjects();
    }, []);

    async function loadProjects() {
        setLoading(true);
        setError(null);
        try {
            const items = await listProjects();
            setProjects(items);
            setToken(readToken());
        } catch (e: any) {
            setError(e?.message ?? String(e));
        } finally {
            setLoading(false);
        }
    }

    function openProject(projectId: string) {
        setSelectedProjectId(projectId);
        setScreen("project-detail");
    }

    function openEditor(projectId: string) {
        setSelectedProjectId(projectId);
        setScreen("editor");
    }

    function goBack() {
        if (screen === "editor") {
            setScreen("project-detail");
        } else {
            setScreen("projects");
            setSelectedProjectId(null);
        }
    }

    function handleLogout() {
        clearToken();
        setToken("");
        setProjects([]);
        setScreen("projects");
    }

    const selectedProject = projects.find((p) => p.id === selectedProjectId) ?? null;

    return (
        <div className="app-container">
            <header className="app-header">
                <div className="header-left">
                    <h1>Interior & Exterior Design Studio</h1>
                    <div className="breadcrumb">
                        {screen === "projects" && <span>Projects</span>}
                        {screen === "project-detail" && (
                            <>
                                <button className="link" onClick={() => setScreen("projects")}>
                                    Projects
                                </button>
                                <span> / {selectedProject?.name ?? "..."}</span>
                            </>
                        )}
                        {screen === "editor" && (
                            <>
                                <button className="link" onClick={() => setScreen("projects")}>
                                    Projects
                                </button>
                                <span> / </span>
                                <button className="link" onClick={() => setScreen("project-detail")}>
                                    {selectedProject?.name ?? "..."}
                                </button>
                                <span> / Editor</span>
                            </>
                        )}
                    </div>
                </div>
                <div className="header-right">
                    {token && (
                        <button className="btn-secondary" onClick={handleLogout}>
                            Logout (clear token)
                        </button>
                    )}
                </div>
            </header>

            <main className="app-main">
                {error && (
                    <div className="error-banner">
                        <strong>Error:</strong> {error}
                        <button className="close" onClick={() => setError(null)}>
                            ×
                        </button>
                    </div>
                )}

                {screen === "projects" && (
                    <ProjectsScreen
                        projects={projects}
                        loading={loading}
                        onRefresh={loadProjects}
                        onOpenProject={openProject}
                    />
                )}

                {screen === "project-detail" && selectedProject && (
                    <ProjectDetailScreen
                        project={selectedProject}
                        onBack={goBack}
                        onOpenEditor={() => openEditor(selectedProject.id)}
                    />
                )}

                {screen === "editor" && selectedProject && (
                    <EditorScreen project={selectedProject} onBack={goBack} />
                )}
            </main>
        </div>
    );
}
