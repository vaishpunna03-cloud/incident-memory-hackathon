# 3-Minute Hackathon Judge Demo Script

**Project Title:** Incident Memory: AI Incident Response & Root-Cause Agent with Hindsight Memory  
**Target Duration:** Exactly 3 Minutes (180 Seconds)

---

## Pitch Narrative:
> *"Production incidents repeat. But your engineering team's knowledge shouldn't be forgotten. Today, we show you how Hindsight operational memory completely changes how an AI agent investigates repeat incidents."*

---

## Timeline & Step-by-Step Execution

### 0:00 – 0:30 | The Core Problem & Product Introduction
1. **Show the Dashboard (`/`)**:
   - Highlight the hero statement: *"Production incidents repeat. Your team's knowledge shouldn't be forgotten."*
   - Point to the **Memory Impact Flow**: Historical Incidents → Retained Knowledge → New Incidents → Contextual Investigation.
   - Show the live health badges at the top: `ENV: PRODUCTION`, `AI: CONNECTED`, `MEMORY: HINDSIGHT`.
   - **Key Soundbite:** *"Most AI chatbots analyze errors in isolation. They have zero memory of past incidents, so when an outage recurs, they repeat the same failed troubleshooting steps. Incident Memory solves this with long-term Hindsight memory."*

### 0:30 – 1:00 | Step 1: The First Incident (INC-071)
1. **Navigate to the Demo Page (`/demo`)**:
   - Point to **Stage 1: First Incident (INC-071)**.
   - Service: `payment-api`, Error: `database connection pool exhausted`, Deployment: `v1.8.2`.
   - Explain the finding:
     - On-call initially restarted the pods alone. *It failed within 3 minutes.*
     - The true root cause was a connection pool idle configuration change. Reverting config solved it.
   - Click the purple **[ RESOLVE & RETAIN IN HINDSIGHT ]** button.
   - Show the green confirmation banner:
     - ✓ Root cause retained
     - ✓ Successful fix retained
     - ✓ Failed attempt (pod restart) captured
     - ✓ Operational lesson stored in Hindsight.
   - **Key Soundbite:** *"We don't just close the ticket; Hindsight automatically extracts the root cause, the successful fix, and crucially—the failed troubleshooting attempt to avoid."*

### 1:00 – 1:30 | Step 2: The Second Similar Incident (INC-104)
1. **Click [ STEP 2: TRIGGER INC-104 ]**:
   - Three weeks later, a new deployment `v2.1.0` rolls out to `payment-api`.
   - Error: `database connection timeout in pool`.
   - Watch the agent initiate investigation:
     - Instantly recalls **INC-071** with **87% historical relevance**.
     - Point out the strict SRE safety protocol: **Current Evidence** is visually separated from **Historical Memory (Not Current Evidence)**.
   - **Key Soundbite:** *"Notice the system's discipline: It never hallucinates that past memory proves the current cause. It treats memory as advisory precedent."*

### 1:30 – 2:30 | The Centerpiece: Root-Cause Evidence Chain & Learned Avoidance
1. **Show the Evidence Chain**:
   - Step 1: Error detected.
   - Step 2: Deployment identified.
   - Step 3: Metrics extracted (100% connection pool saturation).
   - Step 4: INC-071 recalled.
   - Step 5: Similarity factors evaluated (Service match: 100%, Error similarity: 88%, Pattern: 85%).
   - Step 6: **Learned Avoidance**: *"Prior incident proved restarting alone failed. Agent prevents wasting 30 minutes on ineffective pod restarts."*
   - Step 7: Targeted config diff check recommended.
2. Click the **"Why? (Decision Factors)"** button:
   - Show the transparent, audited weights explaining why the memory was applied.

### 2:30 – 3:00 | The Memory Difference & Postmortem
1. **Scroll down to "THE MEMORY DIFFERENCE" Side-by-Side Matrix**:
   - Point to **Without Memory**: Generic triage → Restart pod → Outage repeats → 45m MTTR.
   - Point to **With Hindsight Memory**: Recalled precedent → Avoided naive restart → Checked config parameters → 5m MTTR.
2. Click **View Postmortem**:
   - Show the auto-generated blameless postmortem with executive summary, timeline, what worked, what failed, and prevention recommendations.
3. **Closing Line:**
   - *"Hindsight turns past incident pain into immediate operational intelligence. Thank you!"*
