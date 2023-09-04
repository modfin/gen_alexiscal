export interface Cal {
    id: string
    title: string
    department: string,
    start: Date,
    end: Date,

    created: Date,
    updated: Date,

    version: number


    allDay:boolean
}


export const toCalendar = (cals: Cal[], name?: string, tzLoc?: string, domain?: string): string => {
    return `BEGIN:VCALENDAR
PRODID:-//CF AlexisHR Sync//CF AlexisHR Sync v0.0.1//EN
VERSION:2.0
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:${name || "Generated"}
X-WR-TIMEZONE:${tzLoc || "Europe/Stockholm"}
${cals.map(c => toVEvent(c, domain)).join("\n")}
END:VCALENDAR`.replaceAll("\r", "").split("\n").join("\r\n")
}


export const toVEvent = (cal: Cal, domain?: string) => {
    let {start, end} = cal
    let allDayAddition = ``
    if(cal.allDay){
       end.setDate(end.getDate()+1)
        allDayAddition = '\nX-MICROSOFT-CDO-ALLDAYEVENT:TRUE\n';
        allDayAddition += 'X-MICROSOFT-MSNCALENDAR-ALLDAYEVENT:TRUE';
    }


    return `BEGIN:VEVENT
DTSTART;VALUE=DATE:${formatDate(start, cal.allDay)}
DTEND;VALUE=DATE:${formatDate(end, cal.allDay)}${allDayAddition}
DTSTAMP:${formatDate(new Date())}
UID:${cal.id}@${domain || "unknown"}
CREATED:${formatDate(cal.created)}
LAST-MODIFIED:${formatDate(cal.updated)}
SEQUENCE:${cal.version}
STATUS:CONFIRMED
SUMMARY:${cal.title}
TRANSP:OPAQUE
END:VEVENT`
}


export const formatDate = (d: Date | string, dateonly?: boolean): string => {
    const m = new Date(d);
    let s = m.getUTCFullYear() +
        String(m.getUTCMonth() + 1).padStart(2, '0') +
        m.getUTCDate().toString().padStart(2, '0');

    if (dateonly) {
        return s;
    }
    return s + 'T' + m.getUTCHours().toString().padStart(2, '0') +
        m.getUTCMinutes().toString().padStart(2, '0') +
        m.getUTCSeconds().toString().padStart(2, '0') +
        'Z';
}
