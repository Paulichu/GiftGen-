// Runtime source shipped inside every generated app.
// Written as plain ES5-style browser JavaScript so it runs without a build step.
// It must not contain backticks or "${" because it is embedded in a template literal.

export const APP_RUNTIME = `
(function () {
  "use strict";

  var fields = CONFIG.fields || [];
  var records = [];
  var editingId = null;
  var state = { query: "", filter: "all", sort: "newest" };

  function $(id) { return document.getElementById(id); }

  function esc(value) {
    return String(value === undefined || value === null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function uid() {
    return "r_" + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
  }

  function persist(rows) {
    try { localStorage.setItem(CONFIG.storageKey, JSON.stringify(rows)); } catch (error) {}
  }

  function load() {
    try {
      var raw = localStorage.getItem(CONFIG.storageKey);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (error) {}
    var seed = (CONFIG.seed || []).map(function (row, index) {
      var copy = {};
      for (var key in row) { if (Object.prototype.hasOwnProperty.call(row, key)) copy[key] = row[key]; }
      copy.id = "seed_" + (index + 1);
      copy.createdAt = new Date(Date.now() - (index + 1) * 86400000).toISOString();
      return copy;
    });
    persist(seed);
    return seed;
  }

  function fieldByType(type) {
    for (var i = 0; i < fields.length; i++) { if (fields[i].type === type) return fields[i]; }
    return null;
  }

  function primaryField() { return fields[0] || { key: "title", label: "Title" }; }

  function formatDate(value) {
    if (!value) return "";
    var text = String(value);
    var date = new Date(text.length === 10 ? text + "T00:00:00" : text);
    if (isNaN(date.getTime())) return text;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  }

  function formatNumber(value, unit) {
    var number = Number(value);
    if (isNaN(number)) return String(value);
    var text = number % 1 === 0
      ? number.toLocaleString()
      : number.toLocaleString(undefined, { maximumFractionDigits: 2 });
    return (unit || "") + text;
  }

  function isDone(record) {
    var checkbox = fieldByType("checkbox");
    if (checkbox) return !!record[checkbox.key];
    for (var i = 0; i < fields.length; i++) {
      var field = fields[i];
      if (field.type !== "select") continue;
      var value = String(record[field.key] || "");
      if (/^(done|completed|complete|paid|confirmed|won|read|published|sold out)$/i.test(value)) return true;
    }
    return false;
  }

  function renderStats() {
    var host = $("stats");
    if (!host) return;
    var cards = [{ label: "Total " + (CONFIG.entity ? CONFIG.entity.plural : "records"), value: String(records.length) }];

    var numField = fieldByType("number");
    if (numField) {
      var sum = 0;
      records.forEach(function (record) {
        var value = Number(record[numField.key]);
        if (!isNaN(value)) sum += value;
      });
      cards.push({ label: numField.label + " total", value: formatNumber(sum, numField.unit) });
    } else {
      var selectField = fieldByType("select");
      if (selectField) {
        var seen = {};
        records.forEach(function (record) {
          if (record[selectField.key]) seen[record[selectField.key]] = true;
        });
        cards.push({ label: "Different " + selectField.label.toLowerCase(), value: String(Object.keys(seen).length) });
      }
    }

    if (fieldByType("checkbox") || fieldByType("select")) {
      var done = records.filter(isDone).length;
      cards.push({ label: "Completed", value: done + " / " + records.length });
    } else {
      var recent = records.filter(function (record) {
        return record.createdAt && (Date.now() - new Date(record.createdAt).getTime()) < 7 * 86400000;
      }).length;
      cards.push({ label: "Added this week", value: String(recent) });
    }

    var html = "";
    cards.forEach(function (card) {
      html += '<div class="stat"><span class="stat-label">' + esc(card.label) + '</span><span class="stat-value">' + esc(card.value) + "</span></div>";
    });
    host.innerHTML = html;
  }

  function rowHtml(record) {
    var primary = primaryField();
    var html = '<div class="row" data-id="' + esc(record.id) + '">';
    html += '<div class="row-main">';
    html += '<div class="row-title">' + esc(record[primary.key] || "Untitled") + "</div>";
    html += '<div class="row-meta">';
    for (var i = 1; i < fields.length; i++) {
      var field = fields[i];
      var value = record[field.key];
      if (field.type !== "checkbox" && (value === undefined || value === null || value === "")) {
        continue;
      }
      if (field.type === "textarea") continue;
      if (field.type === "checkbox") {
        html += '<button type="button" class="chip toggle' + (value ? " on" : "") + '" data-act="toggle">' +
          (value ? "✓ " : "○ ") + esc(field.label) + "</button>";
        continue;
      }
      if (field.type === "select") {
        html += '<span class="chip">' + esc(field.label) + ": " + esc(value) + "</span>";
        continue;
      }
      if (field.type === "date") {
        html += '<span class="chip">' + esc(field.label) + " " + esc(formatDate(value)) + "</span>";
        continue;
      }
      if (field.type === "number") {
        html += '<span class="chip">' + esc(field.label) + " " + esc(formatNumber(value, field.unit)) + "</span>";
        continue;
      }
      html += '<span class="chip">' + esc(field.label) + " " + esc(value) + "</span>";
    }
    html += "</div></div>";
    html += '<div class="row-actions">';
    html += '<button type="button" class="icon-btn" data-act="edit" title="Edit">✎</button>';
    html += '<button type="button" class="icon-btn danger" data-act="delete" title="Delete">✕</button>';
    html += "</div></div>";
    return html;
  }

  function filtered() {
    var query = state.query.trim().toLowerCase();
    var rows = records.slice();
    var filterField = fieldByType("select");

    if (query) {
      rows = rows.filter(function (record) {
        return JSON.stringify(record).toLowerCase().indexOf(query) !== -1;
      });
    }
    if (state.filter !== "all" && filterField) {
      rows = rows.filter(function (record) {
        return String(record[filterField.key] || "") === state.filter;
      });
    }

    var primary = primaryField();
    if (state.sort === "oldest") {
      rows.sort(function (a, b) { return new Date(a.createdAt || 0) - new Date(b.createdAt || 0); });
    } else if (state.sort === "alpha") {
      rows.sort(function (a, b) {
        return String(a[primary.key] || "").localeCompare(String(b[primary.key] || ""));
      });
    } else if (state.sort === "high") {
      var numField = fieldByType("number");
      if (numField) {
        rows.sort(function (a, b) { return Number(b[numField.key] || 0) - Number(a[numField.key] || 0); });
      }
    } else {
      rows.sort(function (a, b) { return new Date(b.createdAt || 0) - new Date(a.createdAt || 0); });
    }
    return rows;
  }

  function render() {
    var host = $("list");
    if (!host) return;
    var rows = filtered();
    host.innerHTML = rows.map(rowHtml).join("");
    var empty = $("empty");
    if (empty) empty.hidden = rows.length > 0;
    renderStats();
  }

  function closeModal() {
    var modal = $("modal");
    if (modal) modal.hidden = true;
    editingId = null;
  }

  function openModal(record) {
    editingId = record ? record.id : null;
    var entityName = CONFIG.entity ? CONFIG.entity.singular.toLowerCase() : "record";
    var titleEl = $("modal-title");
    if (titleEl) titleEl.textContent = record ? "Edit " + entityName : "New " + entityName;

    var html = "";
    fields.forEach(function (field) {
      var value = record ? record[field.key] : "";
      if (field.type === "checkbox") {
        html += '<label class="field check"><input type="checkbox" name="' + esc(field.key) + '"' +
          (value ? " checked" : "") + " /><span>" + esc(field.label) + "</span></label>";
        return;
      }
      html += '<label class="field"><span class="field-label">' + esc(field.label) +
        (field.required ? " *" : "") + "</span>";
      if (field.type === "textarea") {
        html += '<textarea name="' + esc(field.key) + '" rows="3" placeholder="' +
          esc(field.placeholder || "") + '">' + esc(value) + "</textarea>";
      } else if (field.type === "select") {
        html += '<select name="' + esc(field.key) + '"><option value="">Select…</option>';
        (field.options || []).forEach(function (option) {
          html += '<option value="' + esc(option) + '"' + (String(value) === option ? " selected" : "") +
            ">" + esc(option) + "</option>";
        });
        html += "</select>";
      } else {
        var inputType = field.type === "number" ? "number" : field.type === "date" ? "date" : field.type === "time" ? "time" : "text";
        html += '<input type="' + inputType + '" name="' + esc(field.key) + '"' +
          (field.type === "number" ? ' step="any"' : "") + ' value="' + esc(value) +
          '" placeholder="' + esc(field.placeholder || "") + '" />';
      }
      html += "</label>";
    });

    var form = $("record-form");
    form.innerHTML = html + '<div class="form-actions"><button type="button" class="btn btn-ghost" id="cancel-btn">Cancel</button>' +
      '<button type="submit" class="btn btn-primary">' + (record ? "Save changes" : "Create") + "</button></div>";

    var modal = $("modal");
    if (modal) modal.hidden = false;
    var first = form.querySelector("input, textarea, select");
    if (first) first.focus();
    var cancel = $("cancel-btn");
    if (cancel) cancel.addEventListener("click", closeModal);
  }

  function collect() {
    var form = $("record-form");
    var values = {};
    fields.forEach(function (field) {
      var input = form.querySelector('[name="' + field.key + '"]');
      if (!input) return;
      if (field.type === "checkbox") values[field.key] = input.checked;
      else if (field.type === "number") values[field.key] = input.value === "" ? "" : Number(input.value);
      else values[field.key] = input.value;
    });
    return values;
  }

  function onSubmit(event) {
    event.preventDefault();
    var values = collect();
    var missing = fields.filter(function (field) {
      return field.required && (values[field.key] === "" || values[field.key] === undefined);
    });
    if (missing.length) {
      toast("Please fill in: " + missing.map(function (field) { return field.label; }).join(", "));
      return;
    }
    if (editingId) {
      records = records.map(function (record) {
        if (record.id !== editingId) return record;
        var copy = {};
        for (var key in record) copy[key] = record[key];
        for (var next in values) copy[next] = values[next];
        return copy;
      });
      toast("Changes saved");
    } else {
      values.id = uid();
      values.createdAt = new Date().toISOString();
      records.unshift(values);
      toast("Created");
    }
    persist(records);
    closeModal();
    render();
  }

  function onListClick(event) {
    var action = event.target.closest("[data-act]");
    if (!action) return;
    var row = event.target.closest(".row");
    if (!row) return;
    var id = row.getAttribute("data-id");
    var record = records.filter(function (item) { return item.id === id; })[0];
    if (!record) return;
    var act = action.getAttribute("data-act");

    if (act === "edit") {
      openModal(record);
    } else if (act === "delete") {
      if (window.confirm("Delete this record? This cannot be undone.")) {
        records = records.filter(function (item) { return item.id !== id; });
        persist(records);
        render();
        toast("Deleted");
      }
    } else if (act === "toggle") {
      var checkbox = fieldByType("checkbox");
      if (!checkbox) return;
      record[checkbox.key] = !record[checkbox.key];
      persist(records);
      render();
    }
  }

  function csvCell(value) {
    var text = value === undefined || value === null ? "" : String(value);
    return '"' + text.replace(/"/g, '""') + '"';
  }

  function exportCsv() {
    var header = fields.map(function (field) { return csvCell(field.label); }).join(",");
    var lines = filtered().map(function (record) {
      return fields.map(function (field) { return csvCell(record[field.key]); }).join(",");
    });
    var csv = [header].concat(lines).join("\\r\\n");
    var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = (CONFIG.slug || "records") + ".csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(function () { URL.revokeObjectURL(link.href); }, 1000);
    toast("CSV exported");
  }

  function setupFilter() {
    var select = $("filter");
    var field = fieldByType("select");
    if (!select || !field) return;
    var options = ['<option value="all">All</option>'];
    (field.options || []).forEach(function (option) {
      options.push('<option value="' + esc(option) + '">' + esc(option) + "</option>");
    });
    select.innerHTML = options.join("");
    select.addEventListener("change", function () {
      state.filter = select.value;
      render();
    });
  }

  var toastTimer = null;
  function toast(message) {
    var el = $("toast");
    if (!el) return;
    el.textContent = message;
    el.hidden = false;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.hidden = true; }, 2400);
  }

  function init() {
    records = load();

    var addBtn = $("add-btn");
    if (addBtn) addBtn.addEventListener("click", function () { openModal(null); });

    var searchEl = $("search");
    if (searchEl) {
      searchEl.addEventListener("input", function () {
        state.query = searchEl.value;
        render();
      });
    }

    var sortEl = $("sort");
    if (sortEl) {
      sortEl.addEventListener("change", function () {
        state.sort = sortEl.value;
        render();
      });
    }

    var exportBtn = $("export-btn");
    if (exportBtn) exportBtn.addEventListener("click", exportCsv);

    var list = $("list");
    if (list) list.addEventListener("click", onListClick);

    var form = $("record-form");
    if (form) form.addEventListener("submit", onSubmit);

    var modal = $("modal");
    if (modal) {
      modal.addEventListener("click", function (event) {
        if (event.target === modal) closeModal();
      });
    }
    var closeBtn = $("modal-close");
    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeModal();
    });

    setupFilter();
    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
`;
