exports = async function(changeEvent) {
  const vcon = changeEvent.fullDocument;

  // Helper: convert JS object to Firestore REST typed format
  function toFirestoreValue(val) {
    if (val === null || val === undefined) return { nullValue: null };
    if (typeof val === "boolean") return { booleanValue: val };
    if (typeof val === "number") {
      return Number.isInteger(val)
        ? { integerValue: String(val) }
        : { doubleValue: val };
    }
    if (typeof val === "string") return { stringValue: val };
    if (Array.isArray(val)) {
      return { arrayValue: { values: val.map(toFirestoreValue) } };
    }
    if (typeof val === "object") {
      const fields = {};
      for (const [k, v] of Object.entries(val)) {
        fields[k] = toFirestoreValue(v);
      }
      return { mapValue: { fields } };
    }
    return { stringValue: String(val) };
  }

  function toFirestoreDocument(obj) {
    const fields = {};
    for (const [k, v] of Object.entries(obj)) {
      fields[k] = toFirestoreValue(v);
    }
    return { fields };
  }

  // Extract metabolic signal from vCon
  const latestAnalysis = (vcon.analysis ?? []).slice(-1)[0]?.body ?? {};
  const metabolicSignal = {
    event_id: vcon.uuid,
    event_type: vcon.subject,
    timestamp: vcon.created_at,
    active_agents: (vcon.parties ?? []).map(p => ({
      name: p.name,
      role: p.role,
      did: p.did
    })),
    network_load_pct: vcon.substrate_context?.network_load_pct ?? null,
    defi_metabolic_index: vcon.substrate_context?.defi_metabolic_index ?? null,
    dao_epoch: vcon.substrate_context?.dao_governance_epoch ?? null,
    depin_nodes_active: vcon.substrate_context?.depin_nodes_active ?? [],
    efficacy_score: latestAnalysis.efficacy_score ?? null,
    pattern_tags: latestAnalysis.pattern_tags ?? [],
    reinforcement_delta: latestAnalysis.reinforcement_delta ?? 0,
    last_updated: new Date().toISOString()
  };

  const projectId = context.values.get("firebase_project_id");
  const token = context.values.get("firebase_service_token");
  const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
  const headers = {
    "Authorization": [`Bearer ${token}`],
    "Content-Type": ["application/json"]
  };

  // Write to /metabolic_state/current — always overwrite (live dashboard state)
  await context.http.patch({
    url: `${baseUrl}/metabolic_state/current`,
    headers,
    body: JSON.stringify(toFirestoreDocument(metabolicSignal))
  });

  // Append to event_stream — rolling feed, TTL 5 minutes
  const eventEntry = {
    ...metabolicSignal,
    ttl_epoch_ms: Date.now() + 300000
  };
  await context.http.post({
    url: `${baseUrl}/event_stream`,
    headers,
    body: JSON.stringify(toFirestoreDocument(eventEntry))
  });

  console.log(`[vcon_firebase_projector] Projected vCon ${vcon.uuid} to Firebase`);
  return { success: true };
};
