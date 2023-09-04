import {Department, Employee, Leave, LeaveType} from "./models";
import {Cal, toCalendar} from "./ical";
import {syncDepartments, syncEmployees, syncLeave, syncLeaveTypes} from "./sync";

export interface Env {
    AlexisStore: KVNamespace;
    ALEXIS_API_KEY: string
    API_KEY: string
    DOMAIN:string
    TZ:string
}

export default {

    async scheduled(
        controller: ScheduledController,
        env: Env,
        ctx: ExecutionContext
    ): Promise<void> {

        await syncEmployees(env)
        await syncLeaveTypes(env)
        await syncDepartments(env)
        await syncLeave(env)
    },

    async fetch(
        request: Request,
        env: Env,
        ctx: ExecutionContext
    ): Promise<Response> {
        env.ALEXIS_API_KEY = ""

        const url = new URL(request.url)

        let apiKey = url.searchParams.get("api-key")
        if (apiKey != env.API_KEY) {
            return new Response("Bad API KEY");
        }


        let includeDepartments = new Set((url.searchParams.get("departments") ?? "")
            .split(",")
            .filter(s => s.length > 0)
            .map(s => s.toLowerCase()))
        let includeEmployee = new Set((url.searchParams.get("employees") ?? "")
            .split(",")
            .filter(s => s.length > 0)
            .map(s => s.toLowerCase()))


        let employees: Employee[] = (await env.AlexisStore.get("employees", "json") ?? [])
        let employeeById = new Map(employees.map(e => [e.id, e]))


        let departments: Department[] = await env.AlexisStore.get("departments", "json") ?? []
        let departmentsById = new Map(departments.map(e => [e.id, e]))

        let leaveTypes: LeaveType[] = await env.AlexisStore.get("leave-types", "json") ?? []
        let leaveTypesById = new Map(leaveTypes.map(e => [e.id, e]))

        let leaves: Leave[] = await env.AlexisStore.get("leaves", "json") ?? []


        let cal = leaves
            .filter(l => {
                let employee = employeeById.get(l.employeeId)
                if (employee === undefined) {
                    return false
                }

                let department = departmentsById.get(employee.departmentId)
                if (department === undefined) {
                    return false
                }
                if (includeEmployee.size == 0 && includeDepartments.size == 0) {
                    return true
                }

                if (includeEmployee.has(employee.id)) {
                    return true
                }
                if (includeEmployee.has(employee.workEmail)) {
                    return true
                }
                if (includeDepartments.has(department.id)) {
                    return true
                }
                if (includeDepartments.has(department.name.toLowerCase())) {
                    return true
                }
            })
            .filter(l => l.status === 'approved')
            .filter(l => !l.deleted)
            .map((l: Leave): Cal | undefined => {

                let employee = employeeById.get(l.employeeId)
                if (employee === undefined) {
                    return undefined
                }

                let department = departmentsById.get(employee.departmentId)
                if (department === undefined) {
                    return undefined
                }

                let type = leaveTypesById.get(l.typeId)

                return {
                    id: l.id,
                    title: `${employee.firstName} ${employee.lastName}${l.afternoon ? ", Afternoon" : ""}${l.morning ? ", Morning" : ""} (${type?.name ?? 'unknown'})`,
                    department: department.name,
                    start: new Date(l.startDate),
                    end: new Date(l.endDate),
                    updated: new Date(l.updated),
                    created: new Date(l.created),
                    version: l.__v,
                    allDay: true
                }
            })
            .reduce((acc: Cal[], val) => {
                if (val !== undefined) {
                    return [...acc, val]
                }
                return acc
            }, [])
            .sort((a: Cal, b: Cal) => a.start < b.start ? -1 : 1)


        let title =`${url.searchParams.get("departments") || "All"} Away`
        let resp = new Response(toCalendar(cal,
            title,
            env.TZ || "Europe/Stockholm",
            env.DOMAIN || "alexishr.com"));

        resp.headers.set("Content-Type", "text/calendar")
        resp.headers.set("Content-Disposition", `attachment; filename="${title.replaceAll(" ", "_")}.ical"`)
        return resp
    }
};
