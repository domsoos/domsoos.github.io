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
  ],
  community: [
    "Recorded Run",
    "Independent Proposals",
    "Blind Review",
    "Synthesis",
    "Integrated Result"
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
      : mode === "grounded"
        ? "Literature-Grounded mode retrieves and reviews scientific papers before agent reasoning."
        : "Community replay shows a previously completed multi-agent run with blind review and synthesis.";

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
    `${items.length} accepted paper${items.length === 1 ? "" : "s"}`;

  $("metaEvidence").textContent =
    `${items.length} accepted paper${items.length === 1 ? "" : "s"}`;

  if (!items.length) {
    $("evidenceList").innerHTML = `
      <div class="empty-state">
        No reviewed evidence was accepted.
      </div>
    `;
    return;
  }

  $("evidenceList").innerHTML = items.map((paper, i) => {
    const doi = paper.doi || "";
    const href = doi
      ? `https://doi.org/${encodeURIComponent(doi)}`
      : "";

    const review = paper.evidence || {};

    const stance =
      review.stance ||
      paper.stance ||
      "";

    const role =
      review.role ||
      paper.role ||
      "";

    const confidence =
      review.confidence ??
      paper.confidence ??
      null;

    const evidenceLevel =
      review.evidence_level ||
      paper.evidence_level ||
      "";

    const rationale =
      review.rationale ||
      paper.review_rationale ||
      paper.rationale ||
      paper.retrieval_reason ||
      paper.why_retrieved ||
      "";

    const abstract =
      paper.abstract || "";

    const limitations =
      Array.isArray(review.limitations)
        ? review.limitations
        : [];

    const title = String(
      paper.title || "Untitled paper"
    ).replace(/<[^>]*>/g, "");

    const reviewSummary = [
      stance ? stance.toUpperCase() : "",
      role || "",
      confidence !== null
        ? `confidence ${Number(confidence).toFixed(2)}`
        : "",
      evidenceLevel
        ? `${evidenceLevel}-level evidence`
        : ""
    ].filter(Boolean).join(" · ");

    return `
      <article class="evidence-item">

        <div class="evidence-title">
          ${i + 1}. ${escapeHtml(title)}
        </div>

        <div class="evidence-meta">
          ${escapeHtml(
            paper.year ||
            paper.publication_year ||
            ""
          )}
          ${doi ? " · " : ""}
          ${doi
            ? `<a href="${href}"
                  target="_blank"
                  rel="noopener">
                 ${escapeHtml(doi)}
               </a>`
            : ""}
        </div>

        ${reviewSummary ? `
          <div class="evidence-meta">
            ${escapeHtml(reviewSummary)}
          </div>
        ` : ""}

        ${abstract ? `
          <div class="evidence-rationale">
            <strong>Paper evidence</strong><br>
            ${escapeHtml(abstract)}
          </div>
        ` : ""}

        ${rationale ? `
          <div class="evidence-rationale">
            <strong>EvidenceReviewer assessment</strong><br>
            ${escapeHtml(rationale)}
          </div>
        ` : ""}

        ${limitations.length ? `
          <div class="evidence-rationale">
            <strong>Limitations</strong><br>
            ${limitations.map(
              item => `• ${escapeHtml(item)}`
            ).join("<br>")}
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

  const community =
    payload.community ||
    payload.result?.community ||
    null;

  if (typeof candidate === "string") {
    $("hypothesisContent").innerHTML = `
      <div class="hypothesis-section">
        ${escapeHtml(candidate).replaceAll("\n", "<br>")}
      </div>
    `;
    return;
  }

  const fields = [
    [
      community ? "Integrated Community Hypothesis" : "Hypothesis",
      candidate.hypothesis || candidate.claim
    ],
    ["Mechanism", candidate.mechanism],
    ["Predicted Outcome", candidate.prediction],
    ["Test", candidate.test || candidate.experiment],
    [
      "Falsification Test",
      candidate.falsification || candidate.falsifier
    ]
  ].filter(([, value]) => value);

  if (!fields.length) {
    $("hypothesisContent").innerHTML = `
      <pre>${escapeHtml(JSON.stringify(candidate, null, 2))}</pre>
    `;
    return;
  }

  let html = "";

  if (community) {
    const proposals =
      community.proposal_count ?? 4;

    const reviews =
      community.review_calls ?? 4;

    const synthesis =
      community.synthesis_calls ?? 1;

    html += `
      <div class="hypothesis-section">
        <div class="hypothesis-label">
          MERIT Community
        </div>

        <div>
          <strong>Recorded replay</strong>
          · ${escapeHtml(String(proposals))} independent agents
          · ${escapeHtml(String(reviews))} blind reviews
          · ${escapeHtml(String(synthesis))} synthesis
        </div>
      </div>
    `;
  }

  html += fields.map(([label, value]) => `
    <div class="hypothesis-section">
      <div class="hypothesis-label">
        ${escapeHtml(label)}
      </div>

      <div>
        ${escapeHtml(String(value)).replaceAll("\n", "<br>")}
      </div>
    </div>
  `).join("");

  if (community) {
    const agreements =
      Array.isArray(community.agreements)
        ? community.agreements
        : [];

    const disagreements =
      Array.isArray(community.disagreements)
        ? community.disagreements
        : [];

    if (agreements.length) {
      html += `
        <div class="hypothesis-section">
          <div class="hypothesis-label">
            Consensus
          </div>

          <ul>
            ${agreements.map(item => `
              <li>
                ${escapeHtml(String(item))}
              </li>
            `).join("")}
          </ul>
        </div>
      `;
    }

    if (disagreements.length) {
      html += `
        <div class="hypothesis-section">
          <div class="hypothesis-label">
            Open Disagreements
          </div>

          <ul>
            ${disagreements.map(item => `
              <li>
                ${escapeHtml(String(item))}
              </li>
            `).join("")}
          </ul>
        </div>
      `;
    }

    const reviews =
      Array.isArray(community.reviews)
        ? community.reviews
        : [];

    if (reviews.length) {
      html += `
        <div class="hypothesis-section">
          <details>
            <summary>
              Blind peer-review details (${reviews.length})
            </summary>

            <div style="margin-top:0.75rem;">
              ${reviews.map(review => {
                const alias =
                  review.focus_alias ||
                  review.alias ||
                  "?";

                const metrics = [
                  [
                    "Plausibility",
                    review.physical_plausibility
                  ],
                  [
                    "Mechanism",
                    review.mechanism_quality
                  ],
                  [
                    "Specificity",
                    review.specificity
                  ],
                  [
                    "Falsifiability",
                    review.falsifiability
                  ],
                  [
                    "Feasibility",
                    review.experimental_feasibility
                  ]
                ].filter(([, value]) =>
                  value !== undefined &&
                  value !== null
                );

                return `
                  <div style="margin-bottom:0.85rem;">
                    <strong>
                      Proposal ${escapeHtml(String(alias))}
                    </strong>

                    <div>
                      ${metrics.map(([name, value]) =>
                        `${escapeHtml(name)} ${escapeHtml(String(value))}/4`
                      ).join(" · ")}
                    </div>
                  </div>
                `;
              }).join("")}
            </div>
          </details>
        </div>
      `;
    }
  }


  if (community) {
    const proposals =
      Array.isArray(community.proposals)
        ? community.proposals
        : [];

    if (proposals.length) {
      html += `
        <div class="hypothesis-section">
          <details>
            <summary>
              Independent proposals reviewed by Community
              (${proposals.length})
            </summary>

            <div style="margin-top:0.9rem;">
              <div style="margin-bottom:0.9rem;">
                These are the exact normalized agent proposals that
                entered anonymous review. Quantitative statements here
                are agent-generated predictions unless separately
                supported by the literature evidence shown below.
              </div>

              ${proposals.map(item => {
                const alias =
                  item.proposal_alias || "?";

                const candidate =
                  item.candidate || {};

                const source =
                  item.source_system ||
                  candidate.source_system ||
                  "unknown";

                const title =
                  candidate.title || null;

                const hypothesis =
                  candidate.hypothesis || "";

                const mechanism =
                  candidate.mechanism || null;

                const prediction =
                  candidate.predicted_outcome || null;

                const falsification =
                  candidate.falsification_test || null;

                const rationale =
                  candidate.rationale || null;

                return `
                  <details style="margin-bottom:0.8rem;">
                    <summary>
                      Proposal ${escapeHtml(String(alias))}
                      · ${escapeHtml(String(source))}
                    </summary>

                    <div style="margin-top:0.7rem;">
                      ${
                        title
                          ? `
                            <div class="hypothesis-label">
                              Title
                            </div>
                            <div style="margin-bottom:0.7rem;">
                              ${escapeHtml(String(title))}
                            </div>
                          `
                          : ""
                      }

                      ${
                        hypothesis
                          ? `
                            <div class="hypothesis-label">
                              Hypothesis
                            </div>
                            <div style="margin-bottom:0.7rem;">
                              ${escapeHtml(String(hypothesis))
                                .replaceAll("\n", "<br>")}
                            </div>
                          `
                          : ""
                      }

                      ${
                        mechanism
                          ? `
                            <div class="hypothesis-label">
                              Mechanism
                            </div>
                            <div style="margin-bottom:0.7rem;">
                              ${escapeHtml(String(mechanism))
                                .replaceAll("\n", "<br>")}
                            </div>
                          `
                          : ""
                      }

                      ${
                        prediction
                          ? `
                            <div class="hypothesis-label">
                              Predicted Outcome
                            </div>
                            <div style="margin-bottom:0.7rem;">
                              ${escapeHtml(String(prediction))
                                .replaceAll("\n", "<br>")}
                            </div>
                          `
                          : ""
                      }

                      ${
                        falsification
                          ? `
                            <div class="hypothesis-label">
                              Falsification Test
                            </div>
                            <div style="margin-bottom:0.7rem;">
                              ${escapeHtml(String(falsification))
                                .replaceAll("\n", "<br>")}
                            </div>
                          `
                          : ""
                      }

                      ${
                        rationale
                          ? `
                            <div class="hypothesis-label">
                              Rationale
                            </div>
                            <div>
                              ${escapeHtml(String(rationale))
                                .replaceAll("\n", "<br>")}
                            </div>
                          `
                          : ""
                      }
                    </div>
                  </details>
                `;
              }).join("")}
            </div>
          </details>
        </div>
      `;
    }

    const adopted =
      Array.isArray(community.adopted_elements)
        ? community.adopted_elements
        : [];

    const rejected =
      Array.isArray(community.rejected_elements)
        ? community.rejected_elements
        : [];

    if (adopted.length || rejected.length) {
      html += `
        <div class="hypothesis-section">
          <details>
            <summary>
              Synthesis decisions
              (${adopted.length} adopted ·
              ${rejected.length} rejected)
            </summary>

            <div style="margin-top:0.9rem;">
              ${
                adopted.length
                  ? `
                    <div class="hypothesis-label">
                      Adopted Elements
                    </div>

                    <pre style="white-space:pre-wrap;">
${escapeHtml(JSON.stringify(adopted, null, 2))}
                    </pre>
                  `
                  : ""
              }

              ${
                rejected.length
                  ? `
                    <div class="hypothesis-label">
                      Rejected Elements
                    </div>

                    <pre style="white-space:pre-wrap;">
${escapeHtml(JSON.stringify(rejected, null, 2))}
                    </pre>
                  `
                  : ""
              }
            </div>
          </details>
        </div>
      `;
    }

    const communityProv =
      community.provenance || {};

    const replayProv =
      payload.provenance ||
      payload.result?.provenance ||
      {};

    if (
      Object.keys(communityProv).length ||
      Object.keys(replayProv).length
    ) {
      const aliasMap =
        communityProv.alias_to_system || {};

      html += `
        <div class="hypothesis-section">
          <details>
            <summary>
              Run provenance
            </summary>

            <div style="margin-top:0.9rem;">
              ${
                communityProv.protocol
                  ? `
                    <div>
                      <strong>Protocol:</strong>
                      ${escapeHtml(String(communityProv.protocol))}
                    </div>
                  `
                  : ""
              }

              <div>
                <strong>Blind review:</strong>
                ${communityProv.blind_review === true ? "yes" : "no"}
              </div>

              ${
                Object.keys(aliasMap).length
                  ? `
                    <div>
                      <strong>Reviewed aliases:</strong>
                      ${Object.entries(aliasMap)
                        .map(([alias, system]) =>
                          `${escapeHtml(alias)} → ${escapeHtml(String(system))}`
                        )
                        .join(" · ")}
                    </div>
                  `
                  : ""
              }

              ${
                communityProv.external_retrieval
                  ? `
                    <div>
                      <strong>Review-time external retrieval:</strong>
                      ${escapeHtml(
                        String(communityProv.external_retrieval)
                      )}
                    </div>
                  `
                  : ""
              }

              ${
                community.elapsed_seconds !== undefined &&
                community.elapsed_seconds !== null
                  ? `
                    <div>
                      <strong>Community runtime:</strong>
                      ${escapeHtml(
                        Number(community.elapsed_seconds).toFixed(1)
                      )} s
                    </div>
                  `
                  : ""
              }

              ${
                replayProv.source_run_id
                  ? `
                    <div>
                      <strong>Source run:</strong>
                      ${escapeHtml(
                        String(replayProv.source_run_id)
                      )}
                    </div>
                  `
                  : ""
              }

              ${
                replayProv.precomputed_replay === true
                  ? `
                    <div>
                      <strong>Playback:</strong>
                      recorded replay of completed run
                    </div>
                  `
                  : ""
              }
            </div>
          </details>
        </div>
      `;
    }
  }

  $("hypothesisContent").innerHTML = html;
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
    selectedMode === "grounded"
      ? (
          payload?.provenance?.precomputed_replay
            ? "Literature-Grounded · Recorded Replay"
            : "Literature-Grounded"
        )
      : selectedMode === "community"
        ? "Community · Recorded Replay"
        : "Fast";
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

const LITERATURE_REPLAY_PROMPT =
  "Can tensile strain reduce oxygen-vacancy migration barriers in yttria-stabilized zirconia?";

async function playLiteratureReplay() {
  clearError();

  $("question").value = LITERATURE_REPLAY_PROMPT;

  // Display the normal Literature-Grounded workflow,
  // but submit the explicit recorded-replay backend mode.
  setMode("grounded");

  const replayButton = $("literatureReplayButton");

  if (replayButton) {
    replayButton.disabled = true;
    replayButton.textContent = "Loading Literature Replay…";
  }

  try {
    await runMerit("grounded");
  } finally {
    if (replayButton) {
      replayButton.disabled = false;
      replayButton.textContent =
        "▶ Play Literature Replay · Recorded YSZ Run";
    }
  }
}


const COMMUNITY_REPLAY_PROMPT =
  "Generate a hypothesis to lower the effective Li migration barrier in LiFePO4, reported per crystallographic direction.";

async function playCommunityReplay() {
  clearError();

  $("question").value = COMMUNITY_REPLAY_PROMPT;

  // Internal mode only. The normal Community card remains disabled.
  setMode("community");

  const replayButton = $("communityReplayButton");

  if (replayButton) {
    replayButton.disabled = true;
    replayButton.textContent = "Loading Community Replay…";
  }

  try {
    await runMerit();
  } finally {
    if (replayButton) {
      replayButton.disabled = false;
      replayButton.textContent =
        "▶ Play Community Replay · Recorded LiFePO₄ Run";
    }
  }
}

async function runMerit(modeOverride = null) {
  clearError();

  const submitMode =
    typeof modeOverride === "string"
      ? modeOverride
      : selectedMode;

  const query = $("question").value.trim();

  if (!query) {
    showError("Enter a scientific hypothesis prompt first.");
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
        mode: submitMode
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

document.querySelectorAll(".example-chip[data-question]").forEach(button => {
  button.addEventListener("click", () => {
    $("question").value = button.dataset.question;
    $("question").focus();
  });
});

$("runButton").addEventListener("click", () => runMerit());

setMode("fast");
checkHealth();
setInterval(checkHealth, 15000);


document.addEventListener("DOMContentLoaded", () => {
  const literatureReplayButton = $("literatureReplayButton");
  const communityReplayButton = $("communityReplayButton");

  if (literatureReplayButton) {
    literatureReplayButton.addEventListener(
      "click",
      playLiteratureReplay
    );
  }

  if (communityReplayButton) {
    communityReplayButton.addEventListener(
      "click",
      playCommunityReplay
    );
  }
});
