import ImageWithFallback from "./ImageWithFallback";
import type { PractitionerProfile } from "@/domain/facility";
import { DEMO_NOTICE } from "@/lib/demo";

const departmentOrder = [
  "Medicine",
  "Surgery",
  "Women & Child",
  "Eye",
  "Dental",
  "Emergency & Critical Care",
  "Diagnostics",
  "Rehabilitation",
];
const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function departmentRank(value: string) {
  const rank = departmentOrder.indexOf(value);
  return rank === -1 ? departmentOrder.length : rank;
}

function formatActivity(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatTime(value: string | null) {
  return value ? value.slice(0, 5) : null;
}

function formatNextOpd(value: string | null) {
  if (!value) return null;
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function PractitionerDirectory({ practitioners }: { practitioners: PractitionerProfile[] }) {
  if (!practitioners.length) {
    return <div className="information-empty"><span>＋</span><h3>No doctor profiles listed for this facility</h3><p>Contact the facility directly for current clinician and OPD information.</p></div>;
  }

  const groups = Map.groupBy(practitioners, (person) => person.department_group ?? "Other departments");
  const orderedGroups = [...groups.entries()].sort(([a], [b]) => departmentRank(a) - departmentRank(b) || a.localeCompare(b));

  return <div className="practitioner-directory">
    <p className="demo-data-notice" role="note">{DEMO_NOTICE}. Profiles, schedules, fees, availability and email addresses below are fictional.</p>
    {orderedGroups.map(([group, people], groupIndex) => {
      const specialties = Map.groupBy(people, (person) => person.specialization);
      return <details className="department-group" key={group} open={groupIndex === 0}>
        <summary><span>{group}</span><small>{people.length} profiles</small></summary>
        {[...specialties.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([specialty, specialists]) => <section className="specialty-group" key={specialty}>
          <h3>{specialty}</h3>
          <div className="doctor-grid">
            {specialists.map((person) => <article className="doctor-card" key={person.id}>
              <div className="doctor-heading">
                <ImageWithFallback src={person.photo_path} alt={`Illustrated demo avatar for ${person.display_name}`} className="doctor-photo" fallback={<div className="doctor-photo fallback" aria-hidden="true">{person.display_name.replace(/^Dr\.?\s*/i, "").slice(0, 1)}</div>} />
                <div><h4>{person.display_name}</h4><p>{person.designation ?? person.specialization}</p>{person.sub_specialty && <small>{person.sub_specialty}</small>}</div>
              </div>
              {person.is_demo && <span className="demo-profile-badge">{person.demo_label ?? "Demo profile - not a real clinician"}</span>}
              <div className="availability-row"><span className={`status-chip${person.availability?.current_status === "Off duty" ? " off-duty" : ""}`}>{person.availability?.current_status ?? "Availability unavailable"}</span>{person.availability?.current_location && <span>{person.availability.current_location}{person.availability.current_until ? ` until ${formatTime(person.availability.current_until)}` : ""}</span>}</div>
              {person.availability?.next_opd_at && <p className="next-opd">Next OPD: {formatNextOpd(person.availability.next_opd_at)}{person.availability.next_opd_location ? ` · ${person.availability.next_opd_location}` : ""}</p>}
              <dl className="doctor-facts">
                <div><dt>Qualification</dt><dd>{person.qualification}</dd></div>
                <div><dt>Experience</dt><dd>{person.experience_years == null ? "Not listed" : `${person.experience_years} years`}</dd></div>
                <div><dt>Languages</dt><dd>{person.languages?.join(", ") || "Not listed"}</dd></div>
                <div><dt>Consultation fee</dt><dd>{person.consultation_fee_inr == null ? "Not listed" : `₹${person.consultation_fee_inr}`}</dd></div>
                <div><dt>Contact</dt><dd>{person.email ?? "Not listed"}</dd></div>
              </dl>
              <details className="schedule-expander"><summary>Weekly schedule</summary>{person.schedule.length ? <ol>{[...person.schedule].sort((a, b) => a.weekday - b.weekday || a.starts.localeCompare(b.starts)).map((slot) => <li key={`${slot.weekday}-${slot.starts}-${slot.activity}-${slot.location}`}><strong>{weekdays[slot.weekday]}</strong><span>{formatTime(slot.starts)}–{formatTime(slot.ends)} · {formatActivity(slot.activity)}{slot.location ? ` · ${slot.location}` : ""}</span></li>)}</ol> : <p>No weekly schedule listed.</p>}</details>
            </article>)}
          </div>
        </section>)}
      </details>;
    })}
  </div>;
}
