exports = async function(changeEvent) {
  const vcon = changeEvent.fullDocument;
  const nimHost = context.values.get("nvidia_nim_host");

  const collection = context.services
    .get("mongodb-atlas")
    .db("substrate_network")
    .collection("vcons");

  async function handleNimFailure(errorMessage) {
    console.error(`[vcon_nim_embedder] ${errorMessage}`);
    await collection.updateOne(
      { _id: vcon._id },
      { $set: { "nim_context.embedding_status": "failed" } }
    );
    return { success: false, error: errorMessage };
  }

  // Build the text corpus to embed
  const dialogText = (vcon.dialog ?? [])
    .map(d => typeof d.body === 'string' ? d.body : JSON.stringify(d.body ?? {}))
    .join(" ");
  const tagText = (vcon.analysis ?? [])
    .flatMap(a => a.body?.pattern_tags ?? [])
    .join(" ");
  const substrateText = JSON.stringify(vcon.substrate_context ?? {});
  const corpusToEmbed = [
    vcon.subject ?? "",
    dialogText,
    tagText,
    substrateText
  ].filter(Boolean).join(" ").substring(0, 8000); // NIM input limit guard

  // Call NVIDIA NIM embedding endpoint
  let embeddingResponse;
  try {
    embeddingResponse = await context.http.post({
      url: `${nimHost}/v1/embeddings`,
      headers: { "Content-Type": ["application/json"] },
      body: JSON.stringify({
        model: "nvidia/nv-embedqa-e5-v5",
        input: [corpusToEmbed],
        input_type: "passage"
      })
    });
  } catch (err) {
    return await handleNimFailure(`NIM call failed for ${vcon.uuid}: ${err.message}`);
  }

  const responseBody = EJSON.parse(embeddingResponse.body.text());
  if (!responseBody.data || !responseBody.data[0] || !responseBody.data[0].embedding) {
    return await handleNimFailure(`Unexpected NIM response structure for ${vcon.uuid}`);
  }

  const vector = responseBody.data[0].embedding;

  // Write embedding back to the vCon document
  await collection.updateOne(
    { _id: vcon._id },
    {
      $set: {
        "embedding.vector": vector,
        "embedding.created_at": new Date().toISOString(),
        "nim_context.embedding_status": "complete"
      }
    }
  );

  console.log(`[vcon_nim_embedder] Embedded vCon ${vcon.uuid} — ${vector.length} dimensions`);
  return { success: true, dimensions: vector.length };
};
