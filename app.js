/* AB 2533 Inspector — offline, on-device only. No network calls.
 * Storage: IndexedDB. DB "ab2533" with stores: "state" (single doc) and
 * "media" (photo/video blobs, autoincrement keys referenced by item).
 */
(function () {
  "use strict";
  var CL = window.AB2533_CHECKLIST;
  var DB, STATE, SAVE_TIMER;

  /* ---------- IndexedDB ---------- */
  function openDB() {
    return new Promise(function (res, rej) {
      var r = indexedDB.open("ab2533", 1);
      r.onupgradeneeded = function (e) {
        var db = e.target.result;
        if (!db.objectStoreNames.contains("state")) db.createObjectStore("state");
        if (!db.objectStoreNames.contains("media"))
          db.createObjectStore("media", { keyPath: "id", autoIncrement: true });
      };
      r.onsuccess = function () { res(r.result); };
      r.onerror = function () { rej(r.error); };
    });
  }
  function tx(store, mode) { return DB.transaction(store, mode).objectStore(store); }
  function idbGet(store, key) {
    return new Promise(function (res, rej) {
      var rq = tx(store, "readonly").get(key);
      rq.onsuccess = function () { res(rq.result); };
      rq.onerror = function () { rej(rq.error); };
    });
  }
  function idbPut(store, val, key) {
    return new Promise(function (res, rej) {
      var rq = tx(store, "readwrite").put(val, key);
      rq.onsuccess = function () { res(rq.result); };
      rq.onerror = function () { rej(rq.error); };
    });
  }
  function idbAdd(store, val) {
    return new Promise(function (res, rej) {
      var rq = tx(store, "readwrite").add(val);
      rq.onsuccess = function () { res(rq.result); };
      rq.onerror = function () { rej(rq.error); };
    });
  }
  function idbDel(store, key) {
    return new Promise(function (res, rej) {
      var rq = tx(store, "readwrite").delete(key);
      rq.onsuccess = function () { res(); };
      rq.onerror = function () { rej(rq.error); };
    });
  }

  /* ---------- State ---------- */
  function blankState() {
    var items = {};
    CL.sections.forEach(function (s) {
      s.items.forEach(function (it) {
        items[it.id] = { status: "", notes: "", media: [] };
      });
    });
    CL.fieldItems.forEach(function (n) {
      items[n] = { status: "", notes: "", media: [], text: "" };
    });
    return {
      project: { apn: "", date: new Date().toISOString().slice(0, 10), address: "",
        owner: "", ownerEmail: "", ownerAddress: "", ownerPhone: "" },
      items: items,
      sign: { ownerName: "", ownerPhone: "", ownerEmail: "",
        contractorName: "", contractorLic: "", contractorPhone: "", contractorEmail: "" }
    };
  }
  function markSaving() { document.getElementById("saveState").textContent = "Saving…"; }
  function scheduleSave() {
    markSaving();
    clearTimeout(SAVE_TIMER);
    SAVE_TIMER = setTimeout(function () {
      idbPut("state", STATE, "current").then(function () {
        document.getElementById("saveState").textContent = "Saved";
      });
    }, 400);
  }

  /* ---------- Render ---------- */
  function el(tag, attrs, html) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (html != null) n.innerHTML = html;
    return n;
  }
  function esc(s) { return (s == null ? "" : String(s)).replace(/[&<>"]/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function projectCard() {
    var p = STATE.project, P = "project";
    var c = el("section", { class: "card" }, "<h2>A. Project Information</h2>");
    var g = el("div", { class: "grid2" });
    function f(key, label, full, type) {
      var w = el("label", { class: "fld" + (full ? " full" : "") }, esc(label));
      var i = el("input", { type: type || "text" });
      i.value = p[key] || "";
      i.addEventListener("input", function () { p[key] = i.value; scheduleSave(); });
      w.appendChild(i); return w;
    }
    g.appendChild(f("apn", "APN")); g.appendChild(f("date", "Date", false, "date"));
    g.appendChild(f("address", "Project Address", true));
    g.appendChild(f("owner", "Owner")); g.appendChild(f("ownerEmail", "Owner Email", false, "email"));
    g.appendChild(f("ownerAddress", "Owner Address", true));
    g.appendChild(f("ownerPhone", "Phone", false, "tel"));
    c.appendChild(g); return c;
  }

  /* In-app camera (getUserMedia). Reliable on Android Chrome and inside an
   * installed PWA, where <input capture> often falls back to the gallery. */
  function openCamera(onBlob) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Live camera not available here — use 'Library / video' instead.");
      return;
    }
    var facing = "environment", stream = null, n = 0;
    var ov = el("div", { class: "cam-ov" });
    var video = el("video", { autoplay: "", playsinline: "" });
    video.muted = true;
    var count = el("div", { class: "cam-count" }, "0 captured — tap circle to snap");
    var bar = el("div", { class: "cam-bar" });
    var flip = el("button", { type: "button", class: "cam-btn" }, "⟲ Flip");
    var shot = el("button", { type: "button", class: "cam-shot", "aria-label": "Capture" });
    var done = el("button", { type: "button", class: "cam-btn" }, "Done");
    bar.appendChild(flip); bar.appendChild(shot); bar.appendChild(done);
    ov.appendChild(video); ov.appendChild(count); ov.appendChild(bar);
    document.body.appendChild(ov);

    function stop() { if (stream) stream.getTracks().forEach(function (t) { t.stop(); }); }
    function close() { stop(); ov.remove(); }
    function start() {
      stop();
      navigator.mediaDevices.getUserMedia({ video: { facingMode: facing }, audio: false })
        .then(function (s) { stream = s; video.srcObject = s; video.play().catch(function () {}); })
        .catch(function (e) {
          alert("Camera blocked or unavailable (" + (e && e.name) +
            "). Allow camera for this site in browser settings, or use 'Library / video'.");
          close();
        });
    }
    flip.addEventListener("click", function () {
      facing = facing === "environment" ? "user" : "environment"; start();
    });
    done.addEventListener("click", close);
    shot.addEventListener("click", function () {
      if (!video.videoWidth) return;
      var cv = document.createElement("canvas");
      cv.width = video.videoWidth; cv.height = video.videoHeight;
      cv.getContext("2d").drawImage(video, 0, 0);
      cv.toBlob(function (b) {
        if (!b) return;
        n++; count.textContent = n + " captured — tap circle to snap";
        ov.classList.add("flash");
        setTimeout(function () { ov.classList.remove("flash"); }, 130);
        onBlob(b);
      }, "image/jpeg", 0.85);
    });
    start();
  }

  function mediaStrip(rec, store) {
    var box = el("div", { class: "media" });
    function refresh() {
      box.innerHTML = "";
      rec.media.forEach(function (mid) {
        idbGet("media", mid).then(function (m) {
          if (!m) return;
          var url = URL.createObjectURL(m.blob);
          var t = el("div", { class: "thumb" });
          var v = m.blob.type.indexOf("video") === 0
            ? el("video", { src: url, muted: "", playsinline: "" })
            : el("img", { src: url });
          var x = el("button", { type: "button" }, "✕");
          x.addEventListener("click", function () {
            rec.media = rec.media.filter(function (z) { return z !== mid; });
            idbDel("media", mid); scheduleSave(); refresh();
          });
          t.appendChild(v); t.appendChild(x); box.appendChild(t);
        });
      });
      function storeBlob(blob, type) {
        return idbAdd("media", { blob: blob, type: type || blob.type, ts: Date.now() })
          .then(function (id) { rec.media.push(id); });
      }
      var cam = el("button", { type: "button", class: "addmedia" }, "📷 Take photo");
      cam.addEventListener("click", function () {
        openCamera(function (blob) {
          storeBlob(blob, "image/jpeg").then(function () { scheduleSave(); refresh(); });
        });
      });
      var pick = el("label", { class: "addmedia alt" }, "🖼 Library / video");
      var inp = el("input", { type: "file", accept: "image/*,video/*", hidden: "" });
      pick.appendChild(inp);
      inp.addEventListener("change", function () {
        var files = Array.prototype.slice.call(inp.files || []);
        Promise.all(files.map(function (file) { return storeBlob(file, file.type); }))
          .then(function () { scheduleSave(); refresh(); });
      });
      box.appendChild(cam); box.appendChild(pick);
    }
    refresh();
    return box;
  }

  function itemRow(section, it) {
    var rec = STATE.items[it.id];
    var wrap = el("div", { class: "item" });
    var q = el("div", { class: "q" });
    q.appendChild(el("div", { class: "num" }, it.id + "."));
    q.appendChild(el("div", { class: "txt" }, esc(it.text)));
    wrap.appendChild(q);

    var b = el("div", { class: "badges" });
    b.appendChild(el("span", { class: "badge tr" }, esc(it.trade || section.defaultTrade || "General")));
    if (it.safeHarbor)
      b.appendChild(el("span", { class: "badge sh", title: "Legal-when-built + safely maintained = NOT a violation" }, "SAFE-HARBOR"));
    else if (section.id === "C" || section.id === "D")
      b.appendChild(el("span", { class: "badge sh-no", title: "Required retroactively by statute" }, "RETROACTIVE"));
    if (it.formQuirk)
      b.appendChild(el("span", { class: "badge qk", title: it.formQuirk }, "FORM QUIRK"));
    wrap.appendChild(b);
    if (it.formQuirk) wrap.appendChild(el("div", { class: "note" }, esc(it.formQuirk)));

    var states = el("div", { class: "states" });
    section.states.forEach(function (st) {
      var id = "s" + it.id + st;
      var lab = el("label", { for: id, "data-st": st }, st[0].toUpperCase() + st.slice(1));
      var r = el("input", { type: "radio", name: "st" + it.id, id: id, value: st });
      if (rec.status === st) { r.checked = true; lab.className = "sel-" + st; }
      r.addEventListener("change", function () {
        rec.status = st;
        states.querySelectorAll("label").forEach(function (l) { l.className = ""; });
        lab.className = "sel-" + st;
        scheduleSave();
      });
      lab.insertBefore(r, lab.firstChild);
      states.appendChild(lab);
    });
    wrap.appendChild(states);

    var nt = el("textarea", { placeholder: "Field notes / location / observed condition" });
    nt.value = rec.notes || "";
    nt.addEventListener("input", function () { rec.notes = nt.value; scheduleSave(); });
    wrap.appendChild(nt);
    wrap.appendChild(mediaStrip(rec, "media"));
    return wrap;
  }

  function sectionCard(section) {
    var c = el("section", { class: "card" });
    var statesTag = section.states.length === 3 ? "3-state" : "2-state";
    c.appendChild(el("h2", null, esc(section.id + ". " + section.title) +
      ' <span class="tag">' + statesTag + "</span>" +
      (section.basis ? ' <span class="tag">' + esc(section.basis) + "</span>" : "")));
    if (section.note) c.appendChild(el("div", { class: "note" }, esc(section.note)));
    section.items.forEach(function (it) { c.appendChild(itemRow(section, it)); });
    return c;
  }

  function fieldItemsCard() {
    var c = el("section", { class: "card" },
      "<h2>I. Additional Safety Violations <span class='tag'>field-identified</span></h2>");
    CL.fieldItems.forEach(function (n) {
      var rec = STATE.items[n];
      var w = el("div", { class: "item" });
      w.appendChild(el("div", { class: "num" }, n + "."));
      var ta = el("textarea", { placeholder: "Describe field-identified condition (leave blank if none)" });
      ta.value = rec.text || "";
      ta.addEventListener("input", function () { rec.text = ta.value; scheduleSave(); });
      w.appendChild(ta);
      var st = el("div", { class: "states" });
      ["compliant", "violation", "unconfirmed"].forEach(function (s) {
        var lab = el("label", null, s[0].toUpperCase() + s.slice(1));
        var r = el("input", { type: "radio", name: "fi" + n });
        if (rec.status === s) { r.checked = true; lab.className = "sel-" + s; }
        r.addEventListener("change", function () {
          rec.status = s; st.querySelectorAll("label").forEach(function (l){l.className="";});
          lab.className = "sel-" + s; scheduleSave();
        });
        lab.insertBefore(r, lab.firstChild); st.appendChild(lab);
      });
      w.appendChild(st);
      w.appendChild(mediaStrip(rec, "media"));
      c.appendChild(w);
    });
    return c;
  }

  function signCard() {
    var s = STATE.sign;
    var c = el("section", { class: "card" },
      "<h2>J. Acknowledgment & Sign-off</h2>" +
      "<div class='note'>The published PLG-264 signature block has Owner / Licensed " +
      "Contractor / County Building Inspector only. Per-trade (M/E/P) sign-off is a " +
      "county verbal request — captured on the report addendum; confirm in writing.</div>");
    var g = el("div", { class: "sig" });
    function f(key, label) {
      var w = el("label", { class: "fld" }, esc(label));
      var i = el("input", { type: "text" }); i.value = s[key] || "";
      i.addEventListener("input", function () { s[key] = i.value; scheduleSave(); });
      w.appendChild(i); return w;
    }
    g.appendChild(f("ownerName", "Owner Name"));
    g.appendChild(f("ownerPhone", "Owner Phone"));
    g.appendChild(f("ownerEmail", "Owner Email"));
    g.appendChild(f("contractorName", "Licensed Contractor Name"));
    g.appendChild(f("contractorLic", "Contractor License #"));
    g.appendChild(f("contractorPhone", "Contractor Phone"));
    g.appendChild(f("contractorEmail", "Contractor Email"));
    c.appendChild(g);
    return c;
  }

  function render() {
    var app = document.getElementById("app");
    app.innerHTML = "";
    app.appendChild(projectCard());
    CL.sections.forEach(function (s) { app.appendChild(sectionCard(s)); });
    app.appendChild(fieldItemsCard());
    app.appendChild(signCard());
  }

  /* ---------- Report ---------- */
  function findItem(id) {
    var found = null;
    CL.sections.forEach(function (s) {
      s.items.forEach(function (it) { if (it.id === id) found = { s: s, it: it }; });
    });
    return found;
  }
  function recFor(it, status) {
    if (status === "unconfirmed") return it.recUnconfirmed || it.recViolation;
    return it.recViolation;
  }
  function imgTag(mid) {
    return idbGet("media", mid).then(function (m) {
      if (!m || !m.blob) return "";
      // Android pickers often report an empty blob.type for valid images;
      // treat anything that isn't a video as an image (mirrors the editor).
      if ((m.blob.type || "").indexOf("video") === 0)
        return "<span class='rpt-vid'>[ video clip recorded — viewable in the " +
          "app; not embeddable in a PDF ]</span>";
      return new Promise(function (res) {
        var fr = new FileReader();
        fr.onload = function () { res('<img src="' + fr.result + '">'); };
        fr.onerror = function () { res(""); };
        fr.readAsDataURL(m.blob);
      });
    });
  }

  function buildReport(preview) {
    var p = STATE.project, root = document.getElementById("reportRoot");
    var findings = [];
    Object.keys(STATE.items).forEach(function (id) {
      var r = STATE.items[id], st = r.status;
      if (st === "violation" || st === "unconfirmed") {
        var fi = findItem(parseInt(id, 10));
        findings.push({
          id: id,
          text: fi ? fi.it.text : (r.text || "Field-identified item " + id),
          trade: fi ? (fi.it.trade || "General") : "General",
          basis: fi ? (fi.it.basis || (fi.s.basis || "")) : "Field-identified",
          status: st,
          safeHarbor: fi ? !!fi.it.safeHarbor : false,
          rec: fi ? recFor(fi.it, st) : "Address field-identified condition in submitted plans.",
          notes: r.notes || "", media: r.media || []
        });
      }
    });
    findings.sort(function (a, b) {
      return a.trade === b.trade ? a.id - b.id : a.trade < b.trade ? -1 : 1;
    });

    var head =
      "<h1>AB 2533 Substandard Housing — Inspection Report &amp; Design-Team Recommendations</h1>" +
      "<p><strong>Form basis:</strong> Santa Cruz County PLG-264 (Rev " + CL.rev +
      ") · HSC § 17920.3 &nbsp;|&nbsp; <strong>APN:</strong> " + esc(p.apn) +
      " &nbsp;|&nbsp; <strong>Date:</strong> " + esc(p.date) + "<br>" +
      "<strong>Address:</strong> " + esc(p.address) + " &nbsp;|&nbsp; <strong>Owner:</strong> " +
      esc(p.owner) + "</p>" +
      "<p><strong>Summary:</strong> " + findings.length + " item(s) requiring action — " +
      findings.filter(function (f){return f.status==="violation";}).length + " violation(s), " +
      findings.filter(function (f){return f.status==="unconfirmed";}).length +
      " unconfirmed (concealed — further investigation).</p>";

    var byTrade = {};
    findings.forEach(function (f) { (byTrade[f.trade] = byTrade[f.trade] || []).push(f); });

    var memo = "<div class='pgbreak'></div><h2>Design-Team Recommendations (by trade)</h2>" +
      "<p style='font-size:11px'>SAFE-HARBOR items: HSC 17920.3 exempts components that were " +
      "legal when built and have been safely maintained. Do not over-scope these to current " +
      "code. County has confirmed Title 24 (energy) is <strong>not</strong> enforced.</p>";
    Object.keys(byTrade).sort().forEach(function (tr) {
      memo += "<h3>" + esc(tr) + "</h3><table class='rpt-table'><tr><th>#</th>" +
        "<th>Condition</th><th>Status</th><th>HSC basis</th><th>Recommendation for plans</th></tr>";
      byTrade[tr].forEach(function (f) {
        memo += "<tr><td>" + esc(f.id) + "</td><td>" + esc(f.text) +
          (f.notes ? "<br><em>Field: " + esc(f.notes) + "</em>" : "") + "</td><td class='rpt-v'>" +
          f.status.toUpperCase() + (f.safeHarbor ? "<br>(safe-harbor)" : "") + "</td><td>" +
          esc(f.basis) + "</td><td>" + esc(f.rec) + "</td></tr>";
      });
      memo += "</table>";
    });

    var full = "<h2 class='pgbreak'>Full Checklist Status</h2><table class='rpt-table'>" +
      "<tr><th>#</th><th>Item</th><th>Status</th><th>Field notes</th></tr>";
    CL.sections.forEach(function (s) {
      full += "<tr><td colspan='4'><strong>" + esc(s.id + ". " + s.title) + "</strong></td></tr>";
      s.items.forEach(function (it) {
        var r = STATE.items[it.id] || {};
        full += "<tr><td>" + it.id + "</td><td>" + esc(it.text) + "</td><td>" +
          esc((r.status || "—").toUpperCase()) + "</td><td>" + esc(r.notes || "") + "</td></tr>";
      });
    });
    var fHas = CL.fieldItems.some(function (n) {
      var r = STATE.items[n]; return r && (r.text || r.status || r.notes);
    });
    if (fHas) {
      full += "<tr><td colspan='4'><strong>I. Additional Safety Violations " +
        "(field-identified)</strong></td></tr>";
      CL.fieldItems.forEach(function (n) {
        var r = STATE.items[n] || {};
        if (!(r.text || r.status || r.notes)) return;
        full += "<tr><td>" + n + "</td><td>" + esc(r.text || "") + "</td><td>" +
          esc((r.status || "—").toUpperCase()) + "</td><td>" + esc(r.notes || "") + "</td></tr>";
      });
    }
    full += "</table>";

    var sigs = "<div class='pgbreak'></div><h2>Acknowledgment & Trade Sign-off Addendum</h2>" +
      "<p style='font-size:10px'>Accurate completion is required to determine if substandard " +
      "conditions exist. Completion does not confer legality. Identified items must be addressed " +
      "in submitted plans and verified at inspection.</p>" +
      sigBlock("Owner", STATE.sign.ownerName) +
      sigBlock("Licensed Contractor (GC) — Lic# " + esc(STATE.sign.contractorLic), STATE.sign.contractorName) +
      sigBlock("Mechanical Contractor (when applicable) — Lic# ______", "") +
      sigBlock("Electrical Contractor — Lic# ______", "") +
      sigBlock("Plumbing Contractor — Lic# ______", "");

    // Photo/video documentation — EVERY item that has media, regardless of
    // status (not just findings), so compliance photos are never dropped.
    function itemMeta(id) {
      var fi = findItem(parseInt(id, 10)), r = STATE.items[id] || {};
      return {
        txt: fi ? fi.it.text : (r.text || "Field-identified item " + id),
        st: (r.status || "—").toUpperCase()
      };
    }
    var ordered = [];
    CL.sections.forEach(function (s) {
      s.items.forEach(function (it) { ordered.push(it.id); });
    });
    CL.fieldItems.forEach(function (n) { ordered.push(n); });
    var withMedia = ordered.filter(function (id) {
      var r = STATE.items[id]; return r && r.media && r.media.length;
    }).map(function (id) {
      return { id: id, media: STATE.items[id].media, _ph: "" };
    });

    var photoPromises = [];
    withMedia.forEach(function (pi) {
      pi.media.forEach(function (mid) {
        photoPromises.push(imgTag(mid).then(function (h) { pi._ph += h; }));
      });
    });
    Promise.all(photoPromises).then(function () {
      var shown = 0;
      var photos = "<div class='pgbreak'></div><h2>Photo &amp; Video Documentation</h2>";
      withMedia.forEach(function (pi) {
        if (!pi._ph) return;
        shown++;
        var m = itemMeta(pi.id);
        photos += "<p><strong>#" + esc(pi.id) + " — " + esc(m.txt) +
          "</strong> <em>(" + esc(m.st) + ")</em></p><div class='rpt-photos'>" +
          pi._ph + "</div>";
      });
      if (!shown) photos += "<p>No photos or videos attached.</p>";
      root.innerHTML = head + memo + full + sigs + photos;
      if (preview) { root.classList.add("preview");
        root.scrollIntoView(); document.getElementById("app").style.display = "none";
        addPreviewBar();
      } else { window.print(); }
    });
  }
  /* Fill the official County PLG-264 AcroForm directly: mark the
   * Compliant/Violation/Unconfirmed checkbox per item, fill project +
   * signature text fields, flatten, and output ONLY the official 5 pages.
   * Field map derived from the PDF geometry (data/plg264-fields.js) -
   * re-run the extraction script if the county revises the form. */
  function buildCountyPDF() {
    if (!window.PDFLib) {
      alert("PDF engine not loaded yet. Reopen the app once while online, then retry.");
      return;
    }
    if (!window.AB2533_PLG264_FIELDS) {
      alert("PLG-264 field map not loaded. Reopen the app once while online, then retry.");
      return;
    }
    var P = window.PDFLib, FM = window.AB2533_PLG264_FIELDS;
    var btn = document.getElementById("btnCounty"), label = btn.textContent;
    btn.textContent = "Building..."; btn.disabled = true;
    // AcroForm text uses a WinAnsi font; fold non-Latin-1 chars to ASCII.
    function asc(s) {
      return String(s == null ? "" : s)
        .replace(/[‘’‚‛]/g, "'")
        .replace(/[“”„]/g, '"')
        .replace(/[–—―]/g, "-")
        .replace(/…/g, "...").replace(/•/g, "-")
        .replace(/ /g, " ").replace(/→/g, "->")
        .replace(/≥/g, ">=").replace(/≤/g, "<=")
        .replace(/≠/g, "!=").replace(/×/g, "x")
        .replace(/[^\x00-\xFF]/g, "-");
    }
    fetch("data/PLG-264.pdf").then(function (r) {
      if (!r.ok) throw new Error("form fetch " + r.status);
      return r.arrayBuffer();
    }).then(function (buf) {
      return P.PDFDocument.load(buf);
    }).then(function (doc) {
      var form = doc.getForm();
      function setText(name, val) {
        if (!name) return;
        try { form.getTextField(name).setText(asc(val)); } catch (e) {}
      }
      function check(name) {
        if (!name) return;
        try { form.getCheckBox(name).check(); } catch (e) {}
      }
      var p = STATE.project, sg = STATE.sign || {}, T = FM.text;
      setText(T.apn, p.apn);
      setText(T.date, p.date);
      setText(T.address, p.address);
      setText(T.ownerAddress, p.ownerAddress);
      setText(T.ownerName, p.owner || sg.ownerName);
      setText(T.ownerEmail, p.ownerEmail || sg.ownerEmail);
      setText(T.ownerPhone, p.ownerPhone || sg.ownerPhone);
      setText(T.ownerSig, sg.ownerName || p.owner);
      setText(T.ownerDate, p.date);
      setText(T.coName, sg.contractorName);
      setText(T.coPhone, sg.contractorPhone);
      setText(T.coEmail, sg.contractorEmail);
      setText(T.coSig, sg.contractorName);
      setText(T.coLic, sg.contractorLic);
      setText(T.coDate, p.date);
      setText(T.fi44, (STATE.items[44] || {}).text);
      setText(T.fi45, (STATE.items[45] || {}).text);
      setText(T.fi46, (STATE.items[46] || {}).text);
      Object.keys(FM.checks).forEach(function (id) {
        var st = (STATE.items[id] || {}).status;
        if (!st) return;
        var col = FM.checks[id][st];
        if (col) check(col);
      });
      try { form.flatten(); } catch (e) {}
      return doc.save();
    }).then(function (bytes) {
      var blob = new Blob([bytes], { type: "application/pdf" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "PLG-264_filled_" + (STATE.project.apn || "inspection") +
        "_" + STATE.project.date + ".pdf";
      a.click();
    }).catch(function (e) {
      alert("Could not build the county PDF: " + (e && e.message || e));
    }).then(function () {
      btn.textContent = label; btn.disabled = false;
    });
  }
  function sigBlock(role, name) {
    return "<table class='rpt-table'><tr><td style='width:55%'>" + esc(role) +
      "<br><br>Name: " + esc(name || "______________________") +
      "</td><td>Signature: ______________________<br><br>Date: ____________</td></tr></table>";
  }
  function addPreviewBar() {
    var bar = el("div", { class: "no-print",
      style: "position:sticky;bottom:0;background:#1f3a5f;color:#fff;padding:.6rem;text-align:center" });
    var pr = el("button", { class: "primary" }, "Print / Save as PDF");
    var bk = el("button", null, "Back to editing");
    pr.addEventListener("click", function () { window.print(); });
    bk.addEventListener("click", function () {
      document.getElementById("reportRoot").classList.remove("preview");
      document.getElementById("reportRoot").innerHTML = "";
      document.getElementById("app").style.display = "";
      bar.remove();
    });
    bar.appendChild(pr); bar.appendChild(el("span", null, " ")); bar.appendChild(bk);
    document.body.appendChild(bar);
  }

  /* ---------- Export / Import (on-device only) ---------- */
  function exportJSON() {
    // includes media as base64 so the file is a complete portable backup
    var media = [];
    var store = tx("media", "readonly");
    var cur = store.openCursor();
    cur.onsuccess = function (e) {
      var c = e.target.result;
      if (c) {
        var fr = new FileReader();
        fr.onload = function () {
          media.push({ id: c.value.id, type: c.value.type, data: fr.result });
          c.continue();
        };
        fr.readAsDataURL(c.value.blob);
      } else {
        var blob = new Blob([JSON.stringify({ v: 1, state: STATE, media: media })],
          { type: "application/json" });
        var a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "AB2533_" + (STATE.project.apn || "inspection") + "_" +
          STATE.project.date + ".json";
        a.click();
      }
    };
  }
  function importJSON(file) {
    var fr = new FileReader();
    fr.onload = function () {
      try {
        var d = JSON.parse(fr.result);
        STATE = d.state;
        // wipe + restore media
        DB.transaction("media", "readwrite").objectStore("media").clear()
          .onsuccess = function () {
          (d.media || []).forEach(function (m) {
            fetch(m.data).then(function (r) { return r.blob(); }).then(function (b) {
              idbAdd("media", { blob: b, type: m.type, ts: Date.now() });
            });
          });
          idbPut("state", STATE, "current").then(function () { render(); });
        };
      } catch (e) { alert("Invalid file."); }
    };
    fr.readAsText(file);
  }

  /* ---------- Boot ---------- */
  function wire() {
    document.getElementById("btnReport").addEventListener("click", function () { buildReport(true); });
    document.getElementById("btnCounty").addEventListener("click", buildCountyPDF);
    document.getElementById("btnExport").addEventListener("click", exportJSON);
    document.getElementById("importFile").addEventListener("change", function (e) {
      if (e.target.files[0]) importJSON(e.target.files[0]);
    });
    document.getElementById("btnReset").addEventListener("click", function () {
      if (!confirm("Start a new inspection? Export first if you need this one.")) return;
      STATE = blankState();
      DB.transaction("media", "readwrite").objectStore("media").clear();
      idbPut("state", STATE, "current").then(render);
    });
  }
  openDB().then(function (db) {
    DB = db;
    return idbGet("state", "current");
  }).then(function (saved) {
    STATE = saved || blankState();
    wire(); render();
    idbPut("state", STATE, "current");
  }).catch(function (e) {
    document.getElementById("app").innerHTML =
      "<section class='card'>Storage unavailable: " + esc(e && e.message) + "</section>";
  });
})();
