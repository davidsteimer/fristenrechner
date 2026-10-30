"""Read-only page extraction. No PDF edits and no publication."""
import hashlib
import json
from pathlib import Path
from pypdf import PdfReader

base = Path("outputs/r10-a2-2026-10-28/catalog-support")
targets = [
    ("SRC-BJ-FRISTENHINWEISE-20121217", "raw/SRC-BJ-FRISTENHINWEISE-20121217.response", 1),
    ("SRC-CH-BK-KANTONSNAMEN-RM-2025-AP18B03", "supplement/SRC-CH-BK-KANTONSNAMEN-RM-2025-AP18B03.response", 8),
]
rows = []
for source_id, relative, page in targets:
    path = base / relative
    data = path.read_bytes()
    reader = PdfReader(path)
    rows.append({"sourceId": source_id, "path": path.as_posix(), "byteLength": len(data),
                 "sha256": hashlib.sha256(data).hexdigest(), "pageCount": len(reader.pages),
                 "physicalPageRead": page, "text": reader.pages[page - 1].extract_text()})
result = {"workPackage": "R10-A2", "checkedOn": "2026-10-28", "recordStatus": "derived-page-extracts-not-source-approval",
          "humanApproval": False, "sourceReleaseApproved": False, "rows": rows}
with (base / "pdf-extracts.json").open("x", encoding="utf-8") as stream:
    json.dump(result, stream, ensure_ascii=False, indent=2)
    stream.write("\n")
print(json.dumps({"pdfs": len(rows), "readPages": [row["physicalPageRead"] for row in rows]}))
