// Replicate TTS - MiniMax Speech-02-HD
// Scriptable for iOS

const API_KEY = await promptForKey();
const text = await pickTextFile();
const voice = await pickVoice();

if (!API_KEY || !text || !voice) {
  Script.complete();
} else {
  const confirmed = await confirmCost(text);
  if (confirmed) await generateSpeech(API_KEY, text, voice);
}

// ──────────────────────────────────────

async function promptForKey() {
  const a = new Alert();
  a.title = "Replicate API Key";
  a.message = "Paste your key. It won't be saved.";
  a.addSecureTextField("r8_...");
  a.addAction("Continue");
  a.addCancelAction("Cancel");
  return await a.present() === -1 ? null : a.textFieldValue(0).trim();
}

async function pickTextFile() {
  let filePath;
  try { filePath = await DocumentPicker.openFile(); }
  catch (e) { return null; }
  const fm = FileManager.iCloud();
  try {
    await fm.downloadFileFromiCloud(filePath);
    const text = fm.readString(filePath);
    if (!text || !text.trim()) { await showError("File is empty."); return null; }
    return text.trim();
  } catch (e) { await showError("Could not read file: " + e.message); return null; }
}

async function confirmCost(text) {
  const chars = text.length;
  const cost = (chars / 1000 * 0.10).toFixed(4);
  const a = new Alert();
  a.title = "Estimated Cost";
  a.message = `${chars.toLocaleString()} characters\n~$${cost} USD`;
  a.addAction("Generate");
  a.addCancelAction("Cancel");
  return await a.present() !== -1;
}

async function pickVoice() {
  const voices = [
    "Wise_Woman", "Friendly_Person", "Inspirational_girl",
    "Deep_Voice_Man", "Calm_Woman", "Casual_Guy",
    "Lively_Girl", "Patient_Man", "Young_Knight", "Determined_Man"
  ];
  const a = new Alert();
  a.title = "Pick a Voice";
  for (const v of voices) a.addAction(v.replace(/_/g, " "));
  a.addCancelAction("Cancel");
  const idx = await a.present();
  return idx === -1 ? null : voices[idx];
}

async function generateSpeech(apiKey, text, voiceId) {
  const chunks = splitText(text, 9000);
  const allBytes = [];

  for (let i = 0; i < chunks.length; i++) {
    const prog = new Alert();
    prog.title = `Part ${i + 1} of ${chunks.length}`;
    prog.message = "Generating... 10-30 seconds.";
    prog.addAction("OK");
    prog.present();

    // Submit prediction
    const req = new Request("https://api.replicate.com/v1/models/minimax/speech-02-hd/predictions");
    req.method = "POST";
    req.headers = { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" };
    req.body = JSON.stringify({ input: { text: chunks[i], voice_id: voiceId } });

    let resp;
    try { resp = await req.loadJSON(); }
    catch (e) { await showError("Submit failed: " + e.message); return; }
    if (!resp || !resp.id) { await showError("No prediction ID.\n" + JSON.stringify(resp)); return; }

    // Poll until done
    let audioUrl = null;
    for (let attempt = 0; attempt < 30; attempt++) {
      await wait(2000);
      const poll = new Request(`https://api.replicate.com/v1/predictions/${resp.id}`);
      poll.headers = { "Authorization": `Bearer ${apiKey}` };
      const result = await poll.loadJSON();
      if (result.status === "succeeded") {
        audioUrl = Array.isArray(result.output) ? result.output[0] : result.output;
        break;
      }
      if (result.status === "failed" || result.status === "canceled") {
        await showError("Failed: " + (result.error || result.status));
        return;
      }
    }
    if (!audioUrl) { await showError("Timed out on part " + (i + 1)); return; }

    // Download audio
    const dlReq = new Request(audioUrl);
    const data = await dlReq.load();
    if (!data) { await showError("Empty audio on part " + (i + 1)); return; }

    // Get raw bytes and append — no base64, no atob, no WebView
    const bytes = data.getBytes();
    for (const b of bytes) allBytes.push(b);
  }

  // Build single Data object from combined bytes and share
  const finalData = Data.fromBytes(allBytes);
  const fm = FileManager.local();
  const finalPath = fm.joinPath(fm.temporaryDirectory(), `tts_${Date.now()}.mp3`);
  fm.write(finalPath, finalData);
  await ShareSheet.present([finalPath]);
}

function splitText(text, maxLen) {
  const chunks = [];
  let remaining = text.trim();
  while (remaining.length > maxLen) {
    let splitAt = remaining.lastIndexOf(". ", maxLen);
    if (splitAt === -1) splitAt = remaining.lastIndexOf("? ", maxLen);
    if (splitAt === -1) splitAt = remaining.lastIndexOf("! ", maxLen);
    if (splitAt === -1) splitAt = remaining.lastIndexOf(" ", maxLen);
    if (splitAt === -1) splitAt = maxLen;
    else splitAt += 1;
    chunks.push(remaining.slice(0, splitAt).trim());
    remaining = remaining.slice(splitAt).trim();
  }
  if (remaining.length > 0) chunks.push(remaining);
  return chunks;
}

function wait(ms) {
  return new Promise(resolve => Timer.schedule(ms, false, resolve));
}

async function showError(msg) {
  const a = new Alert();
  a.title = "Error";
  a.message = msg;
  a.addAction("OK");
  await a.present();
}
