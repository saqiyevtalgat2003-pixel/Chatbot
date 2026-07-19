const API_BASE = "https://api.github.com";

function token(): string {
  const t = process.env.GITHUB_TOKEN;
  if (!t) throw new Error("GITHUB_TOKEN env variable is not set");
  return t;
}

async function gh(path: string, init: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token()}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init.headers || {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub API ${path} failed: ${res.status} ${body}`);
  }
  return res.json();
}

export interface RepoSummary {
  name: string;
  fullName: string;
  owner: string;
  defaultBranch: string;
  private: boolean;
  updatedAt: string;
  description: string | null;
}

export async function listRepos(): Promise<RepoSummary[]> {
  const username = process.env.GITHUB_USERNAME;
  const repos: any[] = [];
  let page = 1;
  while (true) {
    const batch: any[] = await gh(
      `/user/repos?per_page=100&page=${page}&sort=updated&affiliation=owner,collaborator`
    );
    repos.push(...batch);
    if (batch.length < 100) break;
    page += 1;
    if (page > 10) break; // safety cap
  }
  const filtered = username
    ? repos.filter((r) => r.owner?.login?.toLowerCase() === username.toLowerCase())
    : repos;

  return filtered.map((r) => ({
    name: r.name,
    fullName: r.full_name,
    owner: r.owner.login,
    defaultBranch: r.default_branch,
    private: r.private,
    updatedAt: r.updated_at,
    description: r.description,
  }));
}

export interface TreeEntry {
  path: string;
  type: "blob" | "tree";
  size?: number;
  sha: string;
}

export async function getBranchSha(owner: string, repo: string, branch: string): Promise<string> {
  const ref = await gh(`/repos/${owner}/${repo}/git/ref/heads/${branch}`);
  return ref.object.sha;
}

export async function getTree(
  owner: string,
  repo: string,
  branch: string
): Promise<{ commitSha: string; treeSha: string; entries: TreeEntry[] }> {
  const commitSha = await getBranchSha(owner, repo, branch);
  const commit = await gh(`/repos/${owner}/${repo}/git/commits/${commitSha}`);
  const treeSha = commit.tree.sha;
  const tree = await gh(`/repos/${owner}/${repo}/git/trees/${treeSha}?recursive=1`);
  const entries: TreeEntry[] = (tree.tree || [])
    .filter((e: any) => e.type === "blob" || e.type === "tree")
    .map((e: any) => ({ path: e.path, type: e.type, size: e.size, sha: e.sha }));
  return { commitSha, treeSha, entries };
}

export interface UploadFile {
  path: string; // relative path inside the target folder, e.g. "css/style.css"
  contentBase64: string;
}

/**
 * Replaces everything under `folderPath` in the repo with the given files,
 * in a single commit. Files that currently exist under folderPath but are
 * not present in `files` are deleted. Everything outside folderPath is left
 * untouched.
 */
export async function replaceFolder(
  owner: string,
  repo: string,
  branch: string,
  folderPath: string,
  files: UploadFile[],
  commitMessage: string
): Promise<{ commitSha: string; url: string }> {
  const normalizedFolder = folderPath.replace(/^\/+|\/+$/g, "");
  const commitSha = await getBranchSha(owner, repo, branch);
  const commit = await gh(`/repos/${owner}/${repo}/git/commits/${commitSha}`);
  const baseTreeSha = commit.tree.sha;

  const fullTree = await gh(
    `/repos/${owner}/${repo}/git/trees/${baseTreeSha}?recursive=1`
  );
  const existingUnderFolder: string[] = (fullTree.tree || [])
    .filter(
      (e: any) =>
        e.type === "blob" &&
        (normalizedFolder === "" || e.path.startsWith(`${normalizedFolder}/`))
    )
    .map((e: any) => e.path);

  const newPaths = new Set(
    files.map((f) =>
      normalizedFolder ? `${normalizedFolder}/${f.path.replace(/^\/+/, "")}` : f.path
    )
  );

  // 1. Create a blob for every new/updated file
  const blobEntries = [];
  for (const f of files) {
    const blob = await gh(`/repos/${owner}/${repo}/git/blobs`, {
      method: "POST",
      body: JSON.stringify({ content: f.contentBase64, encoding: "base64" }),
    });
    const fullPath = normalizedFolder
      ? `${normalizedFolder}/${f.path.replace(/^\/+/, "")}`
      : f.path;
    blobEntries.push({
      path: fullPath,
      mode: "100644",
      type: "blob",
      sha: blob.sha,
    });
  }

  // 2. Mark files that existed under the folder but are absent from the new
  //    upload for deletion (sha: null removes them from the tree).
  const deleteEntries = existingUnderFolder
    .filter((p) => !newPaths.has(p))
    .map((p) => ({ path: p, mode: "100644", type: "blob", sha: null }));

  // 3. Build the new tree on top of the existing base tree
  const newTree = await gh(`/repos/${owner}/${repo}/git/trees`, {
    method: "POST",
    body: JSON.stringify({
      base_tree: baseTreeSha,
      tree: [...blobEntries, ...deleteEntries],
    }),
  });

  // 4. Create the commit and move the branch pointer
  const newCommit = await gh(`/repos/${owner}/${repo}/git/commits`, {
    method: "POST",
    body: JSON.stringify({
      message: commitMessage,
      tree: newTree.sha,
      parents: [commitSha],
    }),
  });

  await gh(`/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
    method: "PATCH",
    body: JSON.stringify({ sha: newCommit.sha }),
  });

  return {
    commitSha: newCommit.sha,
    url: `https://github.com/${owner}/${repo}/commit/${newCommit.sha}`,
  };
}
