import {Env} from "./index";
import {Employee, Leave, LeaveType} from "./models";


interface Resp<T> {
    status: string
    total: number
    count: number
    offset: number
    relations: any
    data: T[]
}

export const syncEmployees = async (env: Env) => {

    console.log("[Employees] Fetching")
    const res = await fetch("https://api.alexishr.com/v1/employee?limit=500&select=id,firstName,lastName,workEmail,departmentId&filters[active][$eq]=true",
        {
            headers: {
                "Authorization": `Bearer ${env.ALEXIS_API_KEY}`,
            },
        }
    )
    const resp: Resp<Employee> = await res.json()

    console.log(`[Employees] Saving ${resp.data.length} Employees to kv`)
    await env.AlexisStore.put(`employees`, JSON.stringify(resp.data))
    console.log(`[Employees] Done saving Employees`)

}
export const syncLeaveTypes = async (env: Env) => {

    console.log("[LeaveTypes] Fetching")
    const res = await fetch("https://api.alexishr.com/v1/leave-type?limit=500&select=id,kind,name",
        {
            headers: {
                "Authorization": `Bearer ${env.ALEXIS_API_KEY}`,
            },
        }
    )
    const resp: Resp<LeaveType> = await res.json()

    console.log(`[LeaveTypes] Saving ${resp.data.length} Leave Types to kv`)
    await env.AlexisStore.put(`leave-types`, JSON.stringify(resp.data))
    console.log(`[LeaveTypes] Done saving Leave Types`)
}
export const syncDepartments = async (env: Env) => {
    console.log("[Departments] Fetching")
    const res = await fetch("https://api.alexishr.com/v1/department?limit=500&select=id,name,parentId",
        {
            headers: {
                "Authorization": `Bearer ${env.ALEXIS_API_KEY}`,
            },
        }
    )
    const resp: Resp<LeaveType> = await res.json()
    console.log(`[Departments] Saving ${resp.data.length} Leave Types to kv`)
    await env.AlexisStore.put(`departments`, JSON.stringify(resp.data))
    console.log(`[Departments] Done saving Leave Types`)
}
export const syncLeave = async (env: Env) => {

    let limit = 50;
    let offset = 0


    let date = new Date()
    date.setDate(date.getDate() - 60);

    var leaves: Leave[] = []

    while (true) {
        console.log(`[Leave] Fetching ${limit}, offset ${offset}`)
        const res = await fetch(`https://api.alexishr.com/v1/leave`
            + `?limit=${limit}&offset=${offset}&sort[endDate]=asc`
            + `&filters[endDate][$gte]=${date.toISOString()}`
            ,
            {
                headers: {
                    "Authorization": `Bearer ${env.ALEXIS_API_KEY}`,
                },
            }
        )
        const resp: Resp<Leave> = await res.json()

        leaves = leaves.concat(resp.data)

        offset = offset + limit
        if (resp.data.length != limit) {
            break
        }
    }
    console.log(`[Leave] Saving ${leaves.length} Leave to kv`)
    await env.AlexisStore.put(`leaves`, JSON.stringify(leaves))
    console.log(`[Leave] Done saving Departments`)
}