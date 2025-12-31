export type ProjectType = "interior" | "exterior";

export type Project = {
    id: string;
    name: string;
    type: ProjectType;
    createdAt: string;
    updatedAt: string;
};

export type ExportJob = {
    id: string;
    status: "queued" | "running" | "succeeded" | "failed";
    progress: number;
    error: string | null;
    resultUrls: string[];
};

function getToken(): string | null {
    return localStorage.getItem("devToken");
}

function setToken(token: string) {
    localStorage.setItem("devToken", token);
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
    const headers = new Headers(init?.headers ?? {});
    headers.set("accept", "application/json");

    const token = getToken();
    if (token) headers.set("authorization", `Bearer ${token}`);

    const res = await fetch(path, { ...init, headers });

    // If backend issues x-dev-token and CORS exposes it, store it.
    const devToken = res.headers.get("x-dev-token");
    if (devToken) setToken(devToken);

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status} ${res.statusText}: ${text}`);
    }

    return (await res.json()) as T;
}

export async function listProjects(): Promise<Project[]> {
    const data = await apiFetch<{ projects: Project[] }>("/api/v1/projects");
    return data.projects;
}

export async function createProject(input: { name: string; type: ProjectType }): Promise<Project> {
    const data = await apiFetch<{ project: Project }>("/api/v1/projects", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input)
    });
    return data.project;
}

export async function prepareUpload(projectId: string, count: number): Promise<{ key: string; url: string }[]> {
    const data = await apiFetch<{ uploads: { key: string; url: string }[] }>(
        `/api/v1/projects/${projectId}/captures:prepareUpload`,
        {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ count, contentType: "image/jpeg" })
        }
    );
    return data.uploads;
}

export async function finalizeCapture(projectId: string, keys: string[]): Promise<void> {
    await apiFetch(`/api/v1/projects/${projectId}/captures`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ files: keys.map((key) => ({ key })) })
    });
}

export async function uploadToSignedUrl(url: string, file: File): Promise<void> {
    const res = await fetch(url, {
        method: "PUT",
        headers: { "content-type": file.type || "application/octet-stream" },
        body: file
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Upload failed: ${res.status} ${res.statusText}: ${text}`);
    }
}

export async function createExport(params: {
    projectId: string;
    versionId: string;
    type: "before_after" | "snippets";
    quality?: "standard" | "high";
}): Promise<ExportJob> {
    const data = await apiFetch<{ export: ExportJob }>(`/api/v1/projects/${params.projectId}/exports`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
            versionId: params.versionId,
            snippetIds: [],
            type: params.type,
            quality: params.quality ?? "high"
        })
    });
    return data.export;
}

export async function getExport(projectId: string, exportId: string, signed: boolean): Promise<{ export: ExportJob; downloadUrls?: string[] }> {
    const suffix = signed ? "?signed=1" : "";
    return await apiFetch(`/api/v1/projects/${projectId}/exports/${exportId}${suffix}`);
}

export function clearToken() {
    localStorage.removeItem("devToken");
}

export function setManualToken(token: string) {
    setToken(token);
}

export function readToken(): string {
    return getToken() ?? "";
}
