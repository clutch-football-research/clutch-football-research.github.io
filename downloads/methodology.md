# Clutch Drive Conversion Rate (CDCR) Methodology

**Project:** Clutch QB Study  
**Milestone:** 0001 — Methodology Lock  
**Methodology version:** 1.2  
**Study window:** 1999 season through the completion of Week 3 of the 2026 season  
**Status:** Active v1.2 — literal-final rule plus locked 5.0% scoring-threat viability gate; core analytics validated, with sCDCR retained as descriptive standardization rather than a demonstrated predictive enhancement

## 1. Research question

What does it mean for an NFL quarterback to be "clutch"?

This study defines clutch performance narrowly and operationally: when a quarterback is given a legitimate late-game offensive possession in which one normal possession can tie the game or take the lead, did the offense convert that opportunity?

The goal is to separate **quarterback/offensive conversion of the opportunity** from **the eventual team result**.

## 2. Study universe

Tier 1 includes:

- Every completed NFL **regular-season** and **postseason** game from the 1999 season through September 29, 2026.
- Every quarterback who owns at least one qualifying clutch opportunity.
- Starters, backups, injury replacements, and spot starters are all eligible.

Excluded:

- Preseason games.
- Games outside the study window.
- Incomplete or abandoned games until they have an official final result.

The primary automated source will be nflverse/nflfastR play-by-play data. Seasons or games with known source-quality issues will receive enhanced manual QA rather than being silently dropped.

## 3. Unit of analysis

The unit of analysis is **at most one clutch opportunity per team-game**.

For each team-game, the study first identifies the team's **literal final meaningful offensive possession**. A meaningful possession is a genuine competitive offensive possession; administrative kneels, spikes-only pseudo-drives, and obvious tied-game clock runouts are excluded under the existing competitive-possession rules.

Only after the literal final meaningful possession is identified does the study test whether that possession qualifies under the late-game and score-state rules below.

- If the final meaningful possession begins in the fourth quarter or overtime while tied or trailing by one possession, it is the team's CDCR opportunity.
- If the final meaningful possession begins while leading or outside the one-possession deficit range, the team-game contributes **no CDCR opportunity**, even if an earlier possession would have qualified.
- Earlier qualifying possessions never replace a later meaningful possession.

Example: a quarterback has the ball down 2 with 13:55 left, punts, then receives later possessions down 9 and down 12. The down-2 possession is **not** the CDCR opportunity because it was not the team's final meaningful offensive possession. The team-game contributes no CDCR opportunity.

This ordering is intentional: **final possession first, qualification second**.

### 3.1 Realistic-opportunity viability gate — locked v1.2

A literal final possession can be technically eligible by score state yet provide no realistic opportunity to reach the required result. Methodology v1.2 therefore adds a **pre-drive viability gate** that is being validated before the corrected study is accepted.

The viability question is:

> Given only information known when the possession begins, did an average NFL offense have a realistic chance to reach the score state required for CDCR conversion?

The viability probability may use only pre-drive context such as:
- time remaining,
- starting field position,
- starting score state,
- offensive timeouts,
- era / overtime context.

It may **not** use:
- quarterback identity,
- team identity,
- opponent identity as a post-hoc quality proxy,
- what happened during the drive,
- the final game result.

The primary viability model is trained on historical **literal-final qualifying possessions** so its probabilities reflect the terminal-drive decision regime. It is then projected onto earlier qualifying possessions only when one becomes a fallback candidate. The model is cross-fitted by season so the season being scored does not train its own probability. A second model trained on all qualifying Q4/OT drives is retained as a sensitivity check for training-population choice.

The predeclared sensitivity set was:
- 1.0%,
- 2.5%,
- 5.0%,
- 10.0%.

Methodology v1.2 locks the viability threshold at **5.0% probability of reaching scoring-threat territory**. For possessions where a field goal can satisfy CDCR (tied or trailing by 1–3), scoring-threat territory is the opponent 38-yard line or closer. For possessions requiring a touchdown (trailing by 4–8), scoring-threat territory is the opponent 30-yard line or closer. A possession that begins already inside the applicable threat zone is automatically viable.

