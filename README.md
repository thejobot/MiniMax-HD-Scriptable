# MiniMax HD-Scriptable

A [Scriptable](https://scriptable.app) script for iOS that converts text files to speech using the [MiniMax Speech-02-HD](https://replicate.com/minimax/speech-02-hd) model via [Replicate](https://replicate.com). Feed it a document of any length and it comes back as a single MP3 - no apps, no desktop, just your iPhone.

---

## Requirements

- [Scriptable](https://apps.apple.com/us/app/scriptable/id1405459188) (free, iOS)
- A [Replicate](https://replicate.com) account and API key
- Your text saved as a `.txt` file in iCloud Drive

---

## Installation

**Do not copy and paste the script.** iOS will corrupt the code by converting straight quotes into smart quotes, which breaks JavaScript.

Instead:

1. Download `ReplicateTTS.js` from this repo onto your iPhone
2. Open the **Files** app and go to your Downloads folder
3. Long press `ReplicateTTS.js` and tap **Move**
4. Navigate to **iCloud Drive > Scriptable** and tap **Move**
5. Open Scriptable - the script will be there ready to run

---

## Storing Your API Key Securely

Your Replicate API key is sensitive - anyone who has it can run models on your account and rack up charges. Don't hardcode it in the script. Instead, store it in the **iOS Passwords app** so it's encrypted and locked behind Face ID.

1. Open **Settings** → **Passwords** → tap **+** to add a new entry
2. For the website, enter `replicate.com`
3. For the password, paste your Replicate API key
4. Save it

When the script prompts you for the API key, iOS will automatically offer to fill it from Passwords - just tap the suggestion and Face ID does the rest. The key is never stored by the script, it only exists in memory for the duration of that run.

---

## Handling Long Documents

Replicate's MiniMax Speech-02-HD model caps requests at 10,000 characters. This script works around that invisibly. It slices your text into chunks at sentence boundaries - never mid-word, never mid-sentence - fires each one at Replicate in sequence, then stitches the raw audio bytes back together using Scriptable's native binary APIs. What comes out the other end is one seamless MP3. The joins are inaudible.

---

## How to Use

Run the script in Scriptable. It will walk you through the following steps in order:

**1. API Key**
A secure text field (the characters are hidden as you type). Paste your Replicate API key here. It is not saved anywhere after the script finishes.

**2. File Picker**
The iOS Files picker opens so you can browse and select any `.txt` file from iCloud Drive, On My iPhone, or any other connected location. The file must be plain text - not a PDF or Word document.

**3. Cost Estimate**
Before anything is sent to Replicate, the script shows you the character count of your file and the estimated cost in USD based on MiniMax Speech-02-HD's rate of $0.10 per 1,000 characters. You can cancel here at no charge.

**4. Voice Picker**
Choose from 10 pre-built voices ranging from warm and conversational to deep and authoritative. Current options:

- Wise Woman
- Friendly Person
- Inspirational Girl
- Deep Voice Man
- Calm Woman
- Casual Guy
- Lively Girl
- Patient Man
- Young Knight
- Determined Man

**5. Generation**
The script submits each chunk to Replicate, polls for completion, and shows progress (e.g. *Part 2 of 4*). When all parts are done it presents the iOS share sheet with the finished MP3. From there you can save it to Files, open it in any audio app, or AirDrop it.

---

## Converting a PDF to Text

Scriptable can only read `.txt` files. To convert a PDF:

- Use the **Shortcuts** app with a *Get Text from PDF* action, then a *Save File* action to write it as `.txt` to iCloud Drive
- Or open the PDF in **Files**, long press → **Select All** → **Copy**, paste into a new **Notes** entry, then share the note as plain text

---

## Pricing

MiniMax Speech-02-HD on Replicate is billed at **$0.10 per 1,000 characters**. The script shows you the exact estimate before any API call is made.

---

## License

MIT - do whatever you want with it.
