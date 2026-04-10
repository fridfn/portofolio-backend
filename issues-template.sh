#!/bin/bash

echo "🚀 Setting up GitHub Issue Templates..."

# Buat folder
mkdir -p .github/ISSUE_TEMPLATE

# ========================
# BUG TEMPLATE
# ========================
cat << 'EOF' > .github/ISSUE_TEMPLATE/bug.md
---
name: 🐛 Bug Report
about: Laporkan bug atau error
title: "[BUG] "
labels: bug
assignees: ""
---

## 🧩 Ringkasan
> Jelasin bug-nya secara singkat

---

## ⚠️ Yang Terjadi
- ...
- ...

---

## ✅ Yang Diharapkan
- ...
- ...

---

## 🔁 Cara Reproduce
1. ...
2. ...
3. ...

---

## 📱 Environment
- Device:
- OS:
- Browser/App:

---

## 📎 Bukti
Screenshot / log (optional)
EOF

# ========================
# FEATURE TEMPLATE
# ========================
cat << 'EOF' > .github/ISSUE_TEMPLATE/feature.md
---
name: 🚀 Feature Request
about: Usulan fitur baru
title: "[FEATURE] "
labels: enhancement
assignees: ""
---

## ✨ Ide Fitur
> Jelasin fitur yang kamu mau

---

## 🎯 Tujuan
Kenapa fitur ini penting?
- ...
- ...

---

## 🧠 Gambaran Solusi
- UI:
- Behavior:

---

## 🔍 Use Case
- ...

---

## 📌 Catatan
(optional)
EOF

# ========================
# IMPROVEMENT TEMPLATE
# ========================
cat << 'EOF' > .github/ISSUE_TEMPLATE/improvement.md
---
name: ⚡ Improvement
about: Peningkatan fitur
title: "[IMPROVEMENT] "
labels: improvement
assignees: ""
---

## 🔧 Bagian
> Apa yang mau di-improve

---

## ⚠️ Masalah
- ...
- ...

---

## 🚀 Solusi
- ...
- ...

---

## 🎯 Dampak
- ...
EOF

# ========================
# CONFIG
# ========================
cat << 'EOF' > .github/ISSUE_TEMPLATE/config.yml
blank_issues_enabled: false

contact_links:
  - name: 💬 Diskusi
    url: https://github.com/fridfn
    about: Untuk diskusi umum
EOF


echo "✅ Done! Template berhasil dibuat di .github/ISSUE_TEMPLATE"

echo "=============================================================="

echo  "🚀 Setting up folder workflows..."

# ========================
# FOR TELEGRAM NOTIFY
# ========================
cat << 'EOF' > .github/workflows/notify.yml
name: Notify

on:
  push:

jobs:
  notify:
    uses: fridfn/workflow-development/.github/workflows/telegram.yml@main
    with:
      private_message: |
        💜 Repo: ${{ github.repository }}
        👤 Author: ${{ github.actor }}
        📝 Commit: ${{ github.event.head_commit.message }}

      channel_message: |
        🚀 Update baru di ${{ github.repository }}

    secrets:
      TELEGRAM_TOKEN: ${{ secrets.TELEGRAM_TOKEN }}
      TELEGRAM_CHAT_ID: ${{ secrets.TELEGRAM_CHAT_ID }}
      TELEGRAM_CHANNEL_ID: ${{ secrets.TELEGRAM_CHANNEL_ID }}
EOF

echo "✅ Done! Folder workflow berhasil dibuat di .github/workflows"