The 5.0% threshold was selected from the predeclared alternatives using low-tail calibration, population stability, and a blinded review of pre-drive football states. The blinded review hid quarterback, team, game identity, drive outcome, game outcome, model probability, and which side of the candidate cutoff each case occupied. The 2.5% neighborhood remained overwhelmingly desperation cases, the 10% neighborhood was predominantly realistic cases, and the 5% neighborhood was predominantly borderline. No quarterback rankings were used to select the threshold.

A second independent human review was proposed as an additional validation layer but was not performed because no independent reviewer was available. This limitation is disclosed rather than treated as completed validation.

Locked selection logic:
1. Start with the team's literal final meaningful offensive possession.
2. If it begins outside the Q4/OT one-possession CDCR score-state window, the team-game contributes no CDCR opportunity. Do **not** skip backward merely because the score state is nonqualifying.
3. If it begins in a qualifying score state, estimate its pre-drive viability.
4. If the possession begins already in the applicable scoring-threat zone, treat it as viable. Otherwise, if its cross-fitted scoring-threat reachability is at least **5.0%**, evaluate that possession.
5. If reachability is below 5.0%, treat that possession as a desperation/non-viable chance and move back exactly one meaningful offensive possession. Repeat the same tests.
6. If the fallback possession begins leading or otherwise outside the qualifying score-state window, the team-game contributes no CDCR opportunity.

This preserves the literal-final-possession correction while preventing an effectively impossible desperation possession from mechanically creating a quarterback failure.

The famous-case checks are retained as diagnostics, not tuning constraints. In particular, a well-known extraordinary successful play may still be classified as a viable pre-drive opportunity if its pre-drive reachability exceeds 5.0%. This is intentional: viability is determined from the state when the possession begins, not from how unusual the realized play later appears.

## 4. Late-game window

A possession can qualify only if it **begins in the fourth quarter or overtime**.

Possessions that begin before the fourth quarter are excluded even if they continue into the fourth quarter. This rule is intentionally simple and reproducible and will be tested during validation against the manually researched five-quarterback sample.

If validation demonstrates that this boundary materially conflicts with the intended historical methodology, any change will be documented as a new methodology version rather than applied silently.

## 5. Qualifying score state

At the start of the possession, the offensive team must be:

- **Tied**, or
- **Trailing by 1 through 8 points.**

This is the study's **one-possession clutch opportunity** definition for the NFL's two-point-conversion era.

The NFL adopted the two-point conversion in 1994. Therefore, if the study is ever extended to seasons **before 1994**, the qualifying trailing range becomes **1–7 points**; a team down 8 could not tie the game on one offensive possession under the rules then in effect.

Possessions beginning with the offense leading are not qualifying opportunities.

For 1994 onward, possessions beginning down 9 or more are not qualifying opportunities. For pre-1994 seasons, possessions beginning down 8 or more are not qualifying opportunities.

## 6. Competitive-possession requirement

A qualifying possession must be a genuine attempt to advance the ball or score.

A possession consisting only of quarterback kneels or other obvious clock-expiration behavior while tied is not automatically treated as a failure. Such possessions are excluded as noncompetitive or sent to manual review if intent is ambiguous.

## 7. Conversion standard

If the possession starts tied, the offense must **take the lead**.

If the possession starts trailing by 1–6, the offense must **tie the game or take the lead**.

If the possession starts **down 7**, an offensive touchdown is a **Conversion** even if the subsequent extra-point kick is missed or blocked. The quarterback/offense has created the routine tying-kick opportunity, so the kicker does not determine the quarterback's CDCR result.

If the possession starts **down 8**, the offense must score a touchdown **and successfully convert the two-point attempt** (or otherwise reach a tie/lead through an offensive scoring sequence). The two-point try is an offensive play and remains part of the quarterback/offense evaluation.

