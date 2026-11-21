# 🛒 Supermarket Intelligent Staff Management System

An independent, API-first **Staff Management, Attendance, and Operational Intelligence** platform engineered to run alongside standalone **POS (Point of Sale)** and **E-Commerce** software without shared database bottlenecks.

---

## 🏗️ System Architecture

This application acts as the **Single Source of Truth** for employee identities, role-based access control (RBAC), shift scheduling, and cross-platform accountability:

```text
┌─────────────────────────┐       REST / PIN Auth       ┌─────────────────────────┐
│     POS Software        │ ──────────────────────────► │                         │
│ (Cashiers & Tills)      │ ◄────────────────────────── │   Staff Management App  │
└─────────────────────────┘     Webhooks (Voids/Cash)   │  (Django + DRF + Next)  │
                                                        │                         │
┌─────────────────────────┐       REST / PIN Auth       │  • Identity & RBAC      │
│  E-Commerce Platform    │ ──────────────────────────► │  • Shift & Clock-In     │
│ (Pickers & Dispatch)    │ ◄────────────────────────── │  • Anomaly Intelligence │
└─────────────────────────┘   Webhooks (Order Picks)    └─────────────────────────┘
