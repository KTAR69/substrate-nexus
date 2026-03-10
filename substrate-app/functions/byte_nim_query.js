exports = async function({ currentEventText, governanceEpoch, topK = 5 }) {
  const nimHost = context.values.get("nvidia_nim_host");
  const collection = context.services
    .get("mongodb-atlas")
    .db("substrate_network")
    .collection("vcons");

  if (!currentEventText || typeof currentEventText !== "string") {
    throw new Error("byte_nim_query: currentEventText is required and must be a string");
  }

  // Step 1: Embed the current event context (query-type embedding)
  const embedRes = await context.http.post({
    url: `${nimHost}/v1/embeddings`,
    headers: { "Content-Type": ["application/json"] },
    body: JSON.stringify({
      model: "nvidia/nv-embedqa-e5-v5",
      input: [currentEventText],
      input_type: "query"
    })
  });

  const embedBody = EJSON.parse(embedRes.body.text());
  const queryVector = embedBody.data[0].embedding;

  // Step 2: Atlas Vector Search — retrieve top-K similar embedded vCons
  const vectorSearchStage = {
    $vectorSearch: {
      index: "vector_index", // Using the correct index name we created earlier
      path: "embedding.vector", // Wait, earlier I created 'vectors'. Let me check.
      queryVector: queryVector,
      numCandidates: Math.max(topK * 10, 100),
      limit: topK
    }
  };

  // Add governance epoch filter if provided
  if (governanceEpoch !== undefined && governanceEpoch !== null) {
    vectorSearchStage.$vectorSearch.filter = {
      "substrate_context.dao_governance_epoch": {
        $gte: governanceEpoch - 5
      }
    };
  }

  const similarVcons = await collection.aggregate([
    vectorSearchStage,
    {
      $match: {
        "nim_context.embedding_status": "complete"
      }
    },
    {
      $project: {
        uuid: 1,
        subject: 1,
        dialog: 1,
        analysis: 1,
        substrate_context: 1,
        score: { $meta: "vectorSearchScore" }
      }
    }
  ]).toArray();

  // Step 3: Format retrieved vCons as NIM message context (RAG injection)
  const memoryContext = similarVcons.map((v, i) => {
    const outcome = v.analysis?.[0]?.body ?? {};
    const sub = v.substrate_context ?? {};
    return [
      `[Memory ${i + 1} | Similarity: ${(v.score ?? 0).toFixed(4)}]`,
      `Event: ${v.subject}`,
      `Dialog: ${JSON.stringify(v.dialog?.map(d => d.body) ?? [])}`,
      `Outcome: efficacy=${outcome.efficacy_score ?? "N/A"}, tags=${(outcome.pattern_tags ?? []).join(",")}`,
      `Substrate: epoch=${sub.dao_governance_epoch}, load=${sub.network_load_pct}, defi=${sub.defi_metabolic_index}`
    ].join("\n");
  }).join("\n\n");

  // Step 4: Call NIM generative model with vCon memory as context
  const nimGenRes = await context.http.post({
    url: `${nimHost}/v1/chat/completions`,
    headers: { "Content-Type": ["application/json"] },
    body: JSON.stringify({
      model: "meta/llama-3.1-8b-instruct",
      messages: [
        {
          role: "system",
          content: `You are Byte, a DPAi agent operating within the Substrate-Aware Network. ` +
                   `Your decisions must optimize for network efficacy and metabolic health. ` +
                   `You have access to the following relevant memory from past interactions:\n\n` +
                   `${memoryContext || "[No relevant memory found]"}\n\n` +
                   `Respond with a specific, actionable decision. Be concise.`
        },
        {
          role: "user",
          content: currentEventText
        }
      ],
      temperature: 0.3,
      max_tokens: 512
    })
  });

  const genBody = EJSON.parse(nimGenRes.body.text());
  const decision = genBody.choices?.[0]?.message?.content ?? "";

  return {
    decision,
    prior_context_refs: similarVcons.map(v => v.uuid),
    similarity_scores: similarVcons.map(v => v.score),
    memory_count: similarVcons.length
  };
};