The eventual final score of the game does not determine whether the quarterback converted the opportunity.

## 8. Final-possession rule

There is no qualifying-possession supersession rule in methodology v1.2.

The study identifies the team's literal final meaningful offensive possession first. Earlier possessions are excluded from primary CDCR regardless of whether they converted or whether they began in a qualifying score state.

If the final meaningful possession itself qualifies, it is evaluated. If it does not qualify, the team-game has no primary CDCR opportunity.

Earlier successful late-game responses may still be retained separately as descriptive Clutch Response Events, but they do not enter the primary CDCR numerator or denominator.

## 9. Field-goal rules

Field-goal treatment applies only when the kick, if successful, would have produced the score-state result required for conversion. A field goal cannot convert a possession that begins down 4–8.

- Successful kick that ties or takes the lead: **Conversion**
- Missed/blocked field goal of 45 yards or shorter: **Conversion**
- Missed/blocked field goal from 46–55 yards: **Kicker-Dependent No Decision (ND-K)**
- Missed/blocked field goal of 56 yards or longer: **Manual Review**

Invalidated kicks do not end the possession.

## 10. Offensive failures

A qualifying possession is a **failure** if it does not achieve the required tie/lead result and is not classified as a no-decision or manual-review case.

Typical failures include punt, turnover on downs, interception, fumble lost by any offensive player, safety, or end of game without the required score.

A teammate-caused turnover remains a possession failure but receives a separate cause flag.

## 11. Team result is recorded separately

Every resolved clutch opportunity receives an independent team outcome: Win, Loss, or Tie.

The separation is essential: CDCR evaluates conversion of the opportunity, not whether the defense, special teams, or opponent later changed the final result.

## 12. Quarterback attribution

The clutch opportunity is assigned to the quarterback who owns the literal final meaningful offensive possession when that possession qualifies.

If more than one quarterback materially participates in the same qualifying possession, the possession is sent to **Manual Review** rather than assigned mechanically.

## 13. Overtime

Overtime possessions are eligible.

A possession beginning tied in overtime qualifies under the same rules as a tied fourth-quarter possession: the offense must take the lead.

## 14. No-decisions

Current deterministic no-decision category:

- **ND-K:** missed/blocked field-goal attempt from 46–55 yards that would have tied the game or taken the lead.

No-decisions are excluded from the CDCR numerator and denominator but remain in the master opportunity ledger.

## 15. Manual-review queue

Initial manual-review triggers include:

- Missed/blocked field goals of 56+ yards that would have tied or taken the lead.
- Multi-quarterback qualifying possessions.
- Kneel-only or apparently noncompetitive tied possessions.
- Broken or incomplete historical play-by-play.
- Unusual scoring corrections or possession records.
- Lateral/multi-player plays where quarterback attribution is unclear.
- Any case where automated score reconstruction conflicts with official game scoring.

Manual decisions are stored in `data/manual_overrides.csv` with source and rationale.

## 16. CDCR formula

**Resolved Opportunities = Conversions + Failures**

**CDCR = Conversions / Resolved Opportunities**

No-decisions and unresolved manual-review cases are excluded until resolved.

## 17. Primary reporting views

The master ledger should support career, regular-season, postseason, season-by-season, league-wide, score-state, home/away, conversion+team-loss, failure+team-win, and minimum-opportunity views.

Potential future metrics such as Support Gap and era-adjusted CDCR+ will be defined only after the base dataset is validated.

## 18. Validation requirement

Before the corrected historical leaderboard is trusted, the automated pipeline must be rebuilt and reconciled at the individual-game level under methodology v1.2.

Version 1.2 is a methodology correction, not a presentation change. Every downstream result derived from the v1.1 opportunity ledger — CDCR, xCDCR, CAE, sCDCR, rankings, trajectories, crosswalks, Clutch Response Event relationships, publication packages, and website data — must be regenerated from the corrected primary ledger.

