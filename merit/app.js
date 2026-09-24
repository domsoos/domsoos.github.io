const cfg = window.MERIT_CONFIG || {};
let selectedMode = "fast";

const $ = (id) => document.getElementById(id);

const stagesByMode = {
  fast: [
    "Scientific Prompt",
    "Agent Reasoning",
    "Hypothesis"
  ],
  grounded: [
    "Query Planning",
    "Literature Search",
    "Paper Retrieval",
    "Semantic Reranking",
    "Evidence Review",
    "Agent Reasoning"
  ]
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function api(path) {
  return `${String(cfg.API_BASE || "").replace(/\/$/, "")}${path}`;
}

function setBackendStatus(online, text) {
  const pill = $("backendStatus");
  pill.classList.toggle("online", online);
  pill.classList.toggle("offline", !online);
  $("backendStatusText").textContent = text;
}

async function checkHealth() {
  if (!cfg.API_BASE) {
    setBackendStatus(false, "Backend configuring");
    return;
  }

  try {
    const response = await fetch(api(cfg.HEALTH_PATH), {
      cache: "no-store"
    });

    setBackendStatus(
      response.ok,
      response.ok ? "Perlmutter online" : "Backend unavailable"
    );
  } catch {
    setBackendStatus(false, "Backend unavailable");
  }
}

function renderStages(mode) {
  const track = $("progressTrack");
  const stages = stagesByMode[mode];

  track.style.gridTemplateColumns =
    `repeat(${Math.min(stages.length, 6)}, 1fr)`;

  track.innerHTML = stages.map((stage, i) => `
    <div class="stage" data-stage-index="${i}">
      <span class="stage-index">${String(i + 1).padStart(2, "0")}</span>
      <span class="stage-name">${escapeHtml(stage)}</span>
    </div>
  `).join("");
}

function updateStages(stageValue, status) {
  const nodes = [...document.querySelectorAll(".stage")];

  let activeIndex = 0;

  if (typeof stageValue === "number") {
    activeIndex = Math.max(0, Math.min(nodes.length - 1, stageValue));
  } else if (typeof stageValue === "string") {
    const normalized = stageValue.toLowerCase();
    const index = nodes.findIndex(
      node => node.textContent.toLowerCase().includes(normalized)
    );
    if (index >= 0) activeIndex = index;
  }

  nodes.forEach((node, index) => {
    node.classList.remove("active", "done");

    if (status === "completed" || index < activeIndex) {
      node.classList.add("done");
    } else if (index === activeIndex) {
      node.classList.add("active");
    }
  });
}

function setMode(mode) {
  selectedMode = mode;

  document.querySelectorAll(".mode-card[data-mode]").forEach(card => {
    card.classList.toggle("selected", card.dataset.mode === mode);
  });

  $("modeNote").textContent =
    mode === "fast"
      ? "Fast mode uses a direct scientific reasoning workflow."
      : "Literature-Grounded mode retrieves and reviews scientific papers before agent reasoning.";

  renderStages(mode);
}

function showError(message) {
  const box = $("errorBox");
  box.textContent = message;
  box.classList.remove("hidden");
}

function clearError() {
  $("errorBox").classList.add("hidden");
  $("errorBox").textContent = "";
}

function renderEvidence(evidence) {
  const panel = $("evidencePanel");

  if (selectedMode === "fast") {
    panel.classList.add("hidden");
    return;
  }

  panel.classList.remove("hidden");

  const items = Array.isArray(evidence) ? evidence : [];

  $("evidenceCount").textContent =
    `${items.length} paper${items.length === 1 ? "" : "s"}`;

  $("metaEvidence").textContent = `${items.length} papers`;

  if (!items.length) {
    $("evidenceList").innerHTML = `
      <div class="empty-state">
        No reviewed evidence was returned.
      </div>
    `;
    return;
  }

  $("evidenceList").innerHTML = items.map((paper, i) => {
    const doi = paper.doi || "";
    const href = doi
      ? `https://doi.org/${encodeURIComponent(doi)}`
      : "";

    const rationale =
      paper.review_rationale ||
      paper.rationale ||
      paper.retrieval_reason ||
      paper.why_retrieved ||
      "";

    return `
      <article class="evidence-item">
        <div class="evidence-title">
          ${i + 1}. ${escapeHtml(paper.title || "Untitled paper")}
        </div>

        <div class="evidence-meta">
          ${escapeHtml(paper.year || paper.publication_year || "")}
          ${doi ? " · " : ""}
          ${doi
            ? `<a href="${href}" target="_blank" rel="noopener">${escapeHtml(doi)}</a>`
            : ""}
        </div>

        ${rationale ? `
          <div class="evidence-rationale">
            ${escapeHtml(rationale)}
          </div>
        ` : ""}
      </article>
    `;
  }).join("");
}

function renderHypothesis(payload) {
  const candidate =
    payload.hypothesis ||
    payload.result?.hypothesis ||
    payload.result ||
    payload.output ||
    payload;

  if (typeof candidate === "string") {
    $("hypothesisContent").innerHTML = `
      <div class="hypothesis-section">
        ${escapeHtml(candidate).replaceAll("\n", "<br>")}
      </div>
    `;
    return;
  }

  const fields = [
    ["Hypothesis", candidate.hypothesis || candidate.claim],
    ["Mechanism", candidate.mechanism],
    ["Prediction", candidate.prediction],
    ["Test", candidate.test || candidate.experiment],
    ["Falsification", candidate.falsification || candidate.falsifier]
  ].filter(([, value]) => value);

  if (!fields.length) {
    $("hypothesisContent").innerHTML = `
      <pre>${escapeHtml(JSON.stringify(candidate, null, 2))}</pre>
    `;
    return;
  }

  $("hypothesisContent").innerHTML = fields.map(([label, value]) => `
    <div class="hypothesis-section">
      <div class="hypothesis-label">${escapeHtml(label)}</div>
      <div>${escapeHtml(value).replaceAll("\n", "<br>")}</div>
    </div>
  `).join("");
}

function renderResult(payload, requestId) {
  const root = payload.result || payload;

  const evidence =
    root.evidence ||
    root.evidence_pack?.evidence ||
    root.papers ||
    [];

  renderEvidence(evidence);
  renderHypothesis(root);

  $("resultPanel").classList.remove("hidden");
  $("provenancePanel").classList.remove("hidden");

  $("metaRunId").textContent = requestId;
  $("metaMode").textContent =
    selectedMode === "grounded" ? "Literature-Grounded" : "Fast";
  $("metaStatus").textContent = "Complete";

  if (selectedMode === "fast") {
    $("metaEvidence").textContent = "Not requested";
  }

  updateStages(null, "completed");
}

async function pollRun(requestId) {
  while (true) {
    const response = await fetch(
      api(`${cfg.STATUS_PATH}/${encodeURIComponent(requestId)}`),
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error(`Status request failed (${response.status})`);
    }

    const status = await response.json();

    updateStages(
      status.stage ?? status.stage_index ?? status.current_stage,
      status.status
    );

    if (status.status === "completed") {
      break;
    }

    if (["failed", "error", "cancelled"].includes(status.status)) {
      throw new Error(status.error || "MERIT run failed");
    }

    await new Promise(resolve =>
      setTimeout(resolve, cfg.POLL_INTERVAL_MS || 1500)
    );
  }

  const response = await fetch(
    api(`${cfg.RESULT_PATH}/${encodeURIComponent(requestId)}`),
    { cache: "no-store" }
  );

  if (!response.ok) {
    throw new Error(`Result request failed (${response.status})`);
  }

  return response.json();
}

async function runMerit() {
  clearError();

  const query = $("question").value.trim();

  if (!query) {
    showError("Enter a scientific research question first.");
    return;
  }

  if (!cfg.API_BASE) {
    showError(
      "The public MERIT backend is not connected yet. The interface is ready; API wiring is in progress."
    );
    return;
  }

  const button = $("runButton");
  button.disabled = true;
  button.textContent = "Running…";

  $("runPanel").classList.remove("hidden");
  $("resultPanel").classList.add("hidden");
  $("provenancePanel").classList.add("hidden");

  renderStages(selectedMode);
  updateStages(0, "running");

  try {
    const response = await fetch(api(cfg.RUN_PATH), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query,
        mode: selectedMode
      })
    });

    if (!response.ok) {
      throw new Error(`Run submission failed (${response.status})`);
    }

    const submission = await response.json();

    const requestId =
      submission.request_id ||
      submission.run_id ||
      submission.id;

    if (!requestId) {
      throw new Error("Backend did not return a request ID.");
    }

    $("runId").textContent = requestId;
    $("metaRunId").textContent = requestId;

    const result = await pollRun(requestId);

    renderResult(result, requestId);

  } catch (error) {
    showError(error.message || String(error));
    $("metaStatus").textContent = "Failed";
  } finally {
    button.disabled = false;
    button.textContent = "Run MERIT";
  }
}

document.querySelectorAll(".mode-card[data-mode]").forEach(card => {
  card.addEventListener("click", () => setMode(card.dataset.mode));
});

document.querySelectorAll(".example-chip").forEach(button => {
  button.addEventListener("click", () => {
    $("question").value = button.dataset.question;
    $("question").focus();
  });
});

$("runButton").addEventListener("click", runMerit);

setMode("fast");
checkHealth();
setInterval(checkHealth, 15000);
