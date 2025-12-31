// Type definitions for the full app
export type ProjectType = "interior" | "exterior";
export type JobStatus = "queued" | "running" | "succeeded" | "failed";
export type ExportType = "before_after" | "snippets";
export type ExportQuality = "standard" | "high";

export interface Project {
    id: string;
    name: string;
    type: ProjectType;
    createdAt: string;
    updatedAt: string;
}

export interface Capture {
    id: string;
    projectId: string;
    originalUrls: string[];
    metadata: any;
    createdAt: string;
}

export interface Scene {
    id: string;
    projectId: string;
    status: JobStatus;
    progress: number;
    error: string | null;
    artifacts: any;
    createdAt: string;
}

export interface DesignVersion {
    id: string;
    projectId: string;
    baseVersionId: string | null;
    operations: any;
    createdAt: string;
}

export interface Snippet {
    id: string;
    projectId: string;
    versionId: string;
    label: string | null;
    camera: any;
    lightingPresetId: string;
    createdAt: string;
}

export interface ExportJob {
    id: string;
    projectId: string;
    versionId: string;
    type: ExportType;
    quality: ExportQuality;
    snippetIds: string[];
    status: JobStatus;
    progress: number;
    error: string | null;
    resultUrls: string[];
    createdAt: string;
}

// API client
const TOKEN_KEY = "devToken";

function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

function setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
}

export function readToken(): string {
    return getToken() ?? "";
}

export function setManualToken(token: string) {
    setToken(token);
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
    const headers = new Headers(init?.headers ?? {});
    headers.set("accept", "application/json");

    const token = getToken();
    if (token) headers.set("authorization", `Bearer ${token}`);

    const res = await fetch(path, { ...init, headers });

    const devToken = res.headers.get("x-dev-token");
    if (devToken) setToken(devToken);

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status} ${res.statusText}: ${text}`);
    }

    return (await res.json()) as T;
}

// Projects
export async function listProjects(): Promise<Project[]> {
    const data = await apiFetch<{ projects: Project[] }>("/api/v1/projects");
    return data.projects;
}

export async function createProject(input: { name: string; type: ProjectType }): Promise<Project> {
    const data = await apiFetch<{ project: Project }>("/api/v1/projects", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
    });
    return data.project;
}

export async function getProject(projectId: string): Promise<Project> {
    const data = await apiFetch<{ project: Project }>(`/api/v1/projects/${projectId}`);
    return data.project;
}

export async function deleteProject(projectId: string): Promise<void> {
    await apiFetch(`/api/v1/projects/${projectId}`, { method: "DELETE" });
}

// Captures
export async function prepareUpload(
    projectId: string,
    count: number,
    contentType?: string
): Promise<{ key: string; url: string }[]> {
    const data = await apiFetch<{ uploads: { key: string; url: string }[] }>(
        `/api/v1/projects/${projectId}/captures:prepareUpload`,
        {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ count, contentType }),
        }
    );
    return data.uploads;
}

export async function uploadToSignedUrl(url: string, file: File): Promise<void> {
    const res = await fetch(url, {
        method: "PUT",
        headers: { "content-type": file.type || "application/octet-stream" },
        body: file,
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Upload failed: ${res.status} ${res.statusText}: ${text}`);
    }
}

export async function finalizeCapture(projectId: string, keys: string[]): Promise<Capture> {
    const data = await apiFetch<{ capture: Capture }>(`/api/v1/projects/${projectId}/captures`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ files: keys.map((key) => ({ key })) }),
    });
    return data.capture;
}

export async function listCaptures(projectId: string): Promise<Capture[]> {
    const data = await apiFetch<{ captures: Capture[] }>(`/api/v1/projects/${projectId}/captures`);
    return data.captures;
}

// Scene
export async function buildScene(projectId: string): Promise<Scene> {
    const data = await apiFetch<{ scene: Scene }>(`/api/v1/projects/${projectId}/scene:build`, {
        method: "POST",
    });
    return data.scene;
}

export async function getScene(projectId: string): Promise<Scene> {
    const data = await apiFetch<{ scene: Scene }>(`/api/v1/projects/${projectId}/scene`);
    return data.scene;
}

// Versions
export async function createVersion(input: {
    projectId: string;
    baseVersionId?: string;
    operations: any;
}): Promise<DesignVersion> {
    const data = await apiFetch<{ version: DesignVersion }>(`/api/v1/projects/${input.projectId}/versions`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ baseVersionId: input.baseVersionId, operations: input.operations }),
    });
    return data.version;
}

export async function listVersions(projectId: string): Promise<DesignVersion[]> {
    const data = await apiFetch<{ versions: DesignVersion[] }>(`/api/v1/projects/${projectId}/versions`);
    return data.versions;
}

export async function getVersion(projectId: string, versionId: string): Promise<DesignVersion> {
    const data = await apiFetch<{ version: DesignVersion }>(`/api/v1/projects/${projectId}/versions/${versionId}`);
    return data.version;
}

// Snippets
export async function createSnippet(input: {
    projectId: string;
    versionId: string;
    camera: any;
    lightingPresetId: string;
    label?: string;
}): Promise<Snippet> {
    const data = await apiFetch<{ snippet: Snippet }>(`/api/v1/projects/${input.projectId}/snippets`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
            versionId: input.versionId,
            camera: input.camera,
            lightingPresetId: input.lightingPresetId,
            label: input.label,
        }),
    });
    return data.snippet;
}

export async function listSnippets(projectId: string): Promise<Snippet[]> {
    const data = await apiFetch<{ snippets: Snippet[] }>(`/api/v1/projects/${projectId}/snippets`);
    return data.snippets;
}

// Exports
export async function createExport(input: {
    projectId: string;
    versionId: string;
    type: ExportType;
    quality: ExportQuality;
    snippetIds?: string[];
}): Promise<ExportJob> {
    const data = await apiFetch<{ export: ExportJob }>(`/api/v1/projects/${input.projectId}/exports`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
            versionId: input.versionId,
            snippetIds: input.snippetIds ?? [],
            type: input.type,
            quality: input.quality,
        }),
    });
    return data.export;
}

export async function getExport(
    projectId: string,
    exportId: string,
    signed: boolean
): Promise<{ export: ExportJob; downloadUrls?: string[] }> {
    const suffix = signed ? "?signed=1" : "";
    return await apiFetch(`/api/v1/projects/${projectId}/exports/${exportId}${suffix}`);
}