The v1.0 and v1.1 outputs remain preserved only as historical regression and audit references. They are not accepted current results.

Any discrepancy between automated results and the intended literal-final-possession rule must be explained at the individual opportunity level.

## 19. Reproducibility and audit trail

Every row in the master opportunity ledger should retain enough information to reconstruct the classification, including game, season, week, game type, date, offense, opponent, quarterback, possession identifier, start quarter/time, score differential, field position, possession result, terminal play, field-goal distance if applicable, classification, team result, cause flags, source status, audit status, and methodology version.

All manual changes must be made through the override/audit file rather than silently editing derived results.

## 20. Version-control rule

Methodology version 1.2 is the active implementation. The complete v1.0 and v1.1 methodologies are preserved in versioned files and Git history.

If validation reveals that a rule needs to change:
1. Record the issue.
2. Document the proposed change.
3. Increment the methodology version.
4. Rerun the full pipeline.
5. Preserve the prior results for auditability.

## 21. Version 1.2 methodology correction

Version 1.2 preserves the accepted v1.1 one-possession scoring rules:

- 1994 onward: tied or trailing by 1–8 points.
- Pre-1994 extension: tied or trailing by 1–7 points.
- Down 7: an offensive touchdown is credited as a conversion independent of the PAT kick.
- Down 8: the offense must reach a tie or lead, normally touchdown plus successful two-point conversion.
- Existing field-goal, no-decision, quarterback-attribution, and manual-review rules remain in force unless separately versioned.

Version 1.2 changes the **opportunity-selection rule**:

- v1.1 selected the chronologically last possession that itself qualified.
- v1.2 selects the team's literal final meaningful offensive possession first, applies the score-state rule, and then applies the pre-drive viability gate. A qualifying but non-viable desperation possession may be skipped backward under the locked viability threshold.
- A later meaningful possession outside the qualifying score range eliminates an earlier possession from primary CDCR consideration.
- If the literal final meaningful possession does not qualify, the team-game contributes no CDCR opportunity.

This correction restores the intended research question: measuring what the quarterback/offense did with the team's last meaningful chance when the game was still a one-possession situation.

## 22. Research principle

> On the team's last realistic meaningful offensive opportunity, when one possession can still tie the game or take the lead, did the offense convert that chance?

The metric deliberately separates the answer from what the defense, special teams, or opponent does after the quarterback's opportunity ends.

## 23. Prior publication freeze and companion measures

Run 89 froze methodology v1.1 and is preserved as a historical publication snapshot. It is **superseded by methodology v1.2** and must not be treated as the current accepted result set.

The corrected v1.2 pipeline must regenerate the primary and supplemental measures before publication:

- **CDCR:** observed conversion rate on qualifying literal final meaningful possessions.
- **xCDCR:** expected conversion probability from the start-of-drive situation.
- **CAE:** CDCR minus xCDCR.
- **sCDCR:** standardized CDCR on a common opportunity distribution with partial pooling.
- **Clutch Response Event:** descriptive count of successful qualifying late-game responses, including earlier successful responses that are not the literal final meaningful possession.

Clutch Response Events remain descriptive counts rather than a success-rate denominator selected by observed outcome.

### sCDCR validation interpretation

Trailing sCDCR is exploratory: the exact reference-rank invariance check failed; the aggregate scientific rank-stability result remains false. All other required rank-stability and core checks passed. Independently validated core outputs are publishable under a policy adopted after review of Classifier #156. This trailing-scope audit does not establish reference-rank invariance for overall rankings or every historical trajectory snapshot. Point-estimate ranks are uncertain; retain observed CDCR and uncertainty intervals. Mixed predictive scores do not permit predictive improvement claims. Predictive improvement claims are prohibited. The site therefore does not claim that sCDCR improves prediction. Modern-era versus pooled trailing rank Spearman: 0.9999542124542123.

Scientific flags are retained in sdcr_sensitivity_summary.json and publication_policy.json. This separately versioned publication policy does not change methodology v1.2.
