import React, { useState } from "react";
import type { Project, ProjectType } from "../api-client";
import { createProject } from "../api-client";

interface Props {
    projects: Project[];
    loading: boolean;
    onRefresh: () => void;
    onOpenProject: (projectId: string) => void;
}

export function ProjectsScreen({ projects, loading, onRefresh, onOpenProject }: Props) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newName, setNewName] = useState("");
    const [newType, setNewType] = useState<ProjectType>("interior");
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleCreate() {
        if (!newName.trim()) {
            setError("Project name is required");
            return;
        }
        setCreating(true);
        setError(null);
        try {
            await createProject({ name: newName, type: newType });
            setNewName("");
            setShowCreateModal(false);
            onRefresh();
        } catch (e: any) {
            setError(e?.message ?? String(e));
        } finally {
            setCreating(false);
        }
    }

    return (
        <div className="screen projects-screen">
            <div className="screen-header">
                <h2>Your Projects</h2>
                <div className="actions">
                    <button className="btn-secondary" onClick={onRefresh} disabled={loading}>
                        {loading ? "Loading..." : "Refresh"}
                    </button>
                    <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
                        + New Project
                    </button>
                </div>
            </div>

            {projects.length === 0 && !loading && (
                <div className="empty-state">
                    <p>No projects yet. Create your first interior or exterior design project to get started!</p>
                </div>
            )}

            <div className="projects-grid">
                {projects.map((project) => (
                    <div
                        key={project.id}
                        className="project-card"
                        onClick={() => onOpenProject(project.id)}
                    >
                        <div className="project-card-header">
                            <h3>{project.name}</h3>
                            <span className={`badge badge-${project.type}`}>{project.type}</span>
                        </div>
                        <div className="project-card-footer">
                            <span className="date">Created {new Date(project.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                ))}
            </div>

            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Create New Project</h3>
                            <button className="close" onClick={() => setShowCreateModal(false)}>
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            {error && <div className="error-message">{error}</div>}
                            <div className="form-group">
                                <label>Project Name</label>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="e.g., Living Room Redesign"
                                    autoFocus
                                />
                            </div>
                            <div className="form-group">
                                <label>Project Type</label>
                                <div className="radio-group">
                                    <label className="radio-label">
                                        <input
                                            type="radio"
                                            name="type"
                                            value="interior"
                                            checked={newType === "interior"}
                                            onChange={() => setNewType("interior")}
                                        />
                                        <span>Interior</span>
                                    </label>
                                    <label className="radio-label">
                                        <input
                                            type="radio"
                                            name="type"
                                            value="exterior"
                                            checked={newType === "exterior"}
                                            onChange={() => setNewType("exterior")}
                                        />
                                        <span>Exterior</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                                Cancel
                            </button>
                            <button className="btn-primary" onClick={handleCreate} disabled={creating}>
                                {creating ? "Creating..." : "Create Project"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
